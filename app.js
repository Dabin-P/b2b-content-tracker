/* ── STATE ── */
const state = {
  ideas: JSON.parse(localStorage.getItem('ideas') || '[]'),
  hooksCount: parseInt(localStorage.getItem('hooksCount') || '0'),
  settings: JSON.parse(localStorage.getItem('settings') || '{}'),
};

/* ── SEED DATA ── */
const VIRAL_DATA = [
  { p:'yt', title:"HubSpot: The B2B ecommerce automation stack that 10x'd our pipeline", channel:'HubSpot', views:'3.1M', mult:'5.4x avg', days:'2 days ago' },
  { p:'li', title:"Shopify Plus: Why B2B buyers want self-serve — and what to do about it", channel:'Shopify Plus', views:'512K', mult:'4.2x avg', days:'4 days ago' },
  { p:'yt', title:"Salesforce: The real reason B2B customers churn in year one", channel:'Salesforce', views:'1.9M', mult:'3.9x avg', days:'5 days ago' },
  { p:'tt', title:"Gorgias: What happens when you automate B2B customer support", channel:'Gorgias', views:'388K', mult:'6.3x avg', days:'3 days ago' },
  { p:'li', title:"Justin Welsh: How I grew a B2B audience to 500K without paid ads", channel:'Justin Welsh', views:'820K', mult:'7.1x avg', days:'6 days ago' },
  { p:'ig', title:"Klaviyo: One email sequence that lifted B2B repeat orders by 41%", channel:'Klaviyo', views:'97K', mult:'3.6x avg', days:'4 days ago' },
  { p:'yt', title:"Sam Jacobs: The cold outreach mistake killing B2B ecommerce deals", channel:'Pavilion', views:'241K', mult:'4.8x avg', days:'1 day ago' },
];

const CHANNELS = {
  enterprise: [
    { av:'av-blue', init:'HS', name:'HubSpot', badge:'hot', type:'Enterprise · YT + LI + IG', subs:'6.4M subs', freq:'3.2/wk', growth:'+18%' },
    { av:'av-teal', init:'SF', name:'Salesforce', badge:'', type:'Enterprise · YT + LI', subs:'4.1M subs', freq:'2.8/wk', growth:'+11%' },
  ],
  growing: [
    { av:'av-amber', init:'SP', name:'Shopify Plus', badge:'rising', type:'Mid-market · LI + YT', subs:'890K followers', freq:'5.1/wk', growth:'+31%' },
    { av:'av-purple', init:'KV', name:'Klaviyo', badge:'rising', type:'Mid-market · YT + IG', subs:'218K subs', freq:'2.9/wk', growth:'+24%' },
    { av:'av-coral', init:'GG', name:'Gorgias', badge:'hot', type:'Startup · TT + IG', subs:'131K followers', freq:'7/wk', growth:'+69%' },
    { av:'av-green', init:'RH', name:'Recharge', badge:'new', type:'Startup · LI + YT', subs:'44K followers', freq:'4/wk', growth:'+52%' },
  ],
  founders: [
    { av:'av-blue', init:'JW', name:'Justin Welsh', badge:'hot', type:'Solo founder · LI + YT', subs:'530K followers', freq:'5/wk', growth:'+41%' },
    { av:'av-teal', init:'GV', name:'Gary Vaynerchuk', badge:'', type:'Founder · All platforms', subs:'11M+ followers', freq:'14/wk', growth:'+8%' },
  ],
};

const BADGE_MAP = { hot:'badge-hot', new:'badge-new', rising:'badge-rising' };

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  setWeekLabel();
  renderViral('all');
  renderChannels();
  renderIdeas();
  updateMetrics();
  loadSettingsUI();
  updateNotionStatus();
});

function setWeekLabel() {
  const now = new Date();
  const week = getWeekNumber(now);
  document.getElementById('week-label').textContent =
    `Weekly report · Week ${week}, ${now.toLocaleString('en', { month: 'long', year: 'numeric' })}`;
}

function getWeekNumber(d) {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
}

function updateMetrics() {
  document.getElementById('m-ideas').textContent = state.ideas.length || '0';
  document.getElementById('m-hooks').textContent = state.hooksCount || '0';
  document.getElementById('m-viral').textContent = VIRAL_DATA.length;
}

/* ── VIRAL FINDER ── */
function renderViral(filter) {
  const list = document.getElementById('viral-list');
  const items = filter === 'all' ? VIRAL_DATA : VIRAL_DATA.filter(v => v.p === filter);
  list.innerHTML = items.map(v => `
    <div class="viral-item" data-p="${v.p}" onclick="analyzeThis('${v.title.replace(/'/g,"\\'")}')">
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
  return { yt:'YouTube', li:'LinkedIn', ig:'Instagram', tt:'TikTok' }[p] || p;
}

function filterPlatform(btn, p) {
  document.querySelectorAll('.pf').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderViral(p);
}

function loadMoreViral() {
  alert('Connect your YouTube API key in Settings to load live viral data.');
}

/* ── CHANNELS ── */
function renderChannels() {
  renderChannelGroup('channels-enterprise', CHANNELS.enterprise);
  renderChannelGroup('channels-growing', CHANNELS.growing, true);
  renderChannelGroup('channels-founders', CHANNELS.founders, true);
}

function renderChannelGroup(id, channels, addButton = false) {
  const el = document.getElementById(id);
  let html = channels.map(c => `
    <div class="channel-card">
      <div class="channel-top">
        <div class="avatar ${c.av}">${c.init}</div>
        <div>
          <div class="channel-name">${c.name}${c.badge ? `<span class="badge ${BADGE_MAP[c.badge]}">${c.badge}</span>` : ''}</div>
          <div class="channel-type">${c.type}</div>
        </div>
      </div>
      <div class="channel-stats">
        <div class="stat"><strong>${c.subs}</strong></div>
        <div class="stat"><strong>${c.freq}</strong> posts</div>
        <div class="stat"><strong>${c.growth}</strong> growth</div>
      </div>
    </div>`).join('');
  if (addButton) {
    html += `<div class="add-channel" onclick="suggestChannels()">+ Add channel</div>`;
  }
  el.innerHTML = html;
}

function suggestChannels() {
  callClaude(
    'Recommend 5 English-speaking B2B ecommerce channels or founder personal brands to track. Mix of YouTube, LinkedIn, TikTok, Instagram. Focus on creators producing viral content about B2B sales, customer success, and ecommerce growth.',
    'analyze-result'
  );
  switchTab('analyze', document.querySelectorAll('.tab')[2]);
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
    `Analyze this B2B ecommerce hook: "${v}"\n\nBreak down:\n1. Psychological triggers used\n2. Hook structure/framework\n3. Why it works for B2B ecommerce audience\n4. 5 improved variations for YouTube, LinkedIn, and Instagram Reels`,
    'analyze-result'
  );
}

function generateHooks() {
  const v = document.getElementById('hook-input').value.trim();
  const base = v ? `Using "${v}" as reference, generate` : 'Generate';
  incrementHooks();
  callClaude(
    `${base} 10 viral-ready hooks for a B2B ecommerce brand. Give platform-specific versions for YouTube titles, LinkedIn posts, and Instagram Reels. Focus on pain points, contrarian angles, and data-backed hooks.`,
    'analyze-result'
  );
}

function generateScript() {
  const v = document.getElementById('hook-input').value.trim();
  const base = v ? `"${v}"` : 'a strong B2B ecommerce hook';
  callClaude(
    `Write a full short-form video script based on ${base}.\n\nStructure:\n- Hook (0–3s)\n- Problem setup (3–15s)\n- Insight/tension (15–40s)\n- Payoff + CTA (40–60s)\n\nOptimize for LinkedIn and YouTube Shorts. B2B ecommerce audience.`,
    'analyze-result'
  );
}

function useStarter(text) {
  document.getElementById('hook-input').value = text;
}

function incrementHooks() {
  state.hooksCount++;
  localStorage.setItem('hooksCount', state.hooksCount);
  updateMetrics();
}

/* ── IDEA VAULT ── */
function saveIdea() {
  const v = document.getElementById('idea-input').value.trim();
  if (!v) return;
  const idea = { id: Date.now(), text: v, date: new Date().toLocaleDateString('en'), status: 'note' };
  state.ideas.unshift(idea);
  localStorage.setItem('ideas', JSON.stringify(state.ideas));
  document.getElementById('idea-input').value = '';
  renderIdeas();
  updateMetrics();
  if (state.settings.notionKey && state.settings.notionDb) syncToNotion(idea);
}

function developIdea() {
  const v = document.getElementById('idea-input').value.trim();
  if (!v) { alert('Enter an idea first.'); return; }
  callClaude(
    `Develop this B2B ecommerce content idea into a complete short-form video script: "${v}"\n\nInclude hook, story arc, key insight, and CTA. Works for both LinkedIn and YouTube Shorts.`,
    'analyze-result'
  );
  switchTab('analyze', document.querySelectorAll('.tab')[2]);
}

function repurposeIdea() {
  const v = document.getElementById('idea-input').value.trim();
  if (!v) { alert('Enter an idea first.'); return; }
  callClaude(
    `Repurpose this idea into 4 platform-specific content pieces for a B2B ecommerce brand: "${v}"\n\n1. LinkedIn post\n2. YouTube Shorts script\n3. Instagram Reels hook + script\n4. TikTok script\n\nEach should feel native to the platform.`,
    'analyze-result'
  );
  switchTab('analyze', document.querySelectorAll('.tab')[2]);
}

function renderIdeas() {
  const list = document.getElementById('idea-list');
  if (!state.ideas.length) {
    list.innerHTML = `<div style="font-size:13px;color:#aaa;padding:.5rem 0">No ideas saved yet.</div>`;
    return;
  }
  list.innerHTML = state.ideas.map(idea => `
    <div class="viral-item">
      <div class="platform-dot" style="background:#9FE1CB"></div>
      <div>
        <div class="viral-title">${idea.text.substring(0, 80)}${idea.text.length > 80 ? '…' : ''}</div>
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
  state.ideas = state.ideas.filter(i => i.id !== id);
  localStorage.setItem('ideas', JSON.stringify(state.ideas));
  renderIdeas();
  updateMetrics();
}

/* ── CLAUDE API ── */
async function callClaude(prompt, resultId) {
  const key = state.settings.anthropicKey;
  if (!key) {
    showResult(resultId, 'Add your Anthropic API key in Settings to use AI features.', true);
    return;
  }
  showResult(resultId, 'Analyzing...', true);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || 'No response received.';
    showResult(resultId, text, false);
  } catch (e) {
    showResult(resultId, 'Error: ' + e.message, true);
  }
}

function showResult(id, text, isLoading) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('hidden', 'loading');
  if (isLoading) el.classList.add('loading');
  el.textContent = text;
}

/* ── NOTION SYNC ── */
async function syncToNotion(idea) {
  const { notionKey, notionDb } = state.settings;
  if (!notionKey || !notionDb) return;
  try {
    await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: notionDb },
        properties: {
          Name: { title: [{ text: { content: idea.text.substring(0, 100) } }] },
          Date: { date: { start: new Date().toISOString().split('T')[0] } },
          Status: { select: { name: 'Note' } },
          Platform: { select: { name: 'B2B Ecommerce' } },
        },
      }),
    });
  } catch (e) {
    console.warn('Notion sync failed:', e.message);
  }
}

/* ── SETTINGS ── */
function openSettings() {
  document.getElementById('settings-overlay').classList.remove('hidden');
  loadSettingsUI();
}
function closeSettings() {
  document.getElementById('settings-overlay').classList.add('hidden');
}
function closeSettingsOutside(e) {
  if (e.target.id === 'settings-overlay') closeSettings();
}
function loadSettingsUI() {
  document.getElementById('s-anthropic').value = state.settings.anthropicKey || '';
  document.getElementById('s-youtube').value = state.settings.youtubeKey || '';
  document.getElementById('s-notion').value = state.settings.notionKey || '';
  document.getElementById('s-notion-db').value = state.settings.notionDb || '';
}
function saveSettings() {
  state.settings = {
    anthropicKey: document.getElementById('s-anthropic').value.trim(),
    youtubeKey: document.getElementById('s-youtube').value.trim(),
    notionKey: document.getElementById('s-notion').value.trim(),
    notionDb: document.getElementById('s-notion-db').value.trim(),
  };
  localStorage.setItem('settings', JSON.stringify(state.settings));
  closeSettings();
  updateNotionStatus();
}
function updateNotionStatus() {
  const connected = !!(state.settings.notionKey && state.settings.notionDb);
  document.getElementById('notion-status').className = `notion-status-dot ${connected ? 'on' : 'off'}`;
  document.getElementById('notion-status-text').textContent = connected ? 'Connected' : 'Not connected';
}

/* ── TABS ── */
function switchTab(name, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
}
