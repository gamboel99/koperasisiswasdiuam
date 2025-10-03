const API_URL = "https://script.google.com/macros/s/AKfycbxiddwkJJ_qUX3OryOKzO1vknJSqp2KJMv1VaqXf-casL2D0sbNlbzmhdXJKmXPTTRl/exec";

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
  })
  .catch(err => alert("Gagal simpan: " + err));
});
