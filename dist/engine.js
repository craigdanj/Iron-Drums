import {LANES} from './data.js';
export class DrumEngine{
 constructor(state,onProgress=()=>{}){this.state=state;this.onProgress=onProgress;this.cache=new Map();this.rr={};this.voices=[];this.ready=false;this.pending=null;this.output=null;}
 async init(){if(this.ready)return;if(this.pending)return this.pending;
 this.pending=(async()=>{this.ctx=new AudioContext({latencyHint:'interactive'});await this.ctx.resume();this.manifest=await fetch('./samples.json').then(r=>{if(!r.ok)throw Error('Sample manifest unavailable');return r.json()});Object.assign(this.manifest,this.customManifest||{});this.graph=this.buildGraph(this.ctx);await this.loadCurrent();this.ready=true;})();
 try{await this.pending;}catch(e){this.pending=null;throw e;}}
 async getBuffer(path){if(!this.cache.has(path)){const p=fetch(path).then(r=>{if(!r.ok)throw Error('Sample could not load: '+path);return r.arrayBuffer()}).then(b=>this.ctx.decodeAudioData(b));this.cache.set(path,p);p.catch(()=>this.cache.delete(path));}return this.cache.get(path);}
 async loadCurrent(){let paths=[...new Set(LANES.flatMap(l=>this.variant(l).groups.flatMap(g=>this.manifest[g[1]]||[])))];let done=0,index=0;await Promise.all(Array.from({length:6},async()=>{while(index<paths.length){await this.getBuffer(paths[index++]);this.onProgress(++done,paths.length)}}));}
 variant(l){return l.variants[this.state.variants[l.id]||0]||l.variants[0]}
 buildGraph(ctx,only=null){
 const input=ctx.createGain(),master=ctx.createGain(),low=ctx.createBiquadFilter(),high=ctx.createBiquadFilter(),glue=ctx.createDynamicsCompressor(),parallel=ctx.createDynamicsCompressor(),parallelGain=ctx.createGain(),roomIn=ctx.createGain(),room=ctx.createConvolver(),roomGain=ctx.createGain(),limiter=ctx.createDynamicsCompressor(),analyser=ctx.createAnalyser();
 low.type='lowshelf';low.frequency.value=120;high.type='highshelf';high.frequency.value=6500;
 parallel.threshold.value=-30;parallel.ratio.value=8;parallel.attack.value=.008;parallel.release.value=.12;
 const impulse=ctx.createBuffer(2,Math.floor(ctx.sampleRate*1.7),ctx.sampleRate);for(let c=0;c<2;c++){const a=impulse.getChannelData(c);let seed=233+c;for(let i=0;i<a.length;i++){seed=(seed*16807)%2147483647;a[i]=(seed/1073741824-1)*Math.pow(1-i/a.length,3)*.55;}}room.buffer=impulse;
 input.connect(low);low.connect(high);high.connect(glue);glue.connect(master);input.connect(parallel);parallel.connect(parallelGain);parallelGain.connect(master);roomIn.connect(room);room.connect(roomGain);roomGain.connect(master);
 master.connect(limiter);limiter.threshold.value=-1.5;limiter.knee.value=0;limiter.ratio.value=20;limiter.attack.value=.002;limiter.release.value=.08;limiter.connect(analyser);analyser.fftSize=256;analyser.connect(ctx.destination);
 const channels={};for(const c of this.state.channels){const source=ctx.createGain(),hp=ctx.createBiquadFilter(),lo=ctx.createBiquadFilter(),mid=ctx.createBiquadFilter(),hi=ctx.createBiquadFilter(),comp=ctx.createDynamicsCompressor(),pan=ctx.createStereoPanner(),fader=ctx.createGain(),send=ctx.createGain();hp.type='highpass';lo.type='lowshelf';lo.frequency.value=120;mid.type='peaking';mid.frequency.value=1100;mid.Q.value=.7;hi.type='highshelf';hi.frequency.value=6000;source.connect(hp);hp.connect(lo);lo.connect(mid);mid.connect(hi);hi.connect(comp);comp.connect(pan);pan.connect(fader);fader.connect(input);fader.connect(send);send.connect(roomIn);channels[c.id]={source,hp,lo,mid,hi,comp,pan,fader,send};}
 const graph={input,master,low,high,glue,parallelGain,roomGain,channels,analyser,limiter,ctx,only,voices:[]};this.update(graph);return graph;
 }
 update(graph=this.graph){if(!graph)return;const m=this.state.master;graph.master.gain.value=m.volume;graph.low.gain.value=m.low;graph.high.gain.value=m.high;graph.glue.threshold.value=-8-m.glue*.22;graph.glue.ratio.value=1+m.glue*.045;graph.glue.attack.value=.015;graph.glue.release.value=.15;graph.parallelGain.gain.value=m.parallel;graph.roomGain.gain.value=m.room;
 const solo=this.state.channels.some(c=>c.solo);for(const c of this.state.channels){const n=graph.channels[c.id];n.hp.frequency.value=c.hpf;n.lo.gain.value=c.low;n.mid.gain.value=c.mid;n.hi.gain.value=c.high;n.pan.pan.value=c.pan;n.fader.gain.value=(c.mute||(solo&&!c.solo)||(graph.only&&graph.only!==c.id)?0:c.volume)*(c.polarity?-1:1);n.comp.threshold.value=-1-c.comp*.35;n.comp.ratio.value=1+c.comp*.08;n.comp.attack.value=.008;n.comp.release.value=.12;n.send.gain.value=c.room;}}
 async hit(laneId,velocity=100,when,graph=this.graph,random=true){const lane=LANES.find(l=>l.id===laneId);if(!lane||!graph)return;const variant=this.variant(lane);let group=variant.groups.find(g=>velocity<=g[0])||variant.groups.at(-1);const paths=this.manifest[group[1]];if(!paths?.length)return;const index=this.rr[group[1]]||0;this.rr[group[1]]=(index+1)%paths.length;const buffer=await this.getBuffer(paths[index%paths.length]);this.playBuffer(lane,buffer,velocity,when,graph);}
 playBuffer(lane,buffer,velocity,when,graph){const ctx=graph.ctx,t=Math.max(when??ctx.currentTime,ctx.currentTime),c=this.state.channels.find(c=>c.id===lane.ch),src=ctx.createBufferSource(),gain=ctx.createGain();src.buffer=buffer;src.playbackRate.value=2**(c.tune/12);const amp=(velocity/127)**.65*.72;gain.gain.setValueAtTime(amp,t);const duration=Math.max(.035,buffer.duration/src.playbackRate.value*c.decay);if(c.decay<.99){gain.gain.exponentialRampToValueAtTime(.0001,t+duration);}src.connect(gain);gain.connect(graph.channels[lane.ch].source);
 const voices=graph===this.graph?this.voices:graph.voices;
 if(['closed','foot','semi'].includes(lane.id)){for(const voice of voices.filter(v=>v.ch==='hat'&&v.t<=t&&v.end>t)){voice.gain.gain.cancelScheduledValues(t);voice.gain.gain.setTargetAtTime(.0001,t,.012);}}
 const voice={src,gain,ch:lane.ch,t,end:t+duration+.03};voices.push(voice);
 src.onended=()=>{const i=voices.indexOf(voice);if(i>=0)voices.splice(i,1);src.disconnect();gain.disconnect();};
 if(graph===this.graph&&voices.length>128){const old=voices.shift();old.src.stop();}

 src.start(t);src.stop(t+duration+.03);}
 stop(){if(this.ctx){for(const v of this.voices){try{v.src.stop()}catch{}}this.voices=[];}}
 async resume(){await this.init();await this.ctx.resume();}
}
