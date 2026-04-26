#!/usr/bin/env python3
import json
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

BASE = Path('/Users/luismarino/Desktop/CL4UDE-PJ/Repositorio UX-UI')
TARGETS = [BASE / 'docs/data.js', BASE / 'site/data.js']
PREFIX = 'window.UXUI_TOOLS_DATA = '
SUFFIX = ';'


def load_payload(raw: str):
    raw = raw.strip()
    if not raw:
        raise SystemExit('Missing JSON payload')
    return json.loads(raw)


def load_dataset(path: Path):
    raw = path.read_text().strip()
    if not raw.startswith(PREFIX) or not raw.endswith(SUFFIX):
        raise SystemExit(f'Unexpected dataset format in {path}')
    return json.loads(raw[len(PREFIX):-len(SUFFIX)])


def save_dataset(path: Path, data):
    path.write_text(PREFIX + json.dumps(data, ensure_ascii=False) + SUFFIX)


def slug_to_title(slug: str):
    return ' '.join(part.capitalize() for part in slug.split('-'))


def infer_type(url: str, file_name: str):
    lowered = (file_name or url or '').lower()
    if lowered.endswith('.pdf'):
        return 'PDF'
    return 'Link'


def build_note(item_type: str, note: str, created_at: str, file_name: str):
    if note:
        return note
    bits = [item_type]
    if file_name:
        bits.append(f'Archivo: {file_name}')
    if created_at:
        try:
            dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            bits.append(f'Cargado el {dt.strftime("%d %b %Y")}')
        except ValueError:
            pass
    return ' · '.join(bits)


def update_metadata(data):
    items = []
    for section in data.get('sections', []):
        for group in section.get('groups', []):
            items.extend(group.get('items', []))

    data['metadata']['itemCount'] = len(items)
    domain_counts = Counter(item.get('domain', '') for item in items if item.get('domain'))
    top_domains = sorted(domain_counts.items(), key=lambda pair: (-pair[1], pair[0]))[:10]
    data['metadata']['topDomains'] = [
        {'domain': domain, 'count': count} for domain, count in top_domains
    ]


def upsert_resource(data, payload):
    section_slug = payload['section']
    group_slug = payload['group']
    url = payload['url']
    domain = urlparse(url).netloc
    item_type = infer_type(url, payload.get('fileName', ''))
    date = payload.get('createdAt', '')[:10] if payload.get('createdAt') else ''
    new_item = {
        'title': payload['title'],
        'url': url,
        'note': build_note(item_type, payload.get('note', ''), payload.get('createdAt', ''), payload.get('fileName', '')),
        'domain': domain,
        'type': item_type,
        'tags': payload.get('tags', []),
        'date': date,
    }

    section = next((section for section in data['sections'] if section['slug'] == section_slug), None)
    if section is None:
        section = {'title': slug_to_title(section_slug), 'slug': section_slug, 'groups': []}
        data['sections'].append(section)
        data['metadata']['sectionCount'] = len(data['sections'])

    group = next((group for group in section['groups'] if group['slug'] == group_slug), None)
    if group is None:
        group = {'title': slug_to_title(group_slug), 'slug': group_slug, 'items': []}
        section['groups'].append(group)

    existing = next((item for item in group['items'] if item.get('title') == new_item['title'] or item.get('url') == new_item['url']), None)
    if existing:
        existing.update(new_item)
    else:
        group['items'].append(new_item)


def main():
    payload = load_payload(sys.stdin.read())
    for target in TARGETS:
        data = load_dataset(target)
        upsert_resource(data, payload)
        update_metadata(data)
        save_dataset(target, data)
    print(f"Added/updated: {payload['title']}")


if __name__ == '__main__':
    main()
