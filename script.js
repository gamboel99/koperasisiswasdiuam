function loadProduk() {
  let data = JSON.parse(localStorage.getItem("produk")) || [];
  let tbody = document.querySelector("#tabel-produk tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  data.forEach(p => {
    let tr = document.createElement("tr");
    tr.innerHTML = `<td>${p.kode}</td><td>${p.nama}</td><td>${p.hkulak}</td><td>${p.hjual}</td><td>${p.stok}</td>`;
    tbody.appendChild(tr);
  });
}
document.getElementById("form-produk")?.addEventListener("submit", e => {
  e.preventDefault();
  let data = JSON.parse(localStorage.getItem("produk")) || [];
  data.push({
    kode: kode.value,
    nama: nama.value,
    hkulak: hkulak.value,
    hjual: hjual.value,
    stok: stok.value
  });
  localStorage.setItem("produk", JSON.stringify(data));
  loadProduk();
  e.target.reset();
});
window.onload = () => { loadProduk(); loadProdukKasir(); loadTransaksi(); };

function loadProdukKasir() {
  let select = document.getElementById("produk");
  if (!select) return;
  let data = JSON.parse(localStorage.getItem("produk")) || [];
  select.innerHTML = "";
  data.forEach(p => {
    let opt = document.createElement("option");
    opt.value = JSON.stringify(p);
    opt.textContent = `${p.kode} - ${p.nama}`;
    select.appendChild(opt);
  });
}

document.getElementById("form-transaksi")?.addEventListener("submit", e => {
  e.preventDefault();
  let produk = JSON.parse(document.getElementById("produk").value);
  let jumlah = parseInt(document.getElementById("jumlah").value);
  let total = jumlah * parseInt(produk.hjual);
  let transaksi = {
    tanggal: new Date().toLocaleString(),
    kode: produk.kode,
    nama: produk.nama,
    jumlah: jumlah,
    total: total,
    kasir: kasir.value
  };
  let data = JSON.parse(localStorage.getItem("transaksi")) || [];
  data.push(transaksi);
  localStorage.setItem("transaksi", JSON.stringify(data));
  loadTransaksi();
  e.target.reset();
});

function loadTransaksi() {
  let tbody = document.querySelector("#tabel-transaksi tbody");
  if (!tbody) return;
  let data = JSON.parse(localStorage.getItem("transaksi")) || [];
  tbody.innerHTML = "";
  data.forEach(t => {
    let tr = document.createElement("tr");
    tr.innerHTML = `<td>${t.tanggal}</td><td>${t.kode}</td><td>${t.nama}</td><td>${t.jumlah}</td><td>${t.total}</td><td>${t.kasir}</td>`;
    tbody.appendChild(tr);
  });
}

// EXPORT FUNCTIONS
function exportWord(type) {
  let header = "Koperasi SDI Ulumiyah Al-Makruf\n";
  header += (type === "stok" ? "Laporan Stok\n" : "Laporan Penjualan\n");
  header += "Dicetak pada: " + new Date().toLocaleDateString("id-ID") + "\n\n";

  let docContent = header;
  if (type === "stok") {
    let data = JSON.parse(localStorage.getItem("produk")) || [];
    docContent += "Kode\tNama\tHarga Kulak\tHarga Jual\tStok\n";
    data.forEach(p => {
      docContent += `${p.kode}\t${p.nama}\t${p.hkulak}\t${p.hjual}\t${p.stok}\n`;
    });
  } else {
    let data = JSON.parse(localStorage.getItem("transaksi")) || [];
    docContent += "Tanggal\tKode\tNama\tJumlah\tTotal\tKasir\n";
    data.forEach(t => {
      docContent += `${t.tanggal}\t${t.kode}\t${t.nama}\t${t.jumlah}\t${t.total}\t${t.kasir}\n`;
    });
  }
  let blob = new Blob([docContent], {type: "application/msword"});
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laporan_${type}.doc`;
  link.click();
}

function exportExcel(type) {
  let header = "Koperasi SDI Ulumiyah Al-Makruf\n";
  header += (type === "stok" ? "Laporan Stok\n" : "Laporan Penjualan\n");
  header += "Dicetak pada: " + new Date().toLocaleDateString("id-ID") + "\n\n";

  let data, columns;
  if (type === "stok") {
    data = JSON.parse(localStorage.getItem("produk")) || [];
    columns = ["kode","nama","hkulak","hjual","stok"];
  } else {
    data = JSON.parse(localStorage.getItem("transaksi")) || [];
    columns = ["tanggal","kode","nama","jumlah","total","kasir"];
  }
  let csv = header;
  csv += columns.join(",") + "\n";
  data.forEach(row => {
    csv += columns.map(c => row[c]).join(",") + "\n";
  });
  let blob = new Blob([csv], {type: "application/vnd.ms-excel"});
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laporan_${type}.xls`;
  link.click();
}
