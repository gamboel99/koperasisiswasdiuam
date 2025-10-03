function loadPage(page) {
  let content = document.getElementById('content');

  if (page === 'stok') {
    content.innerHTML = `
      <h2>Input Stok Barang</h2>
      <form id="stokForm">
        <label>Kode Barang:</label><br>
        <input type="text" id="kode" required><br>
        <label>Nama Barang:</label><br>
        <input type="text" id="nama" required><br>
        <label>Harga Kulak:</label><br>
        <input type="number" id="kulak" required><br>
        <label>Harga Jual:</label><br>
        <input type="number" id="jual" required><br>
        <label>Stok Awal:</label><br>
        <input type="number" id="stok" required><br>
        <button type="submit">Simpan</button>
      </form>

      <h2>Daftar Produk</h2>
      <table border="1" width="100%" id="produkTable">
        <thead>
          <tr>
            <th>Kode</th><th>Nama</th><th>Kulak</th><th>Jual</th><th>Stok</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;

    // Load data produk
    fetch(API_URL + "?action=getProduk")
      .then(res => res.json())
      .then(data => {
        let tbody = document.querySelector("#produkTable tbody");
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

    // Form submit ke Google Sheet
    document.getElementById("stokForm").addEventListener("submit", function(e){
      e.preventDefault();
      let formData = new FormData();
      formData.append("action","addProduk");
      formData.append("KodeBarang", document.getElementById("kode").value);
      formData.append("NamaBarang", document.getElementById("nama").value);
      formData.append("HargaKulak", document.getElementById("kulak").value);
      formData.append("HargaJual", document.getElementById("jual").value);
      formData.append("Stok", document.getElementById("stok").value);

      fetch(API_URL, {method:"POST", body:formData})
        .then(res => res.text())
        .then(txt => {
          alert("Produk berhasil disimpan!");
          loadPage('stok'); // reload tabel
        });
    });
  }

  if (page === 'laporan') {
    content.innerHTML = `
      <h2>Laporan Penjualan</h2>
      <p>https://script.google.com/macros/s/AKfycbxiddwkJJ_qUX3OryOKzO1vknJSqp2KJMv1VaqXf-casL2D0sbNlbzmhdXJKmXPTTRl/exec;</p>
    `;
  }
}
