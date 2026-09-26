#!/usr/bin/env python3
"""
scripts/convert_session.py

Reads a session JSON file (public summary + key_vocabulary) and generates:
1. A PR-ready vocabulary JSON snippet matching COSYdata's actual schema
   (id scheme: lang:word:form, required fields per schemas/vocabulary.schema.json:
    id, word, language, form, transcription).
2. A lesson-shell JSON matching COSYplatform's lesson format for manual review.

Usage:
    python3 scripts/convert_session.py <path-to-session.json> [--out-dir OUTPUT_DIR]
"""

import sys
import os
import json
import argparse
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def convert_session(session_file, out_dir="output"):
    if not os.path.exists(session_file):
        print(f"Error: Session file not found: {session_file}", file=sys.stderr)
        sys.exit(1)

    with open(session_file, 'r', encoding='utf-8') as f:
        session = json.load(f)

    session_id = session.get("session_id", "session-unknown")
    title = session.get("title", "Untitled Session")
    level = session.get("level", "B1")
    language = session.get("language", "en")
    summary = session.get("summary", "")
    key_vocab = session.get("key_vocabulary", [])
    prompts = session.get("discussion_prompts", [])
    category = session.get("category", "General")

    os.makedirs(out_dir, exist_ok=True)

    # 1. Generate COSYdata vocabulary entries
    vocab_entries = []
    for item in key_vocab:
        term = item.get("term", "").strip()
        if not term:
            continue

        form = item.get("form", "noun").lower()
        if form not in ["noun", "verb", "adjective", "adverb", "phrase", "expression", "idiom"]:
            form = "noun"

        # COSYdata id scheme: lang:word:form
        vocab_id = f"{language}:{slugify(term)}:{form}"
        translation = item.get("translation", "")
        example = item.get("example", "")

        vocab_entry = {
            "id": vocab_id,
            "word": term,
            "language": language,
            "form": form,
            "level": level,
            "transcription": item.get("transcription", f"/{term}/"),
            "definitions": [translation] if translation else [term],
            "examples": [example] if example else [],
            "tags": [category.lower().replace(" ", "-"), "cosyevents-export"]
        }
        vocab_entries.append(vocab_entry)

    vocab_output_path = os.path.join(out_dir, f"{session_id}_vocab.json")
    with open(vocab_output_path, 'w', encoding='utf-8') as f:
        json.dump(vocab_entries, f, indent=2, ensure_ascii=False)
    print(f"Generated vocabulary snippet ({len(vocab_entries)} entries): {vocab_output_path}")

    # 2. Generate COSYplatform lesson-shell JSON
    lesson_shell = {
      "$schema": "https://cosylanguages.github.io/COSYplatform/schemas/lesson.schema.json",
      "sessionId": session_id,
      "title": title,
      "eventType": session.get("event_type", "speaking-club"),
      "category": category,
      "language": language,
      "level": level,
      "summary": summary,
      "reviewStatus": "pending_manual_review",
      "sections": [
        {
          "type": "warmup",
          "title": "Warm-up Discussion",
          "prompts": prompts[:1] if prompts else ["What are your initial thoughts on this topic?"]
        },
        {
          "type": "vocabulary",
          "title": "Key Vocabulary & High-Utility Expressions",
          "items": [
            {
              "term": v.get("term", ""),
              "translation": v.get("translation", ""),
              "example": v.get("example", "")
            } for v in key_vocab
          ]
        },
        {
          "type": "deep-dive",
          "title": "Core Discussion & Case Study",
          "summary": summary,
          "questions": prompts[1:] if len(prompts) > 1 else prompts
        },
        {
          "type": "wrapup",
          "title": "Reflective Speaking & Personal Takeaways",
          "prompts": [
            f"Summarize how the concepts from '{title}' apply to your own personal or professional experience."
          ]
        }
      ]
    }

    lesson_output_path = os.path.join(out_dir, f"{session_id}_lesson_shell.json")
    with open(lesson_output_path, 'w', encoding='utf-8') as f:
        json.dump(lesson_shell, f, indent=2, ensure_ascii=False)
    print(f"Generated lesson-shell JSON: {lesson_output_path}")

def main():
    parser = argparse.ArgumentParser(description="Convert COSYevents session JSON into COSYdata vocabulary snippet and COSYplatform lesson shell.")
    parser.add_argument("session_file", help="Path to input session JSON file")
    parser.add_argument("--out-dir", default="output", help="Directory for generated output files")
    args = parser.parse_args()

    convert_session(args.session_file, args.out_dir)

if __name__ == "__main__":
    main()
