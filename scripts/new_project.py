#!/usr/bin/env python3
"""Scaffold a hover-reveal site: one page, several looks, each hiding a second picture under the first.

    python3 new_project.py <project-dir> --brand "Doublure" [--tagline "What is sewn inside"]
        [--collection "Collection Nº 01"] [--series "Interior Lives"] [--vert "Move slowly. Every surface has a lining."]
        [--description "…"]

Creates:
    <project>/site/     index.html (brand filled in), style.css, main.js (the engine), kit.js (line-work builders),
                        looks.js (SITE config + an empty LOOKS list to fill), img/ (one folder per look)
    <project>/tools/    generate.mjs (fal image pairs), video.mjs (Kling loops), grid.mjs (measuring sheets),
                        looks.json (prompts: shared style + keep, one entry per look), package.json
    <project>/.gitignore
Nothing is generated and no API is called. Looks are added by editing tools/looks.json and site/looks.js.
"""
import argparse, re, shutil, sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
TEMPLATE = SKILL / "assets" / "template"

ap = argparse.ArgumentParser()
ap.add_argument("project")
ap.add_argument("--brand", required=True, help="the site's name, top left, e.g. 'Doublure'")
ap.add_argument("--tagline", default="What is underneath", help="small caps line in the header")
ap.add_argument("--collection", default="Collection Nº 01", help="top-right line")
ap.add_argument("--series", default="Interior Lives", help="top-right second line")
ap.add_argument("--vert", default="Move slowly. Every surface has a lining.", help="vertical line on wide screens")
ap.add_argument("--description", help="meta description (default built from the brand)")
a = ap.parse_args()

proj = Path(a.project).expanduser().resolve()
if proj.exists() and any(proj.iterdir()):
    sys.exit(f"{proj} exists and is not empty; pick a new folder")

shutil.copytree(TEMPLATE, proj, dirs_exist_ok=True)
slug = re.sub(r"[^a-z0-9]+", "-", a.brand.lower()).strip("-") or "hover-reveal"
fill = {
    "{{BRAND}}": a.brand,
    "{{BRAND_UPPER}}": a.brand.upper(),
    "{{ID}}": slug,
    "{{TAGLINE}}": a.tagline,
    "{{COLLECTION}}": a.collection,
    "{{SERIES}}": a.series,
    "{{VERT}}": a.vert,
    "{{DESCRIPTION}}": a.description or f"{a.brand}: move to reveal what is underneath.",
}
for f in (proj / "site" / "index.html", proj / "site" / "looks.js"):
    s = f.read_text()
    for k, v in fill.items():
        s = s.replace(k, v)
    f.write_text(s)
(proj / ".gitignore").write_text(
    "node_modules/\n.DS_Store\n.env.local\n"
    "# 2K masters, raw Kling clips, review and measuring sheets: regenerate with tools/*.mjs\n"
    "tools/out/\n")
print(f"created {proj}")
print(f"next: cd {proj / 'tools'} && npm install")
