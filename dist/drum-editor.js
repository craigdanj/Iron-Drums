import {hitTime, setHitTime, snapTime, moveHits, pasteHits, uniqueHits, clamp, loopBounds} from './editor-model.js';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ROW = 30, LABEL = 158;
const colors = {kick:'#d6ed7d',snare:'#e6aa77',hat:'#9fc5d8',tomhi:'#c9a6db',tomlo:'#c9a6db'};
export class DrumEditor {
  constructor(root, options) {
    Object.assign(this, options); this.root = root;
    this.selection = new Set(); this.clipboard = []; this.grid = 1; this.zoom = 26;
    this.tool = 'draw'; this.cursor = 0; this.lane = 'snare'; this.usedOnly = false;
    root.innerHTML = `
      <div class="daw-toolbar" role="toolbar" aria-label="Drum editing tools">
        <div class="daw-tools"><button data-tool="draw" title="Draw hits (1)">✎ Draw</button><button data-tool="select" title="Select and box-select (2)">↖ Select</button><button data-tool="erase" title="Erase hits (3)">⌫ Erase</button></div>
        <label>Snap <select id="drumSnap" aria-label="Editor snap"><option value="4">1/4</option><option value="2">1/8</option><option value="1" selected>1/16</option><option value="0.5">1/32</option><option value="0.25">1/64</option><option value="1.333333333333">1/8 triplet</option><option value="0.666666666667">1/16 triplet</option><option value="0.333333333333">1/32 triplet</option><option value="0">Off</option></select></label>
        <label>Zoom <input id="drumZoom" type="range" min="10" max="80" value="26" aria-label="Editor horizontal zoom"></label><button data-action="fit">Fit</button>
        <label><input id="drumUsed" type="checkbox"> Used lanes</label>
      </div>
      <div class="daw-actions"><button data-action="copy">Copy</button><button data-action="paste">Paste at marker</button><button data-action="duplicate">Duplicate hits</button><button data-action="delete">Delete</button><button data-action="quantize">Quantize</button><button data-action="ghost">Ghost</button><button data-action="flam">Flam</button><button data-action="roll">Roll ×4</button></div>
      <div class="daw-loop"><label><input id="drumLoop" type="checkbox"> Loop region</label><label>Start bar <input id="drumLoopStart" type="number" min="1" value="1"></label><label>End bar <input id="drumLoopEnd" type="number" min="1" value="2"></label><button data-action="loopSelection">Loop selection</button><span id="drumMarker"></span></div>
      <div class="daw-scroll" tabindex="0" aria-label="Drum note editor. Draw or select hits; arrow keys move selected notes."><div class="daw-content"><div class="daw-ruler"><span class="daw-ruler-label">BAR / BEAT</span><svg class="daw-timebar" height="30"></svg></div><div class="daw-body"><svg class="daw-notes" aria-label="Drum hits"></svg><div class="daw-labels"></div></div><div class="daw-velocity"><span class="daw-velocity-label">VELOCITY<br><small id="drumVelocityLane"></small><small>Drag bars to shape</small></span><svg class="daw-vel" height="112" aria-label="Velocity lane"></svg></div></div></div>
      <div class="daw-inspector"><strong id="drumSelection" role="status"></strong><label>Velocity <input id="drumVelocity" type="number" min="1" max="127"></label><label>Chance % <input id="drumChance" type="number" min="0" max="100"></label><label>Position (16ths) <input id="drumTime" type="number" min="0" step="0.01"></label><button data-action="selectAll">Select all</button><button data-action="saveGroove">★ Save to My Grooves</button></div>
      <p class="daw-hint">Click to draw · drag hits to move · Shift-click to select more · Alt-drag to copy · Select tool: drag a box · ruler: set marker · Ctrl/⌘ C/V/D · Delete · arrows: nudge · Shift-arrows: fine timing</p>
      <details class="my-grooves"><summary>My Grooves <span id="myGrooveCount"></span></summary><div class="my-groove-save"><input id="myGrooveName" placeholder="Name your groove" aria-label="Saved groove name"><button data-action="saveGroove">Save current groove</button></div><div id="myGrooveList"></div></details>`;
    this.$ = s => root.querySelector(s);
    root.addEventListener('click', e => {
      const tool = e.target.closest('[data-tool]');
      if (tool) {this.tool = tool.dataset.tool; this.renderControls();}
      const action = e.target.closest('[data-action]');
      if (action) this.action(action.dataset.action);
      const label = e.target.closest('[data-editor-lane]');
      if (label) {this.lane = label.dataset.editorLane; this.audition(this.lane); this.paint();}
    });
    this.$('#drumSnap').onchange = e => {this.grid = +e.target.value; this.paint();};
    this.$('#drumZoom').oninput = e => {this.zoom = +e.target.value; this.paint();};
    this.$('#drumUsed').onchange = e => {this.usedOnly = e.target.checked; this.paint();};
    for (const id of ['drumLoop','drumLoopStart','drumLoopEnd']) this.$('#'+id).onchange = () => this.updateLoop();
    this.$('#drumVelocity').onchange = e => this.editSelected(n => n.velocity = Math.round(clamp(+e.target.value || 1,1,127)));
    this.$('#drumChance').onchange = e => this.editSelected(n => n.prob = clamp(+e.target.value || 0,0,100) / 100);
    this.$('#drumTime').onchange = e => {
      const notes = this.selected(); if (!notes.length || !Number.isFinite(+e.target.value)) return;
      this.change(() => moveHits(notes, notes.map(hitTime), +e.target.value - Math.min(...notes.map(hitTime)), this.length()));
    };
    root.addEventListener('pointerdown', e => this.pointerDown(e));
    root.addEventListener('contextmenu', e => {
      if (e.target.closest('.daw-notes,.daw-vel')) {e.preventDefault(); const el = e.target.closest('[data-note]'); if (el) {this.selection = new Set([this.p.events[+el.dataset.note]]); this.paint();}}
    });
    root.addEventListener('keydown', e => this.keydown(e));
    window.addEventListener('pointermove', e => this.pointerMove(e));
    window.addEventListener('pointerup', () => this.pointerEnd());
    window.addEventListener('pointercancel', () => this.pointerEnd());
    this.readGrooves(); this.renderMyGrooves();
  }
  length() {return this.p.bars * this.signatures[this.p.signature];}
  selected() {return this.p.events.filter(n => this.selection.has(n));}
  color(lane) {return colors[this.lanes.find(l => l.id === lane)?.ch] || '#b7c4a1';}
  render(p) {
    if (this.p !== p) {this.selection.clear(); this.cursor = 0;}
    this.p = p; const current = new Set(p.events); this.selection = new Set([...this.selection].filter(n => current.has(n)));
    this.cursor = clamp(this.cursor, 0, this.length()-1);
    this.visible = this.lanes.filter(l => !this.usedOnly || l.id === this.lane || p.events.some(n => n.lane === l.id));
    this.paint();
  }
  paint() {
    if (!this.p) return;
    if (!this.drag || this.drag.type !== 'move') this.visible = this.lanes.filter(l => !this.usedOnly || l.id === this.lane || this.p.events.some(n => n.lane === l.id));
    const length = this.length(), width = Math.max(1, length * this.zoom), height = this.visible.length * ROW;
    const spb = this.signatures[this.p.signature], bounds = loopBounds(this.p,spb), interval = this.grid || 1;
    this.$('.daw-content').style.width = width + LABEL + 'px';
    this.$('.daw-body').style.height = height + 'px';
    const notesSvg = this.$('.daw-notes'), ruler = this.$('.daw-timebar'), vel = this.$('.daw-vel');
    for (const svg of [notesSvg,ruler,vel]) svg.setAttribute('width',width);
    notesSvg.setAttribute('height',height);
    let grid = '', ticks = '';
    for (let t = 0, n = 0; t < length-1e-6 && n < 5000; t += interval, n++) {
      const bar = Math.abs(t / spb - Math.round(t / spb)) < 1e-5;
      const beat = Math.abs(t / 4 - Math.round(t / 4)) < 1e-5;
      const x = t * this.zoom;
      grid += `<line x1="${x}" x2="${x}" y1="0" y2="${height}" class="${bar?'bar-line':beat?'beat-line':'sub-line'}"/>`;
    }
    for (let b = 0; b < this.p.bars; b++) {
      ticks += `<text x="${b*spb*this.zoom+7}" y="20">${b+1}</text>`;
      if (this.zoom >= 18) for (const pos of this.beatInfo(this.p.signature).positions.slice(1)) ticks += `<text class="beat-text" x="${(b*spb+pos)*this.zoom+4}" y="20">·${this.beatInfo(this.p.signature).positions.indexOf(pos)+1}</text>`;
    }
    const loop = bounds.enabled ? `<rect class="loop-shade" x="${bounds.start*this.zoom}" y="0" width="${(bounds.end-bounds.start)*this.zoom}" height="${height}"/>` : '';
    notesSvg.innerHTML = this.visible.map((l,i) => `<rect x="0" y="${i*ROW}" width="${width}" height="${ROW}" fill="${i%2?'#1b211d':'#171c19'}"/><line x1="0" x2="${width}" y1="${(i+1)*ROW}" y2="${(i+1)*ROW}" class="sub-line"/>`).join('')+loop+grid+this.p.events.map((n,i) => {
      const row = this.visible.findIndex(l => l.id === n.lane); if (row < 0) return '';
      const x = hitTime(n)*this.zoom, y = row*ROW+7;
      return `<rect data-note="${i}" class="drum-note ${this.selection.has(n)?'selected':''} ${n.velocity<55?'ghost-hit':''}" x="${Math.max(0,x-1)}" y="${y}" rx="3" width="${Math.min(16,Math.max(7,this.zoom*.55))}" height="16" fill="${this.color(n.lane)}" fill-opacity="${.35+n.velocity/127*.65}"><title>${esc(this.lanes.find(l=>l.id===n.lane).name)} · ${hitTime(n).toFixed(3)} · velocity ${n.velocity}</title></rect>`;
    }).join('')+`<line class="daw-cursor" x1="${this.cursor*this.zoom}" x2="${this.cursor*this.zoom}" y1="0" y2="${height}"/><line class="daw-playhead" visibility="hidden" y1="0" y2="${height}"/>`;
    ruler.innerHTML = (bounds.enabled?`<rect x="${bounds.start*this.zoom}" width="${(bounds.end-bounds.start)*this.zoom}" height="30" fill="#d4ed7a" opacity=".15"/>`:'')+ticks+`<path d="M${this.cursor*this.zoom} 30l-5-7h10z" fill="#f4f1c4"/>`;
    this.$('.daw-labels').innerHTML = this.visible.map((l,i)=>`<button data-editor-lane="${l.id}" class="${this.lane===l.id?'active':''}" style="height:${ROW}px;border-left-color:${this.color(l.id)}" aria-label="Audition ${esc(l.name)}"><span>${esc(l.name)}</span><kbd>${l.key.toUpperCase()}</kbd></button>`).join('');
    this.paintVelocity(); this.renderControls();
  }
  paintVelocity() {
    const selected = this.selected(), notes = selected.length ? this.p.events.filter(n=>this.selection.has(n)) : this.p.events.filter(n=>n.lane===this.lane);
    const vel = this.$('.daw-vel');
    vel.innerHTML = [32,64,96,127].map(v=>`<line x1="0" x2="${this.length()*this.zoom}" y1="${104-v/127*94}" y2="${104-v/127*94}" class="sub-line"/>`).join('')+notes.map(n=>`<rect data-note="${this.p.events.indexOf(n)}" x="${Math.max(0,hitTime(n)*this.zoom-1)}" y="${104-n.velocity/127*94}" width="${Math.min(12,Math.max(6,this.zoom*.4))}" height="${n.velocity/127*94}" rx="2" class="velocity-bar ${this.selection.has(n)?'selected':''}" fill="${this.color(n.lane)}"><title>Velocity ${n.velocity}</title></rect>`).join('');
    this.$('#drumVelocityLane').textContent = selected.length ? 'Selected hits' : this.lanes.find(l=>l.id===this.lane).name;
  }
  renderControls() {
    if (!this.p) return;
    this.root.querySelectorAll('[data-tool]').forEach(b=>{b.classList.toggle('active',b.dataset.tool===this.tool);b.setAttribute('aria-pressed',b.dataset.tool===this.tool);});
    const notes = this.selected(), bounds = loopBounds(this.p,this.signatures[this.p.signature]), spb = this.signatures[this.p.signature];
    this.$('#drumSelection').textContent = notes.length ? `${notes.length} hit${notes.length===1?'':'s'} selected` : `${this.p.events.length} hits · select to edit`;
    this.$('#drumMarker').textContent = `Marker ${Math.floor(this.cursor/spb)+1}:${(this.cursor%spb/4+1).toFixed(2)}`;
    for (const [id,key,scale] of [['drumVelocity','velocity',1],['drumChance','prob',100]]) {
      const input = this.$('#'+id); input.disabled = !notes.length;
      input.value = notes.length && notes.every(n=>(n[key]??1)===(notes[0][key]??1)) ? Math.round((notes[0][key]??1)*scale) : '';
      input.placeholder = notes.length ? 'Mixed' : '—';
    }
    this.$('#drumTime').disabled = !notes.length; this.$('#drumTime').value = notes.length ? +Math.min(...notes.map(hitTime)).toFixed(3) : '';
    this.$('#drumLoop').checked = bounds.enabled;
    this.$('#drumLoopStart').value = Math.floor(bounds.start/spb)+1;
    this.$('#drumLoopEnd').value = Math.ceil(bounds.end/spb);
    this.$('#drumLoopStart').max = this.$('#drumLoopEnd').max = this.p.bars;
    this.$('#drumZoom').value = this.zoom;
  }
  change(fn) {
    this.checkpoint(); fn(); this.p.events = uniqueHits(this.p.events);
    this.selection = new Set([...this.selection].filter(n=>this.p.events.includes(n)));
    this.paint(); this.onChange();
  }
  editSelected(fn) {if (this.selected().length) this.change(()=>this.selected().forEach(fn));}
  action(action) {
    const notes = this.selected(), length = this.length();
    if (action === 'selectAll') {this.selection = new Set(this.p.events); this.paint(); return;}
    if (action === 'copy') {this.clipboard = structuredClone(notes); this.notify(notes.length?`Copied ${notes.length} hits`:'Select hits first'); return;}
    if (action === 'fit') {this.zoom = clamp((this.$('.daw-scroll').clientWidth-LABEL-18)/length,2,80); this.paint(); return;}
    if (action === 'saveGroove') {this.saveGroove(); return;}
    if (action === 'paste' || action === 'duplicate') {
      const source = action==='paste'?this.clipboard:notes;
      if (!source.length) return this.notify(action==='paste'?'Copy some hits first':'Select hits first');
      const max = Math.max(...source.map(hitTime));
      const cursor = action==='paste'?this.cursor:snapTime(max+(this.grid||1),this.grid);
      const pasted = pasteHits(source,cursor,length); if (!pasted.length) return this.notify('No space after these hits. Move the marker earlier to paste.');
      this.change(()=>{this.p.events.push(...pasted);this.selection=new Set(pasted);}); return;
    }
    if (!notes.length) return this.notify('Select hits first');
    if (action==='delete') this.change(()=>{this.p.events=this.p.events.filter(n=>!this.selection.has(n));this.selection.clear();});
    if (action==='ghost') this.editSelected(n=>n.velocity=40);
    if (action==='quantize') {if (!this.grid) return this.notify('Choose a snap grid first'); this.editSelected(n=>setHitTime(n,snapTime(hitTime(n),this.grid),length));}
    if (action==='flam' || action==='roll') {
      const newNotes=[];
      for (const n of notes) {
        if (action==='flam') {
          // 25 ms grace note at session tempo, or after beat zero when no lead-in exists.
          const gap = this.bpm()/60*4*.025, t = hitTime(n)>=gap?hitTime(n)-gap:hitTime(n)+gap;
          if(t<length) newNotes.push(setHitTime({...n,velocity:Math.max(1,Math.round(n.velocity*.55))},t,length));
        } else for(let i=1;i<4;i++) {const t=hitTime(n)+i*(this.grid||1)/4;if(t<length)newNotes.push(setHitTime({...n,velocity:Math.max(1,n.velocity-(i%2?15:5))},t,length));}
      }
      this.change(()=>{this.p.events.push(...newNotes);this.selection=new Set([...notes,...newNotes]);});
    }
    if(action==='loopSelection') {
      const spb=this.signatures[this.p.signature];
      this.change(()=>this.p.loop={enabled:true,start:Math.floor(Math.min(...notes.map(hitTime))/spb)*spb,end:Math.min(length,(Math.floor(Math.max(...notes.map(hitTime))/spb)+1)*spb)});this.onLoopChange();
    }
  }
  updateLoop() {
    const spb = this.signatures[this.p.signature], a = clamp(Math.round(+this.$('#drumLoopStart').value||1),1,this.p.bars), b = clamp(Math.round(+this.$('#drumLoopEnd').value||a),a,this.p.bars);
    this.change(()=>this.p.loop={enabled:this.$('#drumLoop').checked,start:(a-1)*spb,end:b*spb}); this.onLoopChange();
  }
  coords(e, svg) {const r=svg.getBoundingClientRect();return {x:clamp(e.clientX-r.left,0,this.length()*this.zoom-.01),y:e.clientY-r.top};}
  pointerDown(e) {
    if(e.button!==0 || !this.p) return;
    const ruler=e.target.closest('.daw-timebar');
    if(ruler){e.preventDefault();const c=this.coords(e,ruler);this.cursor=clamp(Math.floor(c.x/this.zoom),0,this.length()-1);this.paint();this.onSeek(this.cursor);return;}
    const svg=e.target.closest('.daw-notes,.daw-vel'); if(!svg)return;
    e.preventDefault();this.$('.daw-scroll').focus({preventScroll:true});
    const c=this.coords(e,svg), el=e.target.closest('[data-note]'), note=el?this.p.events[+el.dataset.note]:null;
    if(svg.matches('.daw-vel')) {
      if(!note)return;
      if(!this.selection.has(note)) this.selection=new Set([note]);
      this.checkpoint();this.drag={type:'velocity',pointer:e.pointerId,notes:this.selected()};
      this.setVelocity(e);return;
    }
    if(note){
      this.lane=note.lane;
      if(this.tool==='erase'){this.change(()=>{this.p.events=this.p.events.filter(n=>n!==note);this.selection.delete(note);});return;}
      if(e.shiftKey&&this.selection.has(note)){this.selection.delete(note);this.paint();return;}
      if(e.shiftKey)this.selection.add(note);else if(!this.selection.has(note))this.selection=new Set([note]);
      const notes=this.selected();
      this.drag={type:'move',pointer:e.pointerId,x:c.x,y:c.y,notes,times:notes.map(hitTime),rows:notes.map(n=>this.visible.findIndex(l=>l.id===n.lane)),copy:e.altKey,changed:false};
      this.paint();return;
    }
    if(this.tool==='select' || e.shiftKey) {
      this.drag={type:'box',pointer:e.pointerId,x:c.x,y:c.y,base:e.shiftKey?new Set(this.selection):new Set()};
      if(!e.shiftKey)this.selection.clear();this.paint();return;
    }
    if(this.tool==='draw') {
      const row=clamp(Math.floor(c.y/ROW),0,this.visible.length-1), lane=this.visible[row].id;
      const t=clamp(snapTime(c.x/this.zoom,this.grid),0,this.length()-1/960);
      const n=setHitTime({lane,velocity:this.drawVelocity(),prob:1},t,this.length());
      this.lane=lane;this.cursor=Math.floor(t);this.change(()=>{this.p.events.push(n);this.selection=new Set([n]);});
      this.audition(lane,n.velocity);
    }
  }
  pointerMove(e) {
    const d=this.drag;if(!d||e.pointerId!==d.pointer)return;
    e.preventDefault();
    if(d.type==='velocity'){this.setVelocity(e);return;}
    const c=this.coords(e,this.$('.daw-notes'));
    if(d.type==='box') {
      const left=Math.min(d.x,c.x),right=Math.max(d.x,c.x),top=Math.min(d.y,c.y),bottom=Math.max(d.y,c.y);
      this.selection=new Set(d.base);
      for(const n of this.p.events){const x=hitTime(n)*this.zoom,y=this.visible.findIndex(l=>l.id===n.lane)*ROW+ROW/2;if(x>=left&&x<=right&&y>=top&&y<=bottom)this.selection.add(n);}
      this.paint();this.$('.daw-notes').insertAdjacentHTML('beforeend',`<rect class="daw-marquee" x="${left}" y="${top}" width="${right-left}" height="${bottom-top}"/>`);return;
    }
    if(!d.changed && Math.hypot(c.x-d.x,c.y-d.y)<4)return;
    if(!d.changed){this.checkpoint();if(d.copy){d.notes=d.notes.map(n=>({...n}));this.p.events.push(...d.notes);this.selection=new Set(d.notes);}d.changed=true;}
    const delta=snapTime(d.times[0]+(c.x-d.x)/this.zoom,e.shiftKey?0:this.grid)-d.times[0];
    moveHits(d.notes,d.times,delta,this.length());
    const dr=clamp(Math.round((c.y-d.y)/ROW),-Math.min(...d.rows),this.visible.length-1-Math.max(...d.rows));
    d.notes.forEach((n,i)=>n.lane=this.visible[d.rows[i]+dr].id);
    this.paint();
  }
  setVelocity(e) {
    const c=this.coords(e,this.$('.daw-vel')), value=Math.round(clamp((104-c.y)/94*127,1,127));
    this.drag.notes.forEach(n=>n.velocity=value);this.paint();
  }
  pointerEnd() {
    const d=this.drag;if(!d)return;this.drag=null;
    if(d.changed||d.type==='velocity'){this.p.events=uniqueHits(this.p.events);this.paint();this.onChange();}
    else if(d.type==='move'&&d.notes[0])this.audition(d.notes[0].lane,d.notes[0].velocity);
  }
  keydown(e) {
    if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
    const mod=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();
    if(mod&&['a','c','v','d','x','z','y'].includes(k)) {
      e.preventDefault();e.stopPropagation();
      if(k==='z'){e.shiftKey?this.redo():this.undo();return;}
      if(k==='y'){this.redo();return;}
      if(k==='x'){this.action('copy');this.action('delete');return;}
      this.action({a:'selectAll',c:'copy',v:'paste',d:'duplicate'}[k]);return;
    }
    if(['Delete','Backspace'].includes(e.key)){e.preventDefault();e.stopPropagation();this.action('delete');return;}
    if(['1','2','3'].includes(k)){e.preventDefault();this.tool={1:'draw',2:'select',3:'erase'}[k];this.renderControls();return;}
    if(k==='escape'){this.selection.clear();this.paint();return;}
    if(e.key.startsWith('Arrow')&&this.selected().length){
      e.preventDefault();e.stopPropagation();const notes=this.selected();
      if(['ArrowLeft','ArrowRight'].includes(e.key))this.change(()=>moveHits(notes,notes.map(hitTime),(e.key==='ArrowLeft'?-1:1)*(e.shiftKey?1/24:this.grid||.125),this.length()));
      else {
        const rows=notes.map(n=>this.lanes.findIndex(l=>l.id===n.lane)),delta=e.key==='ArrowUp'?-1:1;
        if(Math.min(...rows)+delta<0||Math.max(...rows)+delta>=this.lanes.length)return;
        this.change(()=>notes.forEach((n,i)=>n.lane=this.lanes[rows[i]+delta].id));
      }
    }
  }
  setPlayhead(time) {
    const line=this.$('.daw-playhead');if(!line)return;
    line.setAttribute('visibility',time==null?'hidden':'visible');
    if(time!=null){line.setAttribute('x1',time*this.zoom);line.setAttribute('x2',time*this.zoom);}
  }
  readGrooves() {try{this.myGrooves=JSON.parse(localStorage.getItem('iron-room-my-grooves')||'[]');if(!Array.isArray(this.myGrooves))this.myGrooves=[];}catch{this.myGrooves=[];}}
  saveGroove() {
    const name=this.$('#myGrooveName').value.trim()||this.p.name;
    const groove={...structuredClone(this.p),id:crypto.randomUUID(),name:name.slice(0,80)};delete groove.libraryId;
    const next=[groove,...this.myGrooves].slice(0,100);
    try{localStorage.setItem('iron-room-my-grooves',JSON.stringify(next));this.myGrooves=next;this.renderMyGrooves();this.notify('Saved to My Grooves in this browser');}catch{this.notify('Browser storage is full. Download your project to keep this groove.');}
  }
  renderMyGrooves() {
    this.$('#myGrooveCount').textContent=`(${this.myGrooves.length})`;
    this.$('#myGrooveList').innerHTML=this.myGrooves.map((p,i)=>`<div><button data-load-my="${i}">${esc(p.name)} <small>${p.bars} bars · ${esc(p.signature)}</small></button><button data-delete-my="${i}" aria-label="Delete saved ${esc(p.name)}">×</button></div>`).join('')||'<p class="muted">Save your edited patterns here to reuse them in another session. Project downloads also preserve all current patterns.</p>';
    this.$('#myGrooveList').onclick=e=>{
      const load=e.target.closest('[data-load-my]'),del=e.target.closest('[data-delete-my]');
      if(load)this.loadGroove(structuredClone(this.myGrooves[+load.dataset.loadMy]));
      if(del){const next=this.myGrooves.filter((_,i)=>i!==+del.dataset.deleteMy);try{localStorage.setItem('iron-room-my-grooves',JSON.stringify(next));this.myGrooves=next;this.renderMyGrooves();}catch{this.notify('Could not update saved grooves');}}
    };
  }
}
