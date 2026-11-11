// Brings a narration into an episode and re-times the whole animation to it.
//
//   node tools/import_voice.js bolumler/02-inner-citadel            (uses <episode>/voice/)
//   node tools/import_voice.js bolumler/02-inner-citadel --tts      (generates voice/ with ElevenLabs first)
//
// <episode>/voice/ may contain EITHER
//   a) one file per line: 01.mp3, 02.mp3 … (or .wav/.m4a/.ogg), numbered like LINES in script.js, OR
//   b) one long recording: full.mp3 (or full.wav …). It is split at its pauses into the script's lines.
// Optional: NN.json next to a line file with ElevenLabs alignment (exact word timing).
// Output: narration.wav + timeline.js in the episode folder. Then run tools/score.js and tools/record.js.
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const args = process.argv.slice(2), dir = path.resolve(args.find(a => !a.startsWith('--')) || '.');
const EP = require(path.join(dir, 'script.js')), LINES = EP.LINES, vdir = path.join(dir, 'voice'), tmp = path.join(dir, '.voice-tmp');
fs.mkdirSync(vdir, { recursive: true }); fs.mkdirSync(tmp, { recursive: true });
const ff = a => execFileSync('ffmpeg', ['-y', '-v', 'error', ...a], { stdio: ['ignore', 'pipe', 'pipe'] });
const probe = f => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const num = i => String(i + 1).padStart(2, '0');
const EXT = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac'];
const find = base => { for (const e of EXT) { const f = path.join(vdir, base + e); if (fs.existsSync(f)) return f; } return null; };

async function tts() { // ElevenLabs, one request per line, cached
  const KEY = process.env.ELEVENLABS_API_KEY || 'proxy', VOICE = process.env.VOICE_NARRATOR || EP.EPISODE.voice, MODEL = process.env.TTS_MODEL || 'eleven_multilingual_v2';
  for (let i = 0; i < LINES.length; i++) {
    if (find(num(i))) continue;
    process.stdout.write(`TTS ${i + 1}/${LINES.length}\n`);
    const body = { text: LINES[i].text, model_id: MODEL, voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true, speed: 0.95 }, previous_text: LINES.slice(Math.max(0, i - 2), i).map(l => l.text).join(' ') || undefined, next_text: LINES[i + 1]?.text };
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`, { method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
    const j = await res.json(); fs.writeFileSync(path.join(vdir, num(i) + '.mp3'), Buffer.from(j.audio_base64, 'base64')); fs.writeFileSync(path.join(vdir, num(i) + '.json'), JSON.stringify(j.alignment));
  }
}

// split one long recording at its pauses
function splitFull(full) {
  const log = execFileSync('bash', ['-c', 'ffmpeg -v info -i "$0" -af silencedetect=noise=-38dB:d=0.28 -f null - 2>&1', full]).toString();
  const gaps = []; let s = null;
  for (const ln of log.split('\n')) { const a = ln.match(/silence_start: ([\d.]+)/), b = ln.match(/silence_end: ([\d.]+)/); if (a) s = +a[1]; if (b && s !== null) { gaps.push({ s, e: +b[1], d: +b[1] - s }); s = null; } }
  const dur = probe(full), inner = gaps.filter(g => g.s > 0.05 && g.e < dur - 0.05);
  const need = LINES.length - 1;
  if (inner.length < need) throw new Error(`Found only ${inner.length + 1} spoken parts in ${path.basename(full)}, but the script has ${LINES.length} lines. Leave a clear pause (about half a second) between lines, or send one file per line.`);
  const cuts = inner.slice().sort((a, b) => b.d - a.d).slice(0, need).sort((a, b) => a.s - b.s);
  let st = gaps.length && gaps[0].s <= 0.05 ? gaps[0].e : 0; const files = [];
  cuts.concat([{ s: gaps.length && gaps[gaps.length - 1].e >= dur - 0.05 ? gaps[gaps.length - 1].s : dur, e: dur }]).forEach((c, i) => {
    const f = path.join(tmp, num(i) + '.wav'); ff(['-i', full, '-ss', String(Math.max(0, st - 0.05)), '-to', String(c.s + 0.08), '-ac', '1', '-ar', '48000', f]); files.push(f); st = c.e;
  });
  return files;
}
// trim silence at both ends of one line
function trim(src, i) {
  const f = path.join(tmp, 'line' + num(i) + '.wav');
  ff(['-i', src, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse', '-ac', '1', '-ar', '48000', f]);
  return f;
}
// word timing: exact from alignment json, else spread by syllable-ish weight
function wordsFor(i, dur) {
  const ws = LINES[i].text.split(/\s+/), jf = path.join(vdir, num(i) + '.json');
  if (fs.existsSync(jf)) {
    const al = JSON.parse(fs.readFileSync(jf, 'utf8')), out = []; let cur = null;
    al.characters.forEach((ch, k) => { if (/\s/.test(ch)) { cur = null; return; } if (!cur) { cur = ['', al.character_start_times_seconds[k], 0]; out.push(cur); } cur[0] += ch; cur[2] = al.character_end_times_seconds[k]; });
    const lead = out.length ? out[0][1] : 0; if (out.length === ws.length) return out.map((w, j) => [ws[j], Math.max(0, w[1] - lead), Math.max(0, w[2] - lead)]);
  }
  const wt = ws.map(w => 0.6 + w.replace(/[^\p{L}]/gu, '').length * 0.32 + (/[.,?!:;…]["”]?$/.test(w) ? 1.4 : 0)), tot = wt.reduce((a, b) => a + b, 0);
  let t = 0; return ws.map((w, j) => { const d = dur * wt[j] / tot, r = [w, t, t + d * (/[.,?!:;…]["”]?$/.test(w) ? 0.7 : 0.92)]; t += d; return r; });
}

(async () => {
  if (args.includes('--tts')) await tts();
  let srcs;
  if (find(num(0))) { srcs = LINES.map((_, i) => { const f = find(num(i)); if (!f) throw new Error(`Missing voice/${num(i)}.* (line ${i + 1}: "${LINES[i].text.slice(0, 50)}…")`); return f; }); }
  else { const full = find('full'); if (!full) throw new Error(`Put the narration in ${path.relative(process.cwd(), vdir)}/ as 01.mp3 … ${num(LINES.length - 1)}.mp3, or as one file named full.mp3.`); srcs = splitFull(full); }
  // build the timeline with the same structure as estimateTimeline() (lead, chapter holds, gaps, pauses)
  let t = EP.LEAD; const lines = [], ins = [];
  for (let i = 0; i < LINES.length; i++) {
    const l = LINES[i];
    if (EP.CHAPTERS[l.scene] && (i === 0 || LINES[i - 1].scene !== l.scene)) t += EP.CHAPTER_HOLD;
    const f = trim(srcs[i], i), d = probe(f), ws = wordsFor(i, d);
    lines.push({ scene: l.scene, start: +t.toFixed(3), end: +(t + d).toFixed(3), words: ws.map(w => [w[0], +(t + w[1]).toFixed(3), +(t + w[2]).toFixed(3)]) });
    ins.push({ f, ms: Math.round(t * 1000) });
    t += d + EP.GAP + (l.pause || 0);
  }
  const duration = +(t + EP.TAIL).toFixed(3);
  // mix all lines onto one track (in chunks to keep ffmpeg's input count modest)
  const chunk = 20, parts = [];
  for (let c = 0; c < ins.length; c += chunk) {
    const grp = ins.slice(c, c + chunk), a = []; grp.forEach(g => a.push('-i', g.f));
    const fc = grp.map((g, k) => `[${k}:a]adelay=${g.ms}:all=1[a${k}]`).join(';') + ';' + grp.map((_, k) => `[a${k}]`).join('') + `amix=inputs=${grp.length}:normalize=0,apad,atrim=0:${duration}[o]`;
    const pf = path.join(tmp, `part${c}.wav`); ff([...a, '-filter_complex', fc, '-map', '[o]', '-ar', '48000', '-ac', '1', pf]); parts.push(pf);
  }
  const a = []; parts.forEach(p => a.push('-i', p));
  ff([...a, '-filter_complex', parts.map((_, k) => `[${k}:a]`).join('') + `amix=inputs=${parts.length}:normalize=0,atrim=0:${duration}[o]`, '-map', '[o]', '-ar', '48000', '-ac', '2', path.join(dir, 'narration.wav')]);
  fs.writeFileSync(path.join(dir, 'timeline.js'), '// written by tools/import_voice.js from the narration in voice/\nwindow.TIMELINE=' + JSON.stringify({ duration, lines }) + ';\n');
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`Ready: narration.wav + timeline.js (${Math.floor(duration / 60)}:${String(Math.round(duration % 60)).padStart(2, '0')}). Next: node tools/score.js ${path.relative(process.cwd(), dir)} && node tools/record.js ${path.relative(process.cwd(), dir)}`);
})().catch(e => { console.error(e.message); process.exit(1); });
