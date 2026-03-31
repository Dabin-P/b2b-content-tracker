/* ── STATE ── */
const state = {
  ideas: JSON.parse(localStorage.getItem('ideas') || '[]'),
  hooksCount: parseInt(localStorage.getItem('hooksCount') || '0'),
  settings: JSON.parse(localStorage.getItem('settings') || '{}'),
  customChannels: JSON.parse(localStorage.getItem('customChannels') || '[]'),
  viralVideos: [],
};
/* ── DEFAULT CHANNELS ── */
const DEFAULT_CHANNELS = [
  { id:'UCWTFGPpNQ0Ms6afXhaWDiRw', name:'HubSpot', av:'av-blue', init:'HS', tier:'enterprise', badge:'hot', type:'Enterprise · YT + LI + IG', subs:'—', freq:'3.2/wk', growth:'+18%', ytUrl:'https://www.youtube.com/@HubSpot', liUrl:'https://www.linkedin.com/company/hubspot/',
    why:'HubSpot consistently shows how to turn complex B2B processes into simple, customer-friendly content. Their educational style builds trust — exactly what B2B ecommerce brands need to convert hesitant buyers.' },
  { id:'UCKcqXmCES-virgTVsvEOfsg', name:'Salesforce', av:'av-teal', init:'SF', tier:'enterprise', badge:'', type:'Enterprise · YT + LI', subs:'—', freq:'2.8/wk', growth:'+11%', ytUrl:'https://www.youtube.com/@salesforce', liUrl:'https://www.linkedin.com/company/salesforce/',
    why:'Salesforce masters the art of making enterprise-level solutions feel accessible. Their customer success stories are a masterclass in B2B storytelling that resonates with decision-makers.' },
  { id:'UCVHyhZhBDyJFpPbDHOmHmCw', name:'Shopify', av:'av-amber', init:'SP', tier:'growing', badge:'rising', type:'Mid-market · LI + YT', subs:'—', freq:'5.1/wk', growth:'+31%', ytUrl:'https://www.youtube.com/@shopify', liUrl:'https://www.linkedin.com/company/shopify/',
    why:'Shopify Plus bridges the gap between ecommerce simplicity and B2B complexity. Their content directly addresses the self-serve buying journey that modern B2B customers demand.' },
  { id:'UCNlBODbbfPKT7PQfkKPTa8A', name:'Klaviyo', av:'av-purple', init:'KV', tier:'growing', badge:'rising', type:'Mid-market · YT + IG', subs:'—', freq:'2.9/wk', growth:'+24%', ytUrl:'https://www.youtube.com/@klaviyo', igUrl:'https://www.instagram.com/klaviyo/',
    why:'Klaviyo proves that data-driven content builds lasting B2B relationships. Their focus on retention and repeat orders aligns perfectly with the B2B ecommerce growth model.' },
  { id:'UCqOKvAOb3RhMp-IUbGkMFUg', name:'Gorgias', av:'av-coral', init:'GG', tier:'growing', badge:'hot', type:'Startup · TT + IG', subs:'—', freq:'7/wk', growth:'+69%', ttUrl:'https://www.tiktok.com/@gorgias', igUrl:'https://www.instagram.com/gorgias.cx/',
    why:'Gorgias shows how automation can feel human. Their content reframes CS automation as a relationship builder — critical for B2B brands where customer trust drives repeat business.' },
  { id:'', name:'Justin Welsh', av:'av-brand', init:'JW', tier:'founders', badge:'hot', type:'Solo founder · LI + YT', subs:'530K followers', freq:'5/wk', growth:'+41%', liUrl:'https://www.linkedin.com/in/justinwelsh/', ytUrl:'https://www.youtube.com/@JustinWelsh',
    why:'Justin Welsh\'s content framework — short, punchy, insight-first — is the gold standard for B2B LinkedIn. His audience-building playbook is directly applicable to B2B ecommerce brand pages.' },
  { id:'', name:'Gary Vaynerchuk', av:'av-green', init:'GV', tier:'founders', badge:'', type:'Founder · All platforms', subs:'11M+ followers', freq:'14/wk', growth:'+8%', ytUrl:'https://www.youtube.com/@garyvee', liUrl:'https://www.linkedin.com/in/garyvaynerchuk/',
    why:'GaryVee pioneered the "document, don\'t create" approach — showing behind-the-scenes of real business operations. B2B brands can adopt this authenticity to humanize their customer relationships.' },
];
const STATIC_VIRAL = [
  { p:'li', title:"Shopify Plus: Why B2B buyers want self-serve — and what to do about it", channel:'Shopify Plus', views:'512K', mult:'4.2x avg', days:'4 days ago', url:'https://www.linkedin.com/company/shopify/' },
  { p:'tt', title:"Gorgias: What happens when you automate B2B customer support", channel:'Gorgias', views:'388K', mult:'6.3x avg', days:'3 days ago', url:'https://www.tiktok.com/@gorgias' },
  { p:'li', title:"Justin Welsh: How I grew a B2B audience to 500K without paid ads", channel:'Justin Welsh', views:'820K', mult:'7.1x avg', days:'6 days ago', url:'https://www.linkedin.com/in/justinwelsh/' },
  { p:'ig', title:"Klaviyo: One email sequence that lifted B2B repeat orders by 41%", channel:'Klaviyo', views:'97K', mult:'3.6x avg', days:'4 days ago', url:'https://www.instagram.com/klaviyo/' },
];
/* ── INIT ── */
document.addEventListener('DOMContentLoaded', async () => {
  setWeekLabel();
  renderIdeas();
  updateMetrics();
  loadSettingsUI();
  updateNotionStatus();
  await loadYouTubeData();
  renderChannels();
});
function setWeekLabel() {
  const now = new Date();
  const week = getWeekNumber(now);
  document.getElementById('week-label').textContent =
    `Weekly report · Week ${week}, ${now.toLocaleString('en',{month:'long',year:'numeric'})}`;
}
function getWeekNumber(d) {
  const start = new Date(d.getFullYear(),0,1);
  return Math.ceil(((d-start)/86400000+start.getDay()+1)/7);
}
function updateMetrics() {
  document.getElementById('m-channels').textContent = DEFAULT_CHANNELS.length + state.customChannels.length;
  document.getElementById('m-ideas').textContent = state.ideas.length;
  document.getElementById('m-hooks').textContent = state.hooksCount;
  document.getElementById('m-viral').textContent = state.viralVideos.length + STATIC_VIRAL.length;
}
/* ── YOUTUBE API (server-side via Vercel function) ── */
async function loadYouTubeData() {
  const allChannels = [...DEFAULT_CHANNELS, ...state.customChannels].filter(c => c.id);
  const videos = [];
  for (const ch of allChannels) {
    try {
      const res = await fetch(`/api/youtube?channelId=${ch.id}`);
      const data = await res.json();
      if (!data.videos?.length) continue;
      for (const v of data.videos) {
        videos.push({
          p: 'yt',
          title: v.title,
          channel: ch.name,
          views: formatViews(v.viewCount),
          rawViews: v.viewCount,
          mult: '',
          days: timeAgo(v.publishedAt),
          url: v.url,
          thumbnail: v.thumbnail,
        });
      }
      if (data.videos[0]) {
        ch.subs = ch.subs !== '—' ? ch.subs : '—';
      }
    } catch(e) { console.warn('YT error:', ch.name, e.message); }
  }
  videos.sort((a,b) => b.rawViews - a.rawViews);
  const avg = videos.reduce((s,v) => s+v.rawViews, 0) / (videos.length||1);
  videos.forEach(v => { v.mult = (v.rawViews/avg).toFixed(1)+'x avg'; });
  state.viralVideos = videos;
  renderViral('all');
  updateMetrics();
}
function formatViews(n) {
  if (n>=1000000) return (n/1000000).toFixed(1)+'M';
  if (n>=1000) return Math.round(n/1000)+'K';
  return n.toString();
}
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now()-new Date(dateStr))/86400000);
  if (diff===0) return 'today';
  if (diff===1) return '1 day ago';
  return `${diff} days ago`;
}
/* ── VIRAL FINDER ── */
function renderViral(filter) {
  const list = document.getElementById('viral-list');
  const combined = [...state.viralVideos, ...STATIC_VIRAL];
  const items = filter==='all' ? combined : combined.filter(v=>v.p===filter);
  if (!items.length) {
    list.innerHTML = `<div style="font-size:13px;color:#aac0d8;padding:1rem 0">No videos found yet. YouTube data loads automatically.</div>`;
    return;
  }
  list.innerHTML = items.map(v=>`
    <div class="viral-item" onclick="window.open('${v.url||'#'}','_blank')">
      <div class="platform-dot dot-${v.p}"></div>
      <div>
        <div class="viral-title">${v.title}</div>
        <div class="viral-meta">${v.channel} · ${platformName(v.p)} · ${v.days}</div>
      </div>
      <div style="text-align:right">
        <div class="viral-views">${v.views}</div>
        <div class="viral-mult">${v.mult}</div>
      </div>
    </div>`).join('');
}
function platformName(p) {
  return {yt:'YouTube',li:'LinkedIn',ig:'Instagram',tt:'TikTok'}[p]||p;
}
function filterPlatform(btn,p) {
  document.querySelectorAll('.pf').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  renderViral(p);
}
function loadMoreViral() { loadYouTubeData(); }
/* ── CHANNEL TRACKER ── */
const BADGE_MAP = {hot:'badge-hot',new:'badge-new',rising:'badge-rising'};
function renderChannels() {
  const all = [...DEFAULT_CHANNELS,...state.customChannels];
  renderChannelGroup('channels-enterprise', all.filter(c=>c.tier==='enterprise'));
  renderChannelGroup('channels-growing', all.filter(c=>c.tier==='growing'), true);
  renderChannelGroup('channels-founders', all.filter(c=>c.tier==='founders'), true);
}
function renderChannelGroup(id, channels, addButton=false) {
  const el = document.getElementById(id);
  if (!el) return;
  let html = channels.map(c => `
    <div class="channel-card">
      <div class="channel-top">
        <div class="avatar ${c.av}">${c.init}</div>
        <div>
          <div class="channel-name">${c.name}${c.badge?`<span class="badge ${BADGE_MAP[c.badge]}">${c.badge}</span>`:''}</div>
          <div class="channel-type">${c.type}</div>
        </div>
      </div>
      <div class="channel-stats">
        <div class="stat"><strong>${c.subs||'—'}</strong></div>
        <div class="stat"><strong>${c.freq||'—'}</strong> posts</div>
        <div class="stat"><strong>${c.growth||'—'}</strong></div>
      </div>
      ${c.why ? `<div class="channel-why">${c.why}</div>` : ''}
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">${buildChannelLinks(c)}</div>
      <button class="btn-secondary sm" style="margin-top:8px;width:100%" onclick="getPatternIdeas('${c.name.replace(/'/g,"\\'")}','${(c.why||'').replace(/'/g,"\\'").replace(/\n/g,' ')}')">
        Get Pattern Inc ideas from this channel ↗
      </button>
    </div>`).join('');
  if (addButton) html += `<div class="add-channel" onclick="showAddChannel()">+ Add channel</div>`;
  el.innerHTML = html;
}
function buildChannelLinks(c) {
  const links = [];
  if (c.ytUrl) links.push(`<a class="channel-link" href="${c.ytUrl}" target="_blank">▶ YouTube</a>`);
  if (c.liUrl) links.push(`<a class="channel-link" href="${c.liUrl}" target="_blank">in LinkedIn</a>`);
  if (c.igUrl) links.push(`<a class="channel-link" href="${c.igUrl}" target="_blank">◎ Instagram</a>`);
  if (c.ttUrl) links.push(`<a class="channel-link" href="${c.ttUrl}" target="_blank">♪ TikTok</a>`);
  return links.join('');
}
/* ── PATTERN INC IDEAS ── */
function getPatternIdeas(channelName, whySummary) {
  const prompt = `You are a content strategist for Pattern Inc — a professional B2B ecommerce accelerator that works closely with brand partners and customers. Pattern Inc creates professional, data-driven video content.
The channel we're analyzing is: ${channelName}
Why it's relevant to B2B customer-facing brands: ${whySummary}
Give me 5 specific content ideas that Pattern Inc can create, inspired by ${channelName}'s content style and topics.
For each idea:
1. Video title (professional, B2B ecommerce angle)
2. Core message (1 sentence)
3. Why it works for Pattern Inc's brand partners and customers
4. Recommended platform (YouTube / LinkedIn / both)
Keep the tone professional and data-backed — Pattern Inc's audience is brand executives and ecommerce decision-makers.`;
  document.getElementById('analyze-result').classList.remove('hidden');
  switchTab('analyze', document.querySelectorAll('.tab')[2]);
  callClaude(prompt, 'analyze-result');
}
/* ── ADD CHANNEL ── */
function showAddChannel() {
  document.getElementById('add-channel-overlay').classList.remove('hidden');
}
function closeAddChannel() {
  document.getElementById('add-channel-overlay').classList.add('hidden');
  ['new-channel-name','new-channel-id','new-channel-yt','new-channel-li'].forEach(id => {
    document.getElementById(id).value = '';
  });
}
function closeAddOutside(e) {
  if (e.target.id==='add-channel-overlay') closeAddChannel();
}
async function saveNewChannel() {
  const name = document.getElementById('new-channel-name').value.trim();
  if (!name) { alert('Please enter a channel name.'); return; }
  const id = document.getElementById('new-channel-id').value.trim();
  const ytUrl = document.getElementById('new-channel-yt').value.trim();
  const liUrl = document.getElementById('new-channel-li').value.trim();
  const tier = document.getElementById('new-channel-tier').value;
  const initials = name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  const avColors = ['av-blue','av-teal','av-amber','av-purple','av-coral','av-green'];
  const av = avColors[state.customChannels.length % avColors.length];
  const ch = { id, name, av, init:initials, tier, badge:'new', type:`${tier.charAt(0).toUpperCase()+tier.slice(1)} · YT`, subs:'—', freq:'—', growth:'—', ytUrl, liUrl, why:'' };
  state.customChannels.push(ch);
  localStorage.setItem('customChannels', JSON.stringify(state.customChannels));
  closeAddChannel();
  renderChannels();
  updateMetrics();
  if (id) await loadYouTubeData();
}
/* ── HOOK ANALYZER ── */
function analyzeThis(title) {
  document.getElementById('hook-input').value = title;
  switchTab('analyze', document.querySelectorAll('.tab')[2]);
  analyzeHook();
}
function analyzeHook() {
  const v = document.getElementById('hook-input').value.trim();
  if (!v) return;
  incrementHooks();
  callClaude(
    `Analyze this B2B ecommerce hook: "${v}"\n\n1. Psychological triggers used\n2. Hook structure & framework\n3. Why it works for a B2B ecommerce audience\n4. 5 improved variations for YouTube, LinkedIn, and Instagram Reels\n5. One version adapted for Pattern Inc (professional B2B ecommerce accelerator tone)`,
    'analyze-result'
  );
}
function generateHooks() {
  const v = document.getElementById('hook-input').value.trim();
  const base = v ? `Using "${v}" as reference, generate` : 'Generate';
  incrementHooks();
  callClaude(
    `${base} 10 viral-ready hooks for a B2B ecommerce brand.\n\nGive platform-specific versions:\n- 3 YouTube titles\n- 4 LinkedIn post openers\n- 3 Instagram Reels hooks\n\nFocus on pain points, contrarian angles, and data-backed hooks.\nAlso include 2 versions in a professional tone suited for Pattern Inc (B2B ecommerce accelerator).`,
    'analyze-result'
  );
}
function generateScript() {
  const v = document.getElementById('hook-input').value.trim();
  const base = v ? `"${v}"` : 'a strong B2B ecommerce hook';
  incrementHooks();
  callClaude(
    `Write a full short-form video script based on ${base}.\n\nStructure:\n- Hook (0–3s): attention grab\n- Problem setup (3–15s): agitate the pain\n- Insight/tension (15–40s): the surprising truth\n- Payoff + CTA (40–60s): solution + next step\n\nOptimized for LinkedIn and YouTube Shorts. B2B ecommerce audience.\nAlso write a second version in Pattern Inc's professional, data-driven tone for brand executives.`,
    'analyze-result'
  );
}
function useStarter(text) { document.getElementById('hook-input').value = text; }
function incrementHooks() {
  state.hooksCount++;
  localStorage.setItem('hooksCount', state.hooksCount);
  updateMetrics();
}
/* ── IDEA VAULT ── */
function saveIdea() {
  const v = document.getElementById('idea-input').value.trim();
  if (!v) return;
  const idea = { id:Date.now(), text:v, date:new Date().toLocaleDateString('en'), status:'note' };
  state.ideas.unshift(idea);
  localStorage.setItem('ideas', JSON.stringify(state.ideas));
  document.getElementById('idea-input').value='';
  renderIdeas();
  updateMetrics();
  if (state.settings.notionKey && state.settings.notionDb) syncToNotion(idea);
}
function developIdea() {
  const v = document.getElementById('idea-input').value.trim();
  if (!v) { alert('Enter an idea first.'); return; }
  callClaude(`Develop this B2B ecommerce content idea into a complete short-form video script for Pattern Inc (professional B2B ecommerce accelerator): "${v}"\n\nInclude hook, story arc, key insight, and CTA. Professional tone for brand executives. Works for LinkedIn and YouTube.`, 'analyze-result');
  switchTab('analyze', document.querySelectorAll('.tab')[2]);
}
function repurposeIdea() {
  const v = document.getElementById('idea-input').value.trim();
  if (!v) { alert('Enter an idea first.'); return; }
  callClaude(`Repurpose this idea for Pattern Inc (professional B2B ecommerce accelerator): "${v}"\n\n1. LinkedIn post (professional, insight-first)\n2. YouTube script (data-driven, brand executive audience)\n3. Instagram Reels hook + script\n4. Short-form TikTok script\n\nMaintain professional tone throughout.`, 'analyze-result');
  switchTab('analyze', document.querySelectorAll('.tab')[2]);
}
function renderIdeas() {
  const list = document.getElementById('idea-list');
  if (!state.ideas.length) {
    list.innerHTML=`<div style="font-size:13px;color:#aac0d8;padding:.5rem 0">No ideas saved yet.</div>`;
    return;
  }
  list.innerHTML = state.ideas.map(idea=>`
    <div class="viral-item">
      <div class="platform-dot" style="background:var(--brand)"></div>
      <div>
        <div class="viral-title">${idea.text.substring(0,80)}${idea.text.length>80?'…':''}</div>
        <div class="viral-meta">${idea.date}</div>
      </div>
      <div style="text-align:right">
        <span class="badge badge-new">${idea.status}</span>
        <div style="margin-top:4px">
          <button class="btn-secondary sm" onclick="deleteIdea(${idea.id})">✕</button>
        </div>
      </div>
    </div>`).join('');
}
function deleteIdea(id) {
  state.ideas = state.ideas.filter(i=>i.id!==id);
  localStorage.setItem('ideas', JSON.stringify(state.ideas));
  renderIdeas();
  updateMetrics();
}
/* ── CLAUDE API ── */
async function callClaude(prompt, resultId) {
  const key = state.settings.anthropicKey;
  if (!key) {
    showResult(resultId,'Add your Anthropic API key in Settings to use AI features.',true);
    return;
  }
  showResult(resultId,'Analyzing…',true);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-api-key':key,
        'anthropic-version':'2023-06-01',
        'anthropic-dangerous-direct-browser-access':'true',
      },
      body:JSON.stringify({
        model:'claude-sonnet-4-20250514',
        max_tokens:1200,
        messages:[{role:'user',content:prompt}],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text||'No response received.';
    showResult(resultId,text,false);
  } catch(e) { showResult(resultId,'Error: '+e.message,true); }
}
function showResult(id,text,isLoading) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('hidden','loading');
  if (isLoading) el.classList.add('loading');
  el.textContent=text;
}
/* ── NOTION SYNC ── */
async function syncToNotion(idea) {
  const {notionKey,notionDb} = state.settings;
  if (!notionKey||!notionDb) return;
  try {
    await fetch('https://api.notion.com/v1/pages',{
      method:'POST',
      headers:{'Authorization':`Bearer ${notionKey}`,'Content-Type':'application/json','Notion-Version':'2022-06-28'},
      body:JSON.stringify({
        parent:{database_id:notionDb},
        properties:{
          Name:{title:[{text:{content:idea.text.substring(0,100)}}]},
          Date:{date:{start:new Date().toISOString().split('T')[0]}},
          Status:{select:{name:'Note'}},
        },
      }),
    });
  } catch(e) { console.warn('Notion sync failed:',e.message); }
}
/* ── SETTINGS ── */
function openSettings() {
  document.getElementById('settings-overlay').classList.remove('hidden');
  loadSettingsUI();
}
function closeSettings() { document.getElementById('settings-overlay').classList.add('hidden'); }
function closeSettingsOutside(e) { if(e.target.id==='settings-overlay') closeSettings(); }
function loadSettingsUI() {
  document.getElementById('s-anthropic').value = state.settings.anthropicKey||'';
  document.getElementById('s-youtube').value = state.settings.youtubeKey||'';
  document.getElementById('s-notion').value = state.settings.notionKey||'';
  document.getElementById('s-notion-db').value = state.settings.notionDb||'';
}
async function saveSettings() {
  state.settings={
    anthropicKey:document.getElementById('s-anthropic').value.trim(),
    youtubeKey:document.getElementById('s-youtube').value.trim(),
    notionKey:document.getElementById('s-notion').value.trim(),
    notionDb:document.getElementById('s-notion-db').value.trim(),
  };
  localStorage.setItem('settings',JSON.stringify(state.settings));
  closeSettings();
  updateNotionStatus();
  await loadYouTubeData();
}
function updateNotionStatus() {
  const ok = !!(state.settings.notionKey&&state.settings.notionDb);
  document.getElementById('notion-status').className=`notion-status-dot ${ok?'on':'off'}`;
  document.getElementById('notion-status-text').textContent=ok?'Connected':'Not connected';
}
/* ── TABS ── */
function switchTab(name,btn) {
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  if(btn) btn.classList.add('active');
}
