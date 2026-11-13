import assert from 'node:assert/strict';
import {GROOVES,LANES,SIGNATURES,defaultState} from '../dist/data.js';
import {grooveFingerprint,GROOVE_PROFILES,meterBeatInfo} from '../dist/grooves.js';
import {filterGrooves,PAGE_SIZE} from '../dist/groove-browser.js';
import {exportMidi,importMidi} from '../dist/midi.js';
const ids=new Set(),names=new Set(),rhythms=new Set(),lanes=new Set(LANES.map(l=>l.id)),map=Object.fromEntries(LANES.map(l=>[l.note,l.id]));
let notes=0,tripletNotes=0;
assert.equal(GROOVE_PROFILES.length,50);assert.ok(GROOVES.length>2000);
for(const [index,p]of GROOVES.entries()){
 assert.ok(!ids.has(p.id),'duplicate id '+p.id);ids.add(p.id);
 assert.ok(!names.has(p.name),'duplicate name '+p.name);names.add(p.name);
 assert.ok(SIGNATURES[p.signature]);assert.ok(Number.isInteger(p.bars)&&p.bars>=1&&p.bars<=4);assert.ok(p.events.length);
 const times=new Set();
 for(const e of p.events){assert.ok(lanes.has(e.lane));assert.ok(Number.isInteger(e.step)&&e.step>=0&&e.step<p.bars*SIGNATURES[p.signature],p.name+' step');assert.ok(e.offset>=-.49&&e.offset<=.49,p.name+' offset '+e.offset);assert.ok(e.step+e.offset>=0&&e.step+e.offset<p.bars*SIGNATURES[p.signature]);assert.ok(Number.isInteger(e.velocity)&&e.velocity>=1&&e.velocity<=127);const k=e.lane+':'+Math.round((e.step+e.offset)*120);assert.ok(!times.has(k),p.name+' duplicate hit');times.add(k);notes++;if(e.offset)tripletNotes++;}
 const fp=grooveFingerprint(p);if(index>=36)assert.ok(!rhythms.has(fp),'duplicate rhythmic content '+p.name);rhythms.add(fp);
 const bytes=exportMidi(p.events,p.bpm,p.signature,p.bars*SIGNATURES[p.signature]),parsed=importMidi(bytes.buffer,map);
 assert.equal(parsed.events.length,p.events.length,'MIDI notes '+p.name);assert.equal(parsed.bpm,p.bpm);assert.equal(parsed.signature,p.signature);assert.equal(parsed.bars,p.bars,'MIDI phrase length '+p.name);
 const before=p.events.map(e=>`${e.lane}:${Math.round((e.step+e.offset)*120)}:${e.velocity}`).sort();
 const after=parsed.events.map(e=>`${e.lane}:${Math.round((e.step+e.offset)*120)}:${e.velocity}`).sort();assert.deepEqual(after,before,'MIDI note timing '+p.name);
}
for(const profile of GROOVE_PROFILES){const list=filterGrooves(GROOVES,{style:'style:'+profile.style});assert.ok(list.length>=30,profile.style+' coverage');assert.ok(list.some(({p})=>p.kind==='Groove'));assert.ok(list.some(({p})=>p.kind==='Fill'));}
for(const meter of Object.keys(SIGNATURES))assert.ok(filterGrooves(GROOVES,{meter}).length>0);
const fills=filterGrooves(GROOVES,{kind:'Fill',style:'family:Metal',query:'triplet'});assert.ok(fills.length>0);assert.ok(fills.every(({p})=>p.kind==='Fill'&&p.family==='Metal'&&p.tags.includes('triplet')));
const fave=GROOVES.at(-1);assert.deepEqual(filterGrooves(GROOVES,{savedOnly:true,favorites:new Set([fave.id])}).map(({p})=>p.id),[fave.id]);
assert.equal(filterGrooves(GROOVES,{query:'not-a-real-style'}).length,0);
const sorted=filterGrooves(GROOVES,{sort:'tempo'});assert.ok(sorted.every((g,i)=>i===0||sorted[i-1].p.bpm<=g.p.bpm));
assert.ok(PAGE_SIZE<=50);assert.equal(defaultState().patterns[0].name,'Rock Pocket');
const byKind=Object.fromEntries(['Groove','Fill','Intro','Ending'].map(k=>[k,GROOVES.filter(p=>p.kind===k).length]));
console.log(JSON.stringify({patterns:GROOVES.length,styles:GROOVE_PROFILES.length,meters:Object.keys(SIGNATURES).length,notes,tripletNotes,byKind,uniqueRhythms:rhythms.size},null,2));
console.log('All patterns passed event validation, MIDI timing round trips, deduplication and browser-filter tests.');

for(const m of Object.keys(SIGNATURES)){const b=meterBeatInfo(m);assert.ok(b.positions.every(t=>t>=0&&t<SIGNATURES[m]));assert.ok(b.accents.every(t=>t>=0&&t<SIGNATURES[m]));}assert.equal(meterBeatInfo('6/8').interval,6);assert.equal(meterBeatInfo('7/8').interval,2);

const padded=exportMidi([{lane:'kick',step:0,offset:0,velocity:100}],112,'4/4',64);assert.equal(importMidi(padded.buffer,map).bars,4,'MIDI retains empty ending bars');
const tooLong=exportMidi([{lane:'kick',step:0,offset:0,velocity:100}],112,'4/4',16*65);assert.throws(()=>importMidi(tooLong.buffer,map),/64 bars/);
