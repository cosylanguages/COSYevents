#!/usr/bin/env python3
"""
scripts/separate_gated_content.py

Separates public session content (vocabulary, metadata, titles, article text/links, lyrics/gap-fills, external links)
from gated content (discussion prompts, debate rounds, warm-up questions, facilitator notes, teacher linguistic corrections).

1. Extracts gated content into gated-content-export/ as individual JSON files AND a consolidated single build artifact.
2. Rewrites data/events/*.json, sessions/**/*.md, and sessions/**/*.html to remove gated fields while keeping public content.
"""

import os
import sys
import glob
import json
import re
import yaml
from bs4 import BeautifulSoup, Comment

GATED_EXPORT_DIR = "gated-content-export"

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def ensure_export_dir(subpath=""):
    target = os.path.join(GATED_EXPORT_DIR, subpath) if subpath else GATED_EXPORT_DIR
    os.makedirs(target, exist_ok=True)
    return target

def save_gated_export(session_id, prompts, facilitator_notes):
    # Sanitize session_id for filename
    safe_filename = session_id.replace("/", "--").replace("\\", "--") + ".json"
    filepath = os.path.join(GATED_EXPORT_DIR, safe_filename)

    payload = {
        "session_id": session_id,
        "prompts": prompts if isinstance(prompts, list) else [prompts] if prompts else [],
        "facilitator_notes": facilitator_notes or ""
    }

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    return payload

def process_events_json_files():
    all_exports = []

    # 1. long-reads.json
    lr_path = "data/events/long-reads.json"
    if os.path.exists(lr_path):
        with open(lr_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        modified = False
        for article in data.get("articles", []):
            if "prompts" in article:
                sid = f"long-reads-{article.get('id', 'unknown')}"
                prompts = article.pop("prompts")
                notes = ""
                exp = save_gated_export(sid, prompts, notes)
                all_exports.append(exp)
                modified = True

        if modified:
            with open(lr_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"[Updated] {lr_path}")

    # 2. cinema-club.json
    cc_path = "data/events/cinema-club.json"
    if os.path.exists(cc_path):
        with open(cc_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        modified = False
        for s in data.get("sessions", []):
            if "prompts" in s:
                sid = f"cinema-club-{s.get('id', 'unknown')}"
                prompts = s.pop("prompts")
                notes = ""
                exp = save_gated_export(sid, prompts, notes)
                all_exports.append(exp)
                modified = True

        if modified:
            with open(cc_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"[Updated] {cc_path}")

    # 3. karaoke-club.json
    kc_path = "data/events/karaoke-club.json"
    if os.path.exists(kc_path):
        with open(kc_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        modified = False
        for theme in data.get("themes", []):
            theme_id = theme.get("id", "theme")
            for song in theme.get("songs", []):
                if "pronunciation_prompt" in song:
                    song_title = song.get("title", "song")
                    sid = f"karaoke-club-{theme_id}-{slugify(song_title)}"
                    prompt_text = song.pop("pronunciation_prompt")
                    exp = save_gated_export(sid, [prompt_text], "")
                    all_exports.append(exp)
                    modified = True

        if modified:
            with open(kc_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"[Updated] {kc_path}")

    # 4. speaking-clubs.json
    sc_path = "data/events/speaking-clubs.json"
    if os.path.exists(sc_path):
        with open(sc_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        modified = False
        for club in data.get("clubs", []):
            if "prompts" in club:
                sid = f"speaking-club-{club.get('id', 'unknown')}"
                prompts = club.pop("prompts")
                notes = ""
                exp = save_gated_export(sid, prompts, notes)
                all_exports.append(exp)
                modified = True

        if modified:
            with open(sc_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"[Updated] {sc_path}")

    return all_exports

def process_md_files():
    exports = []
    md_files = glob.glob("sessions/**/*.md", recursive=True) + \
               glob.glob("fr/sessions/**/*.md", recursive=True) + \
               glob.glob("ru/sessions/**/*.md", recursive=True)

    print(f"Processing {len(md_files)} Markdown session files...")

    for md_path in md_files:
        norm_path = md_path.replace("\\", "/")
        session_id = os.path.splitext(norm_path)[0]

        with open(md_path, "r", encoding="utf-8") as f:
            content = f.read()

        match = re.match(r'^---\r?\n([\s\S]+?)\r?\n---\r?\n?([\s\S]*)$', content)
        if not match:
            continue

        fm = yaml.safe_load(match[1]) or {}
        body = match[2].strip()

        prompts = []
        notes = []

        # Extract gated fields
        gated_keys = ["warm_up", "round_1", "lets_speak_together", "round_2", "closing_html", "philosophers_ledger", "debate_duel"]
        for gk in gated_keys:
            if gk in fm:
                prompts.append({gk: fm.pop(gk)})

        if "mistakes" in fm:
            notes.append({"mistakes": fm.pop("mistakes")})

        if prompts or notes or body:
            notes_str = yaml.dump(notes, ensure_ascii=False) if notes else ""
            if body:
                notes_str = (notes_str + "\n" + body).strip()

            exp = save_gated_export(session_id, prompts, notes_str)
            exports.append(exp)

        # Write back modified frontmatter without gated keys
        new_yaml = yaml.dump(fm, lineWidth=-1, noRefs=True, forceQuotes=False, allow_unicode=True)
        new_content = f"---\n{new_yaml}---\n"

        with open(md_path, "w", encoding="utf-8") as f:
            f.write(new_content)

    return exports

def make_gated_prompt_html(title, desc):
    return f"""<div class="ce-gated-prompt">
  <h4>🔒 {title}</h4>
  <p>{desc}</p>
</div>"""

def process_html_files():
    exports = []
    html_files = glob.glob("sessions/**/*.html", recursive=True) + \
                 glob.glob("fr/sessions/**/*.html", recursive=True) + \
                 glob.glob("ru/sessions/**/*.html", recursive=True)

    print(f"Processing {len(html_files)} HTML session files...")

    for html_path in html_files:
        norm_path = html_path.replace("\\", "/")
        session_id = os.path.splitext(norm_path)[0]

        with open(html_path, "r", encoding="utf-8") as f:
            raw_html = f.read()

        soup = BeautifulSoup(raw_html, "html.parser")

        prompts = []
        notes = []
        modified = False

        # 1. Warm-up (#s-warm)
        warm_block = soup.find(id="s-warm")
        if warm_block:
            body_div = warm_block.find(class_="round-body")
            if body_div:
                # Extract text
                items = [li.get_text(strip=True) for li in body_div.find_all("li")]
                instruction = body_div.find(class_="vim-instruction")
                inst_text = instruction.get_text(strip=True) if instruction else ""
                if items or inst_text:
                    prompts.append({"warm_up": {"instruction": inst_text, "questions": items}})

                # Replace inner html
                placeholder = BeautifulSoup(make_gated_prompt_html(
                    "Warm-up Discussion Prompts",
                    "Discussion prompts and facilitator notes for this round are reserved for enrolled students and hosts."
                ), "html.parser")
                body_div.clear()
                body_div.append(placeholder)
                modified = True

        # 2. Round 1 (#s-r1)
        r1_block = soup.find(id="s-r1")
        if r1_block:
            body_div = r1_block.find(class_="round-body")
            if body_div:
                items = []
                for item_div in body_div.find_all(class_="round-item"):
                    m = item_div.find(class_="round-item-main")
                    p = item_div.find(class_="round-item-personal")
                    main_txt = m.get_text(strip=True) if m else ""
                    pers_txt = p.get_text(strip=True) if p else ""
                    if main_txt or pers_txt:
                        items.append({"main": main_txt, "personal": pers_txt})
                instruction = body_div.find(class_="vim-instruction")
                inst_text = instruction.get_text(strip=True) if instruction else ""
                if items or inst_text:
                    prompts.append({"round_1": {"instruction": inst_text, "items": items}})

                placeholder = BeautifulSoup(make_gated_prompt_html(
                    "Round 1 Discussion Prompts",
                    "Discussion prompts and facilitator notes for this round are reserved for enrolled students and hosts."
                ), "html.parser")
                body_div.clear()
                body_div.append(placeholder)
                modified = True

        # 3. Let's Speak Together (#s-lst)
        lst_block = soup.find(id="s-lst")
        if lst_block:
            body_div = lst_block.find(class_="round-body")
            if body_div:
                body_html = "".join([str(c) for c in body_div.contents]).strip()
                if body_html and "ce-gated-prompt" not in body_html:
                    prompts.append({"lets_speak_together": body_html})

                placeholder = BeautifulSoup(make_gated_prompt_html(
                    "Let's Speak Together",
                    "Discussion prompts and facilitator notes for this round are reserved for enrolled students and hosts."
                ), "html.parser")
                body_div.clear()
                body_div.append(placeholder)
                modified = True

        # 4. Round 2 (#s-r2)
        r2_block = soup.find(id="s-r2")
        if r2_block:
            body_div = r2_block.find(class_="round-body")
            if body_div:
                items = []
                for item_div in body_div.find_all(class_="round-item"):
                    m = item_div.find(class_="round-item-main")
                    p = item_div.find(class_="round-item-personal")
                    main_txt = m.get_text(strip=True) if m else ""
                    pers_txt = p.get_text(strip=True) if p else ""
                    if main_txt or pers_txt:
                        items.append({"main": main_txt, "personal": pers_txt})
                instruction = body_div.find(class_="vim-instruction")
                inst_text = instruction.get_text(strip=True) if instruction else ""
                if items or inst_text:
                    prompts.append({"round_2": {"instruction": inst_text, "items": items}})

                placeholder = BeautifulSoup(make_gated_prompt_html(
                    "Round 2 Discussion Prompts",
                    "Discussion prompts and facilitator notes for this round are reserved for enrolled students and hosts."
                ), "html.parser")
                body_div.clear()
                body_div.append(placeholder)
                modified = True

        # 5. Closing (#s-closing / #s-close)
        closing_block = soup.find(id="s-closing") or soup.find(id="s-close")
        if closing_block:
            body_div = closing_block.find(class_="round-body")
            if body_div:
                body_html = "".join([str(c) for c in body_div.contents]).strip()
                if body_html and "ce-gated-prompt" not in body_html:
                    prompts.append({"closing": body_html})

                placeholder = BeautifulSoup(make_gated_prompt_html(
                    "Closing Circle",
                    "Discussion prompts and facilitator notes for this round are reserved for enrolled students and hosts."
                ), "html.parser")
                body_div.clear()
                body_div.append(placeholder)
                modified = True

        # 6. Mistakes (#s-mistakes)
        mistake_block = soup.find(id="s-mistakes")
        if mistake_block:
            body_div = mistake_block.find(class_="mistake-body")
            if body_div:
                m_items = []
                for m_div in body_div.find_all(class_="mistake-item"):
                    w = m_div.find(class_="mistake-wrong")
                    r = m_div.find(class_="mistake-right")
                    n = m_div.find(class_="mistake-note-text")
                    w_txt = w.get_text(strip=True) if w else ""
                    r_txt = r.get_text(strip=True) if r else ""
                    n_txt = n.get_text(strip=True) if n else ""
                    if w_txt or r_txt or n_txt:
                        m_items.append({"wrong": w_txt, "right": r_txt, "note": n_txt})
                if m_items:
                    notes.append({"mistakes": m_items})

                placeholder = BeautifulSoup(make_gated_prompt_html(
                    "Teacher's Note (Linguistic Corrections)",
                    "Linguistic corrections and facilitator notes are reserved for enrolled students and hosts."
                ), "html.parser")
                body_div.clear()
                body_div.append(placeholder)
                modified = True

        if prompts or notes:
            exp = save_gated_export(session_id, prompts, notes)
            exports.append(exp)

        if modified:
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(str(soup))

    return exports

def main():
    ensure_export_dir()

    print("=== Processing Events JSON Files ===")
    events_exports = process_events_json_files()

    print("=== Processing Session Markdown Files ===")
    md_exports = process_md_files()

    print("=== Processing Session HTML Files ===")
    html_exports = process_html_files()

    # Build single consolidated export build artifact
    consolidated_map = {}
    for exp in events_exports + md_exports + html_exports:
        sid = exp["session_id"]
        if sid not in consolidated_map:
            consolidated_map[sid] = exp
        else:
            # Merge prompts and notes if duplicate
            if exp["prompts"]:
                consolidated_map[sid]["prompts"].extend(exp["prompts"])
            if exp["facilitator_notes"]:
                if consolidated_map[sid]["facilitator_notes"]:
                    consolidated_map[sid]["facilitator_notes"] += "\n" + str(exp["facilitator_notes"])
                else:
                    consolidated_map[sid]["facilitator_notes"] = exp["facilitator_notes"]

    consolidated_list = list(consolidated_map.values())
    artifact_path = os.path.join(GATED_EXPORT_DIR, "gated_content_all_export.json")
    with open(artifact_path, "w", encoding="utf-8") as f:
        json.dump(consolidated_list, f, indent=2, ensure_ascii=False)

    print(f"\nCompleted! Total sessions exported: {len(consolidated_list)}")
    print(f"Consolidated build artifact written to {artifact_path}")

if __name__ == "__main__":
    main()
