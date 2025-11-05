---
title: A Short Lesson in Simpler Prompts
kind: article
author: Srihari Sriraman
created_at: 2025-11-04 00:00:00 UTC
layout: post
permalink: /blog/2025/11/04/my-dumb-prompts-that-worked-better/
description: How I went from 300-word prompts that barely worked to 15-word
  prompts that worked quite well.
---
When building [context-viewer](https://blog.nilenso.com/blog/2025/10/29/fight-context-rot-with-context-observability/), I used LLMs to analyse language semantics. I went from 300-word prompts that barely worked to 15-word prompts that worked quite well. I learned about working with LLMs instead of fighting them, and to balance AI with plain old engineering.

The “secret sauce” is basically:

<div markdown="1" style="border-left:4px solid #FF3D84; background:#fafafa; padding:0.75em 1em; border-radius:4px; margin:1em 0;">

* Learn [what the model is good at](https://blog.nilenso.com/blog/2025/10/14/bitter-lesson-applied-ai/), and lean into its strengths
* Break down the problem, or mould it to fit the strengths
* Engineer around limitations of the model
</div>

Two main problems I had to solve were segmentation and categorisation.

## Segmentation
The problem here is to pull apart a single message from an assistant, or prompt from the user, into meaningful chunks like various text or code blocks, instructions, files supplied as context, etc. Here's an example input message, which is a typical wall-of-text in the context window.

<details div markdown="1">
<summary>
Example `user` input message
</summary>

```markdown
"Given the <product_requirements_document>, the <technical_specification_document>, and the <repository_structure>, identify what questions the user should know about the codebase when planning to work on this PRD.\n\n<product_requirements_document>\n# Grand Central — MVP PRD\n\n**DRI:**&#x20;\n**Stakeholders:** People Ops, Partners, Engineering, Design, Data\n**Status:** Draft v1\n**Date:**\n\n---\n\n## 1) Problem statement\n\nPartners and Execs cannot quickly answer basic workforce questions because employee data is scattered across spreadsheets, lacks a single source of truth, and has incomplete history of state changes. This creates slow decisions, duplicated work, and error-prone analysis.\n\n**Evidence to collect pre-ship**\n\n* Time spent per week answering roster questions.\n* Number of duplicate or conflicting records in current Sheets.\n* Top 5 recurring questions stakeholders cannot answer reliably today.\n\n---\n\n## 2) Who is the customer\n\n* **Primary:** People Ops admin who maintains records and exports data.\n* **Secondary:** Partners/Managers who need roster and trend views.\n* **Tertiary:** Employees who look up colleague basics.\n\n**Jobs-to-be-done**\n\n* Maintain canonical person records with auditable history.\n* Import legacy data once with minimal cleanup.\n* Run simple trend analyses without a data analyst.\n\n---\n\n## 3) Goals and non-goals\n\n**Goals (MVP)**\n\n1. Create, edit, and view **person** records with append-only **changesets** and effective dates.\n2. **One-time bulk import** from Google Sheets with dedupe by work email.\n3. **Directory** with search and CSV export of the **current snapshot**.\n4. **Analytics v0:** monthly headcount, joiners vs leavers, level distribution over time; simple “level vs prior experience” view.\n5. **Security:** Google SSO, domain allowlist, audit log on writes.\n\n**Non-goals (MVP)**\n\n* Payroll, performance reviews, external HRIS sync.\n* Complex RBAC beyond Admin vs Viewer.\n* Compensation reporting UI. *Schema ready; UI deferred to v2.*\n\n**Why now**\n\n* Operational risk from spreadsheet fragmentation.\n* Quick wins unlock broader analytics later.\n\n---\n\n## 5) Requirements\n\n### 5.1 Functional\n\n* **Auth:** Google SSO; domain allowlist; logout; session security.\n* **Directory:** list with columns *Name, Work email, Level, Status, Start date*; search by name/email; link to person detail; CSV export of current snapshot.\n* **Person detail:** core fields, plus **History** tab showing changesets in reverse chronological order; show who changed what and when.\n* **Create/Edit:** forms capture effective dates; all edits append a changeset; current snapshot recomputed.\n* **Analytics v0:**\n\n  * *Headcount trend* by month (active count, joineive dates.\n2. **One-time bulk import** from Google Sheets with dedupe by work email.\n3. **Directory** with search and CSV export of the **current snapshot**.\n4. **Analytics v0:** monthly headcount, joiners vs leavers, level distribution over time; si
mple “level vs prior experience” view.\n5. **Security:** Google SSO, domain allowlist, audit log on writes.\n\n**Non-goals (MVP)**\n\n* Payroll, performance reviews, external HRIS sync.\n* Complex RBAC beyond Admin vs Viewer.\n* Compensation reporting U
I. *Schema ready; UI deferred to v2.*\n\n**Why now**\n\n* Operational risk from spreadsheet fragmentation.\n* Quick wins unlock broader analytics later.\n\n---\n\n## 5) Requirements\n\n### 5.1 Functional\n\n* **Auth:** Google SSO; domain allowlist; logo
ut; session security.\n* **Directory:** list with columns *Name, Work email, Level, Status, Start date*; search by name/email; link to person detail; CSV export of current snapshot.\n* **Person detail:** core fields, plus **History** tab showing changes
ets in reverse chronological order; show who changed what and when.\n* **Create/Edit:** forms capture effective dates; all edits append a changeset; current snapshot recomputed.\n* **Analytics v0:**\n\n  * *Headcount trend* by month (active count, joine
rs, leavers).\n  * *Level mix* over time (banded junior/mid/senior).\n  * *Level vs prior experience* scatter.\n* **Import:** one-time CSV importer for legacy Sheets; idempotent; validation report; dedupe by work email; mapping guide.\n\n### 5.2 Data model (MVP)\n\n* **Person**: id, firstName, lastName, workEmail (unique), phone?, role, level, status, startDate, endDate?, priorWorkExperienceYears.\n* **Changeset**: id, personId, field(s) changed, newValue, effectiveDate, author, createdAt.\n* **Status enum**: FULLTIME, CONTRACTOR, EXEC, PARTNER, RESIGNED.\n* **Compensation (v2-ready)**: CompChange(personId, amount, currency, effectiveDate, notes).\n* **Snapshot rule**: latest effective changes per field as of “now”.\n\n### 5.4 UX principles\n\n* Defaults fast data entry over perfect taxonomy.\n* Make history obvious before saving edits.\n* Show what changed, by whom, and when.\n\n---\n\n## 8) Risks and mitigations\n\n* **Import correctness** → schema mapping guide, dry-run, row-level report.\n* **Duplicate records** → unique email constraint; surface potential duplicates; merge flow later.\n* **Bad effective dates** → inline validation; preview of resulting history.\n* **OAuth misconfig** → automated env checks in CI; clear runbooks.\n\n---\n\n## 9) Acceptance tests (MVP)\n\n1. **Create person**: Authenticated user submits required fields → person appears in directory; audit entry created; event `person_created` emitted.\n2. **Edit with history**: Update level with effective date → new changeset stored; History tab shows entry; snapshot updated.\n3. **Import**: Run importer on validated CSV → ≥95% rows ingested; reconciliation report shows any rejects with reasons.\n4. **Export**: Click Export on directory → CSV downloads with one row per current person; header spec matches appendix.\n5. **Analytics**: Open Analytics → monthly headcount, joiners vs leavers, and level mix charts render from production data; “level vs experience” view loads.\n6. **Security**: Unauthenticated user → redirected to login; export requires Admin.\n\n---\n\n## 10) Open questions\n\n* Exact mapping of legacy Sheets to entities and enums.\n* Admin vs Viewer permissions beyond export.\n* Compensation governance and who can view amounts in v2.\n* Do managers need edit rights or view-only in v1?\n\n---\n\n## 11) Appendix\n\n**A. CSV header spec (current snapshot)**\n`firstName,lastName,workEmail,phone,role,level,status,startDate,endDate,priorWorkExperienceYears`\n\n**B. Glossary**\n\n* **Changeset**: append-only record of a field change with an effective date.\n* **Snapshot**: latest effective value per field at a point in time.\n* **Headcount**: number of active employees in a period.\n* **Joiners/Leavers**: counts of start/end effective events in a period.\n\n**C. Decision log**\n\n* Compensation UI deferred to v2; schema included now.\n* Unique workEmail enforced; no merge UI in v1.\n* SQLite acceptable for MVP, to be revisited post-M6.\n\n\n</product_requirements_document>\n\n<technical_specification_document>\n# Modelling\n\nDescribes how to model entities over time.\n\n## Goals\n\nModel an entity with a set of known fields which changes over time such that:\n\n1. The time when a change occurred is tracked separately from when the change\n   was recorded\n\n2. The state of an entity (a view) can be queried for any point in time to\n   fetch the values of fields in that entity at that point in time\n\n3. A change that occurred in the past should affect all views of the entity\n   that are requested after that point in time\n\n4. The end user should not have to declare changes but instead just edits the\n   entity as a whole at a given point in time\n\n## CRDTs\n\nRef: https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type\n\nTypically used for resolving conflicts between information created from two different sources, we are able to use CRDTs for our usecase by treating a change made to an entity's history as a change from a disconnected user that's converging with other changes.\n\n### LWW Element Set\n\nRef: https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type#LWW-Element-Set_(Last-Write-Wins-Element-Set)\n\nAn LWW Element Set is a well known CRDT. It consists of an 'add set', 'remove\nset' and a time stamp for each element in it.\n\nThe timestamp will be the time at which the change occurred. The value is a map\nwith all the fields and corresponding values that are updated. In our case, the\nremove set does not exist since nothing is meant to be removed, just edited. We\nmay mimic a remove by updating a field with a null value if necessary.\n\n## Schema\n\nThe schema to store this in SQLite.\n\n```sql\n\ncreate table changes(\n  -- This would be the personId in our case\n  entityId text,\n\n  -- Time when the event occurred\n  timestamp datetime,\n\n  -- json with fields that have changed and the corresponding values\n  -- eg. {'name': 'Name1', 'age': 22}, {'age': 29}\n  value text,\n);\n\n```\n\nHere’s a concise tech spec for “Grand Central.” It captures current stack choices and the target architecture, flags risks, and proposes guardrails.\n\n# 1) Overview\n\n* Purpose: Single source of truth for employee data. Visual analysis now. Workflow automation later.\n* Users: Internal staff. Auth via Google.\n* Non-goals: Public API, multi-tenant SaaS, heavy analytics.\n\n# 2) Core Requirements\n\n* CRUD for people and changesets.\n* Authenticated access only.\n* Visual graphs of trends.\n* Low-ops deploy. Small team ownership.\n* SQLite durability with simple backups. Path to Postgres when needed.\n\n# 3) Tech Stack (current)\n\n* Web framework: Remix (React + SSR). TypeScript everywhere.\n* Styling: Tailwind.\n* ORM: Prisma.\n* DB: SQLite (file URL defaults to `file:/data/sqlite.db`).\n* Auth: `remix-auth` + Google OAuth.\n* Charts: D3 components.\n* Testing: Vitest for unit, Cypress for E2E.\n* Packaging: Docker multi-stage build. Separate Datasette image for read/admin.\n* Runtime: Node process started by `start.sh` which runs `prisma migrate deploy` then `remix-serve`.\n* Ops: Procfile targets (`web`, `datasette`). Fly volume mounted at `/data`. Healthcheck at `/healthcheck`.\n  Sources: repo Dockerfiles, README, Fly config.&#x20;\n\n# 4) Architecture\n\n## 4.1 Logical components\n\n* **Remix app**\n\n  * Server routes: SSR HTML, actions for mutations, loaders for reads.\n  * Session: Cookie session storage.\n  * Auth: Google Strategy. On first login auto-creates user.\n  * Data access: Prisma client.\n  * Graphs: D3 line and multiseries components rendered client-side.\n* **SQLite**\n\n  * Deployed at `/data/sqlite.db` with a persistent volume.\n* **Datasette**\n\n  * Read and exploratory UI at `/datasette/`.\n  * Insert bot capability gated by token for controlled writes.\n* **Reverse proxy**\n\n  * Local dev uses Caddy via `docker-compose.local.yml` to route to Node and Datasette.\n\n## 4.2 Runtime topology\n\n* **Fly.io app**\n\n  * Service ports: 80/443 -> internal 8080.\n  * Volume mount `/data` for DB durability.\n  * Concurrency limits tuned to \\~20–25 connections.\n* **Datasette sidecar**\n\n  * Runs as a separate process/container when enabled.\n  * Base URL set to `/datasette/`.\n\n## 4.3 Request flow\n\n1. Browser → Remix route.\n2. Loader checks session. If needed, Google OAuth redirects.\n3. Loader/Action hits Prisma → SQLite.\n4. Response rendered via SSR + client hydration.\n5. Optional: Datasette used for admin/read operations.\n\n# 5) Configuration and Secrets\n\n* Required env:\n\n  * `SESSION_SECRET`\n  * `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`\n  * `APP_URL` (for OAuth callback)\n  * `DATABASE_URL` (defaults to `file:/data/sqlite.db`)\n  * `PORT` (default 8080)\n  * `INSERT_TOKEN` for Datasette insert bot\n* Secret handling: Store in Fly secrets or CI secrets. Never in repo. Rotate quarterly.\n\n# 6) Build and Deploy\n\n* **Build**: Multi-stage Docker builds:\n\n  * `deps` installs dev deps, `production-deps` prunes, `build` runs `prisma generate` and `npm run build`, final image copies `/build`, `/public`, `.prisma`.\n* **Start**: `start.sh` applies migrations then serves.\n* **Datasette image**: Minimal Python Alpine, installs `datasette`, `datasette-insert`, `datasette-auth-tokens`, serves `/data/sqlite.db`.\n* **CI/CD**: GitHub Actions push images to registry and deploy. Branching model: `dev` → staging, `main` → production.\n  Note: README mentions DigitalOcean registry and droplet; repo also contains `fly.toml`. Standardize on one target (recommend Fly for volume + healthchecks).\n\n# 7) Data Model and Migrations\n\n* ORM-driven schema via Prisma.\n* Migration policy:\n\n  * All schema changes via Prisma migrations committed to VCS.\n  * On boot, `prisma migrate deploy` runs. Fail fast if migration cannot be applied.\n* Backups:\n\n  * Nightly snapshot of `/data/sqlite.db` to object storage.\n  * Pre-migration snapshot in CI for production.\n\n# 8) Observability\n\n* Logs: stdout structured JSON from app. Retain 14–30 days in platform logs.\n* Health: `/healthcheck` HTTP 200.\n* Metrics (proposed):\n\n  * Basic RED metrics via runtime counters.\n  * Optionally expose `/metrics` for scrape.\n\n# 9) Security\n\n* HTTPS enforced.\n* Cookie `__session`: httpOnly, sameSite=lax, secure in production.\n* OAuth scopes: minimal email identity.\n* RBAC (future): roles for viewer, editor, admin.\n* Datasette:\n\n  * Base URL scoped under `/datasette/`.\n  * Token-gated inserts via `datasette-auth-tokens`.\n  * Default deny policy except for authenticated actor.\n\n# 10) Performance and Scale\n\n* SQLite fits current workload. Single writer, low read concurrency.\n* Concurrency guard at app level to avoid lock thrash.\n* Thresholds to move to Postgres:\n\n  * > 10 req/sec sustained writes.\n  * Multi-region rollout.\n  * Complex reporting joins.\n* Migration path:\n\n  * Replace `DATABASE_URL` to Postgres.\n  * Run Prisma `migrate deploy` on Postgres.\n  * Cutover via maintenance window.\n\n# 11) Testing Strategy\n\n* Unit: Vitest, `happy-dom` environment.\n* E2E: Cypress with `login()` helper and `cleanupUse
r()` per test file.\n* CI gates: typecheck, lint, unit, E2E against mocked services.\n\n# 12) Risks and Mitigations\n\n* **SQLite file lock contention** → keep mutations small; queue bulk imports; consider Postgres if contention spikes.\n* **Dual deploy
ment targets confusion** → choose Fly or DO. Remove unused manifests.\n* **Secrets leakage** → enforce CI secret scanning; restrict Procfile usage in prod if not needed.\n\n# 13) Open Questions\n\n* Is Datasette exposed in production or only behind VPN?
 If exposed, add auth proxy.\n* Which registry is canonical: DOCR or Fly’s? Align CI/CD.\n* Backup RTO/RPO targets?\n\n# 14) Acceptance Criteria\n\n* Auth works with Google in staging and prod.\n* App boots with `prisma migrate deploy` and serves on 808
0 behind TLS.\n* `/datasette/` loads with token auth.\n* E2E tests pass in CI on each PR to `dev` and `main`.\n\nSources: project Dockerfiles, Procfile, README, Fly config, package.json, Prisma bootstrap scripts.&#x20;\n\n\n</technical_specification_doc
ument>\n\n<repository_structure>\n.dockerignore\n.env.example\n.eslintrc.js\n.github/workflows/deploy.yml\n.gitignore\n.gitpod.Dockerfile\n.gitpod.yml\n.npmrc\n.prettierignore\nDockerfile\nDockerfile.datasette\nProcfile\nREADME.md\napp/charts/line-chart
.ts\napp/charts/multiseries-chart.ts\napp/components/graph.tsx\napp/components/person.tsx\napp/db.server.ts\napp/entry.client.tsx\napp/entry.server.tsx\napp/form-action.server.ts\napp/form.tsx\napp/models/graph.server.test.ts\napp/models/graph.server.ts
\napp/models/graph.ts\napp/models/person.server.test.ts\napp/models/person.server.ts\napp/models/person.ts\napp/models/user.server.ts\napp/root.tsx\napp/routes/auth/google.tsx\napp/routes/auth/google/callback.tsx\napp/routes/graphs/levels.tsx\napp/route
s/graphs/people.tsx\napp/routes/healthcheck.tsx\napp/routes/index.tsx\napp/routes/login.tsx\napp/routes/logout.tsx\napp/routes/people.tsx\napp/routes/people/$id.tsx\napp/routes/people/csv.tsx\napp/routes/people/new.tsx\napp/session.server.ts\napp/utils.
test.ts\napp/utils.ts\ncypress.config.ts\ncypress/.eslintrc.js\ncypress/e2e/smoke.cy.ts\ncypress/fixtures/example.json\ncypress/support/commands.ts\ncypress/support/create-user.ts\ncypress/support/delete-user.ts\ncypress/support/e2e.ts\ncypress/tsconfig
.json\ndatasette.metadata.json\ndatasette/metadata.json\ndeploy/grand-central/Caddyfile\ndeploy/grand-central/Caddyfile.local\ndeploy/grand-central/docker-compose.caddy.yml\ndeploy/grand-central/docker-compose.local.yml\ndeploy/grand-central/docker-comp
ose.staging.yml\ndeploy/grand-central/docker-compose.yml\ndoc/modelling.md\nfly.toml\nmocks/README.md\nmocks/index.js\npackage-lock.json\npackage.json\nprisma/generated/zod/index.ts\nprisma/migrations/20230120092252_init/migration.sql\nprisma/migrations
/20230125174823_add_changeset/migration.sql\nprisma/migrations/20230128042107_update_changeset/migration.sql\nprisma/migrations/20230223201415_drop_person_table/migration.sql\nprisma/migrations/20230407085725_drop_user_password/migration.sql\nprisma/mig
rations/migration_lock.toml\nprisma/schema.prisma\nprisma/seed.ts\npublic/favicon.ico\npublic/grand-central.jpg\nremix.config.js\nremix.env.d.ts\nscripts/import_changesets.ts\nstart.sh\ntailwind.config.js\ntest/global-setup.ts\ntest/setup-test-env.ts\nt
sconfig.json\nvitest.config.ts\n</repository_structure>\n

```

</details>

An AI conversation would have an array of such `messages` array with `user`, `assistant`, `tool`, represented in JSON. I need to preserve the semantic meaning while chunking, and the flow of text too. I can't change the order of text, since that matters to an LLM. Since I’m working with inputs that are prompts or skill markdown files, I was likely to have delimiters that were XML / Markdown, etc.

I wanted to get a list of “splits”, so that I could replace a single message in-place with a list of smaller messages. So, I started with this prompt.

<details markdown="1">

<summary>
<code>Initial prompt</code>
</summary>

```markdown
Given a structured JSON containing message parts, split any part that combines multiple distinct ideas into smaller, self-contained units. Each resulting unit must represent **one classifiable concept or function**, preserving all meaning, order, and structure. This prepares the data for hierarchical categorisation. Output **only** the complete replacements JSON object described.

Return **only** a single JSON object in this format:
{
  "replacements": [
    {
      "source_part_id": "42",
      "target_parts": [
        {
          "id": "42.1",
          "type": same_as_source_type",
          "text": "subpart content 1"
        },
        {
          "id": "42.2",
          "type": same_as_source_type",
          "text": "subpart content 2"
        }
      ]
    }
  ]
}

```

</details>

I pasted this prompt into a ChatGPT conversation, attached a messages.json, and started hacking away, trying to find a prompt that worked reasonably. And here's what I got:

<details markdown="1">
<summary>
Sample response
</summary>

```json
{
  "replacements": [
    {
      "source_part_id": "2",
      "target_parts": [
        {
          "id": "2.1",
          "type": "text",
          "text": "Given the <product_requirements_document>, identify questions the user should know about the PRD goals, customer roles, and scope."
        },
        {
          "id": "2.2",
          "type": "text",
          "text": "Given the <product_requirements_document>, identify questions about the data model, including Person and Changeset entities, and how snapshots are computed over time."
        },
        {
          "id": "2.3",
          "type": "text",
          "text": "Given the <product_requirements_document>, identify questions about analytics features such as headcount trends, joiners vs leavers, and level distribution over time."
        },
        {
          "id": "2.4",
          "type": "text",
          "text": "Given the <technical_specification_document>, identify questions regarding the use of CRDTs, specifically LWW Element Sets, and how they handle edits and historical views."
        },
        {
          "id": "2.5",
          "type": "text",
          "text": "Given the <technical_specification_document>, identify questions about the tech stack, including Remix, Prisma, SQLite, Fly.io deployment, and Datasette integration."
        },
        {
          "id": "2.6",
          "type": "text",
          "text": "Given the <technical_specification_document>, identify questions about authentication via Google OAuth, session management, and secret configuration."
        },
        {
          "id": "2.7",
          "type": "text",
          "text": "Given the <technical_specification_document>, identify questions about CI/CD pipelines, Docker builds, migration policies, and backup processes."
        },
        {
          "id": "2.8",
          "type": "text",
          "text": "Given the <repository_structure>, identify which source files implement routes, models, and components related to people, graphs, and authentication."
        },
        {
          "id": "2.9",
          "type": "text",
          "text": "Given the <repository_structure>, identify where database schema migrations, Prisma configuration, and data seeding occur."
        },
        {
          "id": "2.10",
          "type": "text",
          "text": "Given the <repository_structure>, identify files relevant for end-to-end testing, including Cypress and Vitest configurations."
        }
      ]
    }
  ]
}

```
</details>

The issues were:

* It only returned a single replacement most of the times
  * I thought this was because I only had one replacement in the sample response. I added two replacements in the response and the issue reduced, but persisted.
  * I asked chatgpt why it only returned one replacement. It told me that I had said **any** part, not **all** parts. Silly me. I fixed that, but the issue persisted.
* It didn’t return full message chunks, it would snip them with \`…\` in between or write a summary that represented the chunk.
* It was very slow, took >30s in most cases. The reasoning seemed solid, took its time, but the result didn't reflect that thought. It was slow even without reasoning.
* It tried to use code tools, but I didn’t want it to take so much time (I specifically wanted low latency), and I wanted a generic solution.
* I additionally instructed it to “output exact text spans”, added principles on why I wanted it that way, etc. Still no luck.

There were a few other issues around the json structure, preserving additional fields, etc. I also added a couple of guiding examples.
And at the end of these iterations, here’s the prompt I got to:

<details markdown="1">
<summary>
<code>Detailed prompt with all the fixes</code>
</summary>

```markdown
## **Task**

Segment a structured JSON containing message parts into **atomic semantic units**.
Each resulting unit must represent a single, self-contained **intent, fact, or function**, suitable for hierarchical categorisation.
Preserve all original wording, order, and structure.

---

## **Segmentation Rules**

* Each atomic unit should express **one topic, question, instruction, or operation**.
* If a part contains multiple such elements, extract them as separate contiguous spans.
* **Do not paraphrase, omit, or reorder** any text.
* **Preserve all tokens exactly** as in the source.
* Use existing natural boundaries such as XML/HTML tags, JSON objects, Markdown headers, list items, or paragraphs.
* Code blocks, tool calls, and similar technical sections must remain whole.
* Maintain the original hierarchy and `type` values.

---

## **Extraction Objective**

Identify and extract spans that each convey a single semantic role.
Think of this as **semantic segmentation for classification**, not text rewriting.
Output exact text spans that can stand alone and be categorised unambiguously.

---

## **Output Format**

Return only one JSON object in this format:

{
  "replacements": [
    {
      "source_part_id": "42",
      "target_parts": [
        {
          "id": "42.1",
          "type": "same_as_source_type",
          "text": "exact text span 1"
        },
        {
          "id": "42.2",
          "type": "same_as_source_type",
          "text": "exact text span 2"
        }
      ]
    },
    {
      "source_part_id": "84",
      "target_parts": [
        {
          "id": "84.1",
          "type": "same_as_source_type",
          "text": "exact text span 1"
        },
        {
          "id": "84.2",
          "type": "same_as_source_type",
          "text": "exact text span 2"
        }
      ]
    }
  ]
}

Each `source_part_id` corresponds to one original message part that was segmented.
Each `target_part` contains one extracted semantic unit, preserving order and meaning.
```

</details>


The next day, I woke up thinking: _“why is this so difficult, I thought LLMs are good at this stuff”_. And then I tried the simplest prompt to test the hypothesis that I'm using LLMs wrong.

<div markdown="1" class="wrap-code">

```markdown
given the following text, tell me where all you would apply a break.
just give me a json array.

## result
[
  "<task>",
  "<sources>",
  "<project_requirements_document>",
  "<technical_specification_document>",
  "<repository_context>",
  "<breakdown>",
  "<reflection>"
]
```
</div>

Woo! The results were instant (down to 5s from 20s), and exactly what I expected. The JSON input was likely interfering with its capability in identifying semantics, so I sent it only the text. And I didn’t need it to do the actual text-splitting, `string.split` could do that. I could also do this in parallel for all the messages that needed to be split. After some more tweaking of instructions, I got to this prompt.

<div markdown="1" class="wrap-code">

```markdown
Given the following text, tell me where all you would apply a break. The purpose is semantic chunking in way that's suitable for categorisation. Only give me the top level sections to split the text into coherent topical chunks.

Return ONLY a valid JSON array of regexes with positive lookahead which I can use to run string split in javascript.

Example response format: ["(?=regex-of-section-1)", "(?=regex-of-section2)"]
```
</div>

And without even structured outputs, this worked every time, within a few seconds. No reasoning, and no coding tools.

<div markdown="1" style="border-left:4px solid #FF3D84; background:#fafafa; padding:0.75em 1em; border-radius:4px; margin:1em 0;">

### Summary

Before:

* **AI:** One (overengineered) prompt to identify large messages, identify semantic chunks, and split up messages accordingly.

After:

* **Engineering:** Identify large messages
* **Engineering:** Create one prompt per message
* **AI:** Identify semantic chunks given plain text, return a JSON array of substrings / regexes
* **Engineering:** Split up messages
</div>

## Categorisation

After breaking down messages into smaller chunks, I had to categorise them. So in the same manner, I iterated with my prompt and inputs on ChatGPT until I could find something that worked reasonably well.

Here’s a detailed description of my task, that became a prompt:
<details markdown="1">
<summary>
<code> Initial Prompt </code>
</summary>


```markdown
**Goal**
Produce a **hierarchical category map** that shows how information is organized in a conversation. Each category aggregates related message parts, summaries, and structure, enabling visualization and navigation of context usage.

**Instruction**
Given a structured conversation where each message part has a unique `message_part_id`, build a JSON tree that groups the conversation into semantically coherent categories and subcategories.

Do **not** use code tools or programmatic parsing for this task. Use reasoning and language understanding only.

### Your task
1. **Identify major categories** – infer the dominant conceptual or functional blocks from the conversation (for example: *Checklist of questions*, *File reads*, *Reasoning*, *Decisions*).
2. **Decompose recursively** – create subcategories only where the material naturally divides into smaller, meaningful topics.
   - Do **not** fix the number of levels; infer depth as needed.
3. **Assign message parts** – tag each message part with exactly one category or subcategory that best represents its content, using its `message_part_id`.
4. **Summarize each category** – every category node, including children, must contain:
   - `id`: unique short identifier, preferably using dot notation to indicate hierarchy (for example: `checklist`, `checklist.data_model`, `analysis.synthesis`)
   - `name`: concise label
   - `summary`: one-sentence description of what this category covers
   - `message_parts`: array of `message_part_id`s assigned directly to this category
   - `children`: nested categories, if any
5. **Preserve domain terminology** – derive category names from the conversation’s subject matter.
6. **Output** – return a structured, machine-readable JSON array representing the hierarchy, ready for downstream parsing and visualization.

---

### Reflection
Before returning the final JSON, perform the following validation steps:

1. **Completeness check** – ensure every `message_part_id` from the input appears in exactly one category.
2. **Representativeness check** – verify that the categories and subcategories together capture the overall structure and intent of the conversation, aligned with the goal.
3. **Domain integrity check** – confirm that terminology and phrasing reflect the conversation’s domain accurately, not abstract generalizations.
4. **Ground-level identification check** – make sure ground-level material (for example: detailed lists, code, or data) is correctly placed in leaf categories.
5. **Empty-category check** – remove or merge any category that has no assigned `message_parts` and no children with assigned parts. Categories without content are not useful.
6. **Final coherence review** – confirm that summaries are accurate, hierarchy depth is sensible, and the map as a whole provides a faithful and navigable representation of the conversation.

---

### Output specification
Return a **JSON array** of top-level categories.

[
  {
    "id": "checklist",
    "name": "Checklist of questions",
    "summary": "User’s structured audit checklist.",
    "message_parts": ["mp_12", "mp_13"],
    "children": [
      {
        "id": "checklist.data_model",
        "name": "Data model checks",
        "summary": "Questions about schema alignment.",
        "message_parts": ["mp_14", "mp_15"]
      },
      {
        "id": "checklist.security",
        "name": "Security and authentication checks",
        "summary": "Questions related to authentication and authorization.",
        "message_parts": ["mp_16"]
      }
    ]
  },
  {
    "id": "analysis.synthesis",
    "name": "Analysis and synthesis",
    "summary": "Assistant’s reasoning and conclusions.",
    "message_parts": ["mp_20", "mp_22"]
  },
  {
    "id": "files.reads",
    "name": "File readings and tool calls",
    "summary": "Assistant’s inspection of repository files using tools.",
    "message_parts": ["mp_30", "mp_31"]
  }
]
```

</details>

What didn’t work? That reflection list in the prompt is a good list of things that failed!

It wouldn’t return all message parts, some parts would remain without a category, some categories would be created without the parts. Sometimes the message part ids would be hallucinated. And of course, all of this took a long time.

Following the same method, I thought about what the model is actually good at, and went with this one-line prompt:

<div markdown="1" class="wrap-code">

```markdown
given this conversation, give me a list of categories that shows how information is organized. just give me a list of categories in a json array

## Result
[
  "Problem statement and goals",
  "Customer personas and jobs-to-be-done",
  "Functional and data requirements",
  "Technical architecture and stack",
  "Data modeling and schema design",
  "Authentication and security",
  "Directory, person detail, and history",
  "Import and export processes",
  "Analytics and reporting",
  "Audit logging and event tracking",
  "Testing and CI/CD",
  "Performance, scalability, and operations",
  "Open questions and risks",
  "Repository and code organization"
]
```
</div>

These weren’t the categories I wanted. I realised I didn’t want categories that represented the information in text, I was looking for *components* of the conversation, because with context-viewer, I was not looking to analyse the conversation itself, but *how* the conversation happened. So I changed that one part:

<div markdown="1" class="wrap-code">

```markdown
given this conversation, give me a list of components it comprises of. just give me a list in a json array

## Result
[
  "product_requirements_document",
  "technical_specification_document",
  "repository_structure",
  "repository_context",
  "task",
  "sources",
  "breakdown",
  "reflection"
]
```

</div>

That worked! While no output specification was necessary, I tweaked it a little as I experimented with some more input files.

<div markdown="1" class="wrap-code">

```markdown
given this conversation, give me a list of all its components
each component can be 3 to 4 words in length

just give me a list in a json array like this example:
["abc_document", "xyz_structure", "foo_context", "task", "sources", "breakdown", "reflection", "files_about_bar", "files_about_baz", "tool_calls_about_quix", "xyz blocks", "pqr list"]
```

</div>

And then I used another prompt to get the category mapping for each message part, which worked on the first try.

<div markdown="1" class="wrap-code">

```markdown
given this conversation and the list of components, give me a mapping of message part ids in the conversation, to a component from the list, for all the message parts

just give me a simple json object {id: component}

<conversation>${conversationJson}</conversation>
<components>${componentsJson}</components>

## Result
{
  "24.5": "product_requirements_document",
  "24.6": "technical_specification_document",
  "24.7": "repository_structure",
  "26": "assistant_reasoning_blocks",
  "27": "assistant_reasoning_blocks",
  "28": "assistant_reasoning_blocks",
  "29": "assistant_reasoning_blocks",
  ...
```

</div>

<div markdown="1" style="border-left:4px solid #FF3D84; background:#fafafa; padding:0.75em 1em; border-radius:4px; margin:1em 0;">

### Summary:

Before:

* AI: A single prompt to identify hierarchical categories, assign categories to message parts, and return the final mapping.

After:

* AI: Identify components
* AI: Assign components to message part ids
* Engineering: Some basic JSON merging

</div>

---
Overall I’m glad that the prompts I needed in the end were tiny. I think that’s a signal that I’m using LLMs correctly. Just needed to break the problem down, let the model do what it's good at, and augment it with some good old fashioned engineering where needed.
