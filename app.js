
fetch('company.json').then(r=>r.json()).then(d=>{
document.getElementById('companyName').textContent=d.companyName;
document.getElementById('tagline').textContent=d.tagline;
const s=document.getElementById('sales');
d.salesNumbers.forEach(n=>s.innerHTML+=`<li><a href="tel:${n}">${n}</a></li>`);
const f=document.getElementById('factory');
d.factoryNumbers.forEach(n=>f.innerHTML+=`<li><a href="tel:${n}">${n}</a></li>`);
const wa=d.socialLinks.find(x=>x.icon==='whatsapp')?.url||'';
if(wa)QR.draw(document.getElementById('qr'),wa);
});
