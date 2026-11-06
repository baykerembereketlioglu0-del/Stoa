// STOA · Episode 02 · "The Inner Citadel" (Marcus Aurelius) · 16:9, ~8 min, English
// Shared by index.html (browser) and tools/*.js (Node).
//   scene : which scene the line is spoken in
//   pause : extra silence after the line (s)
//   emph  : word prefixes to highlight in captions (lowercase)
//   quote : true -> shown as a large quote card instead of a caption
// Quotes from the Meditations follow George Long's public-domain translation (1862),
// except 5.20 and 10.16, which are given as common modern paraphrases.
(function (root) {
  const EPISODE = {
    no: '02', slug: '02-inner-citadel', title: 'THE INNER CITADEL', philosopher: 'MARCUS AURELIUS',
    format: '16:9', voice: process_env('VOICE_NARRATOR') || 'nPczCjzI2devNBz1zQrb',
  };
  function process_env(k) { try { return process.env[k]; } catch (e) { return undefined; } }

  const LINES = [
    // ---------- HOOK ----------
    { scene: 'hook', text: 'Every morning, the most powerful man on Earth woke up and told himself the same thing.', emph: ['powerful'] },
    { scene: 'hook', id: 'list', text: 'Today, I will meet people who are ungrateful. Arrogant. Dishonest. Envious.', emph: ['ungrateful', 'arrogant', 'dishonest', 'envious'], pause: 0.6 },
    { scene: 'hook', text: 'He ruled over tens of millions of people. He commanded the most powerful army in the world.', emph: ['army'] },
    { scene: 'hook', text: 'And yet, the battle he feared most was not on any frontier.', emph: ['battle'], pause: 0.3 },
    { scene: 'hook', id: 'mind', text: 'It was inside his own mind.', emph: ['mind'], pause: 0.8 },
    { scene: 'hook', id: 'fortress', text: 'This is the story of how Marcus Aurelius built a fortress that no one could conquer.', emph: ['fortress'], pause: 0.6 },
    // ---------- TITLE ----------
    { scene: 'title', id: 'title', text: 'The Inner Citadel.', pause: 2.2 },
    // ---------- I. THE THRONE ----------
    { scene: 'rome', id: 'year', text: 'Rome. The year one hundred sixty one.', pause: 0.5 },
    { scene: 'rome', id: 'emperor', text: 'Marcus Aurelius becomes emperor. And he never wanted the throne.', emph: ['emperor', 'never'] },
    { scene: 'rome', text: 'Years earlier, the emperor Hadrian had noticed this serious, honest boy. He gave him a nickname. Verissimus. The most truthful one.', emph: ['verissimus', 'truthful'], pause: 0.4 },
    { scene: 'rome', id: 'philo', text: 'He wanted to be a philosopher. A quiet life. Books, and long walks with his teachers.', emph: ['philosopher'] },
    { scene: 'rome', id: 'tested', text: 'Instead, he inherited an empire that was about to be tested like never before.', emph: ['tested'], pause: 0.3 },
    { scene: 'rome', text: 'Within a few years, everything that could go wrong, did.', emph: ['wrong'] },
    { scene: 'rome', id: 'crisis', text: 'Floods. Famine. Rebellion. War on the northern border.', emph: ['floods', 'famine', 'rebellion', 'war'], pause: 0.4 },
    { scene: 'rome', id: 'worse', text: 'And something worse than all of them.', emph: ['worse'], pause: 0.9 },
    // ---------- II. THE PLAGUE ----------
    { scene: 'plague', id: 'plague', text: 'A plague came back with the legions from the East.', emph: ['plague'] },
    { scene: 'plague', id: 'pfire', text: 'It moved through the cities like fire through dry grass.', emph: ['fire'] },
    { scene: 'plague', id: 'silent', text: 'Historians believe millions died. Entire towns went silent.', emph: ['millions', 'silent'], pause: 0.5 },
    { scene: 'plague', text: 'Doctors had no cure. Prayers changed nothing.', emph: ['cure', 'nothing'], pause: 0.3 },
    { scene: 'plague', text: 'Marcus could not stop it. No one could.', pause: 0.3 },
    { scene: 'plague', id: 'stayed', text: 'But he refused to hide behind palace walls. He stayed. He worked. He paid for the funerals of the poor.', emph: ['stayed', 'worked'] },
    { scene: 'plague', id: 'why', text: 'Because a Stoic does not ask, why is this happening to me?', emph: ['why'], pause: 0.4 },
    { scene: 'plague', id: 'now', text: 'He asks: what is required of me now?', emph: ['required', 'now'], pause: 0.5 },
    { scene: 'plague', text: 'It is a simple question. And it changes everything.', emph: ['everything'], pause: 0.9 },
    // ---------- III. THE FRONTIER ----------
    { scene: 'frontier', id: 'war', text: 'Then came the war.', emph: ['war'], pause: 0.4 },
    { scene: 'frontier', id: 'tent', text: 'For most of the next decade, the emperor of Rome lived in a tent, on the frozen banks of the Danube.', emph: ['tent', 'frozen'] },
    { scene: 'frontier', id: 'day', text: 'By day, he led his soldiers against the tribes of the north.', emph: ['day'] },
    { scene: 'frontier', id: 'ice', text: 'The winters were brutal. The river froze so hard that armies fought on the ice.', emph: ['ice'], pause: 0.4 },
    { scene: 'frontier', id: 'night', text: 'By night, alone, by the light of a single lamp, he wrote.', emph: ['night', 'wrote'], pause: 0.4 },
    { scene: 'frontier', id: 'himself', text: 'Not for an audience. Not for history. He wrote to himself.', emph: ['himself'] },
    { scene: 'frontier', id: 'med', text: 'Those private notes survived for almost two thousand years. Today, we call them the Meditations.', emph: ['meditations'], pause: 0.5 },
    { scene: 'frontier', text: 'And near the beginning, he wrote the words you heard at the start of this story.' },
    { scene: 'frontier', id: 'q21', text: 'Begin the morning by saying to thyself: I shall meet with the busybody, the ungrateful, arrogant, deceitful, envious, unsocial.', quote: true, cite: 'MEDITATIONS 2.1', pause: 0.6 },
    { scene: 'frontier', id: 'prep', text: 'He was not being bitter. He was preparing.', emph: ['preparing'] },
    { scene: 'frontier', id: 'storm', text: 'If you expect the storm, it cannot surprise you.', emph: ['storm', 'surprise'], pause: 0.4 },
    { scene: 'frontier', text: 'Marcus did not pray for an easy life. He trained himself for a hard one.', emph: ['hard'], pause: 0.9 },
    // ---------- IV. THE BETRAYAL ----------
    { scene: 'betrayal', id: 'bstart', text: 'And the next storm came from a man he trusted.', emph: ['trusted'], pause: 0.3 },
    { scene: 'betrayal', id: 'rumor', text: 'In the year one hundred seventy five, a false rumor spread that Marcus had died.', emph: ['rumor', 'died'] },
    { scene: 'betrayal', id: 'cassius', text: 'Avidius Cassius, his most celebrated general, declared himself emperor.', emph: ['cassius', 'emperor'] },
    { scene: 'betrayal', id: 'east', text: 'Much of the East followed him. Syria. Egypt. The grain that fed Rome.', emph: ['syria', 'egypt'] },
    { scene: 'betrayal', id: 'army', text: 'Marcus gathered his army. But he did not curse Cassius.', emph: ['curse'] },
    { scene: 'betrayal', id: 'forgive', text: 'He told his soldiers that he hoped to forgive him.', emph: ['forgive'], pause: 0.4 },
    { scene: 'betrayal', id: 'killed', text: 'The rebellion ended before they ever met. Cassius was killed by his own officers.', emph: ['killed'] },
    { scene: 'betrayal', id: 'letters', text: 'When his letters were found, letters that could expose every traitor, Marcus had them burned. Unread.', emph: ['burned', 'unread'], pause: 0.5 },
    { scene: 'betrayal', id: 'poison', text: 'He would not let suspicion poison his mind.', emph: ['suspicion', 'poison'], pause: 0.5 },
    { scene: 'betrayal', text: 'Think about that. He had every reason to hate. And he chose not to.', emph: ['hate', 'chose'], pause: 1.0 },
    // ---------- V. THE CITADEL ----------
    { scene: 'citadel', id: 'cq', text: 'How does a man stay calm when the world is burning?', emph: ['calm', 'burning'], pause: 0.5 },
    { scene: 'citadel', id: 'answer', text: 'Marcus had an answer. He called it the inner citadel.', emph: ['citadel'] },
    { scene: 'citadel', id: 'q848', text: 'The mind which is free from passions is a citadel, for man has nothing more secure to which he can fly for refuge.', quote: true, cite: 'MEDITATIONS 8.48', pause: 0.6 },
    { scene: 'citadel', id: 'outside', text: 'Outside the walls, you control almost nothing. Other people. Your reputation. Sickness. Death.', emph: ['nothing'] },
    { scene: 'citadel', id: 'inside', text: 'Inside the walls, you control one thing. How you respond.', emph: ['one', 'respond'], pause: 0.4 },
    { scene: 'citadel', id: 'gate', text: 'No one can enter, unless you open the gate.', emph: ['gate'], pause: 0.5 },
    { scene: 'citadel', id: 'insult', text: 'Think of the last time someone insulted you. The words lasted a second. The pain lasted for days. Who kept it alive?', emph: ['second', 'days', 'alive'], pause: 0.5 },
    { scene: 'citadel', id: 'q47', text: 'Take away thy opinion, and then there is taken away the complaint, I have been harmed. Take away the complaint, and the harm is taken away.', quote: true, cite: 'MEDITATIONS 4.7', pause: 0.8 },
    { scene: 'citadel', id: 'q449', text: 'Be like the promontory against which the waves continually break, but it stands firm and tames the fury of the water around it.', quote: true, cite: 'MEDITATIONS 4.49', pause: 0.6 },
    { scene: 'citadel', id: 'rock', text: 'The waves never stop. The rock never moves.', emph: ['never'], pause: 1.0 },
    // ---------- VI. THE TOOLS ----------
    { scene: 'tools', id: 'tstart', text: 'So how do you build your own citadel? Marcus left us three tools.', emph: ['three'], pause: 0.5 },
    { scene: 'tools', id: 'first', text: 'The first. Prepare in the morning.', emph: ['first', 'morning'] },
    { scene: 'tools', id: 'ready', text: 'Before the day begins, picture what might go wrong. Not to fear it, but to meet it ready.', emph: ['ready'], pause: 0.3 },
    { scene: 'tools', text: 'He did this every single day. Even as emperor. Especially as emperor.', emph: ['every', 'especially'], pause: 0.6 },
    { scene: 'tools', id: 'second', text: 'The second. The view from above.', emph: ['second', 'above'] },
    { scene: 'tools', id: 'rise', text: 'When something feels enormous, rise above it. See your room. Your city. The whole Earth. A small point in endless time.', emph: ['room', 'city', 'earth', 'endless'] },
    { scene: 'tools', id: 'small', text: 'From up there, most of what troubles you becomes very small.', emph: ['small'], pause: 0.3 },
    { scene: 'tools', text: 'Your argument. Your embarrassment. Your fear. Seen from the stars, they shrink.', emph: ['stars', 'shrink'], pause: 0.6 },
    { scene: 'tools', id: 'third', text: 'The third. Remember that you will die.', emph: ['third', 'die'], pause: 0.4 },
    { scene: 'tools', id: 'q211', text: 'Since it is possible that thou mayest depart from life this very moment, regulate every act and thought accordingly.', quote: true, cite: 'MEDITATIONS 2.11', pause: 0.5 },
    { scene: 'tools', id: 'gift', text: 'Not as a threat. As a gift. Every day you are given is a day you could have lost.', emph: ['gift'], pause: 0.3 },
    { scene: 'tools', text: 'So do not waste it on anger, on envy, or on the opinions of strangers.', emph: ['anger', 'envy', 'strangers'], pause: 1.0 },
    // ---------- VII. THE LEGACY ----------
    { scene: 'legacy', id: 'died', text: 'Marcus Aurelius died in the year one hundred eighty, in a military camp, far from Rome.', emph: ['died'], pause: 0.5 },
    { scene: 'legacy', id: 'readers', text: 'He never knew that his private notebook would be read by emperors, soldiers, prisoners, and millions of ordinary people.', emph: ['millions'] },
    { scene: 'legacy', text: 'It has been opened in prison cells, on battlefields, and in hospital rooms, by people searching for the same thing he was. Strength.', emph: ['strength'], pause: 0.5 },
    { scene: 'legacy', id: 'dust', text: 'His empire is dust. His palace is ruins.', emph: ['dust', 'ruins'], pause: 0.4 },
    { scene: 'legacy', id: 'standing', text: 'But the fortress he built inside his mind is still standing. And anyone can enter it.', emph: ['standing', 'anyone'], pause: 1.0 },
    // ---------- OUTRO ----------
    { scene: 'outro', id: 'ostart', text: 'He left one last instruction. Perhaps the most important of all.', pause: 0.6 },
    { scene: 'outro', id: 'q1016', text: 'Waste no more time arguing about what a good man should be.', quote: true, cite: 'MEDITATIONS 10.16', pause: 0.5 },
    { scene: 'outro', id: 'beone', text: 'Be one.', quote: true, pause: 2.0 },
    { scene: 'outro', id: 'tomorrow', text: 'So tomorrow morning, when you wake up, say it to yourself.', pause: 0.3 },
    { scene: 'outro', id: 'mine', text: 'Today, I may meet difficult people. But no one enters my citadel unless I let them.', emph: ['citadel'], pause: 1.2 },
    { scene: 'outro', id: 'logo', text: 'This is Stoa. One lesson at a time.', pause: 0 },
  ];

  const LEAD = 0.6, GAP = 0.42, TAIL = 4.5;
  const SCENES = ['hook', 'title', 'rome', 'plague', 'frontier', 'betrayal', 'citadel', 'tools', 'legacy', 'outro'];
  const CHAPTERS = { rome: 'I · THE THRONE', plague: 'II · THE PLAGUE', frontier: 'III · THE FRONTIER', betrayal: 'IV · THE BETRAYAL', citadel: 'V · THE CITADEL', tools: 'VI · THE THREE TOOLS', legacy: 'VII · THE LEGACY' };
  const CHAPTER_HOLD = 3.2; // chapter card time inserted before each chapter's first line

  // Estimated timing (used until real voice files are imported): ~140 wpm.
  function estimateTimeline() {
    let t = LEAD; const lines = [];
    LINES.forEach((l, i) => {
      if (CHAPTERS[l.scene] && (i === 0 || LINES[i - 1].scene !== l.scene)) t += CHAPTER_HOLD;
      const s = t, words = [];
      for (const w of l.text.split(/\s+/)) {
        const d = 0.16 + w.replace(/[^\p{L}]/gu, '').length * 0.047 + (/[.,?!:;]["”]?$/.test(w) ? 0.2 : 0);
        words.push([w, +t.toFixed(3), +(t + d).toFixed(3)]); t += d;
      }
      lines.push({ scene: l.scene, start: +s.toFixed(3), end: +t.toFixed(3), words });
      t += GAP + (l.pause || 0);
    });
    return { duration: +(t + TAIL).toFixed(3), lines, estimated: true };
  }

  const low = s => s.toLowerCase().replace(/[^\p{L}]/gu, '');
  function wordTime(TL, li, prefix, nth = 0) {
    const l = TL.lines[li]; let n = 0;
    for (const w of l.words) if (low(w[0]).startsWith(prefix) && n++ === nth) return w[1];
    return l.start;
  }
  const idx = {}, ID = {}; LINES.forEach((l, i) => { idx[l.scene] = idx[l.scene] ?? i; if (l.id) ID[l.id] = i; });

  // Scene windows + every sound/visual event, shared by animation and soundtrack.
  function cues(TL) {
    const L = TL.lines, sc = {};
    SCENES.forEach((name, i) => {
      const first = idx[name];
      const pre = CHAPTERS[name] ? CHAPTER_HOLD + 0.2 : 0.35;
      sc[name] = { start: i === 0 ? 0 : Math.max(L[first - 1].end + 0.2, L[first].start - pre), first, chapter: CHAPTERS[name] ? L[first].start - CHAPTER_HOLD : null };
    });
    SCENES.forEach((name, i) => { sc[name].end = i < SCENES.length - 1 ? sc[SCENES[i + 1]].start : TL.duration; });
    const W = (id, p, n) => wordTime(TL, ID[id], p, n), S0 = id => L[ID[id]].start, E0 = id => L[ID[id]].end;
    const c = {
      scenes: sc, ID,
      hook: { list: ['ungrateful', 'arrogant', 'dishonest', 'envious'].map(p => W('list', p)), mind: W('mind', 'mind'), fortress: W('fortress', 'fortress') },
      title: S0('title'),
      rome: { year: S0('year'), emperor: W('emperor', 'emperor'), never: W('emperor', 'never'), hadrian: L[ID.philo - 1].start, verissimus: 0, philo: S0('philo'), tested: W('tested', 'tested'), crisis: ['floods', 'famine', 'rebellion', 'war'].map(p => W('crisis', p)), worse: S0('worse') },
      plague: { start: S0('plague'), fire: W('pfire', 'fire'), silent: W('silent', 'silent'), stayed: W('stayed', 'stayed'), funerals: W('stayed', 'funerals'), why: S0('why'), now: S0('now') },
      frontier: { war: S0('war'), tent: W('tent', 'tent'), day: S0('day'), ice: S0('ice'), night: S0('night'), himself: W('himself', 'himself'), med: W('med', 'meditations'), quote: S0('q21'), quoteEnd: E0('q21'), prep: W('prep', 'preparing'), storm: S0('storm') },
      betrayal: { start: S0('bstart'), rumor: W('rumor', 'rumor'), cassius: S0('cassius'), east: S0('east'), syria: W('east', 'syria'), egypt: W('east', 'egypt'), grain: W('east', 'grain'), army: S0('army'), forgive: W('forgive', 'forgive'), killed: W('killed', 'killed'), letters: S0('letters'), burned: W('letters', 'burned'), poison: S0('poison') },
      citadel: { q: S0('cq'), answer: W('answer', 'citadel'), quote1: S0('q848'), outside: S0('outside'), outer: ['other', 'reputation', 'sickness', 'death'].map(p => W('outside', p)), inside: S0('inside'), respond: W('inside', 'respond'), gate: W('gate', 'gate'), insult: S0('insult'), quote47: S0('q47'), quote2: S0('q449'), rock: S0('rock') },
      tools: { start: S0('tstart'), first: S0('first'), ready: W('ready', 'ready'), second: S0('second'), rise: W('rise', 'rise'), room: W('rise', 'room'), city: W('rise', 'city'), earth: W('rise', 'earth'), point: W('rise', 'point'), small: W('small', 'small'), third: S0('third'), quote: S0('q211'), gift: W('gift', 'gift') },
      legacy: { died: S0('died'), readers: S0('readers'), dust: W('dust', 'dust'), ruins: W('dust', 'ruins'), standing: W('standing', 'standing'), enter: W('standing', 'anyone') },
      outro: { start: S0('ostart'), q: S0('q1016'), beone: S0('beone'), tomorrow: S0('tomorrow'), mine: S0('mine'), logo: S0('logo') },
    };
    c.rome.verissimus = wordTime(TL, ID.philo - 1, 'verissimus');
    // Sound effects (type, time, gain) — consumed by tools/score.js
    const fx = [];
    const add = (type, t, g = 1) => fx.push({ type, t, g });
    add('boom', 0.05, 0.7);
    c.hook.list.forEach(t => add('hit', t, 0.6));
    add('boom', c.hook.mind, 1); add('riser', c.title - 2.2, 0.5); add('boom', c.title, 1.1); add('bell', c.title + 0.1, 0.35);
    SCENES.forEach(n => { if (sc[n].chapter) { add('whoosh', sc[n].chapter, 0.5); add('bell', sc[n].chapter + 0.3, 0.22); add('hit', L[sc[n].first].start - 0.15, 0.5); } });
    add('crowd', c.rome.emperor - 0.4, 0.6); c.rome.crisis.forEach(t => add('hit', t, 0.75)); add('boom', c.rome.worse, 0.9);
    add('boom', c.plague.start, 0.8); add('heart', c.plague.silent, 0.6); add('bell', c.plague.stayed, 0.2); add('bell', c.plague.now, 0.3);
    add('drums', c.frontier.war, 1); add('boom', c.frontier.war, 0.9); add('whoosh', c.frontier.night, 0.4); add('quill', c.frontier.night + 2.0, 0.5); add('bell', c.frontier.med, 0.35); add('thunder', c.frontier.storm + 0.3, 0.7);
    add('boom', c.betrayal.start, 0.8); add('hit', c.betrayal.cassius, 0.9); [c.betrayal.syria, c.betrayal.egypt, c.betrayal.grain].forEach(t => add('hit', t, 0.5)); add('drums', c.betrayal.army, 0.7); add('bell', c.betrayal.forgive, 0.3); add('boom', c.betrayal.killed, 0.8); add('fire', c.betrayal.burned, 0.8);
    add('thunder', c.citadel.q, 0.8); add('boom', c.citadel.answer, 0.9); c.citadel.outer.forEach(t => add('hit', t, 0.45)); add('bell', c.citadel.respond, 0.35); add('gate', c.citadel.gate, 0.8); add('waves', c.citadel.quote2 - 0.5, 1);
    add('bell', c.tools.first, 0.3); add('bell', c.tools.second, 0.3); add('riser', c.tools.rise, 0.35); add('bell', c.tools.third, 0.3); add('heart', c.tools.third, 0.5); add('bell', c.tools.gift, 0.35);
    add('boom', c.legacy.died, 0.6); add('whoosh', c.legacy.readers, 0.4); add('bell', c.legacy.standing, 0.35);
    add('riser', c.outro.beone - 2.4, 0.45); add('boom', c.outro.beone, 1.1); add('bell', c.outro.logo, 0.4);
    c.fx = fx.sort((a, b) => a.t - b.t);
    // Music moods per time window — consumed by tools/score.js
    c.moods = [
      ['hook', 'dark'], ['title', 'epic'], ['rome', 'noble'], ['plague', 'grief'], ['frontier', 'war'],
      ['betrayal', 'tension'], ['citadel', 'calm'], ['tools', 'hope'], ['legacy', 'grief'], ['outro', 'epic'],
    ].map(([n, m]) => ({ start: sc[n].start, end: sc[n].end, mood: m, scene: n }));
    // the frontier: war by day, a quiet night of writing, then the storm
    const fm = c.moods.find(m => m.scene === 'frontier'), fEnd = fm.end; fm.end = c.frontier.night - 0.5;
    c.moods.push({ start: c.frontier.night - 0.5, end: c.frontier.storm, mood: 'night', scene: 'frontier' }, { start: c.frontier.storm, end: fEnd, mood: 'dark', scene: 'frontier' });
    c.ambience = [
      { start: sc.frontier.start, end: sc.frontier.end, type: 'wind', g: 0.8 },
      { start: c.frontier.night - 0.5, end: c.frontier.storm, type: 'fire', g: 0.5 },
      { start: sc.plague.start, end: sc.plague.end, type: 'wind', g: 0.4 },
      { start: sc.citadel.start, end: c.citadel.quote2 - 0.5, type: 'rain', g: 0.6 },
      { start: c.citadel.quote2 - 0.5, end: sc.citadel.end, type: 'sea', g: 0.9 },
      { start: sc.hook.start, end: sc.hook.end, type: 'sea', g: 0.5 },
    ];
    return c;
  }

  const api = { EPISODE, LINES, LEAD, GAP, TAIL, SCENES, CHAPTERS, CHAPTER_HOLD, estimateTimeline, wordTime, cues };
  if (typeof module !== 'undefined') module.exports = api; else root.EP = api;
})(this);
