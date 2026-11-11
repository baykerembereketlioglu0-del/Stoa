// THE COURT OF SMALL CRIMES — the recurring cast and their ElevenLabs voices.
(function (root) {
  const CAST = {
    clerk:      { name: 'THE CLERK',        label: 'CLERK',       voice: 'JBFqnCBsd6RMkjVDRZzb', settings: { stability: 0.5, similarity_boost: 0.8, style: 0.35, speed: 0.95 } }, // George
    judge:      { name: 'JUDGE AGATHA SHELL', label: 'THE COURT', voice: 'Xb7hH8MSUJpSbSDYk0k2', settings: { stability: 0.45, similarity_boost: 0.8, style: 0.45, speed: 0.96 } }, // Alice
    prosecutor: { name: 'FELIX FENNICK',    label: 'PROSECUTION', voice: 'IKne3meq5aSn9XLyUdCD', settings: { stability: 0.32, similarity_boost: 0.75, style: 0.65, speed: 1.05 } }, // Charlie
    expert:     { name: 'DR. INGRID HERON', label: 'EXPERT',      voice: 'pFZP5JQG7iQjIQuC4Bku', settings: { stability: 0.5, similarity_boost: 0.8, style: 0.3, speed: 1.0 } }, // Lily
  };
  if (typeof module !== 'undefined') module.exports = CAST; else root.CAST = CAST;
})(this);
