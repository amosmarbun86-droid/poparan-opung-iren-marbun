window.downloadTreeImage = function () {

  const area = document.querySelector(".tree-box");

  html2canvas(area, {
    scale: 2,
    useCORS: true
  }).then(canvas => {

    const link = document.createElement("a");

    link.download = "family-tree.png";

    link.href = canvas.toDataURL("image/png");

    link.click();
  });
};
