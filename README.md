# YAML from Zero

> An animation-heavy, definition-first introduction to YAML for engineers who
> want to actually *understand* what they're writing — not just copy snippets
> from Stack Overflow.

🌐 **Live site:** https://aroraakarshan.github.io/yaml-from-zero/

Built by [Akarshan Arora](https://github.com/aroraakarshan) — VLSI EM/IR CAD
engineer turning the documentation he wishes existed into open lessons.

---

## Why this exists

YAML is everywhere in modern engineering — Kubernetes, GitHub Actions, EDA tool
configs, CI pipelines, OpenROAD flows, ML experiment configs. Yet most people
learn YAML by *copying broken snippets* and getting indentation errors at
3 a.m.

This site teaches YAML the way it should be taught:

- **Concept first, code second.** Every term gets a definition.
- **Animations, not walls of text.** Indentation, nesting, anchors —
  visualized live, not buried in prose.
- **No prior coding required.** If you can read English, you can follow this.
- **Python bridge included.** Optional Module 4 shows how to read and write
  YAML from Python — useful for anyone automating EDA tool flows.

---

## What's inside

**14 lessons across 4 modules:**

| Module | Lessons |
|---|---|
| 1 — YAML Basics | What is YAML, first YAML, nesting, lists, multi-line, putting it together |
| 2 — Avoiding Mistakes | Common gotchas, validation & debugging |
| 3 — Professional YAML | Anchors & aliases, style & best practices |
| 4 — Automation with Python (optional) | Bridge into scripts, reading/writing YAML, error handling |

Plus an interactive **glossary** and full-text **search**.

---

## Tech stack

| Layer | Tool |
|---|---|
| Framework | [SvelteKit](https://kit.svelte.dev/) (Svelte 5 runes) |
| Static export | `@sveltejs/adapter-static` |
| Lesson authoring | [`mdsvex`](https://mdsvex.pngwn.io/) (Markdown + Svelte components) |
| Syntax highlighting | [Shiki](https://shiki.style/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Animations | Custom Svelte components (no animation library) |
| Package manager | [Bun](https://bun.sh) |

Three-column layout (sidebar / lesson / outline) with a soft pastel palette
that matches the [`python-from-zero`](https://github.com/aroraakarshan/python-from-zero)
sister site.

---

## Run locally

```sh
bun install
bun run dev
```

Open http://localhost:5173.

To produce a static build:

```sh
bun run build         # outputs to ./build/
bun run preview       # serve locally on http://localhost:4173
```

---

## Deploy to GitHub Pages

This repo ships with a GitHub Actions workflow that builds and deploys to
GitHub Pages on every push to `main`.

**One-time setup (already done for the live site, repeat if you fork):**

1. Go to **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Push to `main` (or trigger the workflow manually under **Actions**).

The workflow lives at `.github/workflows/deploy.yml`. It sets the SvelteKit
`BASE_PATH` env var to `/yaml-from-zero` so all asset paths resolve correctly
under `username.github.io/yaml-from-zero/`.

---

## Repository layout

```
src/
  lib/
    components/   ← Animation components, layout, glossary widgets
    data/         ← modules.ts (lesson metadata), search.ts
  routes/
    lesson-XX/    ← One folder per lesson, +page.svx (Markdown + Svelte)
    glossary/
static/           ← Favicons, OG images
svelte.config.js  ← mdsvex + Shiki + adapter-static config
```

---

## License

| What | License |
|---|---|
| **Code** (Svelte components, build scripts, configuration) | [MIT](LICENSE) |
| **Lesson content** (prose, examples, diagrams) | [CC BY-NC-SA 4.0](LICENSE-CONTENT) |

In plain English: fork the code freely. Share and remix the lessons with
attribution, but don't repackage them into a paid course.

---

## Sister projects

- [python-from-zero](https://github.com/aroraakarshan/python-from-zero) —
  Python for absolute beginners, animation-heavy, same stack.
- [python-fundamentals](https://github.com/aroraakarshan/python-fundamentals) —
  Companion Jupyter notebooks for the Python site.
- [pdn-from-zero](https://github.com/aroraakarshan/pdn-from-zero) —
  Power Delivery Networks for VLSI, taught from first principles.
- [pdn-toy-tools](https://github.com/aroraakarshan/pdn-toy-tools) —
  Interactive PDN visualizations.
