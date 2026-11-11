// Multi-voice narration: one ElevenLabs voice per speaker (from cast.js), exact word timing from alignment.
// Usage: node tools/cast_voices.js kanal/court-of-small-crimes/ep001-group-chat
// Output in the episode folder: voice/NN.mp3 (+ .json cache), narration.wav, timeline.js
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { execFileSync } = require('child_process');
const dir = path.resolve(process.argv[2] || '.'), EP = require(path.join(dir, 'script.js')), CAST = require(path.join(dir, '..', 'cast.js'));
const KEY = process.env.ELEVENLABS_API_KEY || 'proxy-injected', MODEL = process.env.TTS_MODEL || 'eleven_multilingual_v2';
const vdir = path.join(dir, 'voice'); fs.mkdirSync(vdir, { recursive: true });
const probe = f => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
async function tts(i) {
  const l = EP.LINES[i], c = CAST[l.who], base = path.join(vdir, String(i + 1).padStart(2, '0'));
  const same = EP.LINES.map((x, k) => ({ x, k })).filter(o => o.x.who === l.who);
  const prev = same.filter(o => o.k < i).slice(-2).map(o => o.x.text).join(' '), next = (same.find(o => o.k > i) || {}).x?.text;
  const body = { text: l.text, model_id: MODEL, voice_settings: { use_speaker_boost: true, ...c.settings }, previous_text: prev || undefined, next_text: next || undefined };
  const hash = crypto.createHash('sha1').update(JSON.stringify([c.voice, body])).digest('hex').slice(0, 12);
  if (fs.existsSync(base + '.json')) { const j = JSON.parse(fs.readFileSync(base + '.json', 'utf8')); if (j.hash === hash && fs.existsSync(base + '.mp3')) return j.alignment; }
  for (let a = 1; ; a++) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${c.voice}/with-timestamps?output_format=mp3_44100_128`, { method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { const j = await res.json(); fs.writeFileSync(base + '.mp3', Buffer.from(j.audio_base64, 'base64')); fs.writeFileSync(base + '.json', JSON.stringify({ hash, alignment: j.alignment })); return j.alignment; }
    const msg = await res.text(); if (a >= 3 || (res.status < 500 && res.status !== 429)) throw new Error(`ElevenLabs ${res.status}: ${msg}`); await new Promise(r => setTimeout(r, 2000 * a));
  }
}
function words(al) { const ws = []; let cur = null; al.characters.forEach((ch, k) => { if (/\s/.test(ch)) { cur = null; return; } if (!cur) { cur = ['', al.character_start_times_seconds[k], 0]; ws.push(cur); } cur[0] += ch; cur[2] = al.character_end_times_seconds[k]; }); return ws; }
(async () => {
  let t = EP.LEAD; const lines = [], ins = [];
  for (let i = 0; i < EP.LINES.length; i++) {
    const l = EP.LINES[i]; process.stdout.write(`${String(i + 1).padStart(2)} ${l.who.padEnd(10)} ${l.text}\n`);
    const al = await tts(i), f = path.join(vdir, String(i + 1).padStart(2, '0') + '.mp3'), ws = words(al), lead = ws.length ? Math.max(0, ws[0][1] - 0.03) : 0;
    const end = Math.min(probe(f), (ws.length ? ws[ws.length - 1][2] : probe(f)) + 0.12) - lead;
    lines.push({ who: l.who, scene: l.scene, start: +t.toFixed(3), end: +(t + end).toFixed(3), words: ws.map(w => [w[0], +(t + w[1] - lead).toFixed(3), +(t + w[2] - lead).toFixed(3)]) });
    ins.push({ f, ms: Math.round(t * 1000), lead }); t += end + EP.GAP + (l.pause || 0);
  }
  const duration = +(t - EP.GAP + EP.TAIL).toFixed(3), a = ['-y', '-v', 'error']; ins.forEach(x => a.push('-ss', String(x.lead), '-i', x.f));
  const fc = ins.map((x, k) => `[${k}:a]aresample=48000,adelay=${x.ms}:all=1[a${k}]`).join(';') + ';' + ins.map((_, k) => `[a${k}]`).join('') + `amix=inputs=${ins.length}:normalize=0,apad,atrim=0:${duration}[o]`;
  execFileSync('ffmpeg', [...a, '-filter_complex', fc, '-map', '[o]', '-ac', '2', path.join(dir, 'narration.wav')], { stdio: 'inherit' });
  fs.writeFileSync(path.join(dir, 'timeline.js'), '// written by tools/cast_voices.js\nwindow.TIMELINE=' + JSON.stringify({ duration, lines }) + ';\n');
  console.log(`Ready: narration.wav + timeline.js (${duration.toFixed(1)} s)`);
})().catch(e => { console.error(e.message); process.exit(1); });
