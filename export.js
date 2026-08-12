import { state } from './store.js';

/* =========================
   TEMA BACKGROUND (ADAT/DAERAH)
   Semua digambar langsung pakai canvas (bukan file
   gambar dari internet), supaya tetap ringan, cepat,
   dan jalan walau tanpa koneksi. Motifnya terinspirasi
   corak khas beberapa daerah, bukan tiruan persis.
========================= */

const BACKGROUND_THEMES = {

  polos: {
    label: "🎨 Polos (Default)",
    base: "#0f2027",
    pattern: null
  },

  batik_kawung: {
    label: "🟤 Batik Kawung (Jawa)",
    base: "#241a12",
    pattern: (ctx, size) => {

      ctx.fillStyle = "#241a12";
      ctx.fillRect(0, 0, size, size);

      ctx.strokeStyle = "rgba(212,175,55,0.35)";
      ctx.lineWidth = 2;

      const r = size / 5;

      [
        [size * 0.5, size * 0.2],
        [size * 0.2, size * 0.5],
        [size * 0.8, size * 0.5],
        [size * 0.5, size * 0.8]
      ].forEach(([x, y]) => {

        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 1.3, 0, 0, Math.PI * 2);
        ctx.stroke();

      });

    }
  },

  ulos_batak: {
    label: "🟥 Ulos Batak (Sumatera Utara)",
    base: "#3d0f0f",
    pattern: (ctx, size) => {

      ctx.fillStyle = "#3d0f0f";
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = "rgba(212,175,55,0.55)";

      for (let x = 0; x < size; x += size / 6) {
        ctx.fillRect(x, 0, 4, size);
      }

      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(0, size / 2 - 2, size, 4);

    }
  },

  songket_emas: {
    label: "🟨 Songket Emas (Sumatera Barat/Melayu)",
    base: "#3a1220",
    pattern: (ctx, size) => {

      ctx.fillStyle = "#3a1220";
      ctx.fillRect(0, 0, size, size);

      ctx.strokeStyle = "rgba(255,215,0,0.4)";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size, size / 2);
      ctx.lineTo(size / 2, size);
      ctx.lineTo(0, size / 2);
      ctx.closePath();
      ctx.stroke();

    }
  },

  tenun_ikat: {
    label: "🟩 Tenun Ikat (Nusa Tenggara)",
    base: "#1c2e23",
    pattern: (ctx, size) => {

      ctx.fillStyle = "#1c2e23";
      ctx.fillRect(0, 0, size, size);

      ctx.strokeStyle = "rgba(220,180,90,0.35)";
      ctx.lineWidth = 3;

      for (let i = -size; i < size * 2; i += size / 4) {

        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + size, size);
        ctx.stroke();

      }

    }
  },

  kain_pua: {
    label: "🟦 Kain Pua (Kalimantan/Dayak)",
    base: "#0e2233",
    pattern: (ctx, size) => {

      ctx.fillStyle = "#0e2233";
      ctx.fillRect(0, 0, size, size);

      ctx.strokeStyle = "rgba(255,140,60,0.35)";
      ctx.lineWidth = 2;

      const step = size / 4;

      for (let x = 0; x <= size; x += step) {

        for (let y = 0; y <= size; y += step) {

          ctx.strokeRect(x - step / 4, y - step / 4, step / 2, step / 2);

        }

      }

    }
  }

};



/* =========================
   POPULATE DROPDOWN PILIHAN BACKGROUND
========================= */

const exportBgSelect =
document.getElementById("exportBgSelect");

if (exportBgSelect) {

  Object.entries(BACKGROUND_THEMES).forEach(([key, theme]) => {

    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = theme.label;

    exportBgSelect.appendChild(opt);

  });

}



/* =========================
   HELPER: ROUNDED RECT
========================= */

function roundRect(ctx, x, y, w, h, r) {

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();

}



/* =========================
   HELPER: PATTERN TILE CANVAS
========================= */

function makePatternCanvas(drawFn, size = 140) {

  const c = document.createElement("canvas");

  c.width = size;
  c.height = size;

  drawFn(c.getContext("2d"), size);

  return c;

}



/* =========================
   PILIH SCALE OTOMATIS
   Kualitas setinggi mungkin (mendekati/di atas Full HD),
   tapi tetap dijaga supaya tidak crash di HP kalau
   pohonnya sangat besar (banyak cabang/anggota).
========================= */

function pickScale(area) {

  const pixels =
    area.scrollWidth * area.scrollHeight;

  if (pixels > 4000000) return 2;
  if (pixels > 1500000) return 2.5;

  return 3;

}



/* =========================
   BANGUN CANVAS HASIL AKHIR
   Berisi: background bertema, judul silsilah,
   tanggal cetak, dan gambar pohon itu sendiri.
========================= */

async function buildExportCanvas() {

  const area =
  document.querySelector(".tree-box");

  const scale =
  pickScale(area);

  const treeCanvas =
  await html2canvas(area, {

    scale,
    useCORS: true,
    backgroundColor: null

  });

  const themeKey =
  exportBgSelect ? exportBgSelect.value : "polos";

  const theme =
  BACKGROUND_THEMES[themeKey] || BACKGROUND_THEMES.polos;

  const unit = scale / 2;

  const padding = 90 * unit;
  const titleHeight = 170 * unit;

  const finalWidth =
  treeCanvas.width + padding * 2;

  const finalHeight =
  treeCanvas.height + padding * 2 + titleHeight;

  const finalCanvas =
  document.createElement("canvas");

  finalCanvas.width = finalWidth;
  finalCanvas.height = finalHeight;

  const ctx =
  finalCanvas.getContext("2d");



  /* BACKGROUND */

  ctx.fillStyle = theme.base;
  ctx.fillRect(0, 0, finalWidth, finalHeight);

  if (theme.pattern) {

    const tile =
    makePatternCanvas(theme.pattern, 140 * unit);

    const pattern =
    ctx.createPattern(tile, "repeat");

    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, finalWidth, finalHeight);

  }



  /* JUDUL */

  const treeName =
  state.currentTreeName || "Keluarga";

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${44 * unit}px sans-serif`;

  ctx.fillText(
    `🌳 Silsilah Keturunan ${treeName}`,
    finalWidth / 2,
    titleHeight * 0.45
  );

  const dateStr =
  new Date().toLocaleDateString("id-ID", {

    day: "numeric",
    month: "long",
    year: "numeric"

  });

  ctx.font = `${22 * unit}px sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.75)";

  ctx.fillText(
    `Dicetak ${dateStr}`,
    finalWidth / 2,
    titleHeight * 0.7
  );



  /* PANEL DI BELAKANG POHON, SUPAYA TETAP TERBACA
     DI ATAS BACKGROUND BERMOTIF */

  const panelX = padding - 20 * unit;
  const panelY = titleHeight - 10 * unit;
  const panelW = treeCanvas.width + 40 * unit;
  const panelH = treeCanvas.height + 40 * unit;

  ctx.fillStyle = "rgba(15,32,39,0.55)";

  roundRect(ctx, panelX, panelY, panelW, panelH, 24 * unit);
  ctx.fill();

  ctx.drawImage(treeCanvas, padding, titleHeight + 10 * unit);

  return finalCanvas;

}



/* =========================
   EXPORT PNG
========================= */

window.downloadTreeImage = async function () {

  const canvas =
  await buildExportCanvas();

  const link =
  document.createElement("a");

  link.download =
  `silsilah-${(state.currentTreeName || "keluarga").toLowerCase().replace(/\s+/g,"-")}.png`;

  link.href =
  canvas.toDataURL("image/png");

  link.click();

  return canvas;

};



/* =========================
   EXPORT PDF
========================= */

window.exportTreeToPDF = async function () {

  const canvas =
  await buildExportCanvas();

  const { jsPDF } = window.jspdf;

  const orientation =
    canvas.width > canvas.height ? "landscape" : "portrait";

  const pdf = new jsPDF({

    orientation,
    unit: "px",
    format: [canvas.width, canvas.height]

  });

  pdf.addImage(
    canvas.toDataURL("image/png"),
    "PNG",
    0,
    0,
    canvas.width,
    canvas.height
  );

  pdf.save(
    `silsilah-${(state.currentTreeName || "keluarga").toLowerCase().replace(/\s+/g,"-")}.pdf`
  );

};



/* =========================
   WIRE BUTTONS
   Tombol dinonaktifkan sementara saat proses render,
   karena gambar resolusi tinggi butuh beberapa detik.
========================= */

const saveImageBtn = document.getElementById("saveImageBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");

async function handleExportClick(btn, originalText, fn) {

  btn.disabled = true;
  btn.textContent = "⏳ Memproses...";

  try {

    await fn();

  } catch (err) {

    alert("Gagal membuat gambar/PDF, coba lagi.");

  } finally {

    btn.disabled = false;
    btn.textContent = originalText;

  }

}

if (saveImageBtn) {

  saveImageBtn.addEventListener("click", () => {

    handleExportClick(saveImageBtn, "📸 Simpan Gambar", window.downloadTreeImage);

  });

}

if (exportPdfBtn) {

  exportPdfBtn.addEventListener("click", () => {

    handleExportClick(exportPdfBtn, "📄 Export PDF", window.exportTreeToPDF);

  });

}
