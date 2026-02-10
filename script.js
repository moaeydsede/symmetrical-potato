async function loadData(){
  const res = await fetch('data.json', {cache:'no-store'});
  if(!res.ok) throw new Error('Failed to load data.json');
  return await res.json();
}

function el(tag, cls){
  const e = document.createElement(tag);
  if(cls) e.className = cls;
  return e;
}

function svgIcon(name){
  // Minimal clean icons (inline SVG)
  const icons = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.54 2.36a2 2 0 0 1-.45 2.11L9.09 10.91a16 16 0 0 0 4 4l1.72-1.11a2 2 0 0 1 2.11-.45c.76.24 1.55.42 2.36.54A2 2 0 0 1 22 16.92z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.52 3.48A11.9 11.9 0 0 0 12 0 12 12 0 0 0 1.56 18.9L0 24l5.26-1.38A12 12 0 0 0 24 12a11.9 11.9 0 0 0-3.48-8.52z"/><path d="M17.2 14.6c-.2.6-1.2 1.1-1.6 1.2-.4.1-.9.2-1.5 0-1.8-.6-3.2-2-4.4-3.3-1.2-1.3-2.1-2.8-2.5-4.4-.2-.6-.1-1.1 0-1.5.1-.4.7-1.4 1.3-1.6.2-.1.4-.1.6 0 .2.1.4.4.6.8l.8 1.9c.1.3.1.6 0 .8-.1.2-.2.4-.4.6l-.5.5c.4 1.1 1.9 2.8 3.2 3.3l.5-.5c.2-.2.4-.3.6-.4.2-.1.5-.1.8 0l1.9.8c.4.2.7.4.8.6.1.2.1.4 0 .6z"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    tg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 5L2 12l7 2 2 7 3-4 4 3 3-15z"/><path d="M9 14l10-9"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/></svg>',
    tt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3v10.5a4.5 4.5 0 1 1-4-4.47V3h8a6 6 0 0 1-4-2z"/></svg>',
    edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
    copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
  };
  return icons[name] || '';
}

function normPhoneForWA(phone){
  // Keep digits only, remove + and spaces
  const digits = String(phone || '').replace(/[^0-9]/g,'');
  return digits.startsWith('0') ? ('20' + digits.slice(1)) : digits; // basic Egypt helper
}

function buildNumberRow(label, value, isWhatsapp){
  const row = el('div','pill');
  const left = el('div','pill__left');
  const lab = el('div','pill__label'); lab.textContent = label;
  const val = el('div','pill__value'); val.textContent = value;
  left.append(lab,val);

  const actions = el('div','pill__actions');

  const copy = el('a','iconbtn');
  copy.href = '#';
  copy.innerHTML = svgIcon('copy');
  copy.title = 'نسخ';
  copy.onclick = (e)=>{ e.preventDefault(); navigator.clipboard?.writeText(value); };

  actions.appendChild(copy);

  const call = el('a','iconbtn');
  call.href = 'tel:' + value;
  call.innerHTML = svgIcon('phone');
  call.title = 'اتصال';
  actions.appendChild(call);

  if(isWhatsapp){
    const wa = el('a','iconbtn');
    wa.href = 'https://wa.me/' + normPhoneForWA(value);
    wa.target = '_blank';
    wa.rel = 'noopener';
    wa.innerHTML = svgIcon('wa');
    wa.title = 'واتساب';
    actions.appendChild(wa);
  }

  row.append(left, actions);
  return row;
}

function socialItem(kind, url){
  const map = {
    facebook: {label:'Facebook', icon:'fb'},
    telegram: {label:'Telegram', icon:'tg'},
    instagram: {label:'Instagram', icon:'ig'},
    tiktok: {label:'TikTok', icon:'tt'}
  };
  if(!url) return null;
  const a = el('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.innerHTML = svgIcon(map[kind].icon) + '<span>'+map[kind].label+'</span>';
  return a;
}

function locationCard(loc){
  const wrap = el('div','loc');
  const title = el('div','loc__title'); title.textContent = loc.title || 'موقع';
  const btns = el('div','loc__btns');

  const openMap = el('a','btn');
  openMap.href = loc.map;
  openMap.target = '_blank';
  openMap.rel = 'noopener';
  openMap.innerHTML = svgIcon('map') + '<span>فتح الخريطة</span>';

  btns.append(openMap);

  if(loc.note){
    const note = el('div');
    note.style.color = 'rgba(11,27,43,.65)';
    note.style.fontSize = '13px';
    note.textContent = loc.note;
    wrap.append(title, note, btns);
  }else{
    wrap.append(title, btns);
  }
  return wrap;
}

async function main(){
  const data = await loadData();

  document.title = (data.companyName || 'موقع الشركة');

  const logo = document.getElementById('logo');
  logo.src = data.logo || 'images/logo.svg';

  document.getElementById('companyName').textContent = data.companyName || '';
  document.getElementById('tagline').textContent = data.tagline || '';

  // Sales
  const salesWrap = document.getElementById('salesNumbers');
  salesWrap.innerHTML = '';
  const sales = Array.isArray(data.salesNumbers) ? data.salesNumbers : [];
  if(sales.length){
    sales.forEach((n, i)=> salesWrap.appendChild(buildNumberRow('Sales ' + (i+1), n, true)));
  }else{
    document.getElementById('salesBlock').style.display='none';
  }

  // Factory
  const fac = data.factoryNumber || '';
  if(fac){
    const fwrap = document.getElementById('factoryNumber');
    fwrap.innerHTML = '';
    fwrap.appendChild(buildNumberRow('Factory', fac, false));
  }else{
    document.getElementById('factoryBlock').style.display='none';
  }

  // Social
  const socialWrap = document.getElementById('socialIcons');
  socialWrap.innerHTML = '';
  const s = data.social || {};
  const items = [
    socialItem('facebook', s.facebook),
    socialItem('telegram', s.telegram),
    socialItem('instagram', s.instagram),
    socialItem('tiktok', s.tiktok),
  ].filter(Boolean);
  if(items.length){
    items.forEach(a=> socialWrap.appendChild(a));
  }else{
    document.getElementById('socialBlock').style.display='none';
  }

  // Locations
  const locWrap = document.getElementById('locations');
  locWrap.innerHTML = '';
  const locs = Array.isArray(data.locations) ? data.locations : [];
  if(locs.length){
    locs.forEach(l=> locWrap.appendChild(locationCard(l)));
  }else{
    locWrap.innerHTML = '<div style="padding:18px;color:rgba(11,27,43,.65)">لا توجد مواقع بعد.</div>';
  }

  // Footer
  document.getElementById('footerText').textContent = data.footerText || '';

  // Optional edit link (for owners)
  if(data.editorUrl){
    const notice = document.getElementById('noticeEdit');
    notice.style.display = 'block';
    const a = document.getElementById('editLink');
    a.href = data.editorUrl;
    a.innerHTML = svgIcon('edit') + '<span>فتح لوحة التحرير</span>';
  }
}

main().catch(err=>{
  console.error(err);
  document.body.innerHTML = '<div style="padding:24px;font-family:system-ui">خطأ في تحميل البيانات. تأكد من وجود ملف data.json بجانب index.html.</div>';
});
