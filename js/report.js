(() => {
  const colors = {'direct-verbalization':'#315d4d','event-process':'#637c6b','speech-communication':'#b56d47','mental-emotional':'#8b754a','relational-state':'#52616b'};
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function svgEl(tag, attrs={}) { const e=document.createElementNS('http://www.w3.org/2000/svg',tag); Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v)); return e; }
  function renderCategory(data) {
    const box=document.querySelector('[data-report-category]'); if(!box) return;
    const total=data.categories.reduce((s,c)=>s+c.count,0);
    const svg=svgEl('svg',{viewBox:'0 0 720 320',role:'img','aria-label':'Category counts'}); box.innerHTML=''; box.append(svg);
    const entries=data.categories.map((c,i)=>({...c,x:28,y:28+i*50,w:520* c.count/total}));
    entries.forEach(c=>{
      const name=uiLang==='zh'?c.label_zh:c.label_en;
      const label=svgEl('text',{x:c.x,y:c.y+13,fill:'#43534a','font-size':12}); label.textContent=name; svg.append(label);
      svg.append(svgEl('rect',{x:210,y:c.y,width:Math.max(2,c.w*0.75),height:16,fill:colors[c.id],rx:3}));
      const n=svgEl('text',{x:218+Math.max(2,c.w*0.75),y:c.y+13,fill:'#43534a','font-size':11}); n.textContent=`${c.count} (${(c.count/total*100).toFixed(1)}%)`; svg.append(n);
    });
  }
  function renderTop(data) {
    const box=document.querySelector('[data-report-top]'); if(!box) return;
    const counts=new Map();
    data.records.forEach(r=>counts.set(r.key_term,(counts.get(r.key_term)||0)+1));
    const top=[...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,10);
    const max=top[0]?.[1]||1;
    const svg=svgEl('svg',{viewBox:'0 0 720 260',role:'img','aria-label':'Top nominal types'}); box.innerHTML=''; box.append(svg);
    top.forEach(([term,count],i)=>{
      const y=18+i*24, w=count/max*540;
      const label=svgEl('text',{x:0,y:y+13,fill:'#43534a','font-size':11}); label.textContent=term; svg.append(label);
      svg.append(svgEl('rect',{x:120,y:y+2,width:w,height:14,rx:3,fill:colors['direct-verbalization'],opacity:.72}));
      const n=svgEl('text',{x:127+w,y:y+13,fill:'#43534a','font-size':10}); n.textContent=count; svg.append(n);
    });
  }
  function renderAudit(audit) {
    const boxes=document.querySelectorAll('[data-audit]'); if(!boxes.length||!audit) return;
    boxes.forEach(box=>{box.innerHTML=`<p><strong>${audit.records_found} / ${audit.records_checked}</strong> IDs found; <strong>${audit.exact_pair_matches}</strong> exact pairs and <strong>${audit.normalized_pair_matches}</strong> pairs after Unicode/whitespace normalization. The fixed 50-record sample has <strong>${audit.audit_sample_normalized_matches}</strong> normalized matches.</p>`;});
  }
  function render() {
    const block=document.querySelector(`[data-lang-block="${uiLang==='zh'?'zh':'en'}"]`);
    document.querySelectorAll('[data-lang-block]').forEach(x=>x.hidden=x!==block);
  }
  async function init(){
    document.addEventListener('langchange',()=>{ if(window.__reportData){render();renderCategory(window.__reportData);renderTop(window.__reportData);} });
    try {
      const [data,audit]=await Promise.all([fetch('data/corpus.json').then(r=>r.json()),fetch('data/audit.json').then(r=>r.json())]);
      window.__reportData=data; render(); renderCategory(data); renderTop(data); renderAudit(audit);
    } catch(e) { console.error(e); }
  }
  document.addEventListener('DOMContentLoaded',init);
})();
