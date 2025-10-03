const API_URL = "https://script.google.com/macros/s/AKfycbxiddwkJJ_qUX3OryOKzO1vknJSqp2KJMv1VaqXf-casL2D0sbNlbzmhdXJKmXPTTRl/exec";

// ✅ Simpan Produk Baru
document.getElementById("stokForm").addEventListener("submit", function(e) {
  e.preventDefault();

  let formData = new FormData();
  formData.append("action", "addProduk");
  formData.append("KodeBarang", document.getElementById("kode").value);
  formData.append("NamaBarang", document.getElementById("nama").value);
  formData.append("HargaKulak", document.getElementById("hargaKulak").value);
  formData.append("HargaJual", document.getElementById("hargaJual").value);
  formData.append("Stok", document.getElementById("stok").value);

  fetch(API_URL, {
    method: "POST",
    body: formData
  })
  .then(res => res.text())
  .then(txt => {
    alert("Produk berhasil disimpan ke Google Sheet!");
    document.getElementById("stokForm").reset();
    loadProduk(); // refresh daftar produk
  })
  .catch(err => alert("Gagal simpan: " + err));
});

// ✅ Load Produk dari Google Sheet
function loadProduk() {
  fetch(API_URL + "?action=getProduk")
    .then(res => res.json())
    .then(data => {
      let html = "<table border='1' cellpadding='6'><tr><th>Kode</th><th>Nama</th><th>Harga Kulak</th><th>Harga Jual</th><th>Stok</th></tr>";
      for (let i = 1; i < data.length; i++) {
        html += `<tr>
          <td>${data[i][0]}</td>
          <td>${data[i][1]}</td>
          <td>${data[i][2]}</td>
          <td>${data[i][3]}</td>
          <td>${data[i][4]}</td>
        </tr>`;
      }
      html += "</table>";
      document.getElementById("produkList").innerHTML = html;
    })
    .catch(err => {
      document.getElementById("produkList").innerHTML = "Gagal memuat produk: " + err;
    });
}

// Load awal
loadProduk();
