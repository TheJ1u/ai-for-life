# Contributing to AI For Life

This site belongs to everyone in the club. You do not need to be an expert. Small additions are welcome.

## What you can add

| I want to add | Where | Time |
| --- | --- | --- |
| A meeting note | `meetings.html` (template is on the page) | 5 min |
| A prompt | `prompts.html` (template is on the page) | 5 min |
| A project | `showcase.html` (template is on the page) | 5 min |
| A glossary word | `glossary.html` (copy an existing entry) | 5 min |
| A new tool guide | Copy `templates/tool-template.html` to `tools/your-tool.html` | 30 min |

Not ready to edit? [Open an issue](https://github.com/TheJ1u/ai-for-life/issues/new) and someone will pick it up.

## How to add something (no command line needed)

1. Make a free account at github.com.
2. Open the repo and click **Fork**. This makes your own copy, so you cannot break the original.
3. Open the file, click the **pencil icon**, make your change, and click **Commit changes**.
4. Click **Contribute**, then **Open pull request**. Write one line about what you added.
5. Someone reviews it and clicks **Merge**. It appears on the site within a couple of minutes.

## Rules of thumb

- Write for a beginner. Explain simply first, technical detail second.
- Say where facts come from. Tool pricing and features change, so link the official site.
- Prefer free or low-cost options.
- Never include passwords, API keys, or private client or personal information.
- Only share work you are comfortable making public.
- Keep the tone friendly. Everyone is learning.

## Adding a new tool guide

1. Copy `templates/tool-template.html` to `tools/your-tool.html`.
2. Fill in every section. Delete nothing, so all guides read the same way.
3. Add a card to the right group on the home page (`index.html`). Groups are Marketing and ad videos, 3D and design, Learning and building models, Data analytics, Writing and productivity, and Code and teamwork. Copy an existing `<a class="card">`, and fill in its **Business use** line.
3b. Fill in the **Business use case** section on your guide with a realistic scenario, how it works, how to measure success, and what to watch out for.
4. In your pull request, say which official pages you checked.

## If something goes wrong

Every change is saved and can be undone. A mistake in a pull request is fixed by editing it, and a mistake that was already merged can be reverted with one click.

## Using Claude or another AI to help

This repo includes instructions that AI assistants read automatically (`CLAUDE.md` and `AGENTS.md`), so you can get help from one even as a beginner.

**With Claude Code (or a similar tool on your computer):**
1. Fork the repo, then clone your fork (or ask the AI to do it for you).
2. Open the folder in Claude Code. It reads `CLAUDE.md` on its own.
3. Say what you want, for example: `I want to add a guide for [tool] to the club site. Walk me through it.`
4. When it is done, ask it to commit and help you open a pull request.

**With Claude or ChatGPT in the browser:** connect your GitHub account in the app's settings, or paste the contents of `CLAUDE.md` into the chat, then describe what you want to add. Copy the result into the file on GitHub (pencil icon), commit, and open a pull request.

Whichever you use, read what it wrote before you submit it. AI can state wrong facts with confidence, so check anything about pricing or features on the tool's official site.

After editing, run `python3 scripts/update_site.py` (or ask your AI to). It refreshes the site search and catches broken links.

## Getting credit for your work

Your pull request is permanent, public proof of what you did. Add yourself to the table on the [Contributors page](contributors.html) in the same pull request, then use the resume bullet builder there. Describe your work honestly, and say so if an AI assistant helped.
