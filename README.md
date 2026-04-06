# 🪡 mdstitch

Package manager for `agent.md` and `skill.md` files.

Share, install, and publish agent instructions the same way you share code — with a single command.

```
npm install -g mdstitch
```

---

### Package management

Publish your agent or skill files to the mdstitch registry, and pull them into any project instantly.

| Command | Description |
|---|---|
| `mdstitch signup` | Create an account |
| `mdstitch login` | Log in |
| `mdstitch publish <file_name>` | Publish a package |
| `mdstitch add <package_name>` | Install a package into your project |
| `mdstitch update <file_name>` | Push an updated version |
| `mdstitch update <file_name> --name <package_name>` | Update under a specific package name |
---

### Annotations

Annotations let you embed live data and protect sensitive content directly in your markdown files.

#### `@excel(file, sheet, range)`

Pulls a table from an Excel file and replaces the annotation with structured instructions an AI agent can use to recreate or work with the data.

```
@excel(report.xlsx, results, A1:E10)
```

Expands to a markdown table with column types, calculation logic, and row data.

#### `@secret(start)` / `@secret(end)`

Wraps content that should be stripped before publishing. Anything between these tags is removed when you run `mdstitch publish` — keeping private context local while sharing the rest.

```
@secret(start)
INTERNAL_API_KEY=abc123
@secret(end)
```

---

### File commands

| Command | Description |
|---|---|
| `mdstitch run <file_name>` | Activate all annotations in a file |
| `mdstitch compress <file_name>` | Shrink file size for token efficiency |
| `mdstitch pretty <file_name>` | Restore compressed file to readable markdown |

---

More annotations coming soon.
