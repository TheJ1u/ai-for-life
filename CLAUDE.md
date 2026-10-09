# AI For Life: instructions for Claude (and other AI assistants)

You are helping a member of the **AI For Life** club add to the club's website. The site belongs to everyone in the club. Most contributors are **beginners**, so be a patient guide, not just a code generator.

Live site: https://thej1u.github.io/ai-for-life/
Repo: https://github.com/TheJ1u/ai-for-life

## How to help a contributor

1. Ask what they want to add (a tool guide, a prompt, a project, a meeting note, a glossary word, or a fix). If they are unsure, suggest one from the list in `CONTRIBUTING.md`.
2. Explain each step in plain language first, technical detail second. Connect ideas to business use where it fits.
3. Make the smallest change that does the job. Do not redesign pages or rewrite other people's content.
4. Run `python3 scripts/update_site.py` after editing. It rebuilds the search index and the sitemap, adds link-preview tags to every page, and checks for broken links. Fix anything it reports.
5. Show the contributor what changed, then help them submit it:
   - Work on their **fork** or a **new branch**, never directly on `main` unless they are the repo owner.
   - Commit with a short, clear message, and open a **pull request**. The owner reviews and merges it.
6. If they have no terminal, they can make the same edits in the GitHub website (pencil icon, then Commit, then Open pull request). Walk them through it.

## What this site is

A plain **static website**: HTML, CSS and a little JavaScript. There is no build step, no framework and nothing to install. GitHub Pages publishes the `main` branch as-is. Do not add frameworks, dependencies or build tools.

| Path | What it is |
| --- | --- |
| `index.html` | Home: intro, "What we do", tools grouped by purpose, share section |
| `start.html` | Start here page and FAQ |
| `meetings.html` | Weekly meeting time, calendar buttons, meeting log |
| `prompts.html` | Prompt library |
| `showcase.html` | Member projects |
| `glossary.html` | Plain-English terms |
| `roadmap.html`, `share.html` | Learning path; QR code and install steps |
| `safe-ai.html`, `calculator.html` | Safe AI checklist; AI video cost calculator (JS in `script.js`) |
| `board.html` | Kanban-style roadmap board (Ideas, In progress, Done) |
| `contributors.html` | Contribution log, resume bullet builder, proof links |
| `404.html` | Shown for missing pages. Uses `<base href="/ai-for-life/">`; update it if the web address changes |
| `sitemap.xml`, `robots.txt` | **Generated** by `scripts/update_site.py`. Never edit by hand |
| `tools/*.html` | One guide per tool |
| `templates/tool-template.html` | Copy this to start a new tool guide |
| `style.css`, `script.js`, `sw.js` | Styles, behavior, offline support |
| `search-index.json` | **Generated.** Never edit by hand. Run `scripts/update_site.py` |
| `assets/` | Images, video, icons, QR code, calendar file |

Every page repeats the same header and footer. If you change the navigation, change it on **every** page.

## How to add things

- **Tool guide:** copy `templates/tool-template.html` to `tools/<name>.html`. Fill in every section, including a long **Full walkthrough** (`<h2 id="walkthrough">`, step by step for a beginner, with common problems) and the **Business use case**. Then add a card to the correct group in `index.html` (copy an existing card and include its "Business use" line). Groups: Marketing and ad videos, 3D and design, Learning and building models, Data analytics, Writing and productivity, AI agents and automation, Code and teamwork. A tool can appear in more than one group. Some groups have an "Open slot" card; replace it when adding the first real guide.
- **Prompt:** copy the template at the bottom of `prompts.html` and paste it after the last prompt card. Use the same categories as the filter buttons (Video, Learning, Writing, Business, Building).
- **Meeting note:** paste the template from `meetings.html` just above the line `Add new meetings ABOVE this line`. Newest first. Never invent what happened at a meeting. If the contributor was not there, leave it.
- **Project:** paste the template from `showcase.html` above `Add new projects ABOVE this line`.
- **Credit:** every contributor adds a row to the table in `contributors.html` (above the `Add new contributors ABOVE this line` comment) in the same pull request. Use their GitHub handle, and their name only if they ask. Never invent contributions or levels.
- **Board card:** move or add a card in `board.html` when work starts or finishes.
- **Glossary word:** copy an existing `<article class="term" ...>` in `glossary.html`. Give it a unique `id="t-word"`, and put the lowercase searchable text in `data-term`.

Meetings are **every Thursday, 4:00 to 5:00 PM Mountain, at BYU**. The "next meeting" banner works that out automatically, so do not hard-code dates.

## Content rules

- **Beginner friendly.** Simple business-style explanation first, technical detail second. No unexplained jargon, or add the word to the glossary.
- **Prefer free or low-cost tools.** Say what is free and what is paid.
- **Do not invent facts.** Tool features and prices change, so link the official site and tell the reader to check current pricing. If you are not sure, say so or leave it out. Never make up statistics, quotes, results or member names.
- **Business use matters.** Each tool guide needs a realistic business scenario with how it works, how to measure success, and what to watch out for. Mention compliance when a field is regulated (insurance, health, finance).
- **Attribute people and sources.** Credit the member who made something.
- **Keep it safe.** Never add passwords, API keys, tokens or private personal or client information. If you see one in the repo, tell the owner right away.
- **Be respectful and inclusive.** No content that targets or embarrasses a person.
- **Copyright.** Do not paste long passages from articles or books. Summarize and link.

## HTML rules that prevent bugs

- Never put a link inside another link. Cards are `<a class="card">`, so do not put `<a>` inside them. `update_site.py` checks this.
- Keep each page's `<title>` as `Name | AI For Life`. The search index depends on it.
- Use relative links (`tools/capcut.html`, or `../style.css` from inside `tools/`).
- Keep the page header, footer and the `<script src=".../script.js">` tag, so search, install and share keep working.
- Copy buttons need `<button class="copy" data-copy>` inside a `.code` block, next to a `<pre>`.

## Test before you submit

```
python3 scripts/update_site.py
python3 -m http.server 8000
```

Then open http://localhost:8000 and look at the page you changed, on a narrow window too (phones matter).

## Commit and pull request

- Short commit message in plain words, for example `Add Midjourney tool guide`.
- In the pull request, say what you added and which official pages you checked for facts.
- The owner reviews every pull request before it goes live, and any change can be undone.
