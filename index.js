#!/usr/bin/env node
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import { Command } from "commander";

const program = new Command();

// 🗂 Load .taskproject config
function loadConfig() {
  const homeDir = os.homedir();
  let currentDir = process.cwd();
  let configPath = null;

  while (true) {
    const potentialPath = path.join(currentDir, ".twconfig");
    if (fs.existsSync(potentialPath)) {
      configPath = potentialPath;
      break;
    }

    // Stop if we have reached the home directory or are outside of it.
    if (currentDir === homeDir || !currentDir.startsWith(homeDir)) {
      break;
    }

    const parentDir = path.dirname(currentDir);
    // Stop if we've reached the filesystem root
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  let cfg = {};
  if (configPath) {
    const lines = fs.readFileSync(configPath, "utf-8").split("\n");
    for (const line of lines) {
      if (!line.trim() || line.startsWith("#")) continue;
      const [k, v] = line.split("=");
      if (k && v) {
        cfg[k.trim()] = v.trim();
      }
    }
  }

  return {
    project: cfg.project || "",
    tags: cfg.default_tags ? cfg.default_tags.split(",") : [],
    due: cfg.due || "",
    report: cfg.report || "",
    context: cfg.context || "",
  };
}

const cfg = loadConfig();

// 🛠 Run task command
function runTask(args, inherit = true) {
  const result = spawnSync("task", args, {
    stdio: inherit ? "inherit" : "pipe",
    encoding: "utf-8",
  });
  return result.stdout?.trim();
}

// 📝 Notes command
program
  .command("notes <id>")
  .option("-e, --edit", "Edit notes in $EDITOR")
  .description("View or edit notes for a task")
  .action((id, options) => {
    let notes = runTask(["_get", `${id}.notes`], false);

    if (options.edit) {
      const tmpfile = path.join(os.tmpdir(), `task-notes-${id}.txt`);
      fs.writeFileSync(tmpfile, notes.replace(/\\n/g, "\n"));
      const editor = process.env.EDITOR || "nvim";
      spawnSync(editor, [tmpfile], { stdio: "inherit" });
      const newNotes = fs.readFileSync(tmpfile, "utf-8").replace(/\n/g, "\\n");
      runTask([id, "modify", `notes:${newNotes}`]);
      console.log(`✅ Notes updated for task ${id}`);
      fs.unlinkSync(tmpfile);
    } else {
      console.log(`📄 Notes for task ${id}:\n`);
      console.log(notes.replace(/\\n/g, "\n"));
    }
  });

// ➕ Add task (auto project/tags/due)
program
  .command("add [desc...]")
  .description("Add a new task with project defaults")
  .action((desc) => {
    const extra = [];
    if (cfg.project) extra.push(`project:${cfg.project}`);
    if (cfg.tags.length) extra.push(...cfg.tags.map((t) => `+${t}`));
    if (cfg.due) extra.push(`due:${cfg.due}`);
    runTask(["add", ...extra, ...desc]);
  });

// 📋 List tasks (scoped to project)
program
  .command("list")
  .description("List tasks (scoped to current project if defined)")
  .option("--all", "Ignore project scope and show all tasks")
  .action((options) => {
    const args = [];
    if (!options.all && cfg.project) {
      args.push(`project:${cfg.project}`);
    }
    if (cfg.report) {
      args.push(cfg.report);
    }
    runTask(["list", ...args]);
  });

// 🔄 Fallback for all other task commands
program.on('command:*', (operands) => {
  // If we get here, no specific command was found.
  // We can treat it as a raw pass-through to `task`.
  // `operands` contains the command name and all of its arguments.
  runTask(operands);
});

// Parse CLI
program.parse(process.argv);

