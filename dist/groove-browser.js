export const PAGE_SIZE=40;
export function filterGrooves(catalogue,{query='',kind='All',style='All',meter='All',feel='All',tempo='All',sort='collection',favorites=new Set(),savedOnly=false}={}){
 const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 const list=catalogue.map((p,index)=>({p,index})).filter(({p})=>{
  if(kind!=='All'&&p.kind!==kind)return false;
  if(savedOnly&&!favorites.has(p.id))return false;
  if(style.startsWith('family:')&&p.family!==style.slice(7))return false;
  if(style.startsWith('style:')&&p.style!==style.slice(6))return false;
  if(meter!=='All'&&p.signature!==meter)return false;
  if(feel!=='All'&&p.feel!==feel)return false;
  if(tempo==='slow'&&p.bpm>=90||tempo==='mid'&&(p.bpm<90||p.bpm>130)||tempo==='fast'&&p.bpm<=130)return false;
  const text=[p.name,p.style,p.family,p.kind,p.feel,p.signature,p.section,...(p.tags||[])].join(' ').toLowerCase();
  return terms.every(t=>text.includes(t));
 });
 if(sort==='name')list.sort((a,b)=>a.p.name.localeCompare(b.p.name));
 if(sort==='tempo')list.sort((a,b)=>a.p.bpm-b.p.bpm||a.p.name.localeCompare(b.p.name));
 if(sort==='length')list.sort((a,b)=>a.p.bars-b.p.bars||a.p.name.localeCompare(b.p.name));
 return list;
}
