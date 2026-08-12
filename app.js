import { db } from './firebase.js';

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import {
  buildForest,
  drawTree
} from './tree.js';

import { state } from './store.js';

import { populateSelect } from './utils.js';



/* =========================
   ELEMENT
========================= */

const nameEl =
document.getElementById("name");

const birthEl =
document.getElementById("birth");

const deathEl =
document.getElementById("death");

const fatherEl =
document.getElementById("father");

const motherEl =
document.getElementById("mother");

const spouseEl =
document.getElementById("spouse");

const genderEl =
document.getElementById("gender");

const photoEl =
document.getElementById("photo");

const photoFieldEl =
document.getElementById("photoField");

const photoLockNoteEl =
document.getElementById("photoLockNote");

const searchEl =
document.getElementById("search");

const addBtn =
document.getElementById("addBtn");

const loadingEl =
document.getElementById("loading");



/* =========================
   GLOBAL
========================= */

let unsubscribeSnapshot = null;



/* =========================
   LOADING
========================= */

function showLoading(){

  loadingEl.style.display = "flex";

}

function hideLoading(){

  loadingEl.style.display = "none";

}



/* =========================
   COMPRESS PHOTO
   Foto disimpan langsung sebagai base64 di dokumen Firestore
   (batas 1MB per dokumen), jadi foto perlu diperkecil dulu
   supaya tidak gagal simpan / bikin dokumen kebesaran.
   Foto di-resize maksimal 500px di sisi terpanjang dan
   dikompres ke JPEG kualitas 0.7.
========================= */

function compressImage(file, maxSize = 500, quality = 0.7){

  return new Promise((resolve, reject)=>{

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e)=>{

      img.onload = ()=>{

        let { width, height } = img;

        if(width > height && width > maxSize){

          height = Math.round(height * (maxSize / width));
          width = maxSize;

        } else if(height > maxSize){

          width = Math.round(width * (maxSize / height));
          height = maxSize;

        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", quality));

      };

      img.onerror = () => reject(new Error("Gagal memuat gambar"));

      img.src = e.target.result;

    };

    reader.onerror = () => reject(new Error("Gagal membaca file"));

    reader.readAsDataURL(file);

  });

}



/* =========================
   AKSES FOTO (PREMIUM PER-TREE)
   Upload foto anggota cuma boleh kalau tree yang sedang
   dibuka status premium, ATAU akun yang login super admin
   (super admin selalu bisa akses semua fitur).
========================= */

function canUsePhoto(){

  return state.isSuperAdmin || state.currentTreeIsPremium;

}

function updatePhotoAccess(){

  const allowed = canUsePhoto();

  photoEl.disabled = !allowed;
  photoFieldEl.classList.toggle("locked", !allowed);
  photoLockNoteEl.style.display = allowed ? "none" : "block";

  if(!allowed){

    photoEl.value = "";

  }

}



/* =========================
   LOAD SELECT
========================= */

function loadSelectOptions(people){

  populateSelect(fatherEl, people, "-- Pilih Ayah --");
  populateSelect(motherEl, people, "-- Pilih Ibu --");
  populateSelect(spouseEl, people, "-- Pilih Pasangan --");

}



/* =========================
   REALTIME FIREBASE
========================= */

function startRealtime(treeId){

  showLoading();

  if(unsubscribeSnapshot){

    unsubscribeSnapshot();

  }

  const peopleQuery =
  query(

    collection(db, "people"),
    where("tree_id", "==", treeId)

  );

  unsubscribeSnapshot = onSnapshot(

    peopleQuery,

    (snapshot)=>{

      state.people = [];

      snapshot.forEach(doc=>{

        state.people.push({

          id: doc.id,

          ...doc.data()

        });

      });

      loadSelectOptions(state.people);
      renderTree(state.people);
      hideLoading();

    }

  );

}



/* =========================
   RENDER TREE
========================= */

function renderTree(people){

  const forestData =
  buildForest(people);

  if(forestData && forestData.length > 0){

    drawTree(forestData);

  }

}



/* =========================
   ADD PERSON
========================= */

async function addPerson(){

  const name =
  nameEl.value.trim();

  const birth =
  birthEl.value;

  const death =
  deathEl.value;

  const father =
  fatherEl.value;

  const mother =
  motherEl.value;

  const spouse =
  spouseEl.value;

  const gender =
  genderEl.value;

  const photoFile =
  photoEl.files[0];



  if(!name){

    alert("Nama wajib diisi");

    return;

  }

  if(!state.currentTreeId){

    alert("Tidak ada silsilah yang aktif");

    return;

  }

  if(birth && death && death < birth){

    alert("Tanggal meninggal tidak boleh lebih awal dari tanggal lahir");

    return;

  }



  let photoBase64 = "";

  if(photoFile){

    if(!canUsePhoto()){

      alert("Upload foto anggota hanya tersedia untuk silsilah Premium.");
      return;

    }

    if(!photoFile.type.startsWith("image/")){

      alert("File foto harus berupa gambar");
      return;

    }

    try{

      photoBase64 =
      await compressImage(photoFile);

    } catch(err){

      alert("Gagal memproses foto, coba foto lain");
      return;

    }

  }



  await addDoc(

    collection(db, "people"),

    {

      tree_id:
      state.currentTreeId,

      name,

      birth_date: birth,

      death_date:
      death || null,

      father_id:
      father || null,

      mother_id:
      mother || null,

      spouse_id:
      spouse || null,

      gender:
      gender || null,

      photo:
      photoBase64 || null

    }

  );



  nameEl.value = "";

  birthEl.value = "";

  deathEl.value = "";

  fatherEl.value = "";

  motherEl.value = "";

  spouseEl.value = "";

  genderEl.value = "";

  photoEl.value = "";

}



/* =========================
   SEARCH REALTIME
========================= */

searchEl.addEventListener(

  "input",

  ()=>{

    const keyword =
    searchEl.value
    .toLowerCase()
    .trim();

    const nodes =
    document.querySelectorAll(".node");

    nodes.forEach(node=>{

      node.classList.remove("highlight-node");

      const text =
      node.innerText
      .toLowerCase();

      if(keyword && text.includes(keyword)){

        node.classList.add("highlight-node");

      }

    });

  }

);



/* =========================
   EVENT
========================= */

addBtn.addEventListener("click", addPerson);



/* =========================
   TREE-GATED START
   Data hanya diambil setelah sebuah silsilah
   dipilih/dibuat (event dikirim dari trees.js)
========================= */

document.addEventListener("app:tree-selected", (e)=>{

  startRealtime(e.detail.treeId);
  updatePhotoAccess();

});

document.addEventListener("app:tree-premium-changed", ()=>{

  updatePhotoAccess();

});

document.addEventListener("app:tree-deselected", ()=>{

  if(unsubscribeSnapshot){

    unsubscribeSnapshot();
    unsubscribeSnapshot = null;

  }

  state.people = [];
  hideLoading();
  updatePhotoAccess();

});

document.addEventListener("app:auth-signed-out", ()=>{

  if(unsubscribeSnapshot){

    unsubscribeSnapshot();
    unsubscribeSnapshot = null;

  }

  state.people = [];
  hideLoading();
  updatePhotoAccess();

});

// Kunci upload foto secara default sebelum ada tree yang dibuka
updatePhotoAccess();
