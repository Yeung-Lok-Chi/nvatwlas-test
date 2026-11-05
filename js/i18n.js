// Interface translations. Corpus text remains in its original languages.
const I18N = {
  en: {
    brand_sub: 'English nouns into Chinese verbs',
    nav_explore: 'Explore', nav_report: 'Report', nav_codebook: 'Codebook', nav_method: 'Method & AI',
    eyebrow: 'A 500-pair subtitle corpus', hero_title_1: 'Where English nouns', hero_title_2: 'turn into Chinese verbs.',
    hero_intro: 'Search a traceable sample from NV Atlas, compare nominal renderings, and see how one noun can open several verbal paths.',
    cta_explore: 'Open the explorer', cta_report: 'Read the learning report',
    stat_records: 'sentence pairs', stat_terms: 'English nominal types', stat_verbs: 'Chinese renderings', stat_checked: 'programmatic audit sample',
    explore_eyebrow: 'Corpus explorer', explore_title: 'Build a view, then share the URL.', reset: 'Reset view',
    search_label: 'Search text, term, or verb', category_filter: 'Category', checked_filter: 'Human check', term_filter: 'Key term', sort_filter: 'Sort table',
    all_categories: 'All categories', all_records: 'All records', checked_only: 'Human checked', unchecked_only: 'Not yet human checked', audit_filter: 'Audit sample', audit_only: '50-row audit sample', audit_sample_tag: 'audit sample', all_terms: 'All terms',
    sort_id: 'Sentence ID', sort_term: 'Key term A-Z', sort_category: 'Category',
    clear_selection: 'Clear selected term', clear_term: 'Clear term:', clear_verb: 'Clear verb:', records_word: 'records', terms_word: 'terms',
    viz_network_kicker: '01 · Relational', viz_network_title: 'Nominal–verbal paths', top_terms: 'Top terms', min_link: 'Minimum link weight',
    viz_network_caption: 'Which English nominal types are rendered through more than one Chinese verb?',
    network_help: 'Click a node to search it. Drag nodes to pin them. Scroll to zoom.', no_results: 'No records match this view.',
    viz_tree_kicker: '02 · Hierarchical', viz_tree_title: 'Category composition', unique_only: 'Distinct terms only',
    viz_tree_caption: 'Which nominal functions dominate the filtered view, and which verbs make up each block?',
    viz_kwic_kicker: '03 · Lexical', viz_kwic_title: 'Bilingual KWIC', previous: 'Previous', next: 'Next',
    viz_kwic_caption: 'How does the nominated English noun sit in context, and where does its Chinese verbal rendering appear?',
    viz_table_kicker: '04 · Tabular', viz_table_title: 'Evidence table', export: 'Export filtered CSV',
    viz_table_caption: 'Which sentence pairs support the current search and filters?',
    th_id: 'ID', th_term: 'English nominal', th_verb: 'Chinese rendering', th_category: 'Category', th_source: 'Source text', th_target: 'Target text', th_checked: 'Checked',
    checked: 'Checked', not_checked: 'Not checked', rows_word: 'rows', network_nom: 'English nominal', network_verb: 'Chinese rendering', noun_word: 'noun', verb_word: 'verb',
    limits_eyebrow: 'Read alongside the data', limits_title: 'What this sample can—and cannot—show.',
    limit_one_title: 'A curated, not random, view.', limit_one_text: 'The 500 supplied IDs are not reproducible from a stated NV Atlas random seed. Treat this as a frozen analytical sample, not a prevalence estimate for the whole corpus.',
    limit_two_title: 'A checking queue is not a human check.', limit_two_text: 'The fixed 50-row sample has been reconciled against the public record set programmatically. A person should still read and approve it before marking it human_checked.',
    limit_three_title: 'Category judgments are interpretive.', limit_three_text: 'The five categories summarize the noun’s function in context. Boundary cases are documented openly in the codebook.',
    footer_left: 'Built for 2026R1 Translation Technology in the Age of AI · CUHK',
    audit_found: 'IDs found', audit_exact: 'Exact pair matches', audit_norm: 'Normalized matches', audit_sample: 'Verification sample matches', audit_missing: 'Missing IDs',
    report_kicker: 'Learning report', report_title: 'The noun is a decision point.',
    report_intro: 'A small corpus study of how English nominalizations become Chinese verbal actions in film subtitles.',
    codebook_kicker: 'Classification manual', codebook_title: 'Five ways to read a nominal.',
    codebook_intro: 'The taxonomy describes how the English noun functions in the sentence pair, not whether the word is grammatically a noun in isolation.',
    about_kicker: 'Method & AI declaration', about_title: 'How the atlas was made.',
    about_intro: 'A transparent account of the data, the checking status, and the division of work between the student and the AI agent.',
    toc: 'On this page'
  },
  zh: {
    brand_sub: '由英文名詞到中文動詞', nav_explore: '探索', nav_report: '學習報告', nav_codebook: '分類手冊', nav_method: '方法與 AI',
    eyebrow: '500 對字幕語料', hero_title_1: '當英文名詞', hero_title_2: '化作中文動詞。',
    hero_intro: '搜尋 NV Atlas 的可追溯樣本，比較名詞的多種譯法，觀察一個名詞如何展開多條動詞路徑。',
    cta_explore: '開啟語料探索器', cta_report: '閱讀學習報告', stat_records: '句對', stat_terms: '英文名詞類型', stat_verbs: '中文譯法', stat_checked: '程式核對樣本',
    explore_eyebrow: '語料探索器', explore_title: '建立視圖，並分享網址。', reset: '重設視圖',
    search_label: '搜尋文本、名詞或動詞', category_filter: '類別', checked_filter: '核對狀態', term_filter: '關鍵名詞', sort_filter: '表格排序',
    all_categories: '所有類別', all_records: '所有記錄', checked_only: '已人工核對', unchecked_only: '尚未人工核對', audit_filter: '核對樣本', audit_only: '50 筆核對樣本', audit_sample_tag: '核對樣本', all_terms: '所有名詞', sort_id: '句子編號', sort_term: '名詞 A-Z', sort_category: '類別',
    clear_selection: '清除已選名詞', clear_term: '清除名詞：', clear_verb: '清除動詞：', records_word: '筆記錄', terms_word: '個名詞',
    viz_network_kicker: '01 · 關係', viz_network_title: '名詞與動詞路徑', top_terms: '顯示名詞', min_link: '最低連結次數',
    viz_network_caption: '哪些英文名詞類型具有超過一種中文動詞譯法？', network_help: '點擊節點搜尋；拖曳可固定節點；滾輪可縮放。', no_results: '目前視圖沒有符合的記錄。',
    viz_tree_kicker: '02 · 層級', viz_tree_title: '類別組成', unique_only: '只計不同詞對', viz_tree_caption: '在目前篩選下，哪些名詞功能最常見？每個區塊由哪些動詞組成？',
    viz_kwic_kicker: '03 · 詞彙', viz_kwic_title: '雙語關鍵詞語境', previous: '上一項', next: '下一項',
    viz_kwic_caption: '英文名詞在語境中如何出現？它的中文動詞譯法落在哪裏？', viz_table_kicker: '04 · 表格', viz_table_title: '證據表', export: '匯出篩選後的 CSV', viz_table_caption: '哪些句對支持目前的搜尋與篩選？',
    th_id: '編號', th_term: '英文名詞', th_verb: '中文譯法', th_category: '類別', th_source: '原文', th_target: '譯文', th_checked: '已核對',
    checked: '已核對', not_checked: '未核對', rows_word: '行', network_nom: '英文名詞', network_verb: '中文譯法', noun_word: '名詞', verb_word: '動詞',
    limits_eyebrow: '閱讀數據時請注意', limits_title: '這個樣本可以說明甚麼，不能說明甚麼。', limit_one_title: '這是精選樣本，不是隨機樣本。', limit_one_text: '現有的 500 個編號無法用已記錄的 NV Atlas 隨機種子重現。因此應把它視為固定的分析樣本，而不是整個語料庫的頻率估計。',
    limit_two_title: '核對清單不等於人工核對。', limit_two_text: '固定的 50 行樣本已透過程式與公開記錄對照。仍應由人手閱讀及確認，才可標記為 human_checked。', limit_three_title: '類別判斷涉及詮釋。', limit_three_text: '五個類別概括名詞在上下文中的功能。邊界個案已在分類手冊公開說明。',
    footer_left: '2026R1 人工智能時代的翻譯科技 · 香港中文大學', audit_found: '找到的編號', audit_exact: '完全相符句對', audit_norm: '正規化後相符', audit_sample: '核對樣本相符數', audit_missing: '缺少編號',
    report_kicker: '學習報告', report_title: '名詞是一個選擇點。', report_intro: '以小型語料研究電影字幕中英文名詞化如何轉化為中文動作。',
    codebook_kicker: '分類手冊', codebook_title: '閱讀名詞的五種方式。', codebook_intro: '這套分類描述英文名詞在句對中的功能，而不是孤立詞語在語法上是否名詞。',
    about_kicker: '方法與 AI 聲明', about_title: 'Atlas 是怎樣製成的。', about_intro: '公開說明資料來源、核對狀態，以及學生與 AI 代理之間的工作分工。',
    toc: '本頁內容'
  }
};
let uiLang = localStorage.getItem('nominal-shift-lang') || 'en';
function t(key) { return (I18N[uiLang] && I18N[uiLang][key]) || I18N.en[key] || key; }
function applyI18n() {
  document.documentElement.lang = uiLang === 'zh' ? 'zh-Hant' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => { const key = el.dataset.i18n; el.textContent = t(key); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll('[data-lang]').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === uiLang));
  window.dispatchEvent(new Event('langchange'));
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-lang]').forEach(btn => btn.addEventListener('click', () => {
    uiLang = btn.dataset.lang; localStorage.setItem('nominal-shift-lang', uiLang); applyI18n();
  }));
  applyI18n();
});
