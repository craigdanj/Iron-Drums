import assert from 'node:assert/strict';
import {hitTime,setHitTime,snapTime,moveHits,pasteHits,uniqueHits,loopBounds} from '../dist/editor-model.js';
import {exportMidi,importMidi} from '../dist/midi.js';
import {LANES} from '../dist/data.js';
// Move a mixed straight/triplet selection against both boundaries. Relative timing must survive.
const notes=[{lane:'snare',step:2,offset:1/3,velocity:40,prob:.8},{lane:'closed',step:6,offset:0,velocity:110,prob:1}];
const times=notes.map(hitTime), spacing=times[1]-times[0];
moveHits(notes,times,-100,16);assert.equal(hitTime(notes[0]),0);assert.ok(Math.abs(hitTime(notes[1])-spacing)<1/960);
moveHits(notes,times,100,16);assert.ok(hitTime(notes[1])<16);assert.ok(Math.abs(hitTime(notes[1])-hitTime(notes[0])-spacing)<1/960);
for(const grid of [4,2,1,.5,.25,4/3,2/3,1/3]) assert.ok(Math.abs(snapTime(6.713,grid)/grid-Math.round(snapTime(6.713,grid)/grid))<1e-10);
assert.equal(snapTime(2.123,0),2.123);
const pasted=pasteHits([{lane:'kick',step:2,velocity:100},{lane:'snare',step:4,velocity:40}],15,16);assert.equal(pasted.length,1);assert.equal(hitTime(pasted[0]),15);
assert.deepEqual(pasteHits([],0,16),[]);
assert.equal(uniqueHits([{lane:'kick',step:0,velocity:30},{lane:'kick',step:0,velocity:120},{lane:'snare',step:0,velocity:50}]).length,2);
assert.equal(uniqueHits([{lane:'kick',step:0,velocity:30},{lane:'kick',step:0,velocity:120}])[0].velocity,120);
assert.deepEqual(loopBounds({bars:2,loop:{start:99,end:100,enabled:true}},16),{start:31,end:32,enabled:true});
// Dense rolls and the last possible sub-step must remain inside the phrase after MIDI import.
const events=[0,.25,.5,.75,2/3,4/3,15.75,31.975].map((t,i)=>setHitTime({lane:i%2?'snare':'closed',velocity:50+i*8,prob:1},t,32));
const map=Object.fromEntries(LANES.map(l=>[l.note,l.id]));
const parsed=importMidi(exportMidi(events,112,'4/4',32).buffer,map);
assert.equal(parsed.bars,2);assert.equal(parsed.events.length,events.length);
for(const [i,n] of parsed.events.entries()){assert.ok(n.step<32&&n.offset>=0&&n.offset<1);assert.ok(Math.abs(hitTime(n)-events.map(hitTime).sort((a,b)=>a-b)[i])<=1/120);}
const restored=JSON.parse(JSON.stringify({events,loop:{start:16,end:32,enabled:true}}));
assert.deepEqual(restored.events,events);assert.deepEqual(restored.loop,{start:16,end:32,enabled:true});
console.log('Editor checks passed: group boundaries, fine timing, snapping, paste, collisions, loop bounds, dense-roll MIDI and JSON persistence.');
