#!/usr/bin/env python3
import argparse
import json
import shutil
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

BASE = Path('/Users/luismarino/Desktop/CL4UDE-PJ/Repositorio UX-UI')
TARGETS = [BASE / 'docs/data.js', BASE / 'site/data.js']
PREFIX = 'window.UXUI_TOOLS_DATA = '
SUFFIX = ';'
INBOX_DIR = BASE / 'inbox' / 'resources'
ARCHIVE_DIR = BASE / 'inbox' / 'processed'
TEMPLATE_PATH = INBOX_DIR / '_template.json'


def parse_args():
    parser = argparse.ArgumentParser(description='Add or sync UX/UI resources into the catalog dataset.')
    parser.add_argument('--file', dest='file_path', help='Path to a JSON file to import.')
    parser.add_argument('--dir', dest='directory', help='Directory containing JSON files to import.')
    parser.add_argument('--stdin', action='store_true', help='Read a single JSON payload from stdin.')
    parser.add_argument('--archive', action='store_true', help='Move imported files into inbox/processed after import.')
    parser.add_argument('--init-inbox', action='store_true', help='Create inbox folders and a JSON template.')
    return parser.parse_args()


def ensure_inbox():
    INBOX_DIR.mkdir(parents=True, exist_ok=True)
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    if not TEMPLATE_PATH.exists():
        TEMPLATE_PATH.write_text(
            json.dumps(
                {
                    'title': 'Nombre del recurso',
                    'section': 'lecturas',
                    'group': 'producto-ai',
                    'url': 'https://example.com/resource',
                    'note': '',
                    'fileName': '',
                    'createdAt': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
                    'tags': [],
                },
                indent=2,
                ensure_ascii=False,
            ) + '\n',
            encoding='utf-8',
        )


def load_payload(raw: str):
    raw = raw.strip()
    if not raw:
        raise SystemExit('Missing JSON payload')
    return json.loads(raw)


def load_payload_from_file(path: Path):
    return load_payload(path.read_text(encoding='utf-8'))


def load_dataset(path: Path):
    raw = path.read_text(encoding='utf-8').strip()
    if not raw.startswith(PREFIX) or not raw.endswith(SUFFIX):
        raise SystemExit(f'Unexpected dataset format in {path}')
    return json.loads(raw[len(PREFIX):-len(SUFFIX)])


def save_dataset(path: Path, data):
    path.write_text(PREFIX + json.dumps(data, ensure_ascii=False) + SUFFIX + '\n', encoding='utf-8')


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
            bits.append(f"Cargado el {dt.strftime('%d %b %Y')}")
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
        return 'updated', new_item['title']

    group['items'].append(new_item)
    return 'added', new_item['title']


def import_payloads(payloads):
    datasets = [load_dataset(target) for target in TARGETS]
    changes = []
    for payload in payloads:
        result = None
        for index, dataset in enumerate(datasets):
            action, title = upsert_resource(dataset, payload)
            if index == 0:
                result = (action, title)
        changes.append(result)

    for dataset in datasets:
        update_metadata(dataset)

    for target, dataset in zip(TARGETS, datasets):
        save_dataset(target, dataset)

    return changes, datasets[0]['metadata']['itemCount']


def collect_inbox_payloads(directory: Path):
    payloads = []
    paths = []
    for path in sorted(directory.glob('*.json')):
        if path.name.startswith('_'):
            continue
        payloads.append(load_payload_from_file(path))
        paths.append(path)
    return payloads, paths


def archive_files(paths):
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    for index, path in enumerate(paths, start=1):
        target = ARCHIVE_DIR / f'{stamp}-{index:02d}-{path.name}'
        shutil.move(str(path), target)


def main():
    args = parse_args()

    if args.init_inbox:
        ensure_inbox()

    payloads = []
    imported_paths = []

    if args.stdin:
        payloads.append(load_payload(sys.stdin.read()))
    if args.file_path:
        file_path = Path(args.file_path)
        payloads.append(load_payload_from_file(file_path))
        imported_paths.append(file_path)
    if args.directory:
        directory = Path(args.directory)
        dir_payloads, dir_paths = collect_inbox_payloads(directory)
        payloads.extend(dir_payloads)
        imported_paths.extend(dir_paths)

    if not payloads:
        if args.init_inbox:
            print(f'Inbox ready at {INBOX_DIR}')
            return
        raise SystemExit('No payloads provided. Use --stdin, --file or --dir.')

    changes, item_count = import_payloads(payloads)

    if args.archive and imported_paths:
        archive_files(imported_paths)

    for action, title in changes:
        print(f'{action}: {title}')
    print(f'total items: {item_count}')


if __name__ == '__main__':
    main()
