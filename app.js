async function loadCompany(){
  const res = await fetch('data/company.json', { cache: 'no-store' });
  if(!res.ok) throw new Error('Failed to load company data');
  return res.json();
}

function setTheme(theme){
  if(!theme) return;
  const root = document.documentElement;
  for(const [k,v] of Object.entries(theme)){
    root.style.setProperty(`--${k}`, v);
  }
  // update browser theme color
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta && theme.primary) meta.setAttribute('content', theme.primary);
}

function iconSvg(name){
  const common = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  if(name==='facebook') return `<svg viewBox="0 0 24 24" ${common}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`;
  if(name==='telegram') return `<svg viewBox="0 0 24 24" ${common}><path d="M21 3 3 11l7 2 2 7 9-17z"/><path d="M10 13l11-10"/></svg>`;
  if(name==='whatsapp') return `<svg viewBox="0 0 24 24" ${common}><path d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5z"/><path d="M8.5 10.5c1 2.8 2.8 4.6 5.6 5.6"/><path d="M14.7 14.7l2 .3c.4.1.7.4.7.8v1.3c0 .5-.5 1-1.1.9-5.5-.8-9.9-5.2-10.7-10.7-.1-.6.4-1.1.9-1.1h1.3c.4 0 .7.3.8.7l.3 2"/></svg>`;
  return `<svg viewBox="0 0 24 24" ${common}><path d="M12 22s8-4 8-10V6l-8-4-8 4v6c0 6 8 10 8 10z"/></svg>`;
}

function renderList(el, items, makeHref){
  el.innerHTML = '';
  (items||[]).forEach(v=>{
    const li = document.createElement('li');
    const left = document.createElement('span');
    left.textContent = v;
    const right = document.createElement('a');
    right.className = 'btn';
    right.target = '_blank';
    right.rel = 'noopener';
    right.href = makeHref ? makeHref(v) : '#';
    right.textContent = makeHref ? 'اتصال' : 'نسخ';
    right.addEventListener('click', (e)=>{
      if(!makeHref){
        e.preventDefault();
        navigator.clipboard?.writeText(v);
      }
    });
    li.appendChild(left);
    li.appendChild(right);
    el.appendChild(li);
  });
}

function bestSocial(links, icon){
  const match = (links||[]).find(x=>String(x.icon||'').toLowerCase()===icon);
  return match?.url || '';
}

async function main(){
  try{
    const data = await loadCompany();
    document.getElementById('companyName').textContent = data.companyName || 'بيانات الشركة';
    document.getElementById('tagline').textContent = data.tagline || '';
    document.getElementById('updatedAt').textContent = data.updatedAt ? new Date(data.updatedAt).toLocaleString('ar-EG') : '—';

    // logo: if user uploaded png use that path; if empty fallback
    const logo = document.getElementById('logo');
    if(data.logoPath) logo.src = data.logoPath;

    setTheme(data.theme);

    // Sales/Factory lists (call / copy)
    renderList(document.getElementById('salesList'), data.sealsNumbers, (v)=>{
      const digits = String(v).replace(/\D+/g,'');
      return digits ? `tel:+${digits}` : '#';
    });

    renderList(document.getElementById('factoryList'), data.factoryNumbers, (v)=>{
      const digits = String(v).replace(/\D+/g,'');
      return digits ? `tel:+${digits}` : '#';
    });

    // Sites
    const sitesList = document.getElementById('sitesList');
    sitesList.innerHTML = '';
    (data.sites||[]).forEach(s=>{
      const li = document.createElement('li');
      li.innerHTML = `<span>${s}</span><span class="pill">موقع</span>`;
      sitesList.appendChild(li);
    });

    // Social
    const socialGrid = document.getElementById('socialGrid');
    socialGrid.innerHTML = '';
    (data.socialLinks||[]).forEach(x=>{
      const a = document.createElement('a');
      a.href = x.url || '#';
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerHTML = `
        ${iconSvg(String(x.icon||'').toLowerCase())}
        <div class="meta">
          <div class="name">${x.name || 'Link'}</div>
          <div class="url">${x.url || ''}</div>
        </div>
      `;
      socialGrid.appendChild(a);
    });

    // QR links
    const fb = bestSocial(data.socialLinks,'facebook');
    const tg = bestSocial(data.socialLinks,'telegram');
    const wa = bestSocial(data.socialLinks,'whatsapp');

    const fbLink = document.getElementById('fbLink');
    const tgLink = document.getElementById('tgLink');
    const whatsLink = document.getElementById('whatsLink');
    fbLink.href = fb || '#';
    tgLink.href = tg || '#';
    whatsLink.href = wa || '#';

    if(wa) window.QR.draw(document.getElementById('qrWhats'), wa);
    if(fb) window.QR.draw(document.getElementById('qrFb'), fb);
    if(tg) window.QR.draw(document.getElementById('qrTg'), tg);

    // Service worker
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('sw.js').catch(()=>{});
    }
  }catch(err){
    console.error(err);
    document.body.innerHTML = `<div style="padding:16px;font-family:system-ui;color:#fff">حدث خطأ في تحميل البيانات. تأكد من وجود ملف <b>data/company.json</b> على نفس المسار.</div>`;
  }
}
main();
