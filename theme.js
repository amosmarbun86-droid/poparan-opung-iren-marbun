/* =========================
   THEME TOGGLE
   Mode terang / gelap, tersimpan di localStorage
========================= */

const themeBtn = document.getElementById("themeToggleBtn");

function applyTheme(theme) {

  if (theme === "light") {
    document.body.classList.add("light-theme");
    themeBtn.textContent = "🌙 Mode Gelap";
  } else {
    document.body.classList.remove("light-theme");
    themeBtn.textContent = "☀️ Mode Terang";
  }
}

const savedTheme = localStorage.getItem("treeTheme") || "dark";
applyTheme(savedTheme);

themeBtn.addEventListener("click", () => {

  const isLight = document.body.classList.contains("light-theme");
  const nextTheme = isLight ? "dark" : "light";

  applyTheme(nextTheme);
  localStorage.setItem("treeTheme", nextTheme);
});
