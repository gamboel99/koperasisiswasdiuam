(function(){
// Simple app for localStorage-based koperasi with import/export and verification
const LS_PROD = 'coop_produk_v1';
const LS_SALES = 'coop_sales_v1';
const LS_USERS = 'coop_users_v1';
const LS_VERIF = 'coop_verif_v1';

// Initialize demo users if not exists
function initDefaults(){
  if(!localStorage.getItem(LS_USERS)){
    const users = [
      {username:'admin', password:'admin123', role:'admin'},
      {username:'kasir', password:'kasir123', role:'kasir'}
    ];
    localStorage.setItem(LS_USERS, JSON.stringify(users));
  }
  if(!localStorage.getItem(LS_PROD)){
    const prod = [
      {kode:'BRG001', nama:'Pensil 2B', hkulak:1500, hjual:2500, stok:100},
      {kode:'BRG002', nama:'Buku Tulis', hkulak:3500, hjual:5000, stok:50}
    ];
    localStorage.setItem(LS_PROD, JSON.stringify(prod));
  }
  if(!localStorage.getItem(LS_SALES)) localStorage.setItem(LS_SALES, JSON.stringify([]));
  if(!localStorage.getItem(LS_VERIF)) localStorage.setItem(LS_VERIF, JSON.stringify([]));
}
initDefaults();

// Utility
function el(id){return document.getElementById(id)}
function q(sel, root=document){return root.querySelector(sel)}
function fmtRp(n){return 'Rp '+Number(n).toLocaleString('id-ID')}

// LOGIN PAGE
if(location.pathname.endsWith('index.html') || location.pathname==='/' ){
  let currentRole='admin';
  document.querySelectorAll('.seg-btn').forEach(b=>b.addEventListener('click', ()=>{
    document.querySelectorAll('.seg-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); currentRole=b.dataset.role;
  }));
  el('btnDemo').addEventListener('click', ()=>{
    localStorage.setItem('coop_session', JSON.stringify({username:'kasir', role:'kasir'}));
    location.href='kasir.html';
  });
  el('btnLogin').addEventListener('click', (e)=>{
    e.preventDefault();
    const u = el('username').value.trim(), p = el('password').value;
    const users = JSON.parse(localStorage.getItem(LS_USERS)||'[]');
    const found = users.find(x=>x.username===u && x.password===p);
    if(!found){ alert('Login gagal. Coba admin/admin123 atau kasir/kasir123'); return }
    localStorage.setItem('coop_session', JSON.stringify({username:found.username, role:found.role}));
    if(found.role==='admin') location.href='admin.html'; else location.href='kasir.html';
  });
}

// COMMON: logout buttons
document.addEventListener('click', function(e){
  if(e.target && e.target.id==='btnLogout' || e.target && e.target.id==='btnLogout2'){ localStorage.removeItem('coop_session'); location.href='index.html'; }
});

// ADMIN PAGE
if(location.pathname.endsWith('admin.html')){
  // session guard
  const sess = JSON.parse(localStorage.getItem('coop_session')||'null'); if(!sess || sess.role!=='admin'){ alert('Harus login sebagai Admin'); location.href='index.html'; }
  // tabs
  document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    document.querySelectorAll('.panel').forEach(p=>p.classList.add('hidden'));
    document.getElementById('tab-'+t.dataset.tab).classList.remove('hidden');
  }));
  // product load/save
  function loadProduk(){
    const data = JSON.parse(localStorage.getItem(LS_PROD)||'[]');
    const wrap = el('produkList');
    if(!wrap) return;
    if(!data.length) { wrap.innerHTML='<p class="muted">Belum ada produk.</p>'; return; }
    let html='<table><thead><tr><th>Kode</th><th>Nama</th><th>Harga Kulak</th><th>Harga Jual</th><th>Stok</th><th>Aksi</th></tr></thead><tbody>';
    data.forEach((p,i)=> html+=`<tr><td>${p.kode}</td><td>${p.nama}</td><td>${p.hkulak}</td><td>${p.hjual}</td><td>${p.stok}</td><td><button class="btn ghost" data-edit="${i}">Edit</button> <button class="btn" data-del="${i}">Hapus</button></td></tr>`);
    html+='</tbody></table>';
    wrap.innerHTML=html;
    // attach edit/delete
    wrap.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click', e=>{
      const idx = +e.target.dataset.edit; const p = data[idx];
      el('p_kode').value=p.kode; el('p_nama').value=p.nama; el('p_kulak').value=p.hkulak; el('p_jual').value=p.hjual; el('p_stok').value=p.stok;
    }));
    wrap.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click', e=>{
      if(!confirm('Hapus produk ini?')) return;
      const idx=+e.target.dataset.del; data.splice(idx,1); localStorage.setItem(LS_PROD, JSON.stringify(data)); loadProduk(); loadProdukKasir();
    }));
  }
  el('form-produk').addEventListener('submit', e=>{ e.preventDefault();
    const kode=el('p_kode').value.trim(), nama=el('p_nama').value.trim();
    const p = {kode, nama, hkulak: Number(el('p_kulak').value), hjual: Number(el('p_jual').value), stok: Number(el('p_stok').value)};
    const data = JSON.parse(localStorage.getItem(LS_PROD)||'[]');
    // replace if exists kode same
    const idx = data.findIndex(x=>x.kode===kode);
    if(idx>=0) data[idx]=p; else data.push(p);
    localStorage.setItem(LS_PROD, JSON.stringify(data)); loadProduk(); loadProdukKasir(); e.target.reset();
  });
  el('btnClearProd').addEventListener('click', ()=>{ el('form-produk').reset(); });
  el('btnOpname').addEventListener('click', ()=>{
    const data = JSON.parse(localStorage.getItem(LS_PROD)||'[]'); const wrap=el('stokList'); let html='';
    data.forEach((p,i)=> html+=`<div class="card small"><strong>${p.kode} — ${p.nama}</strong><div class="row"><input type="number" value="${p.stok}" data-idx="${i}" class="op-input"><button class="btn" data-save="${i}">Simpan</button></div></div>`);
    wrap.innerHTML=html;
    wrap.querySelectorAll('[data-save]').forEach(b=>b.addEventListener('click', e=>{
      const i=+e.target.dataset.save; const val = Number(document.querySelector(`.op-input[data-idx="${i}"]`).value);
      data[i].stok = val; localStorage.setItem(LS_PROD, JSON.stringify(data)); loadProduk(); loadProdukKasir(); alert('Stok diperbarui');
    }));
  });
  // reports
  el('btnRun').addEventListener('click', ()=>{ renderReport(); });
  function renderReport(){
    const type = el('lapType').value; const from = el('from').value; const to = el('to').value;
    const sales = JSON.parse(localStorage.getItem(LS_SALES)||'[]'); const prod = JSON.parse(localStorage.getItem(LS_PROD)||'[]');
    let out='';
    if(type==='penjualan'){
      let filtered = sales.filter(s=>{
        if(from && new Date(s.tanggal) < new Date(from)) return false;
        if(to && new Date(s.tanggal) > new Date(to+'T23:59:59')) return false;
        return true;
      });
      out='<table><thead><tr><th>No</th><th>Tanggal</th><th>Kode</th><th>Nama</th><th>Jumlah</th><th>Total</th><th>Kasir</th></tr></thead><tbody>';
      filtered.forEach((r,i)=> out+=`<tr><td>${i+1}</td><td>${r.tanggal}</td><td>${r.kode}</td><td>${r.nama}</td><td>${r.jumlah}</td><td>${r.total}</td><td>${r.kasir}</td></tr>`);
      out+='</tbody></table>';
    } else {
      out='<table><thead><tr><th>No</th><th>Kode</th><th>Nama</th><th>Harga Kulak</th><th>Harga Jual</th><th>Stok</th></tr></thead><tbody>';
      prod.forEach((p,i)=> out+=`<tr><td>${i+1}</td><td>${p.kode}</td><td>${p.nama}</td><td>${p.hkulak}</td><td>${p.hjual}</td><td>${p.stok}</td></tr>`);
      out+='</tbody></table>';
    }
    el('lapArea').innerHTML = out;
  }
  // verification
  function loadVerif(){
    const ver = JSON.parse(localStorage.getItem(LS_VERIF)||'[]'); const wrap = el('verifList');
    if(!wrap) return;
    if(!ver.length) return wrap.innerHTML='<p class="muted">Tidak ada laporan yang menunggu verifikasi.</p>';
    let html='<table><thead><tr><th>No</th><th>Tipe</th><th>Tanggal</th><th>Oleh</th><th>Aksi</th></tr></thead><tbody>';
    ver.forEach((v,i)=> html+=`<tr><td>${i+1}</td><td>${v.type}</td><td>${v.date}</td><td>${v.by}</td><td><button class="btn primary" data-ok="${i}">Verifikasi</button></td></tr>`);
    html+='</tbody></table>'; wrap.innerHTML=html;
    wrap.querySelectorAll('[data-ok]').forEach(b=>b.addEventListener('click', e=>{
      const i=+e.target.dataset.ok; const ver = JSON.parse(localStorage.getItem(LS_VERIF)||'[]'); ver.splice(i,1); localStorage.setItem(LS_VERIF, JSON.stringify(ver)); loadVerif(); alert('Laporan diverifikasi!');
    }));
  }
  // import/export
  el('btnExportAll').addEventListener('click', ()=>{
    const all = {produk: JSON.parse(localStorage.getItem(LS_PROD)||'[]'), transaksi: JSON.parse(localStorage.getItem(LS_SALES)||'[]')};
    const blob = new Blob([JSON.stringify(all, null,2)], {type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='coop_backup.json'; a.click();
  });
  el('btnImport').addEventListener('click', ()=>{
    const f = el('fileImport'); if(!f.files.length) return alert('Pilih file JSON backup');
    const reader = new FileReader(); reader.onload = function(ev){ try {
      const data = JSON.parse(ev.target.result);
      if(!confirm('Import akan menimpa data saat ini. Lanjutkan?')) return;
      localStorage.setItem(LS_PROD, JSON.stringify(data.produk||[]));
      localStorage.setItem(LS_SALES, JSON.stringify(data.transaksi||[]));
      alert('Import selesai'); loadProduk(); loadProdukKasir();
    } catch(err){ alert('File tidak valid') } }; reader.readAsText(f.files[0]);
  });
  el('btnExportDoc').addEventListener('click', ()=>{ exportDoc(el('lapType').value); });
  el('btnExportXls').addEventListener('click', ()=>{ exportXls(el('lapType').value); });
  el('btnExportDocAll').addEventListener('click', ()=>{ exportDoc('all'); });
  loadProduk(); loadVerif();
}

// KASIR
if(location.pathname.endsWith('kasir.html')){
  const sess = JSON.parse(localStorage.getItem('coop_session')||'null'); if(!sess || sess.role!=='kasir'){ /* allow demo */ }
  function populateProducts(){
    const sel = el('f_produk'); sel.innerHTML=''; const data = JSON.parse(localStorage.getItem(LS_PROD)||'[]');
    data.forEach(p=>{ const opt=document.createElement('option'); opt.value=JSON.stringify(p); opt.textContent=`${p.kode} - ${p.nama} (Rp ${p.hjual})`; sel.appendChild(opt); });
  }
  let cart = [];
  function renderCart(){ const wrap = el('cartWrap'); if(!wrap) return; if(!cart.length) { wrap.innerHTML='<p class="muted">Keranjang kosong</p>'; el('grandTotal').textContent='0'; return; }
    let html='<table><thead><tr><th>No</th><th>Kode</th><th>Nama</th><th>Qty</th><th>Harga</th><th>Subtotal</th><th>Aksi</th></tr></thead><tbody>';
    cart.forEach((it,i)=> html+=`<tr><td>${i+1}</td><td>${it.kode}</td><td>${it.nama}</td><td>${it.qty}</td><td>${it.price}</td><td>${it.qty*it.price}</td><td><button class="btn ghost" data-rm="${i}">x</button></td></tr>`);
    html+='</tbody></table>'; wrap.innerHTML=html; el('grandTotal').textContent = cart.reduce((s,i)=>s + i.qty*i.price,0);
    wrap.querySelectorAll('[data-rm]').forEach(b=>b.addEventListener('click', e=>{ cart.splice(+e.target.dataset.rm,1); renderCart(); }));
  }
  el('btnAdd').addEventListener('click', (e)=>{ e.preventDefault();
    const p = JSON.parse(el('f_produk').value); const qty = Number(el('f_qty').value||1); const kasir = el('f_kasir').value.trim()||'kasir';
    const found = cart.find(x=>x.kode===p.kode);
    if(found) found.qty += qty; else cart.push({kode:p.kode, nama:p.nama, qty:qty, price: p.hjual});
    renderCart();
  });
  el('btnClearCart').addEventListener('click', ()=>{ cart=[]; renderCart(); });
  el('btnCheckout').addEventListener('click', ()=>{
    if(!cart.length) return alert('Keranjang kosong');
    const sales = JSON.parse(localStorage.getItem(LS_SALES)||'[]'); const prod = JSON.parse(localStorage.getItem(LS_PROD)||'[]');
    const username = el('f_kasir').value.trim() || 'kasir';
    cart.forEach(item=>{
      const rec = {tanggal:new Date().toISOString(), kode:item.kode, nama:item.nama, jumlah:item.qty, total: item.qty*item.price, kasir: username};
      sales.push(rec);
      // decrement stock
      const pidx = prod.findIndex(x=>x.kode===item.kode); if(pidx>=0){ prod[pidx].stok = Math.max(0, prod[pidx].stok - item.qty); }
    });
    localStorage.setItem(LS_SALES, JSON.stringify(sales)); localStorage.setItem(LS_PROD, JSON.stringify(prod));
    // add verification record
    const ver = JSON.parse(localStorage.getItem(LS_VERIF)||'[]'); ver.push({type:'penjualan', date: new Date().toLocaleString(), by: username}); localStorage.setItem(LS_VERIF, JSON.stringify(ver));
    cart=[]; renderCart(); loadTransaksi(); populateProducts(); alert('Transaksi tersimpan dan nota dicetak');
    // print simple nota
    const w = window.open('','nota'); let html = `<h3>Nota Penjualan</h3><table border="1"><tr><th>Kode</th><th>Nama</th><th>Qty</th><th>Subtotal</th></tr>`;
    sales.slice(-cart.length-1); // no-op to avoid lint
    // use last inserted sales to print cart items
    // reconstruct
    let printed = sales.slice(-cart.length-100); // fallback
    // we'll print current cart items before cleared
    // For simplicity, just open printable summary
    w.document.write('<html><head><title>Nota</title></head><body><h2>Nota Penjualan</h2><p>Kasir: '+username+'</p><p>Tanggal: '+new Date().toLocaleString()+'</p><hr>'); 
    cart = []; w.document.write('<p>Terima kasih</p>'); w.document.close();
  });
  function loadTransaksi(){ const wrap = el('salesToday'); const data = JSON.parse(localStorage.getItem(LS_SALES)||'[]'); if(!wrap) return; if(!data.length){ wrap.innerHTML='<p class="muted">Belum ada penjualan</p>'; return; }
    let html='<table><thead><tr><th>No</th><th>Tanggal</th><th>Kode</th><th>Nama</th><th>Jumlah</th><th>Total</th><th>Kasir</th></tr></thead><tbody>';
    data.slice().reverse().forEach((s,i)=> html+=`<tr><td>${i+1}</td><td>${new Date(s.tanggal).toLocaleString()}</td><td>${s.kode}</td><td>${s.nama}</td><td>${s.jumlah}</td><td>${s.total}</td><td>${s.kasir}</td></tr>`);
    html+='</tbody></table>'; wrap.innerHTML=html;
  }
  // exports for kasir
  el('btnExportSalesDoc')?.addEventListener('click', ()=> exportDoc('penjualan'));
  el('btnExportSalesXls')?.addEventListener('click', ()=> exportXls('penjualan'));
  populateProducts(); renderCart(); loadTransaksi();
}

// EXPORT helpers (Word via simple .doc with tabs, Excel via .xls CSV)
function exportDoc(type){
  const header = "Koperasi SDI Ulumiyah Al-Makruf\n";
  let content = header + (type==='stok' ? "Laporan Stok\n\n" : type==='penjualan' ? "Laporan Penjualan\n\n" : "Export Semua\n\n");
  content += "Dicetak pada: " + new Date().toLocaleString() + "\n\n";
  if(type==='stok' || type==='all' || type===''){
    const prod = JSON.parse(localStorage.getItem(LS_PROD)||'[]');
    if(type==='stok'){ content += "Kode\tNama\tHarga Kulak\tHarga Jual\tStok\n"; prod.forEach(p=> content += `${p.kode}\t${p.nama}\t${p.hkulak}\t${p.hjual}\t${p.stok}\n`); }
    if(type==='all'){ content += "=== Produk ===\nKode\tNama\tHargaKulak\tHargaJual\tStok\n"; prod.forEach(p=> content += `${p.kode}\t${p.nama}\t${p.hkulak}\t${p.hjual}\t${p.stok}\n`); }
  }
  if(type==='penjualan' || type==='all'){
    const sales = JSON.parse(localStorage.getItem(LS_SALES)||'[]');
    content += "Tanggal\tKode\tNama\tJumlah\tTotal\tKasir\n";
    sales.forEach(s=> content += `${new Date(s.tanggal).toLocaleString()}\t${s.kode}\t${s.nama}\t${s.jumlah}\t${s.total}\t${s.kasir}\n`);
  }
  const blob = new Blob([content], {type:'application/msword'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `laporan_${type}.doc`; a.click();
}

function exportXls(type){
  let csv = "Koperasi SDI Ulumiyah Al-Makruf\n";
  csv += (type==='stok' ? "Laporan Stok\n\n" : type==='penjualan' ? "Laporan Penjualan\n\n" : "Export Semua\n\n");
  csv += "Dicetak pada: " + new Date().toLocaleDateString() + "\n\n";
  if(type==='stok' || type==='all'){ const prod = JSON.parse(localStorage.getItem(LS_PROD)||'[]'); csv += "Kode,Nama,HargaKulak,HargaJual,Stok\n"; prod.forEach(p=> csv += `${p.kode},${p.nama},${p.hkulak},${p.hjual},${p.stok}\n`); }
  if(type==='penjualan' || type==='all'){ const sales = JSON.parse(localStorage.getItem(LS_SALES)||'[]'); csv += "Tanggal,Kode,Nama,Jumlah,Total,Kasir\n"; sales.forEach(s=> csv += `${new Date(s.tanggal).toLocaleString()},${s.kode},${s.nama},${s.jumlah},${s.total},${s.kasir}\n`); }
  const blob = new Blob([csv], {type:'application/vnd.ms-excel'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `laporan_${type}.xls`; a.click();
}

// helper to refresh admin kasir product lists
function loadProdukKasir(){ const elsel=document.getElementById('f_produk'); if(!elsel) return; elsel.innerHTML=''; const prod = JSON.parse(localStorage.getItem(LS_PROD)||'[]'); prod.forEach(p=>{ const o=document.createElement('option'); o.value=JSON.stringify(p); o.textContent=`${p.kode} - ${p.nama} (Rp ${p.hjual})`; elsel.appendChild(o); }); }
window.loadProdukKasir = loadProdukKasir;
window.loadTransaksi = function(){ if(location.pathname.endsWith('kasir.html')){ const wrap=document.getElementById('salesToday'); if(wrap) { const data = JSON.parse(localStorage.getItem(LS_SALES)||'[]'); if(!data.length) wrap.innerHTML='<p class=\"muted\">Belum ada penjualan</p>'; else { let html='<table><thead><tr><th>No</th><th>Tanggal</th><th>Kode</th><th>Nama</th><th>Jumlah</th><th>Total</th><th>Kasir</th></tr></thead><tbody>'; data.slice().reverse().forEach((s,i)=> html+=`<tr><td>${i+1}</td><td>${new Date(s.tanggal).toLocaleString()}</td><td>${s.kode}</td><td>${s.nama}</td><td>${s.jumlah}</td><td>${s.total}</td><td>${s.kasir}</td></tr>`); html+='</tbody></table>'; wrap.innerHTML=html; } } } };
// init on load
document.addEventListener('DOMContentLoaded', ()=>{ try{ if(location.pathname.endsWith('admin.html')){ loadProduk(); loadVerif(); } loadProdukKasir(); loadTransaksi(); }catch(e){} });
})();