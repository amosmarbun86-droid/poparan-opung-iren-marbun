import { db } from './firebase.js';

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { state } from './store.js';



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



/* =========================
   HELPER: RANDOM TOKEN
========================= */

function generateToken(){

  return Math.random().toString(36).slice(2, 8).toUpperCase() +
         Math.random().toString(36).slice(2, 6).toUpperCase();

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
        <strong>${tree.name}</strong>
        ${isOwner ? '<span class="tree-tag">Pemilik</span>' : ''}
        ${(state.isSuperAdmin && !isOwner) ? '<span class="tree-tag admin">Admin akses</span>' : ''}
      </div>
      <div class="tree-card-actions">
        <button class="open-tree-btn">📂 Buka</button>
        ${isOwner ? '<button class="invite-tree-btn">🔑 Token Undangan</button>' : ''}
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

    await addDoc(collection(db, "tree_members"), {

      tree_id: treeRef.id,
      uid: state.currentUser.uid,
      role: "owner",
      joined_at: serverTimestamp()

    });

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

    const treeSnap =
    await getDoc(doc(db, "trees", invite.tree_id));

    if(!treeSnap.exists()){

      alert("Silsilah tujuan tidak ditemukan");
      return;

    }

    await addDoc(collection(db, "tree_members"), {

      tree_id: invite.tree_id,
      uid: state.currentUser.uid,
      role: "member",
      joined_at: serverTimestamp()

    });

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

  showTreesScreen();

});

document.addEventListener("app:auth-signed-out", ()=>{

  state.currentUser = null;
  state.isSuperAdmin = false;
  state.currentTreeId = null;
  state.currentTreeName = "";

  document.body.classList.add("no-tree-selected");

});
