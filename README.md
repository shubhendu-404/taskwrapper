# TaskWrapper (tw) 🔧

`tw` is an extension toolkit for [Taskwarrior](https://taskwarrior.org) that adds project-scoped features and other utilities. It is written in Node.js and designed to give you better control and organization on top of Taskwarrior.

---

## ✨ Features
- **Project Scoping**: Automatically applies project context to your tasks based on your current directory.
- **Recursive Config Search**: Finds the `.taskproject` file in the current or any parent directory (up to your home directory), so you can run commands from anywhere in your project.
- **Smart Command Wrapper**: Provides special handling for `add` and `list` while passing all other Taskwarrior commands through directly.
- **Notes Support**: Attach detailed notes to tasks using a UDA (`notes`) field.

---

## 📦 Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/yourname/taskwrapper.git
   cd taskwrapper
   ```

2. Install globally:
   ```bash
   npm install -g .
   ```
   This will make the `tw` command available on your system.

3. Verify installation:
   ```bash
   tw --help
   ```

---

## ⚙️ Project Configuration

`tw` looks for a `.taskproject` file in the current directory, and searches parent directories up to your home directory. This allows `tw` to apply per-project settings when running commands.

Example `.taskproject` file (INI style):

```ini
# .taskproject

# The project name to be assigned in Taskwarrior
project = my-awesome-project

# Default tags for all tasks in this project
default_tags = dev,backend
```

---

## 🚀 Usage

`tw` acts as a smart wrapper around the standard `task` command.

### Special Commands

The `add` and `list` commands have special behavior when a `.taskproject` file is found:

-   `tw add "Fix API bug"`: Automatically adds the task with the project and default tags from your config file.
-   `tw list`: Lists only the tasks for the current project.
-   `tw list --all`: Ignores the project scope and shows all tasks.
-   `tw notes <id>`: A special command to view or edit notes for a task.

### Standard Commands (Pass-through)

**Any other standard Taskwarrior command** is passed through directly. This means you can use `tw` as a drop-in replacement for `task` for most operations.

```bash
# These commands are passed directly to task
tw done <id>
tw delete <id>
tw sync
tw summary
tw burndown
# ...and so on
```

### Examples
```bash
# Add a task to the current project
tw add "Implement login system"

# List tasks for this project only
tw list

# Mark a task as done
tw 12 done

# Sync with your task server
tw sync
```

---

## 📝 Notes Management

`tw` extends Taskwarrior with a `notes` field (UDA). You can attach or view notes per task:

```bash
# Add/edit notes in your default editor
tw notes <task-id> --edit

# Show notes for a task
tw notes <task-id>
```

**Example `.taskrc` addition:**
Add this to your `~/.taskrc` if you haven’t already defined the UDA:

```ini
uda.notes.type=string
uda.notes.label=Notes
```

---

## 🛠 Development

Run locally without installing:
```bash
node ./index.js list
```

Uninstall:
```bash
npm uninstall -g taskwrapper
```

---

## 📌 Roadmap
- [ ] Per-project custom commands
- [ ] Notes export/import
- [ ] Git integration (auto-tag commits with task IDs)
- [ ] Rich TUI dashboard

---

## 📜 License
MIT License © 2025 
