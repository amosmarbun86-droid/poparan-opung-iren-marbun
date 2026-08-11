import { db } from './firebase.js';

import {
  collection,
  addDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import {
  buildTree,
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
   BASE64
========================= */

function convertToBase64(file){

  return new Promise((resolve)=>{

    const reader =
    new FileReader();

    reader.readAsDataURL(file);

    reader.onload = ()=>{

      resolve(reader.result);

    };

  });

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

function startRealtime(){

  showLoading();

  if(unsubscribeSnapshot){

    unsubscribeSnapshot();

  }

  unsubscribeSnapshot = onSnapshot(

    collection(db, "people"),

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

  const treeData =
  buildTree(people);

  if(treeData){

    drawTree(treeData);

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



  let photoBase64 = "";

  if(photoFile){

    photoBase64 =
    await convertToBase64(photoFile);

  }



  await addDoc(

    collection(db, "people"),

    {

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
    document.querySelectorAll(
      ".node"
    );



    nodes.forEach(node=>{

      node.classList.remove(
        "highlight-node"
      );



      const text =
      node.innerText
      .toLowerCase();



      if(keyword && text.includes(keyword)){

        node.classList.add(
          "highlight-node"
        );

      }

    });

  }

);



/* =========================
   EVENT
========================= */

addBtn.addEventListener(
  "click",
  addPerson
);



/* =========================
   AUTH-GATED START
   Data hanya diambil setelah login berhasil
   (event dikirim dari auth.js)
========================= */

document.addEventListener("app:auth-ready", startRealtime);

document.addEventListener("app:auth-signed-out", ()=>{

  if(unsubscribeSnapshot){

    unsubscribeSnapshot();
    unsubscribeSnapshot = null;

  }

  state.people = [];
  hideLoading();

});
