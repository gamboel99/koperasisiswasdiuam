const API_URL = https://script.google.com/macros/s/AKfycbxiddwkJJ_qUX3OryOKzO1vknJSqp2KJMv1VaqXf-casL2D0sbNlbzmhdXJKmXPTTRl/exec;

// Load produk ke dropdown
fetch(API_URL + "?action=getProduk")
  .then(res => res.json())
  .then(data => {
    let select = document.getElementById("barangSelect");
    for (let i = 1; i < data.length; i++) {
      let opt = document.createElement("option");
      opt.value = data[i][0]; // Kode Barang
      opt.dataset.nama = data[i][1];
      opt.dataset.harga = data[i][3]; // Harga Jual
      opt.textContent = data[i][0] + " - " + data[i][1];
      select.appendChild(opt);
    }
  });

// Hitung harga otomatis
document.getElementById("barangSelect").addEventListener("change", function() {
  let harga = this.selectedOptions[0].dataset.harga;
  document.getElementById("harga").value = harga;
  hitungTotal();
});

document.getElementById("jumlah").addEventListener("input", hitungTotal);

function hitungTotal() {
  let harga = parseInt(document.getElementById("harga").value) || 0;
  let jumlah = parseInt(document.getElementById("jumlah").value) || 0;
  document.getElementById("total").value = harga * jumlah;
}

// Simpan transaksi ke Google Sheet
document.getElementById("jualForm").addEventListener("submit", function(e){
  e.preventDefault();
  let formData = new FormData();
  formData.append("action","addTransaksi");
  formData.append("KodeBarang", document.getElementById("barangSelect").value);
  formData.append("NamaBarang", document.getElementById("barangSelect").selectedOptions[0].dataset.nama);
  formData.append("Jumlah", document.getElementById("jumlah").value);
  formData.append("Harga", document.getElementById("harga").value);
  formData.append("Total", document.getElementById("total").value);

  fetch(API_URL, {method:"POST", body:formData})
    .then(res => res.text())
    .then(txt => {
      alert("Transaksi berhasil disimpan!");
      loadLaporan();
      document.getElementById("jualForm").reset();
      document.getElementById("harga").value = "";
      document.getElementById("total").value = "";
    });
});

// Load laporan transaksi
function loadLaporan() {
  fetch(API_URL + "?action=getTransaksi")
    .then(res => res.json())
    .then(data => {
      let tbody = document.querySelector("#laporanTable tbody");
      tbody.innerHTML = "";
      for (let i = 1; i < data.length; i++) {
        let row = `<tr>
          <td>${data[i][0]}</td>
          <td>${data[i][1]}</td>
          <td>${data[i][2]}</td>
          <td>${data[i][3]}</td>
          <td>${data[i][4]}</td>
        </tr>`;
        tbody.innerHTML += row;
      }
    });
}

loadLaporan();
