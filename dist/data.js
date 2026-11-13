import {createExtensiveGrooves,METERS} from './grooves.js';
const v=(label,groups)=>({label,groups});
const shell=(p)=>[[39,p+'_P'],[79,p+'_F'],[127,p+'_FF']];
const snare=(p)=>[[29,p+'_Ghost'],[64,p+'_MP'],[99,p+'_F'],[127,p+'_FF']];
export const CHANNELS=[
 ['kick','Kick',0,0.88],['snare','Snare',-.08,.8],['hat','Hi-hat',-.4,.58],['tomhi','Rack tom',-.3,.72],['tomlo','Floor tom',.4,.75],['crash1','Crash L',-.65,.6],['crash2','Crash R',.65,.6],['ride','Ride',.45,.65],['china','China',.7,.55],['splash','Splash',-.2,.55],['cowbell','Cowbell',.15,.65]
].map(([id,name,pan,volume])=>({id,name,pan,volume,tune:0,decay:1,low:0,mid:0,high:0,hpf:25,comp:0,room:.12,mute:false,solo:false,polarity:false}));
export const LANES=[
 {id:'kick',name:'Kick',ch:'kick',note:36,key:'b',variants:[v('18″ Birch • resonant',shell('kick_OH')),v('18″ Birch • alternate',shell('kick2_OH'))]},
 {id:'snare',name:'Snare · center',ch:'snare',note:38,key:'f',variants:[v('14 × 5″ Birch / mahogany',snare('snare_OH')),v('14 × 6″ Dry birch',snare('snare2_OH'))]},
 {id:'stick',name:'Snare · cross-stick',ch:'snare',note:37,key:'d',variants:[v('Wood cross-stick',[[127,'snareStick_OH_F']])]},
 {id:'snareoff',name:'Snare · wires off',ch:'snare',note:40,key:'g',variants:[v('Birch • wires off',[[64,'snareOFF_OH_P'],[127,'snareOFF_OH_F']]),v('Dry birch • wires off',[[64,'snare2OFF_OH_P'],[127,'snare2OFF_OH_F']])]},
 {id:'closed',name:'Hi-hat · closed',ch:'hat',note:42,key:'h',variants:[v('Stagg SH 14″ closed',[[63,'hihatClosed_OH_P'],[127,'hihatClosed_OH_F']])]},
 {id:'semi',name:'Hi-hat · half-open',ch:'hat',note:46,key:'j',variants:[1,2,3,4,5,6,7].map(n=>v('Open position '+n,[[63,`hihatSemiOpen${n}_OH_P`],[127,`hihatSemiOpen${n}_OH_F`]]))},
 {id:'open',name:'Hi-hat · open',ch:'hat',note:26,key:'k',variants:[v('Stagg SH 14″ open',[[39,'hihatOpen_OH_P'],[79,'hihatOpen_OH_F'],[127,'hihatOpen_OH_FF']])]},
 {id:'foot',name:'Hi-hat · pedal',ch:'hat',note:44,key:'l',variants:[v('Foot chick',[[127,'hihatFoot_OH_MP']])]},
 {id:'tomhi',name:'Rack tom',ch:'tomhi',note:48,key:'r',variants:[v('12 × 7″ Birch',shell('hiTom_OH'))]},
 {id:'tomlo',name:'Floor tom',ch:'tomlo',note:43,key:'t',variants:[v('14 × 14″ Birch',[[39,'loTom_OH_PP'],[79,'loTom_OH_MP'],[127,'loTom_OH_FF']])]},
 {id:'crash1',name:'Crash · left',ch:'crash1',note:49,key:'q',variants:[v('Paiste Innovations 18″',[[63,'crash1_OH_P'],[127,'crash1_OH_FF']]),v('Stagg SH 16″',[[127,'crash3_OH_FF']])]},
 {id:'crash2',name:'Crash · right',ch:'crash2',note:57,key:'w',variants:[v('Paiste Rude 20″',[[63,'crash2_OH_P'],[127,'crash2_OH_FF']]),v('Stagg SH 16″',[[127,'crash3_OH_FF']])]},
 {id:'ride',name:'Ride · bow',ch:'ride',note:51,key:'e',variants:[v('Stagg SH 20″',[[63,'ride1_OH_MP'],[127,'ride1_OH_FF']]),v('Paiste PST5 20″',[[39,'ride2_OH_PP'],[79,'ride2_OH_MP'],[127,'ride2_OH_FF']])]},
 {id:'bell',name:'Ride · bell',ch:'ride',note:53,key:'y',variants:[v('Stagg bell',[[127,'ride1Bell_OH_F']]),v('Paiste bell',[[127,'ride2Bell_OH_F']])]},
 {id:'china',name:'China',ch:'china',note:52,key:'u',variants:[v('Masterworks Custom 20″',[[127,'china1_OH_FF']]),v('Paiste Innovations 18″',[[127,'china2_OH_FF']])]},
 {id:'splash',name:'Splash',ch:'splash',note:55,key:'i',variants:[v('Paiste PST5 8″',[[63,'splash1_OH_P'],[127,'splash1_OH_F']])]},
 {id:'cowbell',name:'Cowbell',ch:'cowbell',note:56,key:'o',variants:[v('Studio cowbell',[[39,'cowbell_P'],[79,'cowbell_MP'],[127,'cowbell_FF']])]}
];
export const SIGNATURES=Object.fromEntries(Object.entries(METERS).map(([name,m])=>[name,m.steps]));
export function blankPattern(name='Untitled',bars=2,signature='4/4'){return {id:crypto.randomUUID(),name,bars,signature,events:[]};}
function createLegacyGrooves(){let list=[];
 const styles=['Rock','Metal','Funk','Blues','Pop','Progressive'];
 for(const style of styles)for(let n=0;n<6;n++){
  let p=blankPattern(`${style} ${['Pocket','Drive','Half-time','Ghosts','Lift','Fill'][n]}`,2,style==='Progressive'&&n===4?'7/8':'4/4');
  p.id=`legacy-${style.toLowerCase()}-${n}`;p.family=style==='Progressive'?'Odd meter':style;p.feel='Straight';p.tags=[style,'classic'];p.style=style;p.kind=n===5?'Fill':'Groove';p.bpm={Rock:112,Metal:150,Funk:98,Blues:88,Pop:118,Progressive:130}[style];
  const s=SIGNATURES[p.signature];const put=(lane,step,velocity=100)=>p.events.push({lane,step,velocity,prob:1,offset:0});
  for(let bar=0;bar<2;bar++){
   const o=bar*s, half=n===2;
   for(let t=0;t<s;t+=style==='Metal'&&n===1?1:2)put(style==='Blues'?'ride':n===4?'open':'closed',o+t,t%4===0?92:65);
   for(let t=0;t<s;t++){if((half?t===8:t===4||t===12))put('snare',o+t,112);}
   let kicks=style==='Metal'?[0,2,6,8,10,14]:style==='Funk'?[0,3,7,8,11]:[0,8,10];
   if(n===1)kicks=[0,3,6,8,10,14];if(half)kicks=[0,3,10];
   kicks.filter(t=>t<s).forEach(t=>put('kick',o+t,108));
   if(n===3||style==='Funk') [3,7,11,15].filter(t=>t<s).forEach(t=>put('snare',o+t,34+(t%3)*7));
   if(n===4&&bar===0)put('crash1',o,112);
   if(n===5&&bar===1){p.events=p.events.filter(e=>e.step<o+8);for(let t=8;t<s;t++)put(t<10?'snare':t<12?'tomhi':'tomlo',o+t,80+(t%4)*10);}
  }list.push(p);
 }return list;
}
export function createGrooves(){const legacy=createLegacyGrooves();return [...legacy,...createExtensiveGrooves(legacy)];}
export const GROOVES=createGrooves();
export const DEFAULT_MASTER={volume:.78,low:0,high:0,glue:35,parallel:.16,room:.28};
export function defaultState(){return {version:1,title:'Untitled session',bpm:112,swing:0,humanize:8,velocityHumanize:5,signature:'4/4',mode:'pattern',channels:structuredClone(CHANNELS),master:{...DEFAULT_MASTER},variants:{},patterns:[structuredClone(GROOVES[0]),structuredClone(GROOVES[4]),structuredClone(GROOVES[5])],active:0,song:[{pattern:0,repeats:2},{pattern:1,repeats:1},{pattern:2,repeats:1}],midiMap:Object.fromEntries(LANES.map(l=>[l.note,l.id]))};}
export const MIX_PRESETS={
 'Studio natural':{room:.28,parallel:.16,glue:35,low:0,high:0},
 'Modern punch':{room:.2,parallel:.48,glue:62,low:2,high:2},
 'Big room':{room:.72,parallel:.38,glue:55,low:1,high:1},
 'Dry & intimate':{room:.04,parallel:.06,glue:15,low:0,high:-1},
 'Vintage warmth':{room:.38,parallel:.22,glue:42,low:1.5,high:-4},
 'Crisp funk':{room:.12,parallel:.28,glue:40,low:-1,high:3}
};
