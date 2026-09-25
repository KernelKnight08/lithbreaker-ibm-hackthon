---
name: lithbreaker
description: Use when the user wants to extract a specific module from a monolithic codebase and turn it into a standalone microservice — performs dependency mapping, isolation, containerization, monolith refactoring, verification, and source control.
metadata:
  argument-hint: "[module-to-extract] [new-service-folder]"
---

# Lithbreaker — Monolith-to-Microservice Extraction Workflow

You are performing a surgical extraction of a module from a monolithic codebase and converting it
into a fully standalone microservice. You have been given two arguments:

- **$1** — the module (file, directory, or logical name) to extract
- **$2** — the destination folder for the new microservice

Work through each phase in order. Do not skip phases. Announce each phase by name before starting it.

---

## Phase 1 — Dependency Mapping

**Goal:** Fully understand who consumes the target module before touching anything.

1. Use `grep` to recursively search the entire workspace for every file that imports, requires, or
   references `$1`. Cast a wide net — search for bare module names, relative paths, and any aliased
   imports. For example:
   - JavaScript/TypeScript: `import .* from .*$1`, `require\(.*$1`
   - Python: `from $1 import`, `import $1`
   - Java/Go/other: adapt the pattern to the language's import syntax.
2. Use `read_file` on each matched file to confirm the exact import lines and understand how the
   module is used (function calls, class instantiation, type references, etc.).
3. Build a **dependency report** — a numbered list of every affected file and the specific symbols
   it imports from `$1`. Present this to the user before proceeding.
4. Identify the primary language/runtime of the target module (`$1`). This determines the web
   server framework used in Phase 2.

---

## Phase 2 — Isolation

**Goal:** Move the module into `$2` and wrap it in a lightweight HTTP server so it can be called
over the network.

1. Use `list_files` on `$1` (or its parent directory) to enumerate all files that make up the
   module, including sub-modules, utilities it depends on internally, and any config files it reads.
2. Create the destination directory `$2` if it does not exist (use `execute_command` with `mkdir`).
3. Copy or move every file identified in step 1 into `$2` using `execute_command`. Preserve the
   internal directory structure.
4. Create a minimal web server entry point inside `$2` that:
   - Imports and re-exports the extracted module's public API.
   - Exposes each public function or method as an HTTP endpoint (POST routes are preferred for
     general-purpose calls; GET for pure reads).
   - Reads the listening port from an environment variable (default `3000` for Node/Express,
     `8000` for Python/FastAPI).
   - Choose the framework based on the detected language:
     - **JavaScript / TypeScript** → `Express` (`server.js` or `server.ts`)
     - **Python** → `FastAPI` with `uvicorn` (`main.py`)
     - **Go** → `net/http` (`main.go`)
     - **Other** → ask the user which lightweight HTTP framework to use before continuing.
5. Write a `package.json` (Node) or `requirements.txt` / `pyproject.toml` (Python) listing only
   the dependencies actually needed by the new service.
6. Write a `README.md` inside `$2` documenting each exposed endpoint: method, path, request body
   schema, and response schema.

---

## Phase 3 — Containerization

**Goal:** Make the new microservice self-contained and deployable with a single `docker build`.

1. Write a `Dockerfile` inside `$2` following best practices:
   - Use an official, version-pinned base image (e.g. `node:20-alpine`, `python:3.12-slim`).
   - Set `WORKDIR /app`.
   - Copy dependency manifests first (`package.json` / `requirements.txt`), run the install step,
     then copy source — this maximises layer caching.
   - Use `ENV PORT=<default>` to document the port variable.
   - Expose the port with `EXPOSE`.
   - Set a non-root `USER` (e.g. `node` for Node images, create one for Python).
   - Use `CMD` (not `ENTRYPOINT`) for the start command so it is easy to override.
2. Write a `.dockerignore` file excluding `node_modules`, `__pycache__`, `.env`, and any test
   directories.
3. Write a `docker-compose.yml` at the root of `$2` that:
   - Defines a single service named after the module.
   - Maps `${PORT:-3000}:3000` (or the equivalent port).
   - Accepts an `env_file: .env` entry so secrets are never hardcoded.
4. Write a `.github/workflows/deploy.yml` file inside `$2` that simulates an automated CI/CD
   pipeline for the new microservice:
   - Trigger on `push` to the `main` branch, scoped to changes under `$2/**`.
   - Define two jobs: **build** and **deploy**.
   - **build** job: checks out code, sets up the appropriate runtime (e.g. `actions/setup-node`
     for Node, `actions/setup-python` for Python), installs dependencies, and runs
     `docker build -t <service-name>:${{ github.sha }} .` from within `$2`.
   - **deploy** job: depends on `build`, and contains placeholder steps for pushing the image to
     a container registry and restarting the service (add a `# TODO:` comment in each placeholder
     step so the user knows exactly what to fill in).
   - Use `GITHUB_TOKEN` via `secrets.GITHUB_TOKEN` for any auth references; never hardcode
     credentials.

---

## Phase 4 — Monolith Update

**Goal:** Rewrite every file identified in Phase 1 so the monolith calls the new microservice over
HTTP instead of importing the module locally.

1. For each file in the Phase 1 dependency report:
   a. Remove the old local import of `$1`.
   b. Add an HTTP client import appropriate for the language:
      - Node.js → prefer the built-in `fetch` (Node 18+) or `axios` if already a dependency.
      - Python → `httpx` (async-preferred) or `requests`.
      - Go → `net/http`.
   c. Replace every call to the local module's functions with an equivalent `async` HTTP call to
      the new service. Use the base URL from an environment variable (e.g. `SERVICE_$1_URL`,
      uppercased and sanitized).
   d. Wrap each HTTP call in a `try/catch` (JS) or `try/except` (Python) block that re-raises a
      clear error so the monolith fails loudly on network issues.
   e. Use `apply_diff` or `search_and_replace` to make the changes surgically — never rewrite a
      whole file unless it consists almost entirely of module-related code.
   f. **Async propagation (mandatory — zero manual follow-ups allowed):** If converting a
      synchronous call to an `async` HTTP call causes the containing function to become `async`,
      you must recursively trace the call stack upwards through the monolith and update every
      parent function that calls it: mark each one `async` and add `await` at each call site.
      Continue up the stack until you reach an entry point (e.g. a route handler, a top-level
      script, or an event listener) that already handles promises or is itself already `async`.
      Do not stop at the first caller — every intermediate function in the chain must be updated
      in the same phase so there are zero manual follow-ups required.
2. If the monolith has a central config or `.env` file, add the `SERVICE_$1_URL` variable to it
   with a sensible default (e.g. `http://localhost:3000`).
3. Do not change any business logic, formatting, comments, or unrelated imports in the monolith
   files. The diff must be minimal and reviewable.

---

## Phase 5 — Verification

**Goal:** Produce a clear, human-readable summary of every change made so the user can review
before committing.

1. List every file that was **created** (new service files, Dockerfile, README, etc.).
2. List every file that was **modified** (monolith files updated in Phase 4).
3. List every file that was **moved or copied** (the original module files).
4. For each modified monolith file, briefly describe what changed (e.g. "replaced local import of
   `$1` with HTTP call to `SERVICE_$1_URL`").
5. Highlight any assumptions made during the extraction (e.g. "assumed FastAPI because the module
   was Python", "defaulted port to 8000").
6. Flag any remaining manual steps the user should complete (e.g. "add
   `SERVICE_$1_URL` to production secrets manager", "add tests for the new service endpoints",
   "fill in the `# TODO:` deploy steps in `.github/workflows/deploy.yml`").
7. Render two **Mermaid.js flowcharts** inside standard ` ```mermaid ` code fences:

   **Chart 1 — Original monolith architecture** (tightly coupled):
   - Show the monolith as a single process boundary containing all modules.
   - Draw directed arrows between modules to represent the in-process function calls that existed
     before the extraction (e.g. `cart → billing`).
   - Label each arrow with the function name that was called locally.

   **Chart 2 — New microservice architecture** (after extraction):
   - Show the monolith boundary containing the remaining modules.
   - Show `$2` as a separate process/service box outside the monolith boundary.
   - Draw the HTTP network call from the monolith's caller module to `$2`, and label the arrow
     with the HTTP method and path (e.g. `POST /process-payment`).
   - Add a label or note indicating the environment variable used for the base URL
     (e.g. `SERVICE_BILLING_URL`).
   - Use a distinct visual style (e.g. `:::external` subgraph or a dashed border) to clearly
     mark the network boundary between the monolith and the new service.

---

## Phase 6 — Source Control

**Goal:** Commit the extraction on a dedicated branch so the change is isolated and reviewable.

1. Use `execute_command` to check if `git` is available: run `git --version`.
   - If the command fails or git is not found, inform the user and skip the remaining steps in this
     phase. Suggest they commit the changes manually.
2. Check whether the workspace is a git repository: run `git rev-parse --is-inside-work-tree`.
   - If not a repo, inform the user and skip the remaining steps.
3. Create a new branch named `lithbreaker/$1-extraction` (replace any path separators and spaces
   with `-`):
   ```
   git checkout -b lithbreaker/<sanitized-module-name>-extraction
   ```
4. Stage all changes:
   ```
   git add $2  <modified monolith files>
   ```
5. Commit with a descriptive message:
   ```
   git commit -m "feat(lithbreaker): extract $1 into standalone microservice at $2

   - Wrapped public API in HTTP server
   - Added Dockerfile and docker-compose.yml
   - Updated monolith callers to use SERVICE_<MODULE>_URL over HTTP"
   ```
6. Print the `git log --oneline -5` output so the user can confirm the commit looks correct.
7. Remind the user to run `git push --set-upstream origin lithbreaker/<branch-name>` when ready to
   open a pull request. Do **not** push automatically.
