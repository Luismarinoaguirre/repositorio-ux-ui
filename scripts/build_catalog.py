#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "content" / "herramientas-ux-ui.md"
JSON_OUT = ROOT / "data" / "ux-ui-tools.json"
FLAT_OUT = ROOT / "data" / "ux-ui-tools.flat.json"
JS_OUT = ROOT / "site" / "data.js"


def slugify(value: str) -> str:
    text = value.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def parse_markdown(path: Path) -> dict:
    title = ""
    source_url = ""
    source_title = ""
    last_reviewed = ""
    sections = []

    current_section = None
    current_group = None

    bullet_re = re.compile(r"^- \[(?P<title>.+?)\]\((?P<url>.+?)\)(?: - (?P<note>.+))?$")

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line:
            continue

        if line.startswith("# "):
            title = line[2:].strip()
            continue

        if line.startswith("Source: "):
            source_url = line.split("Source: ", 1)[1].strip()
            continue

        if line.startswith("Source title: "):
            source_title = line.split("Source title: ", 1)[1].strip()
            continue

        if line.startswith("Last reviewed: "):
            last_reviewed = line.split("Last reviewed: ", 1)[1].strip()
            continue

        if line.startswith("## "):
            current_section = {
                "title": line[3:].strip(),
                "slug": slugify(line[3:].strip()),
                "groups": [],
            }
            current_group = {
                "title": "General",
                "slug": "general",
                "items": [],
            }
            current_section["groups"].append(current_group)
            sections.append(current_section)
            continue

        if line.startswith("### "):
            if current_section is None:
                raise ValueError(f"Group found before section: {line}")
            current_group = {
                "title": line[4:].strip(),
                "slug": slugify(line[4:].strip()),
                "items": [],
            }
            current_section["groups"].append(current_group)
            continue

        match = bullet_re.match(line)
        if match:
            if current_section is None or current_group is None:
                raise ValueError(f"Item found before section/group: {line}")
            item_title = match.group("title").strip()
            item_url = match.group("url").strip()
            note = match.group("note")
            current_group["items"].append(
                {
                    "title": item_title,
                    "url": item_url,
                    "note": note.strip() if note else "",
                    "domain": urlparse(item_url).netloc,
                }
            )

    cleaned_sections = []
    for section in sections:
        groups = []
        for group in section["groups"]:
            if group["items"]:
                groups.append(group)
        section["groups"] = groups
        cleaned_sections.append(section)

    flat_items = []
    for section in cleaned_sections:
        for group in section["groups"]:
            for item in group["items"]:
                flat_items.append(
                    {
                        **item,
                        "section": section["title"],
                        "sectionSlug": section["slug"],
                        "group": group["title"],
                        "groupSlug": group["slug"],
                    }
                )

    domain_counts = Counter(item["domain"] for item in flat_items)

    data = {
        "metadata": {
            "title": title,
            "sourceUrl": source_url,
            "sourceTitle": source_title,
            "lastReviewed": last_reviewed,
            "extractedAt": datetime.now(timezone.utc).isoformat(),
            "sectionCount": len(cleaned_sections),
            "itemCount": len(flat_items),
            "topDomains": [
                {"domain": domain, "count": count}
                for domain, count in domain_counts.most_common(10)
            ],
        },
        "sections": cleaned_sections,
    }
    return data, flat_items


def main() -> None:
    data, flat_items = parse_markdown(SOURCE)
    JSON_OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    FLAT_OUT.write_text(json.dumps(flat_items, indent=2, ensure_ascii=False), encoding="utf-8")
    JS_OUT.write_text(
        "window.UXUI_TOOLS_DATA = " + json.dumps(data, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(
        f"Built catalog with {data['metadata']['sectionCount']} sections and "
        f"{data['metadata']['itemCount']} items."
    )


if __name__ == "__main__":
    main()
