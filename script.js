
fetch('data.json')
.then(r=>r.json())
.then(d=>{
  document.getElementById('companyName').innerText=d.companyName;
  document.getElementById('tagline').innerText=d.tagline || '';
  document.getElementById('logo').src=d.logo;

  const contacts=document.getElementById('contacts');
  d.salesNumbers.forEach(n=>{
    contacts.innerHTML+=`<a class="button" href="tel:${n}">📞 ${n}</a>`;
  });
  if(d.factoryNumber){
    contacts.innerHTML+=`<div class="card">🏭 ${d.factoryNumber}</div>`;
  }

  const social=document.getElementById('social');
  Object.entries(d.social).forEach(([k,v])=>{
    if(v){
      social.innerHTML+=`<a class="button secondary" href="${v}" target="_blank">${k}</a>`;
    }
  });

  const loc=document.getElementById('locations');
  d.locations.forEach(l=>{
    loc.innerHTML+=`<a class="card" href="${l.map}" target="_blank">📍 ${l.title}</a>`;
  });
});
