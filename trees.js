import { db } from './firebase.js';

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { state } from './store.js';
import { escapeHtml } from './utils.js';



/* =========================
   ELEMENT
========================= */

const treesScreen =
document.getElementById("treesScreen");

const treesListEl =
document.getElementById("treesList");

const treesLoadingEl =
document.getElementById("treesLoading");

const createTreeBtn =
document.getElementById("createTreeBtn");

const joinTreeBtn =
document.getElementById("joinTreeBtn");

const joinTreeTokenEl =
document.getElementById("joinTreeToken");

const changeTreeBtn =
document.getElementById("changeTreeBtn");

const adminBadgeEl =
document.getElementById("adminBadge");

const currentTreeLabelEl =
document.getElementById("currentTreeLabel");

const manageTokensBtn =
document.getElementById("manageTokensBtn");

const adminTokensScreen =
document.getElementById("adminTokensScreen");

const generateAccountTokenBtn =
document.getElementById("generateAccountTokenBtn");

const accountTokensListEl =
document.getElementById("accountTokensList");

const accountTokensLoadingEl =
document.getElementById("accountTokensLoading");

const backToTreesBtn =
document.getElementById("backToTreesBtn");

const manageUsersBtn =
document.getElementById("manageUsersBtn");

const usersListEl =
document.getElementById("usersList");

const usersLoadingEl =
document.getElementById("usersLoading");

const backToTreesFromUsersBtn =
document.getElementById("backToTreesFromUsersBtn");



/* =========================
   HELPER: RANDOM TOKEN
========================= */

function generateToken(){

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomValues = new Uint32Array(10);
  crypto.getRandomValues(randomValues);

  let token = "";

  randomValues.forEach(v=>{
    token += chars[v % chars.length];
  });

  return token;

}



/* =========================
   PASTIKAN DOKUMEN "users/{uid}" ADA
   Dipakai untuk simpan role (user / super_admin).
   Role tidak pernah ditimpa kalau sudah ada,
   supaya tidak ada celah menaikkan role sendiri.
========================= */

async function ensureUserDoc(user){

  const userRef =
  doc(db, "users", user.uid);

  const userSnap =
  await getDoc(userRef);

  if(!userSnap.exists()){

    await setDoc(userRef, {

      email: user.email || null,
      role: "user",
      created_at: serverTimestamp()

    });

    return "user";

  }

  return userSnap.data().role || "user";

}



/* =========================
   TAMPILKAN LAYAR DAFTAR SILSILAH
========================= */

function showTreesScreen(){

  document.body.classList.add("no-tree-selected");

  document.dispatchEvent(
    new CustomEvent("app:tree-deselected")
  );

  loadTreesList();

}

function hideTreesScreen(){

  document.body.classList.remove("no-tree-selected");

}



/* =========================
   PILIH SILSILAH
========================= */

function selectTree(treeId, treeName){

  state.currentTreeId = treeId;
  state.currentTreeName = treeName;

  currentTreeLabelEl.textContent =
  "— " + treeName;

  hideTreesScreen();

  document.dispatchEvent(

    new CustomEvent("app:tree-selected", {
      detail: { treeId, treeName }
    })

  );

}



/* =========================
   MUAT DAFTAR SILSILAH
   - User biasa: hanya silsilah yang dia punya/diundang
     (lewat koleksi tree_members)
   - Super admin: SEMUA silsilah yang pernah dibuat
========================= */

async function loadTreesList(){

  treesLoadingEl.style.display = "block";
  treesListEl.innerHTML = "";

  let trees = [];

  if(state.isSuperAdmin){

    const snap =
    await getDocs(collection(db, "trees"));

    snap.forEach(d=>{

      trees.push({ id: d.id, ...d.data() });

    });

  } else {

    const memberSnap =
    await getDocs(

      query(
        collection(db, "tree_members"),
        where("uid", "==", state.currentUser.uid)
      )

    );

    const treeIds = [];

    memberSnap.forEach(d=>{

      treeIds.push(d.data().tree_id);

    });

    for(const treeId of treeIds){

      const treeSnap =
      await getDoc(doc(db, "trees", treeId));

      if(treeSnap.exists()){

        trees.push({ id: treeSnap.id, ...treeSnap.data() });

      }

    }

  }

  renderTreesList(trees);

  treesLoadingEl.style.display = "none";

}



/* =========================
   RENDER DAFTAR SILSILAH
========================= */

function renderTreesList(trees){

  if(trees.length === 0){

    treesListEl.innerHTML =
      `<p class="trees-empty">Belum ada silsilah. Buat baru atau gabung pakai token.</p>`;

    return;

  }

  treesListEl.innerHTML = "";

  trees.forEach(tree=>{

    const isOwner =
    tree.owner_uid === state.currentUser.uid;

    const card =
    document.createElement("div");

    card.className = "tree-card";

    card.innerHTML = `
      <div class="tree-card-info">
        <strong>${escapeHtml(tree.name)}</strong>
        ${isOwner ? '<span class="tree-tag">Pemilik</span>' : ''}
        ${(state.isSuperAdmin && !isOwner) ? '<span class="tree-tag admin">Admin akses</span>' : ''}
      </div>
      <div class="tree-card-actions">
        <button class="open-tree-btn">📂 Buka</button>
        ${isOwner ? '<button class="invite-tree-btn">🔑 Token Undangan</button>' : ''}
        ${isOwner ? '<button class="delete-tree-btn">🗑️ Hapus</button>' : ''}
      </div>
    `;

    card.querySelector(".open-tree-btn")
      .addEventListener("click", ()=>{

        selectTree(tree.id, tree.name);

      });

    const inviteBtn =
    card.querySelector(".invite-tree-btn");

    if(inviteBtn){

      inviteBtn.addEventListener("click", ()=>{

        generateInvite(tree.id, tree.name);

      });

    }

    const deleteBtn =
    card.querySelector(".delete-tree-btn");

    if(deleteBtn){

      deleteBtn.addEventListener("click", ()=>{

        deleteTree(tree.id, tree.name, deleteBtn);

      });

    }

    treesListEl.appendChild(card);

  });

}



/* =========================
   BUAT SILSILAH BARU
========================= */

async function createTree(){

  const name =
  prompt("Nama silsilah baru (misal: Marga Sitorus):");

  if(!name || !name.trim()) return;

  createTreeBtn.disabled = true;

  try{

    const treeRef =
    await addDoc(collection(db, "trees"), {

      name: name.trim(),
      owner_uid: state.currentUser.uid,
      created_at: serverTimestamp()

    });

    await setDoc(
      doc(db, "tree_members", `${treeRef.id}_${state.currentUser.uid}`),
      {

        tree_id: treeRef.id,
        uid: state.currentUser.uid,
        role: "owner",
        joined_at: serverTimestamp()

      }
    );

    selectTree(treeRef.id, name.trim());

  } catch(err){

    alert("Gagal membuat silsilah, coba lagi.");

  } finally {

    createTreeBtn.disabled = false;

  }

}



/* =========================
   GENERATE TOKEN UNDANGAN
========================= */

async function generateInvite(treeId, treeName){

  const token =
  generateToken();

  try{

    await setDoc(doc(db, "tree_invites", token), {

      tree_id: treeId,
      created_by: state.currentUser.uid,
      used: false,
      created_at: serverTimestamp()

    });

    prompt(

      `Token undangan untuk "${treeName}" (bagikan ke anggota, sekali pakai):`,
      token

    );

  } catch(err){

    alert("Gagal membuat token undangan, coba lagi.");

  }

}



/* =========================
   HAPUS SILSILAH
   Hanya pemilik (owner_uid) yang bisa hapus,
   tombol ini hanya dirender kalau isOwner true.
   Menghapus juga semua data terkait: anggota (people),
   daftar member (tree_members), dan token undangan
   (tree_invites) supaya tidak ada data "yatim" tertinggal.
========================= */

async function deleteTree(treeId, treeName, buttonEl){

  const typedName =
  prompt(
    `Tindakan ini akan menghapus silsilah "${treeName}" beserta SEMUA anggota di dalamnya secara permanen dan tidak bisa dibatalkan.\n\nUntuk konfirmasi, ketik ulang nama silsilah ini:`
  );

  if(typedName === null) return;

  if(typedName.trim() !== treeName){

    alert("Nama tidak cocok, penghapusan dibatalkan.");
    return;

  }

  buttonEl.disabled = true;
  buttonEl.textContent = "Menghapus...";

  try{

    const batch = writeBatch(db);

    const peopleSnap =
    await getDocs(
      query(collection(db, "people"), where("tree_id", "==", treeId))
    );

    peopleSnap.forEach(d=> batch.delete(d.ref));

    const membersSnap =
    await getDocs(
      query(collection(db, "tree_members"), where("tree_id", "==", treeId))
    );

    membersSnap.forEach(d=> batch.delete(d.ref));

    const invitesSnap =
    await getDocs(
      query(collection(db, "tree_invites"), where("tree_id", "==", treeId))
    );

    invitesSnap.forEach(d=> batch.delete(d.ref));

    batch.delete(doc(db, "trees", treeId));

    await batch.commit();

    if(state.currentTreeId === treeId){

      state.currentTreeId = null;
      state.currentTreeName = "";

    }

    loadTreesList();

  } catch(err){

    alert("Gagal menghapus silsilah, coba lagi.");

    buttonEl.disabled = false;
    buttonEl.textContent = "🗑️ Hapus";

  }

}



/* =========================
   GABUNG SILSILAH PAKAI TOKEN
========================= */

async function joinTree(){

  const token =
  joinTreeTokenEl.value.trim().toUpperCase();

  if(!token){

    alert("Masukkan token silsilah dulu");
    return;

  }

  joinTreeBtn.disabled = true;

  try{

    const inviteRef =
    doc(db, "tree_invites", token);

    const inviteSnap =
    await getDoc(inviteRef);

    if(!inviteSnap.exists()){

      alert("Token tidak ditemukan, cek lagi dengan pemilik silsilah");
      return;

    }

    const invite =
    inviteSnap.data();

    if(invite.used){

      alert("Token ini sudah pernah dipakai");
      return;

    }

    // Daftarkan keanggotaan DULU. Rules Firestore cuma
    // izinkan baca detail silsilah (trees/{id}) kalau sudah
    // jadi anggota, jadi urutannya harus: jadi anggota dulu,
    // baru boleh baca nama silsilahnya.
    await setDoc(
      doc(db, "tree_members", `${invite.tree_id}_${state.currentUser.uid}`),
      {

        tree_id: invite.tree_id,
        uid: state.currentUser.uid,
        role: "member",
        joined_at: serverTimestamp()

      }
    );

    const treeSnap =
    await getDoc(doc(db, "trees", invite.tree_id));

    if(!treeSnap.exists()){

      alert("Silsilah tujuan tidak ditemukan");
      return;

    }

    await updateDoc(inviteRef, {

      used: true,
      used_by: state.currentUser.uid,
      used_at: serverTimestamp()

    });

    joinTreeTokenEl.value = "";

    selectTree(treeSnap.id, treeSnap.data().name);

  } catch(err){

    alert("Gagal bergabung, coba lagi.");

  } finally {

    joinTreeBtn.disabled = false;

  }

}



/* =========================
   EVENT
========================= */

createTreeBtn.addEventListener("click", createTree);
joinTreeBtn.addEventListener("click", joinTree);

changeTreeBtn.addEventListener("click", ()=>{

  showTreesScreen();

});



/* =========================
   PANEL ADMIN: DAFTAR PENGGUNA
   Hanya untuk super_admin. Menampilkan semua
   dokumen di collection "users" (dibuat otomatis
   lewat ensureUserDoc saat orang pertama kali login).
========================= */

manageUsersBtn.addEventListener("click", ()=>{

  document.body.classList.add("admin-users-open");

  loadUsersList();

});

backToTreesFromUsersBtn.addEventListener("click", ()=>{

  document.body.classList.remove("admin-users-open");

});

function formatJoinDate(ts){

  if(!ts || !ts.toDate) return "Tanggal tidak diketahui";

  const d = ts.toDate();

  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

}

async function loadUsersList(){

  usersLoadingEl.style.display = "block";
  usersListEl.innerHTML = "";

  try{

    const snap =
    await getDocs(collection(db, "users"));

    let users = [];

    snap.forEach(d=>{

      users.push({ id: d.id, ...d.data() });

    });

    // Terbaru duluan berdasarkan created_at
    users.sort((a, b)=>{

      const aTime = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
      const bTime = b.created_at?.toMillis ? b.created_at.toMillis() : 0;

      return bTime - aTime;

    });

    renderUsersList(users);

  } catch(err){

    usersListEl.innerHTML =
      `<p class="trees-empty">Gagal memuat daftar pengguna.</p>`;

  } finally {

    usersLoadingEl.style.display = "none";

  }

}

function renderUsersList(users){

  if(users.length === 0){

    usersListEl.innerHTML =
      `<p class="trees-empty">Belum ada pengguna terdaftar.</p>`;

    return;

  }

  usersListEl.innerHTML = "";

  users.forEach(u=>{

    const row =
    document.createElement("div");

    row.className = "tree-card";

    row.innerHTML = `
      <div class="tree-card-info">
        <strong class="user-email">${escapeHtml(u.email || "(tanpa email)")}</strong>
        <span class="tree-tag ${u.role === 'super_admin' ? 'admin' : ''}">
          ${u.role === 'super_admin' ? 'Super Admin' : 'User'}
        </span>
        <span class="user-joined">Daftar: ${formatJoinDate(u.created_at)}</span>
      </div>
    `;

    usersListEl.appendChild(row);

  });

}



/* =========================
   PANEL ADMIN: KELOLA TOKEN AKUN
   Hanya untuk super_admin. Menggantikan
   cara lama (bikin token manual di
   Firebase Console koleksi "invites").
========================= */

manageTokensBtn.addEventListener("click", ()=>{

  document.body.classList.add("admin-tokens-open");

  loadAccountTokens();

});

backToTreesBtn.addEventListener("click", ()=>{

  document.body.classList.remove("admin-tokens-open");

});

async function loadAccountTokens(){

  accountTokensLoadingEl.style.display = "block";
  accountTokensListEl.innerHTML = "";

  const snap =
  await getDocs(collection(db, "invites"));

  let invites = [];

  snap.forEach(d=>{

    invites.push({ id: d.id, ...d.data() });

  });

  // Terbaru duluan (kalau ada created_at, jatuh ke urutan asli kalau tidak)
  invites.reverse();

  renderAccountTokens(invites);

  accountTokensLoadingEl.style.display = "none";

}

function renderAccountTokens(invites){

  if(invites.length === 0){

    accountTokensListEl.innerHTML =
      `<p class="trees-empty">Belum ada token akun. Klik "Generate Token Baru" untuk bikin.</p>`;

    return;

  }

  accountTokensListEl.innerHTML = "";

  invites.forEach(inv=>{

    const row =
    document.createElement("div");

    row.className = "tree-card";

    row.innerHTML = `
      <div class="tree-card-info">
        <strong class="token-code">${escapeHtml(inv.id)}</strong>
        <span class="tree-tag ${inv.used ? 'admin' : ''}">
          ${inv.used ? 'Sudah dipakai' : 'Belum dipakai'}
        </span>
        ${inv.used_by_email ? `<span class="token-used-by">oleh ${escapeHtml(inv.used_by_email)}</span>` : ''}
      </div>
      <div class="tree-card-actions">
        <button class="copy-token-btn">📋 Salin</button>
      </div>
    `;

    row.querySelector(".copy-token-btn")
      .addEventListener("click", ()=>{

        copyToken(inv.id);

      });

    accountTokensListEl.appendChild(row);

  });

}

function copyToken(token){

  if(navigator.clipboard && navigator.clipboard.writeText){

    navigator.clipboard.writeText(token)
      .then(()=> alert("Token disalin: " + token))
      .catch(()=> prompt("Salin token ini manual:", token));

  } else {

    prompt("Salin token ini manual:", token);

  }

}

generateAccountTokenBtn.addEventListener("click", async ()=>{

  generateAccountTokenBtn.disabled = true;

  try{

    const token =
    generateToken();

    await setDoc(doc(db, "invites", token), {

      used: false,
      created_by: state.currentUser.uid,
      created_at: serverTimestamp()

    });

    await loadAccountTokens();

    copyToken(token);

  } catch(err){

    alert("Gagal membuat token, coba lagi.");

  } finally {

    generateAccountTokenBtn.disabled = false;

  }

});



/* =========================
   MULAI SETELAH LOGIN
   (dikirim dari auth.js)
========================= */

document.addEventListener("app:auth-ready", async (e)=>{

  const user = e.detail.user;

  state.currentUser = user;

  const role =
  await ensureUserDoc(user);

  state.isSuperAdmin =
  (role === "super_admin");

  adminBadgeEl.style.display =
  state.isSuperAdmin ? "inline-block" : "none";

  manageTokensBtn.style.display =
  state.isSuperAdmin ? "block" : "none";

  manageUsersBtn.style.display =
  state.isSuperAdmin ? "block" : "none";

  showTreesScreen();

});

document.addEventListener("app:auth-signed-out", ()=>{

  state.currentUser = null;
  state.isSuperAdmin = false;
  state.currentTreeId = null;
  state.currentTreeName = "";

  document.body.classList.add("no-tree-selected");
  document.body.classList.remove("admin-tokens-open");
  document.body.classList.remove("admin-users-open");

});
