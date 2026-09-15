"""Checks that each narration clip actually says what the script asked for.

Neural TTS can silently drop or mangle words, especially near the end of a long
input, and the resulting wav is perfectly clean audio of the wrong sentence. A
duration check cannot see that. This transcribes every clip and compares it to
the intended text.

Run with cwd = an episode dir:
  <voice>/tts/.venv/Scripts/python.exe ../scripts/verify_narration.py
"""

import difflib
import json
import re
import sys
from pathlib import Path

import torch
from transformers import pipeline

MODEL = "openai/whisper-base.en"


def norm(text: str) -> list[str]:
    return re.sub(r"[^a-z0-9\s]", " ", text.lower()).split()


def main() -> int:
    root = Path.cwd()
    spec = json.loads((root / "src/narration.json").read_text(encoding="utf-8"))
    only = set(sys.argv[1:])

    device = 0 if torch.cuda.is_available() else -1
    asr = pipeline("automatic-speech-recognition", model=MODEL, device=device)

    worst = 1.0
    failures = []
    print(f"{'id':<6} {'match':>6}  missing / extra")
    for line in spec:
        if only and line["id"] not in only:
            continue
        wav = root / "public/audio" / f"{line['id']}.wav"
        if not wav.exists():
            print(f"{line['id']:<6} {'--':>6}  no wav")
            continue

        heard = asr(str(wav))["text"]
        want, got = norm(line["text"]), norm(heard)
        ratio = difflib.SequenceMatcher(None, want, got).ratio()
        worst = min(worst, ratio)

        sm = difflib.SequenceMatcher(None, want, got)
        missing, extra = [], []
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag in ("replace", "delete"):
                missing += want[i1:i2]
            if tag in ("replace", "insert"):
                extra += got[j1:j2]

        flag = "" if ratio >= 0.90 else "   <-- CHECK"
        print(f"{line['id']:<6} {ratio:>6.2f}  -{' '.join(missing) or 'none'} / +{' '.join(extra) or 'none'}{flag}")
        if ratio < 0.90:
            failures.append((line["id"], ratio, heard.strip()))

    if failures:
        print("\nclips that did not match:")
        for cid, ratio, heard in failures:
            print(f"  {cid} ({ratio:.2f}) heard: {heard}")
    print(f"\nworst match {worst:.2f}, {len(failures)} clip(s) below 0.90")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
