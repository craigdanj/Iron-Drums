// Pattern timing is measured in sixteenth notes, independently of grid snapping.
export const hitTime = n => n.step + (n.offset || 0);
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export function setHitTime(note, value, length) {
  const t = Math.round(clamp(value, 0, length - 1 / 960) * 960) / 960;
  note.step = Math.floor(t); note.offset = t - note.step;
  return note;
}
export function snapTime(value, grid) { return grid ? Math.round(value / grid) * grid : value; }
export function moveHits(notes, times, delta, length) {
  if (!notes.length) return;
  const low = Math.min(...times), high = Math.max(...times);
  delta = clamp(delta, -low, length - 1 / 960 - high);
  notes.forEach((note, i) => setHitTime(note, times[i] + delta, length));
}
export function pasteHits(notes, cursor, length) {
  if (!notes.length) return [];
  const start = Math.min(...notes.map(hitTime));
  return notes.map(n => ({...n, time: cursor + hitTime(n) - start}))
    .filter(n => n.time >= 0 && n.time < length)
    .map(({time, ...n}) => setHitTime(n, time, length));
}
export function uniqueHits(events) {
  const result = new Map();
  for (const n of events) result.set(n.lane + ':' + Math.round(hitTime(n) * 960), n);
  return [...result.values()];
}
export function loopBounds(p, stepsPerBar) {
  const length = p.bars * stepsPerBar;
  let start = clamp(Number.isFinite(+p.loop?.start) ? Math.floor(+p.loop.start) : 0, 0, length - 1);
  let end = clamp(Number.isFinite(+p.loop?.end) ? Math.floor(+p.loop.end) : length, start + 1, length);
  return {start, end, enabled: !!p.loop?.enabled};
}
