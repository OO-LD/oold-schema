"""Renders one narration line at several pacing settings, back to back, so the
pace can be chosen by ear instead of guessed at.

Chatterbox has no speed parameter. Two levers affect pace:
  cfg_weight  lower values slow the delivery down; it is generated slower, not
              stretched, so it stays natural. Stochastic: re-rolling gives a
              different take.
  atempo      ffmpeg time-stretch applied afterwards, pitch preserved.
              Deterministic, but smears consonants at the edges.

Writes pace-compare.wav with a spoken label before each variant.

  <voice>/tts/.venv/Scripts/python.exe pace_probe.py <out_dir> <reference.wav>
"""

import subprocess
import sys
from pathlib import Path

import torch
import torchaudio
from chatterbox.tts import ChatterboxTTS

LINE = (
    "Two teams working apart both pick the most obvious field name there is. "
    "Nothing in either document warns you they meant different things."
)

# (label, cfg_weight, atempo)
VARIANTS = [
    ("Setting one. Default.", 0.5, 1.0),
    ("Setting two. Slower generation.", 0.4, 1.0),
    ("Setting three. Slowest generation.", 0.3, 1.0),
    ("Setting four. Slowest, plus ten percent stretch.", 0.3, 0.9),
]

FFMPEG = Path(__file__).resolve().parents[2] / "node_modules/ffmpeg-static/ffmpeg.exe"


def main() -> int:
    out_dir, reference = Path(sys.argv[1]), sys.argv[2]
    out_dir.mkdir(parents=True, exist_ok=True)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = ChatterboxTTS.from_pretrained(device=device)
    words = len(LINE.split())
    parts = []

    for i, (label, cfg, tempo) in enumerate(VARIANTS):
        lab = out_dir / f"lab{i}.wav"
        torchaudio.save(str(lab), model.generate(label, audio_prompt_path=reference), model.sr)

        raw = out_dir / f"v{i}_raw.wav"
        torchaudio.save(str(raw), model.generate(LINE, audio_prompt_path=reference, cfg_weight=cfg), model.sr)

        final = out_dir / f"v{i}.wav"
        if tempo == 1.0:
            final = raw
        else:
            subprocess.run(
                [str(FFMPEG), "-y", "-loglevel", "error", "-i", str(raw),
                 "-af", f"atempo={tempo}", str(final)], check=True)

        dur = float(subprocess.run(
            [str(FFMPEG), "-i", str(final)], capture_output=True, text=True
        ).stderr.split("Duration: ")[1][:11].split(":")[-1])
        print(f"cfg_weight={cfg} atempo={tempo}: {dur:.2f}s, {round(words / (dur / 60))} wpm", flush=True)
        parts += [lab, final]

    listing = out_dir / "concat.txt"
    listing.write_text("".join(f"file '{p.name}'\n" for p in parts), encoding="utf-8")
    subprocess.run(
        [str(FFMPEG), "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
         "-i", str(listing), str(out_dir / "pace-compare.wav")], check=True)
    print(f"\nwrote {out_dir / 'pace-compare.wav'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
