/* =========================
   EXPORT PNG
========================= */

window.downloadTreeImage = function () {

  const area = document.querySelector(".tree-box");

  return html2canvas(area, {
    scale: 2,
    useCORS: true
  }).then(canvas => {

    const link = document.createElement("a");

    link.download = "family-tree.png";

    link.href = canvas.toDataURL("image/png");

    link.click();

    return canvas;
  });
};



/* =========================
   EXPORT PDF
========================= */

window.exportTreeToPDF = function () {

  const area = document.querySelector(".tree-box");

  html2canvas(area, {
    scale: 2,
    useCORS: true
  }).then(canvas => {

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

    pdf.save("family-tree.pdf");
  });
};



/* =========================
   WIRE BUTTONS
========================= */

const saveImageBtn = document.getElementById("saveImageBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");

if (saveImageBtn) {
  saveImageBtn.addEventListener("click", window.downloadTreeImage);
}

if (exportPdfBtn) {
  exportPdfBtn.addEventListener("click", window.exportTreeToPDF);
}
