// CASE 001 — THE GROUP CHAT. 9:16 Short, ~40 s.
// Science: Darley & Latané (1968), "Bystander intervention in emergencies: diffusion of responsibility",
// Journal of Personality and Social Psychology 8(4), 377–383. Alone: 85% reported the seizure before it ended; with four other listeners: 31%.
(function (root) {
  const EPISODE = { no: '001', title: 'THE GROUP CHAT', source: 'Darley & Latané (1968), J. Personality & Social Psychology 8(4)' };
  const LINES = [
    { id: 'open',    who: 'clerk',      scene: 'title',    text: 'All rise. The Court of Small Crimes is now in session.', pause: 0.3 },
    { id: 'case',    who: 'judge',      scene: 'dock',     text: 'Case number one. The defendants: everyone in the group chat.', pause: 0.2 },
    { id: 'msg',     who: 'prosecutor', scene: 'evidence', text: 'Your Honour! Sunday night. One message: can anyone help me move on Saturday?', pause: 0.15 },
    { id: 'seen',    who: 'prosecutor', scene: 'evidence', text: 'Seen by twelve people. Replies? Zero.', pause: 0.45 },
    { id: 'call',    who: 'judge',      scene: 'expert',   text: 'Expert witness?', pause: 0.15 },
    { id: 'study',   who: 'expert',     scene: 'expert',   text: 'In 1968, two psychologists staged an emergency. Alone, eighty-five percent of people acted. With four others listening, only thirty-one percent did.', pause: 0.2 },
    { id: 'why',     who: 'expert',     scene: 'diffuse',  text: 'Everyone assumes someone else will answer. It is called diffusion of responsibility.', pause: 0.35 },
    { id: 'verdict', who: 'judge',      scene: 'verdict',  text: 'The court finds the group chat... guilty.', pause: 0.5 },
    { id: 'sentence',who: 'judge',      scene: 'sentence', text: 'Sentence: next time you need help, do not ask the group. Ask one person, by name.', pause: 0.4 },
    { id: 'close',   who: 'clerk',      scene: 'outro',    text: 'Court adjourned. Your verdict? Guilty, or not guilty?', pause: 0 },
  ];
  const LEAD = 0.7, GAP = 0.32, TAIL = 2.8, SCENES = ['title', 'dock', 'evidence', 'expert', 'diffuse', 'verdict', 'sentence', 'outro'];
  function estimateTimeline() { let t = LEAD; const lines = []; for (const l of LINES) { const s = t, words = []; for (const w of l.text.split(/\s+/)) { const d = 0.16 + w.replace(/[^\p{L}\d]/gu, '').length * 0.05 + (/[.,?!:]$/.test(w) ? 0.2 : 0); words.push([w, t, t + d]); t += d; } lines.push({ who: l.who, scene: l.scene, start: s, end: t, words }); t += GAP + (l.pause || 0); } return { duration: t + TAIL, lines }; }
  const ID = {}; LINES.forEach((l, i) => ID[l.id] = i);
  const low = s => s.toLowerCase().replace(/[^\p{L}\d]/gu, '');
  function wordTime(TL, id, prefix, nth = 0) { const l = TL.lines[ID[id]]; let n = 0; for (const w of l.words) if (low(w[0]).startsWith(prefix) && n++ === nth) return w[1]; return l.start; }
  function cues(TL) {
    const L = TL.lines, sc = {};
    SCENES.forEach((n, i) => { const first = LINES.findIndex(l => l.scene === n); sc[n] = { start: i === 0 ? 0 : L[first].start - 0.3, first }; });
    SCENES.forEach((n, i) => sc[n].end = i < SCENES.length - 1 ? sc[SCENES[i + 1]].start : TL.duration);
    const W = (id, p, n) => wordTime(TL, id, p, n), S0 = id => L[ID[id]].start, E0 = id => L[ID[id]].end;
    const c = {
      scenes: sc, ID,
      rise: W('open', 'rise'), title: W('open', 'court'),
      defendants: W('case', 'everyone'),
      sunday: W('msg', 'sunday'), message: W('msg', 'can'),
      seenStart: W('seen', 'seen'), seen12: W('seen', 'twelve'), zero: W('seen', 'zero'),
      year: W('study', '1968'), alone: W('study', 'alone'), eighty: W('study', 'eighty'), four: W('study', 'four'), thirty: W('study', 'thirty'),
      someone: W('why', 'someone'), diffusion: W('why', 'diffusion'),
      guilty: W('verdict', 'guilty'), verdictStart: S0('verdict'),
      ask: W('sentence', 'ask', 0), one: W('sentence', 'one'), name: W('sentence', 'name'), sentenceEnd: E0('sentence'),
      adjourned: W('close', 'adjourned'), yourVerdict: W('close', 'your'), guiltyQ: W('close', 'guilty'), notQ: W('close', 'not'),
    };
    const fx = [], add = (type, t, g = 1) => fx.push({ type, t, g });
    add('gavel', c.rise - 0.25, 0.9); add('gavel', c.title, 0.7); add('whoosh', sc.dock.start, 0.5); add('murmur', c.defendants, 0.4);
    add('whoosh', sc.evidence.start, 0.5); add('ping', c.message, 0.7);
    for (let i = 0; i < 12; i++) add('tick', c.seenStart + 0.15 + i * (c.seen12 - c.seenStart + 0.3) / 12, 0.45);
    add('crickets', c.zero + 0.05, 0.7); add('stamp', c.seenStart - 0.35, 0.7);
    add('whoosh', sc.expert.start, 0.5); add('chalk', c.eighty, 0.5); add('chalk', c.thirty, 0.5);
    add('whoosh', sc.diffuse.start, 0.4); add('split', c.someone, 0.6);
    add('drumroll', c.verdictStart, 0.6); add('gavel', c.guilty - 0.05, 1.2); add('stamp', c.guilty + 0.05, 1.1); add('gasp', c.guilty + 0.2, 0.6);
    add('whoosh', sc.sentence.start, 0.4); add('ping', c.one, 0.6); add('ding', c.sentenceEnd - 0.2, 0.7);
    add('whoosh', sc.outro.start, 0.4); add('gavel', c.adjourned, 0.8); add('stamp', c.guiltyQ, 0.6); add('stamp', c.notQ + 0.2, 0.6);
    c.fx = fx.sort((a, b) => a.t - b.t);
    c.musicDuck = [[c.verdictStart - 0.2, c.guilty + 1.2]]; // music drops out for the verdict
    return c;
  }
  const api = { EPISODE, LINES, LEAD, GAP, TAIL, SCENES, estimateTimeline, wordTime, cues, ID };
  if (typeof module !== 'undefined') module.exports = api; else root.EP = api;
})(this);
