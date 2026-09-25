 # ⚡ Lithbreaker (Powered by IBM Bob)
    **The Automated Monolith-to-Microservice Extraction Agent.**

    Built for the **IBM Bob 2.0 Hackathon**.

    ## 🚀 The Problem
  Enterprise software inevitably becomes a "Big Ball of Mud"—a
  monolith where modules are deeply entangled. Extracting a single
  bounded context (like a "Billing" module) into an independent
  microservice usually takes senior engineers weeks of manual
  dependency mapping, code isolation, containerization, and
  rewriting imports.

    ## 💡 Our Solution
    **Lithbreaker** is a custom Agentic Skill built natively for the
  **IBM Bob IDE**.
    By simply running a single slash command, Lithbreaker
  orchestrates a multi-agent workflow that acts as a Principal
  Software Architect. It doesn't just write code; it safely
  decouples your architecture.

    ### The 6-Phase Agentic Workflow:
  1.**Dependency Mapping (The Analyst):** Maps the AST/imports of
  the monolith to find exactly what relies on the target module.
    2. **Isolation (The Extractor):** Extracts the target module,
  fixes internal paths, and automatically scaffolds a lightweight
  web server (e.g., Express/FastAPI).
    3. **Containerization (The DevOps Agent):** Generates a
  production-ready `Dockerfile` and a `.github/workflows/deploy.yml`
  CI/CD pipeline.
    4. **Monolith Update (The Rewriter):** Safely rewrites all
  original monolithic files to use asynchronous network requests
  (HTTP `fetch`) instead of local imports, and automatically
  propagates `await` up the call stack.
    5. **Verification:** Validates the decoupling and generates
  Mermaid.js visual architecture diagrams.
    6. **Source Control:** Automatically branches, commits, and
  prepares a Pull Request.

    ## 🛠️ How to Test It

   1. Open this repository in your IBM Bob IDE.
    2. Open the Bob chat.
    3. Run the Lithbreaker command targeting the dummy enterprise
  codebase:
       `/lithbreaker src/modules/billing billing-service`
    4. Watch as Lithbreaker automatically untangles the dependencies,
  generates the new microservice, and rewrites the monolith to
  communicate over the network.

    ## 🔮 Future Roadmap (Enterprise Scale)
   While Lithbreaker currently works beautifully on small-to-medium
  codebases, our roadmap to scale it for 500k+ line legacy
  Java/Python repositories includes:
    * **AST/LSP Integration:** Replacing LLM text-searching with
  Abstract Syntax Trees (Tree-sitter) for 100% deterministic
  dependency mapping.
    * **Vector DB / RAG:** Indexing the repository via embeddings to
  bypass LLM context-window limitations on massive codebases.
    * **Database Schema Splitting:** A DB Architect subagent that
  analyzes ORMs to generate safe SQL migration scripts for shared
  databases.
