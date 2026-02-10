/* Config-driven Company Profile Site (GitHub Pages)
   Edit data.json only. Anything left empty will be hidden automatically.
*/

const $ = (sel) => document.querySelector(sel);

function escapeHtml(s){
  return String(s ?? '').replace(/[&<>"']/g, (c)=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

function svgPhone(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M8.5 3h7A2.5 2.5 0 0 1 18 5.5v13A2.5 2.5 0 0 1 15.5 21h-7A2.5 2.5 0 0 1 6 18.5v-13A2.5 2.5 0 0 1 8.5 3Z" stroke="currentColor" stroke-width="1.8"/>
    <path d="M10 6h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M12 18.1h.01" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
  </svg>`;
}
function svgCopy(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 9h10v10H9V9Z" stroke="currentColor" stroke-width="1.8" />
    <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}
function svgMap(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 22s7-4.6 7-12a7 7 0 0 0-14 0c0 7.4 7 12 7 12Z" stroke="currentColor" stroke-width="1.8"/>
    <path d="M12 13.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" stroke="currentColor" stroke-width="1.8"/>
  </svg>`;
}
function svgFacebook(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14 8.5V7.2c0-.9.6-1.2 1.2-1.2H17V3h-2.2C12.6 3 11 4.4 11 7.2v1.3H9v3h2V21h3v-9.5h2.4l.6-3H14Z" fill="currentColor"/>
  </svg>`;
}
function svgTelegram(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21.8 5.2 19 20.6c-.2 1.1-1.1 1.4-2 .9l-5.5-4.1-2.7 2.6c-.3.3-.6.6-1.2.6l.4-6 10.9-9.8c.5-.4-.1-.6-.7-.2L5.6 12.2 1 10.8c-1-.3-1-1 .2-1.5l18-6.9c.8-.3 1.5.2 1.6 1.3Z" fill="currentColor"/>
  </svg>`;
}
function svgInstagram(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9A4.5 4.5 0 0 1 16.5 21h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Z" stroke="currentColor" stroke-width="1.8"/>
    <path d="M12 16.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" stroke="currentColor" stroke-width="1.8"/>
    <path d="M17.3 6.7h.01" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
  </svg>`;
}
function svgTikTok(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14 3v10.2a3.8 3.8 0 1 1-3.1-3.7V6.3c.7.2 1.4.3 2.1.3.4 1.6 1.7 3.4 4.9 3.7V7.1c-1.5-.2-2.6-.9-3.1-1.6V3H14Z" fill="currentColor"/>
  </svg>`;
}

function makeIconBtn(href, title, svg){
  const safe = escapeHtml(href);
  return `<a class="iconBtn" href="${safe}" target="_blank" rel="noopener" title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}">${svg}</a>`;
}

function makePill(href, label, svg){
  const safe = escapeHtml(href);
  return `<a class="pill" href="${safe}" target="_blank" rel="noopener">${svg}<span>${escapeHtml(label)}</span></a>`;
}

function normalizePhone(p){
  return String(p ?? '').trim();
}

function makeTelLink(p){
  // keep digits and plus
  const compact = String(p).replace(/[^0-9+]/g,'');
  return `tel:${compact}`;
}

function makeWhatsappLink(p){
  // WhatsApp needs country code digits only
  const digits = String(p).replace(/[^0-9]/g,'');
  return `https://wa.me/${digits}`;
}

async function init(){
  const res = await fetch('data.json', {cache: 'no-store'});
  const data = await res.json();

  // Header
  $('#companyName').textContent = data.companyName || 'اسم الشركة';
  $('#companyTagline').textContent = data.tagline || 'ملابس أطفال';
  $('#footerLine').textContent = `© ${new Date().getFullYear()} ${data.companyName || ''}`.trim();

  const initial = (data.companyName || 'J').trim().charAt(0).toUpperCase();
  $('#logoInitial').textContent = initial || 'J';

  // Logo
  if (data.logo){
    $('#companyLogo').src = data.logo;
  }

  // رابط التعديل (اختياري). لا يظهر إلا إذا وضعت showEditLink=true و editRepoUrl
  if (data.showEditLink === true && data.editRepoUrl){
    $('#repoHint').href = data.editRepoUrl;
  } else {
    $('#repoHint').style.display = 'none';
  }

  // Phones
  const phonesEl = $('#phones');
  const sales = Array.isArray(data.salesNumbers) ? data.salesNumbers.filter(Boolean) : [];
  const factory = data.factoryNumber ? [data.factoryNumber] : [];

  const rows = [];

  // Sales rows (call + WhatsApp + copy)
  sales.forEach((p, idx)=>{
    const phone = normalizePhone(p);
    rows.push(`
      <div class="row">
        <div class="row__left">
          <span class="badge"><span class="badge__dot"></span>Sales ${idx+1}</span>
          <span class="phone">${escapeHtml(phone)}</span>
        </div>
        <div class="actions">
          <a class="iconBtn" href="${escapeHtml(makeTelLink(phone))}" title="اتصال">${svgPhone()}</a>
          <a class="iconBtn" href="${escapeHtml(makeWhatsappLink(phone))}" target="_blank" rel="noopener" title="واتساب">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 11.6A8.4 8.4 0 0 1 7.6 19L4 20l1.1-3.4A8.4 8.4 0 1 1 20 11.6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              <path d="M9.1 8.9c.2-.5.4-.5.6-.5h.5c.2 0 .5 0 .7.5.2.5.8 1.9.9 2.1.1.2.1.4 0 .6-.1.2-.2.3-.4.5-.2.2-.4.4-.2.8.2.4.9 1.5 2 2.4 1.4 1.1 2.5 1.4 2.9 1.5.4.1.7 0 .9-.3.2-.3.4-.7.5-1 .1-.3.3-.3.5-.2.2.1 1.4.7 1.7.8.3.1.4.2.4.4 0 .2 0 .9-.4 1.7-.4.8-1.9 1.6-2.7 1.7-.7.1-1.6.2-3.9-.8-2.8-1.2-4.6-4.1-4.7-4.3-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-1.9.9-2.2Z" fill="currentColor"/>
            </svg>
          </a>
          <button class="iconBtn" type="button" data-copy="${escapeHtml(phone)}" title="نسخ">${svgCopy()}</button>
        </div>
      </div>
    `);
  });

  // Factory row (call + copy)
  factory.forEach((p)=>{
    const phone = normalizePhone(p);
    rows.push(`
      <div class="row">
        <div class="row__left">
          <span class="badge badge--factory"><span class="badge__dot"></span>Factory</span>
          <span class="phone">${escapeHtml(phone)}</span>
        </div>
        <div class="actions">
          <a class="iconBtn" href="${escapeHtml(makeTelLink(phone))}" title="اتصال">${svgPhone()}</a>
          <button class="iconBtn" type="button" data-copy="${escapeHtml(phone)}" title="نسخ">${svgCopy()}</button>
        </div>
      </div>
    `);
  });

  phonesEl.innerHTML = rows.join('') || `<div class="note"><span class="dot"></span><span>لا توجد أرقام مضافة. عدّل <b>salesNumbers</b> و <b>factoryNumber</b> داخل <b>data.json</b>.</span></div>`;

  // Copy handlers
  document.querySelectorAll('[data-copy]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const val = btn.getAttribute('data-copy') || '';
      try{
        await navigator.clipboard.writeText(val);
        btn.style.transform = 'translateY(-1px) scale(1.02)';
        setTimeout(()=>btn.style.transform='', 120);
      }catch(e){
        // fallback
        const t = document.createElement('textarea');
        t.value = val;
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        document.body.removeChild(t);
      }
    });
  });

  // Socials
  const socialEl = $('#social');
  const s = data.social || {};
  const pills = [];

  if (s.facebook)  pills.push(makePill(s.facebook, 'Facebook', svgFacebook()));
  if (s.telegram)  pills.push(makePill(s.telegram, 'Telegram', svgTelegram()));
  if (s.instagram) pills.push(makePill(s.instagram, 'Instagram', svgInstagram()));
  if (s.tiktok)    pills.push(makePill(s.tiktok, 'TikTok', svgTikTok()));

  socialEl.innerHTML = pills.join('') || '';

  // Locations
  const locEl = $('#locations');
  const locs = Array.isArray(data.locations) ? data.locations.filter(l=>l && l.title && l.map) : [];
  if (!locs.length){
    locEl.innerHTML = `<div class="note"><span class="dot"></span><span>أضف أي عدد من المواقع داخل <b>locations</b> في <b>data.json</b> (عنوان + رابط خرائط).</span></div>`;
  } else {
    locEl.innerHTML = locs.map(l=>`
      <div class="loc">
        <div class="loc__left">
          ${svgMap()}
          <div>
            <div class="loc__title">${escapeHtml(l.title)}</div>
            <div class="card__subtitle">${escapeHtml(l.notes || '')}</div>
          </div>
        </div>
        <a class="loc__link" href="${escapeHtml(l.map)}" target="_blank" rel="noopener">افتح الخريطة</a>
      </div>
    `).join('');
  }

  // Set document title
  document.title = (data.companyName ? `${data.companyName} | موقع الشركة` : 'موقع الشركة');
}

init().catch(err=>{
  console.error(err);
  document.body.innerHTML = '<div style="font-family: Cairo, Arial; padding:18px">حدث خطأ في تحميل <b>data.json</b>. تأكد أنه موجود وصحيح.</div>';
});
