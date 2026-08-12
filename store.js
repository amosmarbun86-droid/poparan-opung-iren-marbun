/* =========================
   SHARED STATE
   Dipakai app.js (menulis) & modal.js (membaca)
   agar dropdown Ayah/Ibu/Pasangan di modal edit
   selalu sinkron dengan data terbaru dari Firestore.
========================= */

export const state = {
  people: [],

  // Data akun yang sedang login
  currentUser: null,
  isSuperAdmin: false,

  // Silsilah (tree) yang sedang aktif dibuka
  currentTreeId: null,
  currentTreeName: "",

  // Upload foto anggota: fitur premium per-tree.
  // Super admin selalu bisa akses walau tree tidak premium.
  currentTreeIsPremium: false
};
