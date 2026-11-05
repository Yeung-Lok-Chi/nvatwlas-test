(() => {
  function render(){document.querySelectorAll('[data-lang-block]').forEach(x=>x.hidden=x.dataset.langBlock!==(uiLang==='zh'?'zh':'en'));}
  async function init(){
    document.addEventListener('langchange',render); render();
    const box=document.querySelector('[data-audit]');
    if(box){try{const a=await fetch('data/audit.json').then(r=>r.json());box.innerHTML=`<p><strong>${a.records_found} / ${a.records_checked}</strong> IDs found; <strong>${a.exact_pair_matches}</strong> exact pairs and <strong>${a.normalized_pair_matches}</strong> pairs after Unicode/whitespace normalization. The fixed 50-record sample has <strong>${a.audit_sample_normalized_matches}</strong> normalized matches.</p>`;}catch(e){console.error(e);}}
  }
  document.addEventListener('DOMContentLoaded',init);
})();
