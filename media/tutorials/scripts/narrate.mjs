// Turns src/narration.json into public/audio/<id>.wav, then measures every clip
// and reports whether it fits the scene it is meant to sit in.
//
// Usage, with cwd = an episode dir:
//   node ../scripts/narrate.mjs                    SAPI, offline, default
//   node ../scripts/narrate.mjs --engine clone     cloned voice via Chatterbox
//   node ../scripts/narrate.mjs s3 s4              only these ids
//
// src/narration.json is a list of:
//   { "id": "s1", "scene": "S1", "frames": 420, "rate": 0, "text": "..." }
// `frames` is the budget: how many frames the clip must fit inside. `rate` is
// SAPI-only. The words are the same whichever engine reads them; adapting the
// wording to one engine's weaknesses is how you end up with "Jason" in a script.
//
// Engines are interchangeable because everything downstream consumes
// public/audio/<id>.wav and knows nothing about how it was made.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
const ffmpeg = path.resolve(here, '../../node_modules/ffmpeg-static/ffmpeg.exe');
const FPS = 30;

const VOICE_DIR = 'C:/Users/Stier/ownCloud/Projekte/2025_BW2/personal_information/voice';
const CLONE_PYTHON = `${VOICE_DIR}/tts/.venv/Scripts/python.exe`;
const CLONE_REFERENCE = `${VOICE_DIR}/simon-stier_en_dpp4eu-day2/reference/ref_01.wav`;
const SAPI_VOICE = 'Microsoft Zira Desktop';

const argv = process.argv.slice(2);
const engineIdx = argv.indexOf('--engine');
const engine = engineIdx >= 0 ? argv[engineIdx + 1] : 'sapi';
const only = argv.filter((a, i) => !a.startsWith('--') && i !== engineIdx + 1);

const spec = JSON.parse(fs.readFileSync(path.join(root, 'src/narration.json'), 'utf-8'));
const lines = spec.filter((l) => !only.length || only.includes(l.id));
const outDir = path.join(root, 'public/audio');
fs.mkdirSync(outDir, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'narrate-'));

// Text goes via a UTF-8 file, never inline, so quotes and punctuation in the
// narration cannot break the PowerShell command.
const speakSapi = (line, wav) => {
  const txt = path.join(tmp, 'line.txt');
  fs.writeFileSync(txt, line.text, 'utf-8');
  const esc = (p) => p.replace(/\\/g, '\\\\');
  execFileSync('powershell.exe', ['-NoProfile', '-Command', [
    'Add-Type -AssemblyName System.Speech;',
    '$s = New-Object System.Speech.Synthesis.SpeechSynthesizer;',
    `$s.SelectVoice('${SAPI_VOICE}');`,
    `$s.Rate = ${line.rate ?? 0};`,
    `$s.SetOutputToWaveFile('${esc(wav)}');`,
    `$t = [System.IO.File]::ReadAllText('${esc(txt)}', [System.Text.Encoding]::UTF8);`,
    '$s.Speak($t); $s.Dispose();',
  ].join(' ')], { stdio: 'pipe' });
};

// One model load for the whole episode: load dominates the cost of a short clip.
const speakClone = (batch) => {
  const job = path.join(tmp, 'job.json');
  fs.writeFileSync(job, JSON.stringify(
    batch.map((l) => ({ id: l.id, text: l.text, out: path.join(outDir, `${l.id}.wav`) })),
  ));
  execFileSync(CLONE_PYTHON, [path.join(here, 'chatterbox_tts.py'), job, CLONE_REFERENCE], {
    cwd: path.join(VOICE_DIR, 'tts'),
    stdio: ['ignore', 'inherit', 'pipe'],
    env: { ...process.env, TQDM_DISABLE: '1' },
  });
};

const durationOf = (file) => {
  try {
    execFileSync(ffmpeg, ['-hide_banner', '-i', file], { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    const m = e.stderr.toString().match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    if (m) return +m[1] * 3600 + +m[2] * 60 + +m[3];
  }
  return NaN;
};

if (engine === 'clone') {
  console.log(`engine: clone (Chatterbox, reference ${path.basename(CLONE_REFERENCE)})`);
  speakClone(lines);
} else {
  console.log(`engine: sapi (${SAPI_VOICE})`);
  for (const line of lines) speakSapi(line, path.join(outDir, `${line.id}.wav`));
}

const timing = [];
let overruns = 0;
for (const line of lines) {
  const seconds = durationOf(path.join(outDir, `${line.id}.wav`));
  const frames = Math.ceil(seconds * FPS);
  const budget = line.frames ?? Infinity;
  const fits = frames <= budget;
  if (!fits) overruns += 1;
  const words = line.text.trim().split(/\s+/).length;
  const wpm = Math.round(words / (seconds / 60));
  timing.push({ id: line.id, scene: line.scene ?? null, engine, seconds: +seconds.toFixed(2), frames, budget, fits, words, wpm });
  console.log(
    `${line.id.padEnd(6)} ${String(frames).padStart(5)}f / ${String(budget).padStart(5)}f  ` +
    `${seconds.toFixed(2).padStart(6)}s  ${String(words).padStart(3)}w  ${String(wpm).padStart(3)}wpm  ` +
    `${fits ? 'ok' : 'OVERRUNS by ' + (frames - budget) + 'f'}`,
  );
}

fs.writeFileSync(path.join(root, 'src/narration.timing.json'), JSON.stringify(timing, null, 2) + '\n');
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${timing.length} clips, ${overruns} overrunning their scene budget`);
if (overruns) process.exit(1);
