// CASE 002 — THE THERMOSTAT. 9:16 Short, ~45 s.
// Science: Kingma, B. & van Marken Lichtenbelt, W. (2015). Energy consumption in buildings and female thermal demand.
// Nature Climate Change 5, 1054–1056. Indoor-climate standards rest on a 1960s comfort model with the metabolic rate of a
// 40-year-old, 70 kg man; for young women doing light office work this may overestimate metabolic rate (heat production) by up to 35%.
(function (root) {
  const EPISODE = { no: '002', title: 'THE THERMOSTAT', source: 'Kingma & van Marken Lichtenbelt (2015), Nature Climate Change 5' };
  const LINES = [
    { id: 'open',     who: 'clerk',      scene: 'title',    text: 'All rise. The Court of Small Crimes is now in session.', pause: 0.3 },
    { id: 'case',     who: 'judge',      scene: 'dock',     text: 'Case number two. The defendant turned the heating on. On the third of October.', pause: 0.25 },
    { id: 'rule',     who: 'prosecutor', scene: 'evidence', text: 'Your Honour! This house had one rule. Nobody touches the thermostat until November.', pause: 0.15 },
    { id: 'days',     who: 'prosecutor', scene: 'evidence', text: 'She lasted three days. Three!', pause: 0.2 },
    { id: 'shorts',   who: 'prosecutor', scene: 'shorts',   text: 'Meanwhile, her flatmate is still wearing shorts.', pause: 0.4 },
    { id: 'call',     who: 'judge',      scene: 'expert',   text: 'Expert witness?', pause: 0.15 },
    { id: 'model',    who: 'expert',     scene: 'expert',   text: 'Office temperature standards come from a comfort model built in the sixties, around a forty-year-old man weighing seventy kilos.', pause: 0.2 },
    { id: 'study',    who: 'expert',     scene: 'expert',   text: 'A 2015 study found it can overestimate how much heat a woman\'s body makes by up to thirty-five percent.', pause: 0.2 },
    { id: 'same',     who: 'expert',     scene: 'same',     text: 'Same room. Different body.', pause: 0.4 },
    { id: 'verdict',  who: 'judge',      scene: 'verdict',  text: 'The court finds the defendant... not guilty.', pause: 0.5 },
    { id: 'sentence', who: 'judge',      scene: 'sentence', text: 'Sentence for the flatmate: one jumper. Wear it. And stop calling her weak.', pause: 0.4 },
    { id: 'close',    who: 'clerk',      scene: 'outro',    text: 'Court adjourned. Your verdict? Guilty, or not guilty?', pause: 0 },
  ];
  const LEAD = 0.7, GAP = 0.32, TAIL = 2.8, SCENES = ['title', 'dock', 'evidence', 'shorts', 'expert', 'same', 'verdict', 'sentence', 'outro'];
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
      heating: W('case', 'heating'), third: W('case', 'third'), october: W('case', 'october'),
      oneRule: W('rule', 'one'), nobody: W('rule', 'nobody'), november: W('rule', 'november'),
      lasted: W('days', 'lasted'), threeA: W('days', 'three', 0), threeB: W('days', 'three', 1),
      meanwhile: W('shorts', 'meanwhile'), shortsW: W('shorts', 'shorts'),
      sixties: W('model', 'sixties'), forty: W('model', 'forty'), seventy: W('model', 'seventy'),
      y2015: W('study', '2015'), overest: W('study', 'overestimate'), woman: W('study', 'woman'), thirty: W('study', 'thirty'),
      same: W('same', 'same'), different: W('same', 'different'),
      verdictStart: S0('verdict'), not: W('verdict', 'not'), guilty: W('verdict', 'guilty'),
      jumper: W('sentence', 'jumper'), wear: W('sentence', 'wear'), weak: W('sentence', 'weak'), sentenceEnd: E0('sentence'),
      adjourned: W('close', 'adjourned'), yourVerdict: W('close', 'your'), guiltyQ: W('close', 'guilty'), notQ: W('close', 'not'),
    };
    const fx = [], add = (type, t, g = 1) => fx.push({ type, t, g });
    add('gavel', c.rise - 0.25, 0.9); add('gavel', c.title, 0.7);
    add('whoosh', sc.dock.start, 0.5); add('tick', c.heating + 0.1, 0.9); add('tick', c.heating + 0.22, 0.7); add('stamp', c.october, 0.6);
    add('whoosh', sc.evidence.start, 0.5); add('stamp', c.nobody - 0.2, 0.7);
    add('chalk', c.threeA, 0.6); add('ping', c.threeB, 0.6);
    add('whoosh', sc.shorts.start, 0.5); add('crickets', c.shortsW + 0.2, 0.5);
    add('whoosh', sc.expert.start, 0.5); add('chalk', c.forty, 0.5); add('chalk', c.seventy, 0.5); add('split', c.thirty, 0.5);
    add('whoosh', sc.same.start, 0.4); add('ding', c.different, 0.5);
    add('drumroll', c.verdictStart, 0.6); add('gavel', c.guilty - 0.05, 1.2); add('stamp', c.guilty + 0.05, 1.1); add('gasp', c.guilty + 0.2, 0.6);
    add('whoosh', sc.sentence.start, 0.4); add('ping', c.jumper, 0.6); add('ding', c.sentenceEnd - 0.2, 0.7);
    add('whoosh', sc.outro.start, 0.4); add('gavel', c.adjourned, 0.8); add('stamp', c.guiltyQ, 0.6); add('stamp', c.notQ + 0.2, 0.6);
    c.fx = fx.sort((a, b) => a.t - b.t);
    c.musicDuck = [[c.verdictStart - 0.2, c.guilty + 1.2]];
    return c;
  }
  const api = { EPISODE, LINES, LEAD, GAP, TAIL, SCENES, estimateTimeline, wordTime, cues, ID };
  if (typeof module !== 'undefined') module.exports = api; else root.EP = api;
})(this);
