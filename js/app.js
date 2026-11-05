(() => {
  'use strict';

  const state = {
    data: null,
    audit: null,
    search: '',
    category: 'all',
    checked: 'all',
    audit: 'all',
    term: 'all',
    sort: 'id',
    selectedTerm: null,
    selectedVerb: null,
    networkTop: 14,
    networkMin: 1,
    uniqueOnly: false,
    page: 1,
    pageSize: 20,
    kwicIndex: 0,
  };

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = new Intl.NumberFormat();
  const catColor = {
    'direct-verbalization': '#315d4d',
    'event-process': '#637c6b',
    'speech-communication': '#b56d47',
    'mental-emotional': '#8b754a',
    'relational-state': '#52616b',
  };

  function readUrl() {
    const p = new URLSearchParams(location.search);
    state.search = p.get('q') || '';
    state.category = p.get('category') || 'all';
    state.checked = p.get('checked') || 'all';
    state.audit = p.get('audit') || 'all';
    state.term = p.get('term') || 'all';
    state.sort = p.get('sort') || 'id';
    state.selectedTerm = p.get('focus') || null;
    state.selectedVerb = p.get('verb') || null;
    state.networkTop = Number(p.get('top') || 14);
    state.networkMin = Number(p.get('minlink') || 1);
    state.uniqueOnly = p.get('unique') === '1';
  }

  function writeUrl() {
    const p = new URLSearchParams();
    if (state.search) p.set('q', state.search);
    if (state.category !== 'all') p.set('category', state.category);
    if (state.checked !== 'all') p.set('checked', state.checked);
    if (state.audit !== 'all') p.set('audit', state.audit);
    if (state.term !== 'all') p.set('term', state.term);
    if (state.sort !== 'id') p.set('sort', state.sort);
    if (state.selectedTerm) p.set('focus', state.selectedTerm);
    if (state.selectedVerb) p.set('verb', state.selectedVerb);
    if (state.networkTop !== 14) p.set('top', state.networkTop);
    if (state.networkMin !== 1) p.set('minlink', state.networkMin);
    if (state.uniqueOnly) p.set('unique', '1');
    history.replaceState(null, '', `${location.pathname}${p.toString() ? '?' + p : ''}${location.hash}`);
  }

  function setSelects() {
    const cat = $('#category-filter');
    state.data.categories.forEach(c => {
      const option = document.createElement('option');
      option.value = c.id;
      option.textContent = uiLang === 'zh' ? c.label_zh : c.label_en;
      cat.append(option);
    });
    const terms = [...new Set(state.data.records.map(r => r.key_term))].sort();
    terms.forEach(t => {
      const option = document.createElement('option');
      option.value = t;
      option.textContent = t;
      $('#term-filter').append(option);
    });
    $('#search').value = state.search;
    cat.value = state.category;
    $('#checked-filter').value = state.checked;
    $('#audit-filter').value = state.audit;
    $('#term-filter').value = state.term;
    $('#sort-filter').value = state.sort;
    $('#network-top').value = state.networkTop;
    $('#network-top-value').value = state.networkTop;
    $('#network-min').value = state.networkMin;
    $('#network-min-value').value = state.networkMin;
    $('#tree-highlight').checked = state.uniqueOnly;
  }

  function filtered() {
    const q = state.search.trim().toLowerCase();
    let rows = state.data.records.filter(r => {
      if (state.category !== 'all' && r.category !== state.category) return false;
      if (state.checked === 'yes' && !r.human_checked) return false;
      if (state.checked === 'no' && r.human_checked) return false;
      if (state.audit === 'yes' && !r.audit_sample) return false;
      if (state.term !== 'all' && r.key_term !== state.term) return false;
      if (state.selectedTerm && r.key_term !== state.selectedTerm) return false;
      if (state.selectedVerb && r.target_verb !== state.selectedVerb) return false;
      if (q) {
        const hay = `${r.id} ${r.key_term} ${r.target_verb} ${r.source_text} ${r.target_text}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (state.sort === 'term') rows.sort((a, b) => a.key_term.localeCompare(b.key_term) || Number(a.id) - Number(b.id));
    else if (state.sort === 'category') rows.sort((a, b) => a.category_label_en.localeCompare(b.category_label_en) || Number(a.id) - Number(b.id));
    else rows.sort((a, b) => Number(a.id) - Number(b.id));
    return rows;
  }

  function displayCategories() {
    const lang = uiLang;
    return state.data.categories.map(c => ({...c, label: lang === 'zh' ? c.label_zh : c.label_en}));
  }

  function renderSummary(rows) {
    const total = state.data.meta.records;
    const terms = new Set(rows.map(r => r.key_term)).size;
    $('#result-summary').innerHTML = `${fmt.format(rows.length)} / ${fmt.format(total)} ${t('records_word')} · ${fmt.format(terms)} ${t('terms_word')}`;
    $('#clear-selection').hidden = !state.selectedTerm && !state.selectedVerb;
    if (state.selectedTerm) $('#clear-selection').textContent = `${t('clear_term')} ${state.selectedTerm}`;
    else if (state.selectedVerb) $('#clear-selection').textContent = `${t('clear_verb')} ${state.selectedVerb}`;
    else $('#clear-selection').textContent = t('clear_selection');
  }

  function renderTable(rows) {
    const maxPage = Math.max(1, Math.ceil(rows.length / state.pageSize));
    state.page = Math.min(state.page, maxPage);
    const start = (state.page - 1) * state.pageSize;
    const pageRows = rows.slice(start, start + state.pageSize);
    const body = $('#table-body');
    body.innerHTML = pageRows.length ? pageRows.map(r => `<tr data-id="${r.id}" data-term="${esc(r.key_term)}" data-verb="${esc(r.target_verb)}" class="${state.selectedTerm === r.key_term && state.selectedVerb === r.target_verb ? 'selected' : ''}">
      <td>${esc(r.id)}</td><td>${esc(r.key_term)}</td><td>${esc(r.target_verb)}</td><td>${esc(uiLang === 'zh' ? r.category_label_zh : r.category_label_en)}</td>
      <td>${esc(r.source_text)}</td><td>${esc(r.target_text)}</td><td><span class="${r.human_checked ? 'checked' : 'unchecked'}">${r.human_checked ? t('checked') : t('not_checked')}</span>${r.audit_sample ? `<br><span class="audit-sample">${t('audit_sample_tag')}</span>` : ''}</td>
    </tr>`).join('') : `<tr><td colspan="7" class="kwic-empty">${t('no_results')}</td></tr>`;
    body.querySelectorAll('tr[data-id]').forEach(tr => tr.addEventListener('click', () => {
      state.selectedTerm = tr.dataset.term;
      state.selectedVerb = tr.dataset.verb;
      state.search = tr.dataset.term;
      state.page = 1;
      state.kwicIndex = 0;
      $('#search').value = state.search;
      writeUrl();
      render();
    }));
    $('#table-count').textContent = `${fmt.format(rows.length)} ${t('rows_word')}`;
    $('#page-position').textContent = `${state.page} / ${maxPage}`;
    $('#page-prev').disabled = state.page <= 1;
    $('#page-next').disabled = state.page >= maxPage;
  }

  function renderNetwork(rows) {
    const svg = $('#network-chart');
    const empty = $('#network-empty');
    empty.hidden = rows.length > 0;
    svg.innerHTML = '';
    if (!rows.length) return;
    const termCount = new Map();
    rows.forEach(r => termCount.set(r.key_term, (termCount.get(r.key_term) || 0) + 1));
    const topTerms = [...termCount.entries()].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0])).slice(0, state.networkTop).map(([term]) => term);
    const termSet = new Set(topTerms);
    const linksMap = new Map();
    rows.forEach(r => {
      if (!termSet.has(r.key_term)) return;
      const key = `${r.key_term}\u0000${r.target_verb}`;
      linksMap.set(key, (linksMap.get(key) || 0) + 1);
    });
    const links = [...linksMap.entries()].map(([key, weight]) => {
      const [source, target] = key.split('\u0000');
      return {source, target, weight};
    }).filter(d => d.weight >= state.networkMin);
    if (!links.length) { empty.hidden = false; return; }
    const linkedTerms = new Set(links.flatMap(d => [d.source, d.target]));
    const width = svg.clientWidth || 700, height = svg.clientHeight || 470;
    const left = [...termSet].filter(t => linkedTerms.has(t)).sort((a,b) => termCount.get(b)-termCount.get(a)).map(t => ({id:t, kind:'term', count:termCount.get(t)}));
    const verbCount = new Map();
    links.forEach(d => verbCount.set(d.target, (verbCount.get(d.target)||0) + d.weight));
    const right = [...verbCount.entries()].sort((a,b) => b[1]-a[1]).map(([id,count]) => ({id, kind:'verb', count}));
    const x1 = Math.max(108, width * .2), x2 = Math.min(width - 100, width * .8);
    const maxSide = Math.max(left.length, right.length);
    const gap = Math.max(8, Math.min(30, (height - 70) / Math.max(1, maxSide - 1)));
    const y = (i, n) => height / 2 + (i - (n-1)/2) * gap;
    left.forEach((n,i) => Object.assign(n,{x:x1,y:y(i,left.length)}));
    right.forEach((n,i) => Object.assign(n,{x:x2,y:y(i,right.length)}));
    const termNodes = new Map(left.map(n => [n.id,n])), verbNodes = new Map(right.map(n => [n.id,n]));
    const maxWeight = Math.max(...links.map(d => d.weight));
    const NS = 'http://www.w3.org/2000/svg';
    const add = (tag, attrs, parent=svg) => { const e=document.createElementNS(NS,tag); Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v)); parent.append(e); return e; };
    add('text',{x:18,y:18,class:'network-axis-label'}).textContent = t('network_nom');
    const axis2=add('text',{x:width-18,y:18,'text-anchor':'end',class:'network-axis-label'}); axis2.textContent = t('network_verb');
    links.forEach(d => {
      const a=termNodes.get(d.source), b=verbNodes.get(d.target);
      if(!a||!b) return;
      const path=add('path',{d:`M${a.x},${a.y} C${(a.x+b.x)/2},${a.y} ${(a.x+b.x)/2},${b.y} ${b.x},${b.y}`,class:'network-link','data-term':d.source,'data-verb':d.target,'stroke-width':Math.max(1, Math.min(8, d.weight / maxWeight * 7)),'data-weight':d.weight});
      path.style.stroke = d.source === state.selectedTerm || d.target === state.selectedVerb ? 'rgba(199,91,53,.9)' : 'rgba(49,93,77,.16)';
      path.addEventListener('click', () => selectPair(d.source, d.target));
    });
    [...left, ...right].forEach(n => {
      const g = add('g',{class:`network-node ${n.kind}`,'transform':`translate(${n.x},${n.y})`,'data-term':n.id,'data-verb':n.kind==='verb'?n.id:''});
      add('circle',{r:Math.max(4, Math.min(11, 4 + Math.sqrt(n.count)*1.3)), class:'node-dot'},g);
      const label=add('text',{x:n.kind==='term'?14:-14,y:4,'text-anchor':n.kind==='term'?'start':'end',class:'node-label'},g); label.textContent=n.id;
      g.addEventListener('click', e => { e.stopPropagation(); if(n.kind==='term') selectPair(n.id,null); else selectPair(null,n.id); });
      g.addEventListener('pointerdown', e => startDrag(e,g,n));
    });
    svg._network = {nodes:[...left,...right], width, height};
  }

  let drag = null;
  function startDrag(e, g, n) {
    if (e.button !== 0) return;
    const svg = $('#network-chart'); const rect = svg.getBoundingClientRect();
    drag = {g, n, rect, moved:false};
    g.setPointerCapture(e.pointerId);
    e.preventDefault();
    g.addEventListener('pointermove', onDrag);
    g.addEventListener('pointerup', endDrag, {once:true});
  }
  function onDrag(e) {
    if (!drag) return;
    drag.moved = true;
    const {rect} = drag;
    const x = Math.max(20, Math.min(rect.width-20, e.clientX-rect.left));
    const y = Math.max(30, Math.min(rect.height-20, e.clientY-rect.top));
    drag.g.setAttribute('transform', `translate(${x},${y})`);
  }
  function endDrag() {
    if (drag) { drag.g.removeEventListener('pointermove', onDrag); drag = null; }
  }

  function selectPair(term, verb) {
    if (term) { state.selectedTerm = state.selectedTerm === term && !verb ? null : term; state.search = state.selectedTerm || ''; }
    if (verb) { state.selectedVerb = state.selectedVerb === verb ? null : verb; state.search = state.selectedVerb || state.search; }
    if (!term && !verb) { state.selectedTerm=null; state.selectedVerb=null; }
    $('#search').value = state.search;
    state.page = 1; state.kwicIndex = 0;
    writeUrl(); render();
  }

  function renderTreemap(rows) {
    const box = $('#treemap-chart');
    box.innerHTML = '';
    let dataRows = rows;
    if (state.uniqueOnly) {
      const seen = new Set();
      dataRows = rows.filter(r => { const k=`${r.key_term}\u0000${r.target_verb}`; if(seen.has(k)) return false; seen.add(k); return true; });
    }
    const groups = displayCategories().map(c => {
      const groupRows = dataRows.filter(r => r.category === c.id);
      const verbs = new Map();
      groupRows.forEach(r => verbs.set(r.target_verb, (verbs.get(r.target_verb)||0)+1));
      return {...c, rows:groupRows, verbs:[...verbs.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4), total:groupRows.length};
    }).filter(g => g.total);
    const total = groups.reduce((s,g)=>s+g.total,0);
    if (!total) { box.innerHTML = `<div class="empty-state">${t('no_results')}</div>`; return; }
    groups.sort((a,b)=>b.total-a.total).forEach((g,i) => {
      const div=document.createElement('div');
      div.className='tree-group'; div.style.flex = `${Math.max(g.total,.5)} 1 130px`; div.style.minWidth = `${Math.max(118, Math.min(260, g.total/total*100*4.2))}px`;
      div.dataset.category=g.id;
      div.innerHTML=`<div class="tree-label">${esc(g.label)}</div><span class="tree-count">${g.total}</span>${g.verbs.map(([v,n])=>`<span class="tree-child" data-verb="${esc(v)}">${esc(v)} ${n}</span>`).join('')}`;
      div.addEventListener('click', e => {
        const child = e.target.closest('[data-verb]');
        if (child) { e.stopPropagation(); selectPair(null, child.dataset.verb); }
        else { state.category = state.category === g.id ? 'all' : g.id; $('#category-filter').value = state.category; state.page=1; writeUrl(); render(); }
      });
      box.append(div);
    });
  }

  function highlight(text, needle) {
    if (!needle) return esc(text);
    const safe = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return esc(text).replace(new RegExp(`(${safe})`, 'ig'), '<mark>$1</mark>');
  }

  function renderKwic(rows) {
    const box=$('#kwic-content');
    if (!rows.length) { box.innerHTML=`<div class="kwic-empty">${t('no_results')}</div>`; $('#kwic-position').textContent='0 / 0'; return; }
    state.kwicIndex = ((state.kwicIndex % rows.length)+rows.length)%rows.length;
    const r=rows[state.kwicIndex];
    box.innerHTML=`<div class="kwic-meta"><span>ID ${esc(r.id)}</span><span class="kwic-chip">${esc(uiLang==='zh'?r.category_label_zh:r.category_label_en)}</span></div>
      <p class="kwic-line">${highlight(r.source_text,r.key_term)}</p><div class="kwic-arrow">↓</div><p class="kwic-line kwic-zh">${highlight(r.target_text,r.target_verb)}</p>
      <div class="kwic-meta"><span>${t('noun_word')}: <strong>${esc(r.key_term)}</strong></span><span>→</span><span>${t('verb_word')}: <strong>${esc(r.target_verb)}</strong></span></div>`;
    $('#kwic-position').textContent=`${state.kwicIndex+1} / ${rows.length}`;
  }

  function renderReportChart() {
    const chart = document.querySelector('[data-report-chart]');
    if (!chart || !state.data) return;
    const counts = state.data.categories;
    const total = counts.reduce((s,c)=>s+c.count,0);
    let x=0;
    chart.innerHTML = '';
    const NS='http://www.w3.org/2000/svg';
    counts.forEach(c => {
      const w=c.count/total*100;
      const rect=document.createElementNS(NS,'rect');
      rect.setAttribute('x',`${x}%`); rect.setAttribute('y','22'); rect.setAttribute('width',`${Math.max(0,w-.15)}%`); rect.setAttribute('height','112'); rect.setAttribute('fill',catColor[c.id]);
      chart.append(rect);
      const label=document.createElementNS(NS,'text');
      label.setAttribute('x',`${x}%`); label.setAttribute('y','16'); label.setAttribute('fill','#43534a'); label.setAttribute('font-size','11');
      label.textContent=`${uiLang==='zh'?c.label_zh:c.label_en} ${c.count}`;
      chart.append(label);
      x+=w;
    });
  }

  function exportCsv() {
    const rows=filtered();
    const head=['id','source_text','target_text','source','category','human_checked','audit_sample','unit','key_term','target_verb','retrieved','upstream_corpus'];
    const csv=[head.join(','),...rows.map(r=>head.map(k=>`"${String(r[k]??'').replace(/"/g,'""')}"`).join(','))].join('\r\n');
    const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='nominal-shift-filtered.csv'; a.click(); URL.revokeObjectURL(a.href);
  }

  function render() {
    if (!state.data) return;
    const rows=filtered();
    renderSummary(rows);
    renderNetwork(rows);
    renderTreemap(rows);
    renderKwic(rows);
    renderTable(rows);
    renderReportChart();
  }

  function bind() {
    $('#search').addEventListener('input', e => { state.search=e.target.value; state.selectedTerm=null; state.selectedVerb=null; state.page=1; writeUrl(); render(); });
    $('#category-filter').addEventListener('change', e => { state.category=e.target.value; state.page=1; writeUrl(); render(); });
    $('#checked-filter').addEventListener('change', e => { state.checked=e.target.value; state.page=1; writeUrl(); render(); });
    $('#audit-filter').addEventListener('change', e => { state.audit=e.target.value; state.page=1; writeUrl(); render(); });
    $('#term-filter').addEventListener('change', e => { state.term=e.target.value; state.page=1; writeUrl(); render(); });
    $('#sort-filter').addEventListener('change', e => { state.sort=e.target.value; state.page=1; writeUrl(); render(); });
    $('#network-top').addEventListener('input', e => { state.networkTop=Number(e.target.value); $('#network-top-value').value=e.target.value; writeUrl(); renderNetwork(filtered()); });
    $('#network-min').addEventListener('input', e => { state.networkMin=Number(e.target.value); $('#network-min-value').value=e.target.value; writeUrl(); renderNetwork(filtered()); });
    $('#tree-highlight').addEventListener('change', e => { state.uniqueOnly=e.target.checked; writeUrl(); renderTreemap(filtered()); });
    $('#kwic-prev').addEventListener('click', () => { state.kwicIndex--; renderKwic(filtered()); });
    $('#kwic-next').addEventListener('click', () => { state.kwicIndex++; renderKwic(filtered()); });
    $('#page-prev').addEventListener('click', () => { state.page=Math.max(1,state.page-1); renderTable(filtered()); });
    $('#page-next').addEventListener('click', () => { state.page++; renderTable(filtered()); });
    $('#export-csv').addEventListener('click', exportCsv);
    $('#clear-selection').addEventListener('click', () => { state.selectedTerm=null; state.selectedVerb=null; state.search=''; $('#search').value=''; state.page=1; writeUrl(); render(); });
    $('#reset-view').addEventListener('click', () => { const keep=uiLang; state.search='';state.category='all';state.checked='all';state.audit='all';state.term='all';state.sort='id';state.selectedTerm=null;state.selectedVerb=null;state.networkTop=14;state.networkMin=1;state.uniqueOnly=false;state.page=1;state.kwicIndex=0; writeUrl(); setSelects(); render(); });
    window.addEventListener('resize', () => { if (state.data) renderNetwork(filtered()); });
    window.addEventListener('langchange', () => { if (state.data) { setCategoryOptionsText(); render(); } });
  }

  function setCategoryOptionsText() {
    [...$('#category-filter').options].forEach(opt => {
      if (opt.value==='all') opt.textContent=t('all_categories');
      else { const c=state.data.categories.find(x=>x.id===opt.value); if(c) opt.textContent=uiLang==='zh'?c.label_zh:c.label_en; }
    });
  }

  async function init() {
    readUrl();
    try {
      const [data, audit] = await Promise.all([
        fetch('data/corpus.json').then(r => { if(!r.ok) throw Error(r.status); return r.json(); }),
        fetch('data/audit.json').then(r => r.ok ? r.json() : null).catch(() => null)
      ]);
      state.data = data; state.audit = audit;
      $('#stat-records').textContent=data.meta.records;
      $('#stat-terms').textContent=data.meta.unique_terms;
      $('#stat-verbs').textContent=data.meta.unique_verbs;
      $('#stat-checked').textContent=data.meta.audit_sample_size;
      setSelects(); bind(); render();
      if (audit) renderAudit(audit);
    } catch (err) {
      console.error(err);
      $('#result-summary').textContent='The corpus data could not be loaded.';
    }
  }

  function renderAudit(audit) {
    const box=document.querySelector('[data-audit]');
    if(!box) return;
    box.innerHTML = `<table class="audit-table"><tbody>
      <tr><th>${t('audit_found')}</th><td>${audit.records_found} / ${audit.records_checked}</td></tr>
      <tr><th>${t('audit_exact')}</th><td>${audit.exact_pair_matches}</td></tr>
      <tr><th>${t('audit_norm')}</th><td>${audit.normalized_pair_matches}</td></tr>
      <tr><th>${t('audit_sample')}</th><td>${audit.verification_sample_normalized_matches} / ${audit.verification_sample_size}</td></tr>
      <tr><th>${t('audit_missing')}</th><td>${audit.missing_ids.length}</td></tr>
    </tbody></table>`;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
