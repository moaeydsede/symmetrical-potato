
async function loadJson(){
  const r = await fetch('company.json', {cache:'no-store'});
  return r.json();
}

function linesToArray(s){
  return String(s||'').split('\n').map(x=>x.trim()).filter(Boolean);
}

function buildJsonFromForm(){
  const out = window._template || {};
  out.companyName = document.getElementById('fName').value.trim() || out.companyName || 'JOOD KIDS';
  out.tagline = document.getElementById('fTag').value.trim() || out.tagline || '';
  out.salesNumbers = linesToArray(document.getElementById('fSales').value);
  out.factoryNumbers = linesToArray(document.getElementById('fFactory').value);
  out.sites = linesToArray(document.getElementById('fSites').value);

  const fb = document.getElementById('fFb').value.trim();
  const tg = document.getElementById('fTg').value.trim();
  const wa = document.getElementById('fWa').value.trim();

  // Keep list style socialLinks
  out.socialLinks = [
    {name:'Facebook', url: fb || '', icon:'facebook'},
    {name:'Telegram', url: tg || '', icon:'telegram'},
    {name:'WhatsApp', url: wa || '', icon:'whatsapp'},
  ].filter(x => x.url);

  out.updatedAt = new Date().toISOString();
  return out;
}

function downloadText(filename, text){
  const blob = new Blob([text], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
}

async function init(){
  const data = await loadJson();
  window._template = data;

  document.getElementById('fName').value = data.companyName || '';
  document.getElementById('fTag').value = data.tagline || '';
  document.getElementById('fSales').value = (data.salesNumbers||[]).join('\n');
  document.getElementById('fFactory').value = (data.factoryNumbers||[]).join('\n');
  document.getElementById('fSites').value = (data.sites||[]).join('\n');

  const get = (icon)=> (data.socialLinks||[]).find(x=>String(x.icon||'').toLowerCase()===icon)?.url || '';
  document.getElementById('fFb').value = get('facebook');
  document.getElementById('fTg').value = get('telegram');
  document.getElementById('fWa').value = get('whatsapp');

  const outBox = document.getElementById('out');
  outBox.value = JSON.stringify(data, null, 2);

  const build = ()=>{
    const obj = buildJsonFromForm();
    outBox.value = JSON.stringify(obj, null, 2);
  };

  document.getElementById('btnBuild').addEventListener('click', (e)=>{
    e.preventDefault();
    build();
  });
  document.getElementById('btnCopy').addEventListener('click', async (e)=>{
    e.preventDefault();
    build();
    await navigator.clipboard.writeText(outBox.value);
  });
  document.getElementById('btnDownload').addEventListener('click', (e)=>{
    e.preventDefault();
    build();
    downloadText('company.json', outBox.value);
  });
}
init();
