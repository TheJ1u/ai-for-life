# AI For Life

A beginner-friendly guide to the AI tools we talk about in the **AI For Life** club, plus a glossary of the tech and business words you will hear.

**Live site:** https://thej1u.github.io/ai-for-life/ (no account or install needed, just open the link).

*Want your own copy of this site?* Fork the repo, then turn on GitHub Pages: Settings, Pages, deploy from `main`, folder `/ (root)`. GitHub Pages is a free switch that turns the repo's files into a website, and it will appear at `https://YOUR-USERNAME.github.io/ai-for-life/` (replace YOUR-USERNAME with your GitHub username).

## What is inside

| Page | What it covers |
| --- | --- |
| `index.html` | Home page with the header video and all tools |
| `tools/flux-3.html` | FLUX 3 by Black Forest Labs (AI video with sound) |
| `tools/higgsfield.html` | Higgsfield (multi-model AI video studio) |
| `tools/google-ai-edge-eloquent.html` | Google AI Edge Eloquent (free dictation app) |
| `tools/hugging-face.html` | Hugging Face (open model hub) |
| `tools/github.html` | GitHub (store, share and publish projects) |
| `start.html` | Start here: what the club is, how to join in, FAQ |
| `meetings.html` | Weekly meeting time, calendar invite and meeting log |
| `prompts.html` | Copy-and-paste prompt library |
| `showcase.html` | Member projects |
| `templates/tool-template.html` | Copy this to write a new tool guide |
| `tools/capcut.html` | CapCut (video editing) |
| `tools/build-your-own-model.html` | A path to fine-tuning and publishing your own model |
| `glossary.html` | Searchable notes: API, CLI, MCP, CEO, CIO, CCO and more |
| `roadmap.html` | Beginner learning path |

## Header video

The home page plays `assets/header.mp4` (a FLUX 3 clip shared in the club chat). Optional: add `assets/header-poster.jpg` as the still image shown while it loads. If the video is missing, the page falls back to a gradient.

## Edit it yourself (no build step)

This is plain HTML, CSS and a little JavaScript. Open any `.html` file in a text editor and change the words. To preview, open `index.html` in your browser.

- Add a new tool: copy a file in `tools/`, edit the text, and add a card in `index.html`.
- Add a glossary term: copy an `<article class="term">` block in `glossary.html`.

## Contributing

Open an issue or pull request with a better prompt, a fix, or a new tool. Keep claims factual and link official sources.

## Notes

Tools and prices change quickly. Confirm details on each official site. Do not commit API keys or private data.

## Extras built in

- **Search:** the box in the header searches every tool page, the glossary terms and the other pages. It reads `search-index.json`.
- **Share and install:** `share.html` has a QR code, a Share button, and steps to add the site to a phone home screen. The site is also an installable web app (`manifest.webmanifest`, `sw.js`).

## Regenerating the QR code and search index

The QR code points to `https://thej1u.github.io/ai-for-life/`. If you move to a custom domain, make a new QR code for the new address and replace `assets/qr.png` and `assets/qr.svg`. Whenever you add or edit pages, the search index (`search-index.json`) needs to be rebuilt too.

## Contributing

Everyone in the club is welcome to add to this site. See [CONTRIBUTING.md](CONTRIBUTING.md) for the step-by-step guide, or open an issue with an idea. If you use Claude Code or another AI assistant, it will read [CLAUDE.md](CLAUDE.md) and guide you through adding things.
