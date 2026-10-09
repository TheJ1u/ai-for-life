#!/usr/bin/env python3
"""Run this after you add or edit pages:   python3 scripts/update_site.py

It does four things:
1. Rebuilds search-index.json so the site search finds your new content.
2. Rebuilds sitemap.xml and robots.txt so search engines find every page.
3. Adds link-preview tags (title, description, picture) to any page missing them.
4. Checks every page for broken links and for a link nested inside another link
   (that breaks the layout).
No extra installs needed. It only uses Python's standard library.
"""
import datetime, glob, html as H, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
BASE = "https://thej1u.github.io/ai-for-life/"   # change this if the web address changes


def text_of(s):
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", H.unescape(s)).strip()


def pages(include_template=False, include_404=True):
    for f in sorted(glob.glob("**/*.html", recursive=True)):
        if f.startswith("templates/") and not include_template:
            continue
        if f == "404.html" and not include_404:
            continue
        yield f


def page_url(f):
    return BASE if f == "index.html" else BASE + f


def ensure_preview_tags():
    """Add Open Graph tags (the title, text and picture shown when a link is shared)."""
    n = 0
    for f in pages(include_template=True):
        s = open(f, encoding="utf-8").read()
        if 'property="og:title"' in s:
            continue
        t = re.search(r"<title>(.*?)</title>", s)
        d = re.search(r'<meta name="description" content="([^"]*)">', s)
        if not t:
            continue
        tags = (
            f'<meta property="og:type" content="website">\n'
            f'<meta property="og:site_name" content="AI For Life">\n'
            f'<meta property="og:title" content="{t.group(1)}">\n'
            f'<meta property="og:description" content="{d.group(1) if d else "AI For Life club"}">\n'
            f'<meta property="og:url" content="{page_url(f)}">\n'
            f'<meta property="og:image" content="{BASE}assets/og-image.png">\n'
            f'<meta name="twitter:card" content="summary_large_image">\n'
        )
        if f != "404.html" and not f.startswith("templates/"):
            tags += f'<link rel="canonical" href="{page_url(f)}">\n'
        s = s.replace("</head>", tags + "</head>", 1)
        open(f, "w", encoding="utf-8").write(s)
        n += 1
    print(f"Link-preview tags added to {n} page(s)")


def build_sitemap():
    today = datetime.date.today().isoformat()
    urls = [BASE if f == "index.html" else page_url(f) for f in pages(include_404=False)]
    body = "".join(f"  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>\n" for u in urls)
    open("sitemap.xml", "w", encoding="utf-8").write(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "</urlset>\n")
    open("robots.txt", "w", encoding="utf-8").write(f"User-agent: *\nAllow: /\n\nSitemap: {BASE}sitemap.xml\n")
    print(f"Sitemap rebuilt: {len(urls)} pages")


def build_index():
    index = []
    for f in pages(include_404=False):
        s = open(f, encoding="utf-8").read()
        t = re.search(r"<title>(.*?) \| AI For Life</title>", s)
        if not t:
            print(f"WARNING: {f} has no '<title>Name | AI For Life</title>'")
            continue
        title = t.group(1)
        m = re.search(r"<main.*?</main>", s, flags=re.S)
        body = text_of(m.group(0) if m else s)
        if f == "glossary.html":
            for a in re.finditer(r'<article class="term" id="(t-[^"]+)".*?</article>', s, flags=re.S):
                name = text_of(re.search(r"<h3>(.*?)(?:<span|</h3>)", a.group(0)).group(1))
                index.append({"t": name, "k": "Glossary", "u": f"glossary.html#{a.group(1)}", "x": text_of(a.group(0))})
            index.append({"t": "Glossary", "k": "Page", "u": "glossary.html", "x": "glossary of tech and business terms"})
            continue
        if f == "prompts.html":
            for a in re.finditer(r'<article class="pcard".*?</article>', s, flags=re.S):
                if "Your prompt here" in a.group(0):
                    continue
                index.append({"t": H.unescape(re.search(r"<h3>(.*?)</h3>", a.group(0)).group(1)),
                              "k": "Prompt", "u": "prompts.html", "x": text_of(a.group(0))})
        index.append({"t": title, "k": "Tool" if f.startswith("tools/") else "Page", "u": f, "x": body[:5000]})
    with open("search-index.json", "w", encoding="utf-8") as out:
        json.dump(index, out, separators=(",", ":"))
    print(f"Search index rebuilt: {len(index)} entries")


def check_pages():
    problems = 0
    for f in pages(include_template=True):
        s = open(f, encoding="utf-8").read()
        for link in re.findall(r'(?:href|src)="([^"#]+)"', s):
            if link.startswith(("http", "mailto:", "/")):
                continue
            target = os.path.normpath(os.path.join(os.path.dirname(f), link.split("?")[0]))
            if not os.path.exists(target):
                print(f"BROKEN LINK in {f}: {link}")
                problems += 1
        if re.search(r"<a [^>]*>(?:(?!</a>).)*?<a ", s, flags=re.S):
            print(f"NESTED LINK in {f}: a link sits inside another link (for example inside a card). Remove the inner one.")
            problems += 1
        ids = re.findall(r'\bid="([^"]+)"', s)
        dup = {i for i in ids if ids.count(i) > 1}
        if dup:
            print(f"DUPLICATE ID in {f}: {', '.join(sorted(dup))}")
            problems += 1
    print("Checks passed." if not problems else f"{problems} problem(s) found. Fix them before you commit.")
    return problems


if __name__ == "__main__":
    ensure_preview_tags()
    build_sitemap()
    build_index()
    sys.exit(1 if check_pages() else 0)
