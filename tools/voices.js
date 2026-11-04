// Anlatımı ElevenLabs ile seslendirir, kelime zamanlamasını çıkarır.
// Kullanım:  ELEVENLABS_API_KEY=... node tools/voices.js bolumler/01-elinde-olan
// Çıktı (bölüm klasörüne): audio/NN.mp3 (+ .json önbellek), narration.wav, timeline.js
// Not: Önbellek vardır; metni değiştirmediğin replikler için tekrar kredi harcanmaz.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { execFileSync } = require('child_process');

const dir = path.resolve(process.argv[2] || '.');
const EP = require(path.join(dir, 'script.js'));
const KEY = process.env.ELEVENLABS_API_KEY || 'proxy';
const VOICE = process.env.VOICE_NARRATOR || EP.EPISODE.voice;
const MODEL = process.env.TTS_MODEL || 'eleven_multilingual_v2';
const SETTINGS = { stability: 0.42, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: 0.94 };
const out = path.join(dir, 'audio'); fs.mkdirSync(out, { recursive: true });

async function tts(i) {
  const l = EP.LINES[i];
  const body = {
    text: l.text, model_id: MODEL, voice_settings: SETTINGS,
    previous_text: EP.LINES.slice(Math.max(0, i - 2), i).map(x => x.text).join(' ') || undefined,
    next_text: EP.LINES[i + 1] ? EP.LINES[i + 1].text : undefined,
  };
  const hash = crypto.createHash('sha1').update(JSON.stringify([VOICE, body])).digest('hex').slice(0, 10);
  const base = path.join(out, String(i).padStart(2, '0'));
  if (fs.existsSync(base + '.json')) {
    const c = JSON.parse(fs.readFileSync(base + '.json', 'utf8'));
    if (c.hash === hash && fs.existsSync(base + '.mp3')) return c.alignment;
  }
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`, {
      method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (res.ok) {
      const j = await res.json();
      fs.writeFileSync(base + '.mp3', Buffer.from(j.audio_base64, 'base64'));
      fs.writeFileSync(base + '.json', JSON.stringify({ hash, alignment: j.alignment }));
      return j.alignment;
    }
    const msg = await res.text();
    if (attempt >= 3 || res.status < 500 && res.status !== 429) throw new Error(`ElevenLabs ${res.status}: ${msg}`);
    await new Promise(r => setTimeout(r, 2000 * attempt));
  }
}

// Karakter zamanlarından kelime zamanları
function words(al) {
  const ws = []; let cur = null;
  al.characters.forEach((ch, k) => {
    if (/\s/.test(ch)) { cur = null; return; }
    if (!cur) { cur = ['', al.character_start_times_seconds[k], 0]; ws.push(cur); }
    cur[0] += ch; cur[2] = al.character_end_times_seconds[k];
  });
  return ws;
}
const probe = f => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());

(async () => {
  let t = EP.LEAD; const lines = [], ins = [];
  for (let i = 0; i < EP.LINES.length; i++) {
    const l = EP.LINES[i];
    process.stdout.write(`Ses ${i + 1}/${EP.LINES.length}: ${l.text}\n`);
    const al = await tts(i), f = path.join(out, String(i).padStart(2, '0') + '.mp3');
    const ws = words(al), dur = probe(f);
    // Sesin sonundaki sessizliği kırp: son kelimenin bitişi + 0.15 sn
    const speechEnd = Math.min(dur, (ws.length ? ws[ws.length - 1][2] : dur) + 0.15);
    lines.push({ scene: l.scene, start: t, end: t + speechEnd, words: ws.map(w => [w[0], +(t + w[1]).toFixed(3), +(t + w[2]).toFixed(3)]) });
    ins.push({ f, ms: Math.round(t * 1000) });
    t += speechEnd + EP.GAP + (l.pause || 0);
  }
  const duration = +(t - EP.GAP - (EP.LINES[EP.LINES.length - 1].pause || 0) + EP.TAIL).toFixed(3);
  const args = ['-y', '-v', 'error']; ins.forEach(a => args.push('-i', a.f));
  const fc = ins.map((a, i) => `[${i}:a]aresample=48000,adelay=${a.ms}:all=1[a${i}]`).join(';') + ';' +
    ins.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${ins.length}:normalize=0,apad,atrim=0:${duration}[out]`;
  execFileSync('ffmpeg', [...args, '-filter_complex', fc, '-map', '[out]', '-ac', '2', path.join(dir, 'narration.wav')], { stdio: 'inherit' });
  fs.writeFileSync(path.join(dir, 'timeline.js'), '// tools/voices.js tarafından üretildi\nwindow.TIMELINE=' + JSON.stringify({ duration, lines }) + ';\n');
  console.log(`Hazır: narration.wav + timeline.js (${duration.toFixed(1)} sn). Sonra: node tools/soundtrack.js ${path.relative(process.cwd(), dir)}`);
})().catch(e => { console.error(e.message); process.exit(1); });
