#!/usr/bin/env python3
"""Stop hook: archive analytics reports to reports/.

Fires on every turn end. Reads the Stop-hook JSON from stdin, pulls the last
assistant message out of the transcript, and if that message contains the
sentinel marker `<!-- analytics-report -->`, writes it to
  <cwd>/reports/analytics-<YYYY-MM-DD>.md

Same-day collisions with different content get a -HHMMSS suffix; identical
content is skipped (so re-runs / continuations don't duplicate). The script
never blocks the turn: any error is swallowed and it always exits 0.
"""

import sys
import os
import json
import datetime

MARKER = "<!-- analytics-report -->"


def last_assistant_text(transcript_path):
    """Return the concatenated text of the final assistant message, or ''."""
    last = ""
    try:
        with open(transcript_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if entry.get("type") != "assistant":
                    continue
                msg = entry.get("message") or {}
                content = msg.get("content")
                parts = []
                if isinstance(content, str):
                    parts.append(content)
                elif isinstance(content, list):
                    for block in content:
                        if isinstance(block, dict) and block.get("type") == "text":
                            parts.append(block.get("text", ""))
                text = "".join(parts).strip()
                if text:
                    last = text  # keep overwriting; last one wins
    except (OSError, IOError):
        return ""
    return last


def main():
    raw = sys.stdin.read()
    try:
        payload = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        return

    transcript_path = payload.get("transcript_path")
    cwd = payload.get("cwd") or os.getcwd()
    if not transcript_path or not os.path.exists(transcript_path):
        return

    text = last_assistant_text(transcript_path)
    if MARKER not in text:
        return

    reports_dir = os.path.join(cwd, "reports")
    os.makedirs(reports_dir, exist_ok=True)

    now = datetime.datetime.now()
    day = now.strftime("%Y-%m-%d")
    target = os.path.join(reports_dir, "analytics-%s.md" % day)

    # Dedup: if the newest same-day file already holds this exact content, skip.
    if os.path.exists(target):
        try:
            with open(target, "r", encoding="utf-8") as f:
                if f.read().strip() == text.strip():
                    return
        except (OSError, IOError):
            pass
        # Different content, same day -> timestamped sibling, don't clobber.
        target = os.path.join(reports_dir, "analytics-%s-%s.md" % (day, now.strftime("%H%M%S")))

    try:
        with open(target, "w", encoding="utf-8") as f:
            f.write(text.rstrip() + "\n")
    except (OSError, IOError):
        return


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass
    sys.exit(0)
