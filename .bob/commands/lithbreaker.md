# /lithbreaker

Extract a module from a monolithic codebase and convert it into a standalone microservice.

## Usage

```
/lithbreaker [module-to-extract] [new-service-folder]
```

| Argument | Description |
|---|---|
| `$1` | Path or name of the module to extract from the monolith |
| `$2` | Destination folder where the new microservice will be created |

## What it does

Activates the **Lithbreaker** skill, which walks through a 6-phase agentic workflow:

1. **Dependency Mapping** — scans the codebase for every file that imports `$1`
2. **Isolation** — moves the module to `$2` and wraps it in an Express or FastAPI HTTP server
3. **Containerization** — generates a `Dockerfile`, `.dockerignore`, and `docker-compose.yml`
4. **Monolith Update** — rewrites monolith callers to use async HTTP calls instead of local imports
5. **Verification** — summarises every created, modified, and moved file
6. **Source Control** — branches, commits, and prepares the changes for a pull request

## Examples

```
/lithbreaker src/auth services/auth-service
```

```
/lithbreaker app/payments ../payments-service
```

```
/lithbreaker modules/notifications ./notifications-microservice
```

## Notes

- The new service will read its port from a `PORT` environment variable.
- Monolith callers will reference the new service via a `SERVICE_<MODULE>_URL` environment variable.
- Changes are committed to a `lithbreaker/<module>-extraction` branch. Nothing is pushed automatically.
- Requires `git` to be installed for Phase 6; all other phases run without it.

---

activate_skill: lithbreaker
args:
  - $1
  - $2
