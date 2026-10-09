#!/usr/bin/env python3
"""Run this after you add or edit pages:   python3 scripts/update_site.py

It does two things:
1. Rebuilds search-index.json so the site search finds your new content.
2. Checks every page for broken links and for a link nested inside another link
   (that breaks the layout).
No extra installs needed. It only uses Python's standard library.
"""
import glob, html as H, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)


def text_of(s):
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", H.unescape(s)).strip()


def build_index():
    index = []
    for f in sorted(glob.glob("**/*.html", recursive=True)):
        if f.startswith("templates/"):
            continue
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
    for f in sorted(glob.glob("**/*.html", recursive=True)):
        s = open(f, encoding="utf-8").read()
        for link in re.findall(r'(?:href|src)="([^"#]+)"', s):
            if link.startswith(("http", "mailto:")):
                continue
            target = os.path.normpath(os.path.join(os.path.dirname(f), link.split("?")[0]))
            if not os.path.exists(target):
                print(f"BROKEN LINK in {f}: {link}")
                problems += 1
        if re.search(r"<a [^>]*>(?:(?!</a>).)*?<a ", s, flags=re.S):
            print(f"NESTED LINK in {f}: a link sits inside another link (for example inside a card). Remove the inner one.")
            problems += 1
    print("Checks passed." if not problems else f"{problems} problem(s) found. Fix them before you commit.")
    return problems


if __name__ == "__main__":
    build_index()
    sys.exit(1 if check_pages() else 0)
