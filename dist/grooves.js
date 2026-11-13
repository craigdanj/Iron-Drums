/** Original, deterministic drum-kit arrangements. No third-party MIDI content.
 * Coordinates are sixteenth-note units. Fractional coordinates preserve triplets.
 * Style names describe acoustic-kit interpretations, not authentic percussion ensembles.
 */
export const METERS={
 '4/4':{steps:16,groups:[4,4,4,4]},'3/4':{steps:12,groups:[4,4,4]},
 '5/4':{steps:20,groups:[12,8]},'5/8':{steps:10,groups:[6,4]},
 '6/8':{steps:12,groups:[6,6]},'7/8':{steps:14,groups:[4,4,6]},
 '9/8':{steps:18,groups:[6,6,6]},'11/8':{steps:22,groups:[6,6,6,4]},
 '12/8':{steps:24,groups:[6,6,6,6]}
};
const seq=s=>String(s).trim().split(/\s+/).filter(Boolean).map(Number);
const kicks=s=>s.split('|').map(seq);
const eighth=n=>Array.from({length:Math.ceil(n/2)},(_,i)=>i*2);
const sixteenth=n=>Array.from({length:n},(_,i)=>i);
const shuffle=n=>Array.from({length:Math.ceil(n/4)},(_,i)=>[i*4,i*4+8/3]).flat().filter(x=>x<n);
const jazz=n=>Array.from({length:Math.ceil(n/8)},(_,i)=>[i*8,i*8+4,i*8+20/3]).flat().filter(x=>x<n);
const profile=(family,style,bpm,k,s='4 12',extra={})=>({family,style,bpm,k:kicks(k),snare:seq(s),signature:'4/4',feel:'Straight',pulse:'eighth',voice:'closed',...extra});
export const GROOVE_PROFILES=[
 profile('Rock','Studio Rock',112,'0 8|0 6 8 10|0 3 8 11|0 4 8 12|0 7 10 14'),
 profile('Rock','Hard Rock',124,'0 2 8 10|0 6 8 14|0 3 6 8 10|0 4 8 12 14|0 2 7 8 11 14','4 12',{voice:'semi'}),
 profile('Rock','Alternative Rock',108,'0 7 8|0 3 10|0 6 11 14|0 4 10 12|0 3 7 10 15'),
 profile('Rock','Indie Rock',132,'0 8 14|0 2 7 8|0 6 10 15|0 4 8 12|0 3 8 11 15','4 12',{snareVoice:'stick'}),
 profile('Rock','Pop Punk',174,'0 2 8 10 14|0 3 6 8 11|0 2 6 8 10 15|0 4 6 8 12 14|0 2 7 8 10 14','4 12',{voice:'semi'}),
 profile('Rock','Punk',186,'0 6 8 14|0 2 6 10 14|0 3 8 11|0 4 8 12 14|0 2 8 10 15','4 12',{voice:'open',ghosts:[7,15]}),
 profile('Metal','Heavy Metal',148,'0 2 8 10|0 2 3 8 10 11|0 3 6 8 11 14|0 4 6 8 12 14|0 1 2 6 8 9 10 14','4 12',{voice:'ride'}),
 profile('Metal','Thrash',192,'0 2 4 8 10 12|0 1 6 8 9 14|0 2 3 6 8 10 11 14|0 4 5 8 12 13|0 1 2 3 8 9 10 11','4 12',{voice:'semi'}),
 profile('Metal','Metalcore',150,'0 3 6 10 14|0 1 3 6 9 10 14|0 2 6 7 10 14 15|0 4 6 10 12 14|0 1 2 6 10 11 14','8',{voice:'china'}),
 profile('Metal','Djent',136,'0 1 6 7 10|0 3 4 9 10 14|0 1 2 7 8 13 14|0 4 5 10 11|0 1 5 6 7 12 13','8',{voice:'china',pulse:[0,4,8,12]}),
 profile('Metal','Blast Beats',210,'0 2 4 6 8 10 12 14|0 1 4 5 8 9 12 13|0 1 2 4 6 8 9 10 12 14|0 2 3 6 8 10 11 14|0 1 2 3 4 5 8 9 10 11 12 13','1 3 5 7 9 11 13 15',{voice:'ride'}),
 profile('Metal','Doom',66,'0 8|0 3 10|0 6 8 14|0 4 10 14|0 2 7 10 15','8',{voice:'open',pulse:[0,4,8,12]}),
 profile('Pop','Pop',116,'0 8 10|0 6 8 11|0 3 8 14|0 4 8 12|0 7 8 10 15'),
 profile('Pop','Ballad',72,'0 10|0 6 8|0 3 10 14|0 8 12|0 7 10 15','4 12',{snareVoice:'stick',voice:'ride',pulse:[0,4,8,12]}),
 profile('Funk','Funk',102,'0 3 7 8 11|0 6 9 14|0 2 7 10 15|0 4 7 8 12|0 3 6 10 13','4 12',{ghosts:[1,6,9,14]}),
 profile('Funk','Linear Funk',108,'0 3 8 11|0 6 10 15|0 2 7 10 13|0 4 8 11 14|0 3 6 9 14','4 12',{linear:true,pulse:'sixteenth',ghosts:[2,7,10,15]}),
 profile('Funk','Afrobeat',112,'0 6 10 14|0 3 8 14|0 2 7 10 15|0 4 6 12 14|0 3 7 9 14','4 10 12',{pulse:[0,2,3,6,8,10,11,14],ghosts:[1,7,15],voice:'closed'}),
 profile('Soul','Soul',94,'0 8|0 6 8 14|0 3 8 11|0 4 8 14|0 7 10 15','4 12',{ghosts:[7,15]}),
 profile('Soul','Motown',126,'0 4 8 12|0 4 6 8 12|0 2 4 8 10 12|0 4 8 11 12 14|0 3 4 8 12 15','4 12',{pulse:'sixteenth',ghosts:[2,10]}),
 profile('Soul','R&B',86,'0 3 8 11|0 6 9 14|0 2 7 10 15|0 4 8 10 14|0 3 7 11 15','4 12',{pulse:[0,2,4,6,7,8,10,12,14],ghosts:[1,6,9,14]}),
 profile('Soul','Neo-Soul',78,'0 3 9 14|0 6 10 15|0 2 7 11 14|0 4 9 12 15|0 3 6 10 13','4 12',{feel:'Swing',pulse:'shuffle',ghosts:[2,7,10,15]}),
 profile('Hip-Hop','Hip-Hop',92,'0 6 10|0 3 8 14|0 7 10 15|0 4 8 10|0 2 6 11 14','4 12',{pulse:[0,2,4,6,8,10,12,14],ghosts:[11]}),
 profile('Hip-Hop','Boom Bap',88,'0 3 10|0 6 8 11|0 2 7 10|0 4 8 14|0 3 6 11 15','4 12',{feel:'Swing',pulse:'shuffle',ghosts:[7,15]}),
 profile('Hip-Hop','Trap Kit',140,'0 3 6 11|0 2 7 10 14|0 1 6 10 15|0 4 9 14|0 3 7 11 14','8',{pulse:'sixteenth',ghosts:[15],rolls:true}),
 profile('Electronic','Disco',120,'0 4 8 12|0 4 8 10 12|0 2 4 8 12|0 4 6 8 12 14|0 3 4 8 11 12','4 12',{pulse:[2,6,10,14],voice:'open'}),
 profile('Electronic','House Kit',124,'0 4 8 12|0 4 7 8 12|0 4 8 12 15|0 2 4 8 12 14|0 4 6 8 10 12','4 12',{pulse:[0,2,4,6,8,10,12,14],offbeatOpen:true}),
 profile('Electronic','Drum & Bass',172,'0 10|0 3 10|0 7 10 14|0 4 10 15|0 3 6 10 11','4 12',{pulse:'sixteenth',ghosts:[7,9,15]}),
 profile('Electronic','Breakbeat',132,'0 6 10 14|0 3 8 10|0 2 7 10 15|0 4 6 10 14|0 3 7 11 14','4 12',{ghosts:[2,7,10,15]}),
 profile('Jazz','Jazz Swing',148,'0 8|0 6.6667 12|0 4 10.6667|0 8 14.6667|0 6.6667 10.6667','4 12',{feel:'Swing',pulse:'jazz',voice:'ride',snareVoice:'stick',ghosts:[6.6667,14.6667],foot:[4,12]}),
 profile('Jazz','Bebop',188,'0 10.6667|0 6.6667 8|0 4 14.6667|0 8 12|0 2.6667 10.6667 14.6667','6.6667 12',{feel:'Swing',pulse:'jazz',voice:'ride',ghosts:[2.6667,8],foot:[4,12]}),
 profile('Jazz','Jazz Waltz',154,'0|0 8|0 6.6667|0 4 10.6667|0 2.6667 8','4 8',{signature:'3/4',feel:'Swing',pulse:[0,4,6.6667,8,10.6667],voice:'ride',snareVoice:'stick',foot:[4,8]}),
 profile('Blues','Blues Shuffle',104,'0 8|0 6.6667 8|0 2.6667 8 10.6667|0 4 8 12|0 6.6667 10.6667 14.6667','4 12',{feel:'Shuffle',pulse:'shuffle',voice:'ride',ghosts:[6.6667,14.6667]}),
 profile('Blues','Texas Shuffle',128,'0 4 8 12|0 2.6667 4 8 12|0 4 6.6667 8 12 14.6667|0 4 8 10.6667 12|0 2.6667 6.6667 8 12','4 12',{feel:'Shuffle',pulse:'shuffle',ghosts:[0,2.6667,6.6667,8,10.6667,14.6667]}),
 profile('Blues','Slow Blues',68,'0 12|0 8 12 20|0 4 12 16 22|0 6 12 18|0 10 12 16 20','6 18',{signature:'12/8',feel:'Triplet',pulse:[0,4,6,10,12,16,18,22],voice:'ride',ghosts:[8,20]}),
 profile('World','Reggae',82,'4 12|0 4 12|4 10 12|4 8 12|2 4 12 14','4 12',{snareVoice:'stick',pulse:[0,2,4,6,8,10,12,14],offbeatOpen:true}),
 profile('World','One Drop',76,'8|8 14|6 8|8 11|2 8 14','8',{snareVoice:'stick',pulse:[0,2,4,6,8,10,12,14],ghosts:[15]}),
 profile('World','Ska',148,'0 8|0 6 8 14|0 4 8 12|0 2 8 10|0 6 8 11','4 12',{voice:'semi',pulse:[2,6,10,14]}),
 profile('World','Bossa Nova',132,'0 6 8 14|0 6 8 12 14|0 2 6 8 14|0 6 8 10 14|0 6 7 8 14','0 6 12 20 24',{cycle:2,voice:'ride',snareVoice:'stick',pulse:[0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30],foot:[4,12,20,28]}),
 profile('World','Samba',104,'0 3 4 7 8 11 12 15|0 2 4 7 8 10 12 15|0 3 4 6 8 11 12 14|0 3 4 7 8 10 12 14|0 2 4 6 8 11 12 15','2 8 14 20 26',{cycle:2,voice:'bell',snareVoice:'stick',pulse:[0,3,6,8,10,13,16,19,22,24,26,29],foot:[4,12,20,28]}),
 profile('World','Baiao',96,'0 3 6 8 11 14|0 3 6 8 10 14|0 2 6 8 11 14|0 3 6 8 12 14|0 3 5 8 11 14','4 10 12',{voice:'closed',snareVoice:'stick',pulse:[0,2,4,6,8,10,12,14],toms:[0,6,8,14]}),
 profile('World','Songo',108,'0 6 10 14|0 3 6 10 14|0 6 8 11 14|0 4 6 10 15|0 2 6 11 14','4 11 20 26',{cycle:2,voice:'cowbell',snareVoice:'stick',pulse:[0,3,6,8,10,14,16,19,22,24,26,30],toms:[7,15,23,31]}),
 profile('World','Cascara',116,'0 6 8 14|0 6 10 14|0 3 8 14|0 4 8 12 14|0 6 8 11 15','0 6 12 20 24',{cycle:2,voice:'cowbell',snareVoice:'stick',pulse:[0,2,4,6,7,10,12,14,16,18,20,22,24,26,27,30]}),
 profile('World','Afro-Cuban 6/8',114,'0 6|0 4 6 10|0 2 6 8|0 6 10|0 4 8 10','4 10',{signature:'6/8',feel:'Triplet',voice:'bell',pulse:[0,2,4,5,7,9,11],toms:[3,8]}),
 profile('Country','Country Train',156,'0 8|0 6 8|0 2 8 10|0 4 8 12|0 3 8 14','0 2 4 6 8 10 12 14',{pulse:[4,12],voice:'foot',ghosts:[1,3,5,7,9,11,13,15],train:true}),
 profile('Country','Country Rock',118,'0 8|0 6 8 10|0 2 8 14|0 4 8 12|0 3 8 10 15','4 12',{voice:'ride',ghosts:[7,15]}),
 profile('Odd meter','Progressive 5/4',122,'0 8 12|0 6 10 16|0 3 8 12 18|0 4 10 14 18|0 2 7 12 15 18','4 12 16',{signature:'5/4',voice:'ride',accent:[0,12]}),
 profile('Odd meter','Progressive 7/8',132,'0 4 8|0 3 8 12|0 2 6 10|0 4 7 10 12|0 1 5 8 11','4 10',{signature:'7/8',voice:'ride',accent:[0,4,8]}),
 profile('Odd meter','Odd 5/8',142,'0 6|0 3 6 8|0 2 7|0 4 6|0 1 5 8','4 8',{signature:'5/8',accent:[0,6]}),
 profile('Odd meter','Odd 9/8',126,'0 6 12|0 4 6 10 14|0 3 8 12 16|0 6 10 12 17|0 2 7 12 15','6 14',{signature:'9/8',feel:'Triplet',voice:'bell',accent:[0,6,12]}),
 profile('Odd meter','Odd 11/8',136,'0 6 12 18|0 3 8 12 20|0 4 7 14 18|0 2 6 11 16 20|0 5 10 12 17 20','6 14 20',{signature:'11/8',voice:'ride',accent:[0,6,12,18]})
];
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');
const clamp=v=>Math.round(Math.max(1,Math.min(127,v)));
function builder(meta){const map=new Map(),len=METERS[meta.signature].steps*meta.bars;
 return {meta,add(lane,t,velocity=90){if(!Number.isFinite(t)||t<0||t>=len-.00001)return;const tick=Math.round(t*120),step=Math.round(tick/120);const event={lane,step,velocity:clamp(velocity),prob:1,offset:tick/120-step};if(step>=len){event.step=len-1;event.offset=tick/120-event.step;}const key=`${lane}:${tick}`,old=map.get(key);if(!old||old.velocity<event.velocity)map.set(key,event);},
 removeRange(start,end){for(const [key,e]of map)if(e.step+e.offset>=start&&e.step+e.offset<end)map.delete(key);},
 finish(){return {...meta,events:[...map.values()].sort((a,b)=>(a.step+a.offset)-(b.step+b.offset)||a.lane.localeCompare(b.lane))};}};
}
function pulseFor(p){const n=METERS[p.signature].steps;if(Array.isArray(p.pulse))return p.pulse;return p.pulse==='jazz'?jazz(n):p.pulse==='shuffle'?shuffle(n):p.pulse==='sixteenth'?sixteenth(n):eighth(n);}
function cyclePositions(positions,bar,p){const n=METERS[p.signature].steps,phase=(bar%(p.cycle||1))*n;return positions.filter(t=>t>=phase&&t<phase+n).map(t=>t-phase);}
function compose(p,base,section,bars=section===2?4:2){const spb=METERS[p.signature].steps,b=builder({id:`ir-${slug(p.style)}-${base}-${section}`,name:`${p.style} · ${['Foundation','Push','Syncopated','Drive','Broken'][base%5]} ${base<5?'hats':'ride'} · ${['Verse','Ghosts','Chorus'][section]}`,family:p.family,style:p.style,kind:'Groove',feel:p.feel,signature:p.signature,bars,bpm:p.bpm,section:['Verse','Ghost notes','Chorus'][section],tags:[p.family,p.style,p.feel,base<5?'hi-hat':'ride',section===1?'ghost notes':section===2?'chorus lift':'verse pocket']});
 const primary=base<5?p.voice:(p.voice==='ride'?'bell':p.voice==='cowbell'?'bell':'ride'),ks=p.k[base%5];
 const carrier=['closed','semi','open'].includes(primary)?'hats':primary==='foot'?'pedal':primary;b.meta.name=`${p.style} · ${['Foundation','Push','Syncopated','Drive','Broken'][base%5]} ${carrier} · ${['Verse','Ghosts','Chorus'][section]}`;b.meta.tags[3]=carrier;
 for(let bar=0;bar<bars;bar++){
  const o=bar*spb,back=cyclePositions(p.snare,bar,p),ksBar=ks.filter(t=>t<spb),pulse=cyclePositions(pulseFor(p),bar,p),backVoice=p.snareVoice||'snare';
  for(let j=0;j<pulse.length;j++){const t=pulse[j];if(section===2&&bar%2===0&&t===0)continue;if(p.linear&&(back.some(x=>Math.abs(x-t)<.01)||ksBar.some(x=>Math.abs(x-t)<.01)))continue;let lane=primary;if(p.offbeatOpen&&t%4===2)lane='open';if(section===2&&bar%2===1&&j===pulse.length-1&&['closed','semi'].includes(lane))lane='semi';b.add(lane,o+t,(p.accent||[0]).some(x=>Math.abs(x-t)<.01)?99:(j%2?66:83));}
  for(const t of ksBar)b.add('kick',o+t,bar%2?105:111);
  // The second half of a phrase answers the first with an extra pickup.
  if(bar%2&&base%2===1)b.add('kick',o+spb-(p.feel==='Straight'?1:4/3),93);
  for(const t of back)b.add(backVoice,o+t,p.train?(t%4===0?95:56):section===2?117:107);
  const ghosts=[...(p.ghosts||[]),...(section===1?[1,spb/2-1,spb-3]:[])];
  for(const t of ghosts.filter(t=>t>=0&&t<spb))if(!back.some(x=>Math.abs(x-t)<.05))b.add('snare',o+t,31+((bar+Math.round(t))%3)*6);
  for(const t of cyclePositions(p.foot||[],bar,p))if(!pulse.some(x=>Math.abs(x-t)<.01&&['closed','semi','open'].includes(primary)))b.add('foot',o+t,67);
  for(const t of cyclePositions(p.toms||[],bar,p))b.add(t%2?'tomhi':'tomlo',o+t,67);
  if(p.rolls&&bar===bars-1)for(const t of [spb-2,spb-5/3,spb-4/3])b.add('closed',o+t,49+(Math.round(t*3)%3)*10);
  if(section===2&&bar%2===0){b.add(bar===0?'crash1':'crash2',o,112);}
 }
 return b;
}
function makeFill(p,base,orchestration,lengthIndex){const spb=METERS[p.signature].steps,beat=['6/8','9/8','12/8'].includes(p.signature)?6:p.signature.endsWith('/8')?2:4,length=[beat,beat*2,spb,spb*2][lengthIndex],bars=lengthIndex===3?4:2,b=compose(p,base,0,bars),start=spb*bars-length;
 Object.assign(b.meta,{id:`ir-${slug(p.style)}-fill-${orchestration}-${lengthIndex}`,name:`${p.style} · ${['Snare ladder','Tom descent','Kick & hands','Triplet turnaround'][orchestration]} · ${['1 beat','2 beats','1 bar','2 bars'][lengthIndex]}`,kind:'Fill',section:'Fill',tags:[p.family,p.style,p.feel,'fill',['snare','toms','kick snare','triplet'][orchestration]]});
 b.removeRange(start,spb*bars);
 const stride=orchestration===3?4/3:1;
 for(let t=start,j=0;t<spb*bars-.01;t+=stride,j++){
  const ratio=(t-start)/length;let lane;
  if(orchestration===0)lane=j%8<6?'snare':j%8===6?'tomhi':'tomlo';
  if(orchestration===1)lane=ratio<.25?'snare':ratio<.62?'tomhi':'tomlo';
  if(orchestration===2)lane=['snare','tomhi','kick','kick','snare','tomlo','kick','kick'][j%8];
  if(orchestration===3)lane=['snare','tomhi','tomlo'][j%3];
  b.add(lane,t,72+(j%4)*9+Math.round(ratio*10));
  if(j%4===0&&lane!=='kick')b.add('kick',t,103);
 }
 // A short flam leads into a strong final landing, entirely inside the phrase.
 if(lengthIndex>=2)b.add('snare',spb*bars-1.28,49);
 return b.finish();
}
function makeBoundary(p,ending,variant){const spb=METERS[p.signature].steps,bars=variant?2:1,b=compose(p,variant?3:0,0,bars);
 Object.assign(b.meta,{id:`ir-${slug(p.style)}-${ending?'ending':'intro'}-${variant}`,name:`${p.style} · ${ending?(variant?'Stop-time ending':'Final hit'):(variant?'Tom build':'Count-in pickup')}`,kind:ending?'Ending':'Intro',section:ending?'Ending':'Intro',tags:[p.family,p.style,ending?'ending stop':'intro build',p.feel]});
 if(ending){const start=variant?spb:0;b.removeRange(start,spb*bars);for(const [j,t]of (variant?[0,Math.floor(spb/2)]:[0]).entries()){b.add('kick',start+t,117);b.add('snare',start+t,114);b.add(j%2?'crash2':'crash1',start+t,119);}}
 else{b.removeRange(0,spb*bars);if(variant){for(let bar=0;bar<bars;bar++)for(let t=0;t<spb;t++){b.add(t%4<2?'tomhi':'tomlo',bar*spb+t,42+Math.round((bar*spb+t)/(bars*spb)*70));if(t%4===0)b.add('kick',bar*spb+t,94);}}else{for(let t=0;t<spb;t+=4)b.add('stick',t,70);for(let t=Math.max(0,spb-4);t<spb;t++)b.add(t<spb-2?'snare':'tomhi',t,75+(t%4)*9);}}
 return b.finish();
}
// A rhythm fingerprint ignores velocity so duplicate content cannot inflate the catalogue.
export function grooveFingerprint(p){return `${p.signature}/${p.bars}:`+p.events.map(e=>`${e.lane}:${Math.round((e.step+e.offset)*120)}`).sort().join(',');}
export function createExtensiveGrooves(existing=[]){const seen=new Set(existing.map(grooveFingerprint)),out=[];
 const add=p=>{const key=grooveFingerprint(p);if(!p.events.length||seen.has(key))return;seen.add(key);out.push(p);};
 for(const p of GROOVE_PROFILES){for(let base=0;base<10;base++)for(let section=0;section<3;section++)add(compose(p,base,section).finish());for(let orchestration=0;orchestration<4;orchestration++)for(let length=0;length<4;length++)add(makeFill(p,orchestration,orchestration,length));for(let variant=0;variant<2;variant++){add(makeBoundary(p,false,variant));add(makeBoundary(p,true,variant));}}
 return out;
}

export function meterBeatInfo(signature){const m=METERS[signature],interval=['6/8','9/8','12/8'].includes(signature)?6:signature.endsWith('/8')?2:4;let t=0;const accents=m.groups.map(g=>{const a=t;t+=g;return a;});return {positions:Array.from({length:Math.ceil(m.steps/interval)},(_,i)=>i*interval),accents,interval};}

export const PATTERN_LICENSE='MIT License\n\nCopyright (c) 2026 Iron Room contributors\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.';
