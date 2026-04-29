// =========================================================
// script.js - Logika DOM untuk Aplikasi SITTA
// =========================================================

/* ============== UTILITIES ============== */
function formatTanggal(tgl) {
  const bulan = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const d = new Date(tgl);
  if (isNaN(d.getTime())) return tgl;
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

function persenStatus(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("selesai") || s.includes("diterima")) return 100;
  if (s.includes("dikirim") || s.includes("antar")) return 80;
  if (s.includes("dalam perjalanan") || s.includes("transit")) return 55;
  if (s.includes("proses") || s.includes("packing")) return 25;
  return 10;
}

function statusFromPerjalanan(perjalanan, statusAwal) {
  const last = perjalanan[perjalanan.length - 1];
  if (last && last.keterangan.toLowerCase().includes("selesai antar")) return 100;
  return persenStatus(statusAwal);
}

/* ============== TOAST ============== */
function showToast(pesan, tipe = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${tipe}`;
  toast.innerHTML = `
    <span class="toast-icon">${tipe === "error" ? "⚠" : tipe === "success" ? "✓" : "ℹ"}</span>
    <span class="toast-msg">${pesan}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ============== ALERT KUSTOM ============== */
function showAlert(pesan, opsi = {}) {
  const tipe = opsi.tipe || "error";
  const judul = opsi.judul || (tipe === "error" ? "Peringatan" : tipe === "success" ? "Berhasil" : "Informasi");
  const ikon = tipe === "error" ? "⚠" : tipe === "success" ? "✓" : "ℹ";

  const old = document.getElementById("dialogKustom");
  if (old) old.remove();

  const dialog = document.createElement("div");
  dialog.id = "dialogKustom";
  dialog.className = "modal active dialog-kustom";
  dialog.innerHTML = `
    <div class="modal-content dialog-card">
      <div class="dialog-ikon dialog-${tipe}">${ikon}</div>
      <h3 class="dialog-judul">${judul}</h3>
      <p class="dialog-pesan">${pesan}</p>
      <div class="dialog-actions">
        <button type="button" class="btn btn-primary" id="dialogOK">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);
  setTimeout(() => dialog.classList.add("show"), 10);
  document.getElementById("dialogOK").addEventListener("click", () => {
    dialog.classList.remove("show");
    setTimeout(() => dialog.remove(), 200);
  });
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      dialog.classList.remove("show");
      setTimeout(() => dialog.remove(), 200);
    }
  });
}

/* ============== CONFIRM KUSTOM ============== */
function showConfirm(pesan, opsi = {}) {
  return new Promise((resolve) => {
    const judul = opsi.judul || "Konfirmasi";
    const tipe = opsi.tipe || "warning";
    const labelOK = opsi.labelOK || "Ya, Lanjutkan";
    const labelBatal = opsi.labelBatal || "Batal";
    const ikon = tipe === "danger" ? "⚠" : tipe === "warning" ? "?" : "ℹ";

    const old = document.getElementById("dialogKustom");
    if (old) old.remove();

    const dialog = document.createElement("div");
    dialog.id = "dialogKustom";
    dialog.className = "modal active dialog-kustom";
    dialog.innerHTML = `
      <div class="modal-content dialog-card">
        <div class="dialog-ikon dialog-${tipe}">${ikon}</div>
        <h3 class="dialog-judul">${judul}</h3>
        <p class="dialog-pesan">${pesan}</p>
        <div class="dialog-actions">
          <button type="button" class="btn btn-outline" id="dialogBatal">${labelBatal}</button>
          <button type="button" class="btn btn-${tipe === 'danger' ? 'danger' : 'primary'}" id="dialogYa">${labelOK}</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
    setTimeout(() => dialog.classList.add("show"), 10);

    function tutup(hasil) {
      dialog.classList.remove("show");
      setTimeout(() => {
        dialog.remove();
        resolve(hasil);
      }, 200);
    }
    document.getElementById("dialogYa").addEventListener("click", () => tutup(true));
    document.getElementById("dialogBatal").addEventListener("click", () => tutup(false));
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) tutup(false);
    });
  });
}

/* ============== HELPER LOGOUT ============== */
async function lakukanLogout() {
  const ok = await showConfirm("Yakin ingin keluar dari aplikasi SITTA?", {
    judul: "Konfirmasi Keluar",
    labelOK: "Ya, Keluar",
    labelBatal: "Tetap di Sini",
    tipe: "warning"
  });
  if (ok) {
    sessionStorage.removeItem("userSITTA");
    window.location.href = "index.html";
  }
}

/* ============== HALAMAN LOGIN ============== */
function initLogin() {
  const formLogin = document.getElementById("formLogin");
  if (!formLogin) return;

  formLogin.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
      showToast("Email dan password tidak boleh kosong!", "error");
      return;
    }
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      showToast("Format email tidak valid!", "error");
      return;
    }

    const user = dataPengguna.find(u => u.email === email && u.password === password);
    if (user) {
      sessionStorage.setItem("userSITTA", JSON.stringify(user));
      showToast(`Selamat datang, ${user.nama}!`, "success");
      setTimeout(() => { window.location.href = "dashboard.html"; }, 1000);
    } else {
      showAlert("Email/password yang anda masukkan salah", {
        tipe: "error",
        judul: "Login Gagal"
      });
    }
  });

  const togglePass = document.getElementById("togglePassword");
  if (togglePass) {
    togglePass.addEventListener("click", function () {
      const pw = document.getElementById("password");
      if (pw.type === "password") {
        pw.type = "text";
        this.textContent = "🙈";
      } else {
        pw.type = "password";
        this.textContent = "👁";
      }
    });
  }

  const btnLupa = document.getElementById("btnLupa");
  const modalLupa = document.getElementById("modalLupa");
  const closeLupa = document.getElementById("closeLupa");
  if (btnLupa) btnLupa.onclick = () => modalLupa.classList.add("active");
  if (closeLupa) closeLupa.onclick = () => modalLupa.classList.remove("active");

  const formLupa = document.getElementById("formLupa");
  if (formLupa) {
    formLupa.addEventListener("submit", function (e) {
      e.preventDefault();
      const emailLupa = document.getElementById("emailLupa").value.trim();
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexEmail.test(emailLupa)) {
        showToast("Masukkan email yang valid!", "error");
        return;
      }
      modalLupa.classList.remove("active");
      showToast("Link reset password telah dikirim ke " + emailLupa, "success");
      formLupa.reset();
    });
  }

  const btnDaftar = document.getElementById("btnDaftar");
  const modalDaftar = document.getElementById("modalDaftar");
  const closeDaftar = document.getElementById("closeDaftar");
  if (btnDaftar) btnDaftar.onclick = () => modalDaftar.classList.add("active");
  if (closeDaftar) closeDaftar.onclick = () => modalDaftar.classList.remove("active");

  const formDaftar = document.getElementById("formDaftar");
  if (formDaftar) {
    formDaftar.addEventListener("submit", function (e) {
      e.preventDefault();
      const nama = document.getElementById("namaDaftar").value.trim();
      const emailD = document.getElementById("emailDaftar").value.trim();
      const passD = document.getElementById("passwordDaftar").value.trim();
      const confD = document.getElementById("confirmDaftar").value.trim();

      if (!nama || !emailD || !passD || !confD) {
        showToast("Semua kolom wajib diisi!", "error");
        return;
      }
      if (passD.length < 6) {
        showToast("Password minimal 6 karakter!", "error");
        return;
      }
      if (passD !== confD) {
        showToast("Konfirmasi password tidak cocok!", "error");
        return;
      }
      modalDaftar.classList.remove("active");
      showToast(`Pendaftaran berhasil! Silakan login, ${nama}.`, "success");
      formDaftar.reset();
    });
  }

  window.addEventListener("click", function (e) {
    if (e.target.classList && e.target.classList.contains("modal")) {
      e.target.classList.remove("active");
    }
  });
}

/* ============== HALAMAN DASHBOARD ============== */
function initDashboard() {
  const greetingEl = document.getElementById("greeting");
  if (!greetingEl) return;

  // Greeting berbasis waktu lokal
  const jam = new Date().getHours();
  let greeting, ikon;
  if (jam >= 4 && jam < 11) { greeting = "Selamat Pagi"; ikon = "☀"; }
  else if (jam >= 11 && jam < 15) { greeting = "Selamat Siang"; ikon = "🌤"; }
  else if (jam >= 15 && jam < 19) { greeting = "Selamat Sore"; ikon = "🌅"; }
  else { greeting = "Selamat Malam"; ikon = "🌙"; }
  greetingEl.innerHTML = `${ikon} ${greeting}`;

  // Nama user di hero
  const userData = sessionStorage.getItem("userSITTA");
  const userNameHero = document.getElementById("userNameHero");
  if (userData && userNameHero) {
    const u = JSON.parse(userData);
    userNameHero.textContent = u.nama.split(" ")[0]; // nama depan saja
  }

  // Jam berjalan (kompak: tanggal + jam HH:MM)
  const jamEl = document.getElementById("jamSekarang");
  if (jamEl) {
    function updateJam() {
      const now = new Date();
      const opt = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
      const tgl = now.toLocaleDateString("id-ID", opt);
      const j = now.toTimeString().split(" ")[0].substring(0, 5);
      jamEl.innerHTML = `<span class="jam-tgl">${tgl}</span><span class="jam-jam">${j}</span>`;
    }
    updateJam();
    setInterval(updateJam, 30000);
  }

  // Stat cards
  const totalStokEl = document.getElementById("totalStok");
  if (totalStokEl && typeof dataBahanAjar !== "undefined") {
    const totalStok = dataBahanAjar.reduce((sum, b) => sum + b.stok, 0);
    totalStokEl.textContent = totalStok.toLocaleString("id-ID");
  }
  const totalJudulEl = document.getElementById("totalJudul");
  if (totalJudulEl && typeof dataBahanAjar !== "undefined") {
    totalJudulEl.textContent = dataBahanAjar.length;
  }
  const totalDOEl = document.getElementById("totalDO");
  if (totalDOEl && typeof dataTracking !== "undefined") {
    totalDOEl.textContent = Object.keys(dataTracking).length;
  }
}

/* ============== NAVBAR (semua halaman selain login) ============== */
function initNavbar() {
  const userData = sessionStorage.getItem("userSITTA");
  let u = null;
  if (userData) u = JSON.parse(userData);

  // Isi info user di navbar desktop, mobile, dan sheet
  if (u) {
    const inisial = u.nama.charAt(0).toUpperCase();
    const isiTeks = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    isiTeks("userName", u.nama);
    isiTeks("userRole", `${u.role} · ${u.lokasi}`);
    isiTeks("navAvatar", inisial);
    isiTeks("navAvatarMobile", inisial);
    isiTeks("sheetUserName", u.nama);
    isiTeks("sheetUserRole", `${u.role} · ${u.lokasi}`);
    isiTeks("sheetAvatar", inisial);
  }

  // Dropdown laporan
  const btnLaporan = document.getElementById("btnLaporan");
  const dropdownLaporan = document.getElementById("dropdownLaporan");
  if (btnLaporan && dropdownLaporan && !btnLaporan.dataset.bound) {
    btnLaporan.dataset.bound = "1";
    btnLaporan.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownLaporan.classList.toggle("active");
    });
    document.addEventListener("click", function () {
      dropdownLaporan.classList.remove("active");
    });
  }

  // Logout (navbar desktop)
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout && !btnLogout.dataset.bound) {
    btnLogout.dataset.bound = "1";
    btnLogout.addEventListener("click", lakukanLogout);
  }

  // Mobile profile sheet
  const mobileAvatarBtn = document.getElementById("mobileAvatarBtn");
  const bottomNavAccount = document.getElementById("bottomNavAccount");
  const mobileSheet = document.getElementById("mobileSheet");
  const sheetCloseBtn = document.getElementById("sheetCloseBtn");
  const sheetLogoutBtn = document.getElementById("sheetLogoutBtn");

  function bukaSheet() { if (mobileSheet) mobileSheet.classList.add("active"); }
  function tutupSheet() { if (mobileSheet) mobileSheet.classList.remove("active"); }

  if (mobileAvatarBtn) mobileAvatarBtn.addEventListener("click", bukaSheet);
  if (bottomNavAccount) bottomNavAccount.addEventListener("click", bukaSheet);
  if (sheetCloseBtn) sheetCloseBtn.addEventListener("click", tutupSheet);
  if (sheetLogoutBtn) sheetLogoutBtn.addEventListener("click", () => {
    tutupSheet();
    setTimeout(lakukanLogout, 200);
  });
  if (mobileSheet) {
    mobileSheet.addEventListener("click", (e) => {
      if (e.target === mobileSheet) tutupSheet();
    });
  }
}

/* ============== HALAMAN TRACKING ============== */
function initTracking() {
  const formCari = document.getElementById("formCariDO");
  if (!formCari) return;

  formCari.addEventListener("submit", function (e) {
    e.preventDefault();
    const noDO = document.getElementById("inputNoDO").value.trim();
    const hasilArea = document.getElementById("hasilTracking");

    if (!noDO) {
      showToast("Nomor Delivery Order harus diisi!", "error");
      return;
    }

    const data = dataTracking[noDO];
    if (!data) {
      hasilArea.innerHTML = `
        <div class="empty-state">
          <div class="empty-ikon">🔍</div>
          <h3>Data Tidak Ditemukan</h3>
          <p>Nomor DO <strong>${noDO}</strong> tidak ada dalam sistem.</p>
          <p class="muted">Coba: 2023001234 atau 2023005678</p>
        </div>`;
      return;
    }

    const persen = statusFromPerjalanan(data.perjalanan, data.status);
    let statusBadgeKelas = "badge-pending";
    if (persen === 100) statusBadgeKelas = "badge-success";
    else if (persen >= 50) statusBadgeKelas = "badge-progress";

    const perjalananTerbalik = [...data.perjalanan].reverse();
    let timelineHTML = "";
    perjalananTerbalik.forEach((item, i) => {
      timelineHTML += `
        <li class="${i === 0 ? 'aktif' : ''}">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-ket">${item.keterangan}</div>
            <div class="timeline-tgl">${item.waktu}</div>
          </div>
        </li>`;
    });

    hasilArea.innerHTML = `
      <div class="card-tracking">
        <div class="tracking-header">
          <div>
            <h3>${data.nama}</h3>
            <p class="muted">No. DO: ${data.nomorDO}</p>
          </div>
          <div class="badge ${statusBadgeKelas}">${data.status}</div>
        </div>
        <div class="progress-wrap">
          <div class="progress-label">
            <span>Progress Pengiriman</span>
            <span><strong>${persen}%</strong></span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${persen}%"></div>
          </div>
        </div>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Ekspedisi</span>
            <span class="detail-value">${data.ekspedisi}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tanggal Kirim</span>
            <span class="detail-value">${formatTanggal(data.tanggalKirim)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Kode Paket</span>
            <span class="detail-value"><code>${data.paket}</code></span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Total Pembayaran</span>
            <span class="detail-value harga">${data.total}</span>
          </div>
        </div>
        <h4 class="section-title">Perjalanan Paket</h4>
        <ul class="timeline">${timelineHTML}</ul>
      </div>`;
    showToast("Data DO berhasil ditemukan", "success");
  });

  document.querySelectorAll(".chip-do").forEach(chip => {
    chip.addEventListener("click", function () {
      document.getElementById("inputNoDO").value = this.dataset.no;
      document.getElementById("formCariDO").requestSubmit();
    });
  });
}

/* ============== HALAMAN STOK BAHAN AJAR ============== */
let dataStok = [];

function renderTabelStok() {
  const tbody = document.getElementById("tbodyStok");
  if (!tbody) return;

  if (dataStok.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty-row">Belum ada data stok</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  dataStok.forEach((item, idx) => {
    const tr = document.createElement("tr");
    const stokClass = item.stok < 200 ? "stok-rendah" : item.stok < 400 ? "stok-sedang" : "stok-tinggi";
    const coverHTML = item.cover
      ? `<img src="${item.cover}" alt="Cover ${item.namaBarang}" class="cover-mini" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'cover-fallback',textContent:'📕'}))" />`
      : `<div class="cover-fallback">📕</div>`;
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td class="cover-cell">${coverHTML}</td>
      <td><code>${item.kodeLokasi}</code></td>
      <td><code>${item.kodeBarang}</code></td>
      <td class="nama-barang">${item.namaBarang}</td>
      <td><span class="tag-jenis">${item.jenisBarang}</span></td>
      <td class="text-center">${item.edisi}</td>
      <td class="text-right"><span class="badge-stok ${stokClass}">${item.stok}</span></td>
      <td class="text-center">
        <button class="btn-icon btn-edit" data-idx="${idx}" title="Edit">✎</button>
        <button class="btn-icon btn-hapus" data-idx="${idx}" title="Hapus">🗑</button>
      </td>`;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".btn-hapus").forEach(btn => {
    btn.addEventListener("click", async function () {
      const idx = parseInt(this.dataset.idx);
      const item = dataStok[idx];
      const ok = await showConfirm(
        `Apakah Anda yakin ingin menghapus bahan ajar "${item.namaBarang}" dari daftar stok?`,
        { judul: "Hapus Bahan Ajar", labelOK: "Ya, Hapus", labelBatal: "Batal", tipe: "danger" }
      );
      if (ok) {
        dataStok.splice(idx, 1);
        renderTabelStok();
        updateStatStok();
        showToast("Data stok berhasil dihapus", "success");
      }
    });
  });

  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", function () {
      const idx = parseInt(this.dataset.idx);
      bukaModalEdit(idx);
    });
  });
}

function updateStatStok() {
  const totalJudul = document.getElementById("statTotalJudul");
  const totalUnit = document.getElementById("statTotalUnit");
  const stokRendah = document.getElementById("statStokRendah");
  if (totalJudul) totalJudul.textContent = dataStok.length;
  if (totalUnit) totalUnit.textContent = dataStok.reduce((s, i) => s + i.stok, 0).toLocaleString("id-ID");
  if (stokRendah) stokRendah.textContent = dataStok.filter(i => i.stok < 200).length;
}

function bukaModalEdit(idx) {
  const item = dataStok[idx];
  document.getElementById("modalJudul").textContent = "Edit Bahan Ajar";
  document.getElementById("editIdx").value = idx;
  document.getElementById("inpKodeLokasi").value = item.kodeLokasi;
  document.getElementById("inpKodeBarang").value = item.kodeBarang;
  document.getElementById("inpNamaBarang").value = item.namaBarang;
  document.getElementById("inpJenisBarang").value = item.jenisBarang;
  document.getElementById("inpEdisi").value = item.edisi;
  document.getElementById("inpStok").value = item.stok;
  document.getElementById("inpCover").value = item.cover || "";
  document.getElementById("modalStok").classList.add("active");
}

function bukaModalTambah() {
  document.getElementById("modalJudul").textContent = "Tambah Bahan Ajar Baru";
  document.getElementById("formStok").reset();
  document.getElementById("editIdx").value = "";
  document.getElementById("modalStok").classList.add("active");
}

function initStok() {
  const tbodyStok = document.getElementById("tbodyStok");
  if (!tbodyStok) return;

  dataStok = JSON.parse(JSON.stringify(dataBahanAjar));
  renderTabelStok();
  updateStatStok();

  const btnTambah = document.getElementById("btnTambahStok");
  if (btnTambah) btnTambah.addEventListener("click", bukaModalTambah);

  const closeStok = document.getElementById("closeModalStok");
  if (closeStok) closeStok.addEventListener("click", () => {
    document.getElementById("modalStok").classList.remove("active");
  });

  const formStok = document.getElementById("formStok");
  if (formStok) {
    formStok.addEventListener("submit", function (e) {
      e.preventDefault();
      const idx = document.getElementById("editIdx").value;
      const data = {
        kodeLokasi: document.getElementById("inpKodeLokasi").value.trim().toUpperCase(),
        kodeBarang: document.getElementById("inpKodeBarang").value.trim().toUpperCase(),
        namaBarang: document.getElementById("inpNamaBarang").value.trim(),
        jenisBarang: document.getElementById("inpJenisBarang").value,
        edisi: document.getElementById("inpEdisi").value.trim(),
        stok: parseInt(document.getElementById("inpStok").value),
        cover: document.getElementById("inpCover").value.trim()
      };

      if (!data.kodeLokasi || !data.kodeBarang || !data.namaBarang) {
        showToast("Kode lokasi, kode barang, dan nama wajib diisi!", "error");
        return;
      }
      if (!data.edisi || parseInt(data.edisi) < 1) {
        showToast("Edisi minimal 1!", "error");
        return;
      }
      if (isNaN(data.stok) || data.stok < 0) {
        showToast("Stok tidak boleh negatif!", "error");
        return;
      }

      if (idx === "") {
        dataStok.unshift(data);
        showToast("Bahan ajar baru berhasil ditambahkan!", "success");
      } else {
        dataStok[parseInt(idx)] = data;
        showToast("Data bahan ajar berhasil diperbarui!", "success");
      }

      document.getElementById("modalStok").classList.remove("active");
      renderTabelStok();
      updateStatStok();
    });
  }

  const inputCari = document.getElementById("cariStok");
  if (inputCari) {
    inputCari.addEventListener("input", function () {
      const q = this.value.toLowerCase();
      const baris = document.querySelectorAll("#tbodyStok tr");
      baris.forEach(r => {
        const teks = r.textContent.toLowerCase();
        r.style.display = teks.includes(q) ? "" : "none";
      });
    });
  }

  const filterJenis = document.getElementById("filterJenis");
  if (filterJenis) {
    filterJenis.addEventListener("change", function () {
      const v = this.value;
      const tbody = document.getElementById("tbodyStok");
      const list = (v === "ALL") ? dataStok : dataStok.filter(i => i.jenisBarang === v);

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-row">Tidak ada data sesuai filter</td></tr>`;
        return;
      }

      tbody.innerHTML = "";
      list.forEach((item, idx) => {
        const stokClass = item.stok < 200 ? "stok-rendah" : item.stok < 400 ? "stok-sedang" : "stok-tinggi";
        const coverHTML = item.cover
          ? `<img src="${item.cover}" alt="Cover ${item.namaBarang}" class="cover-mini" />`
          : `<div class="cover-fallback">📕</div>`;
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td class="cover-cell">${coverHTML}</td>
          <td><code>${item.kodeLokasi}</code></td>
          <td><code>${item.kodeBarang}</code></td>
          <td class="nama-barang">${item.namaBarang}</td>
          <td><span class="tag-jenis">${item.jenisBarang}</span></td>
          <td class="text-center">${item.edisi}</td>
          <td class="text-right"><span class="badge-stok ${stokClass}">${item.stok}</span></td>
          <td class="text-center">-</td>`;
        tbody.appendChild(tr);
      });
    });
  }

  window.addEventListener("click", function (e) {
    if (e.target.classList && e.target.classList.contains("modal")) {
      e.target.classList.remove("active");
    }
  });
}

/* ============== INISIALISASI ============== */
document.addEventListener("DOMContentLoaded", function () {
  initLogin();
  initDashboard();
  initNavbar();
  initTracking();
  initStok();
});
