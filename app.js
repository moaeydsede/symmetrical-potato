
async function loadCompany(){
  const res = await fetch('company.json', { cache: 'no-store' });
  if(!res.ok) throw new Error('Cannot load company.json');
  return res.json();
}

function setTheme(theme){
  if(!theme) return;
  const root = document.documentElement;
  for(const [k,v] of Object.entries(theme)){
    root.style.setProperty(`--${k}`, v);
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta && theme.primary) meta.setAttribute('content', theme.primary);
}

function svgIcon(name){
  const common = 'class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  if(name==='facebook') return `<svg ${common}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`;
  if(name==='telegram') return `<svg ${common}><path d="M21 3 3 11l7 2 2 7 9-17z"/><path d="M10 13l11-10"/></svg>`;
  if(name==='whatsapp') return `<svg ${common}><path d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5z"/><path d="M8.5 10.5c1 2.8 2.8 4.6 5.6 5.6"/><path d="M14.7 14.7l2 .3c.4.1.7.4.7.8v1.3c0 .5-.5 1-1.1.9-5.5-.8-9.9-5.2-10.7-10.7-.1-.6.4-1.1.9-1.1h1.3c.4 0 .7.3.8.7l.3 2"/></svg>`;
  return `<svg ${common}><path d="M12 22s8-4 8-10V6l-8-4-8 4v6c0 6 8 10 8 10z"/></svg>`;
}

function normalizeTel(v){
  const d = String(v||'').replace(/[^\d+]/g,'');
  // allow + at start
  return d.startsWith('+') ? d : (d ? ('+'+d) : '');
}

function renderPhones(listEl, arr){
  listEl.innerHTML='';
  (arr||[]).forEach(v=>{
    const tel = normalizeTel(v);
    const li = document.createElement('li');
    li.innerHTML = `<span>${v}</span><a class="btn" href="tel:${tel}">${svgIcon('phone')}اتصال</a>`;
    listEl.appendChild(li);
  });
}

function getSocial(links, icon){
  const item = (links||[]).find(x => String(x.icon||'').toLowerCase() === icon);
  return item?.url || '';
}

async function main(){
  const data = await loadCompany();

  // Theme
  setTheme(data.theme);

  // Logo
  const logoBox = document.getElementById('logoBox');
  if(data.logo?.type === 'svg' && data.logo.svg){
    logoBox.innerHTML = data.logo.svg;
  }else{
    logoBox.textContent = (data.companyName||'')[0] || 'J';
  }

  document.getElementById('companyName').textContent = data.companyName || '—';
  document.getElementById('tagline').textContent = data.tagline || '';
  document.getElementById('updatedAt').textContent = data.updatedAt ? new Date(data.updatedAt).toLocaleString('ar-EG') : '—';

  renderPhones(document.getElementById('salesList'), data.salesNumbers);
  renderPhones(document.getElementById('factoryList'), data.factoryNumbers);

  // Sites
  const sitesList = document.getElementById('sitesList');
  sitesList.innerHTML='';
  (data.sites||[]).forEach(s=>{
    const li = document.createElement('li');
    li.innerHTML = `<span>${s}</span>`;
    sitesList.appendChild(li);
  });

  // Social grid
  const socialGrid = document.getElementById('socialGrid');
  socialGrid.innerHTML='';
  (data.socialLinks||[]).forEach(x=>{
    const a = document.createElement('a');
    a.href = x.url || '#';
    a.target = '_blank';
    a.rel = 'noopener';
    const icon = String(x.icon||'').toLowerCase();
    a.innerHTML = `
      ${svgIcon(icon)}
      <div class="meta">
        <div class="name">${x.name || 'Link'}</div>
        <div class="url">${x.url || ''}</div>
      </div>
    `;
    socialGrid.appendChild(a);
  });

  // QR
  const wa = getSocial(data.socialLinks,'whatsapp');
  const fb = getSocial(data.socialLinks,'facebook');
  const tg = getSocial(data.socialLinks,'telegram');

  const waLink = document.getElementById('waLink');
  const fbLink = document.getElementById('fbLink');
  const tgLink = document.getElementById('tgLink');
  waLink.href = wa || '#';
  fbLink.href = fb || '#';
  tgLink.href = tg || '#';

  if(wa) window.QR.draw(document.getElementById('qrWa'), wa);
  if(fb) window.QR.draw(document.getElementById('qrFb'), fb);
  if(tg) window.QR.draw(document.getElementById('qrTg'), tg);

  // PWA
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
}

main().catch(err=>{
  console.error(err);
  document.body.innerHTML = `<div style="padding:16px;font-family:system-ui">حدث خطأ: تأكد أن ملف <b>company.json</b> موجود بجانب index.html.</div>`;
});
