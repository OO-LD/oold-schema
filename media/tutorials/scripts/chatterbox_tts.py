"""Synthesises narration clips in a cloned voice with Chatterbox.

Reads a job file: [{"id": "s1", "text": "...", "out": "C:/.../s1.wav"}, ...]
Loads the model once and generates every clip, because model load dominates the
cost of a short clip.

Run with the tts environment that already has chatterbox and CUDA torch:
  <voice>/tts/.venv/Scripts/python.exe chatterbox_tts.py job.json <reference.wav>

Chatterbox embeds Resemble's inaudible Perth watermark in everything it
generates. That is left enabled deliberately: it is what makes the output
identifiable as synthetic after the fact.
"""

import json
import sys
import time
from pathlib import Path

import torch
import torchaudio
from chatterbox.tts import ChatterboxTTS


def main() -> int:
    job_path, reference = sys.argv[1], sys.argv[2]
    jobs = json.loads(Path(job_path).read_text(encoding="utf-8"))

    device = "cuda" if torch.cuda.is_available() else "cpu"
    t0 = time.time()
    model = ChatterboxTTS.from_pretrained(device=device)
    print(f"model loaded on {device} in {time.time() - t0:.1f}s", flush=True)

    for job in jobs:
        t = time.time()
        wav = model.generate(job["text"], audio_prompt_path=reference)
        out = Path(job["out"])
        out.parent.mkdir(parents=True, exist_ok=True)
        torchaudio.save(str(out), wav, model.sr)
        secs = wav.shape[-1] / model.sr
        print(f"{job['id']:<6} {secs:6.2f}s audio in {time.time() - t:5.1f}s", flush=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
