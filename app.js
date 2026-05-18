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



/* =========================
   ELEMENT
========================= */

const nameEl =
document.getElementById("name");

const birthEl =
document.getElementById("birth");

const fatherEl =
document.getElementById("father");

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

let peopleData = [];



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

  fatherEl.innerHTML = `
    <option value="">
      -- Pilih Ayah --
    </option>
  `;

  spouseEl.innerHTML = `
    <option value="">
      -- Pilih Pasangan --
    </option>
  `;

  people.forEach(person=>{

    fatherEl.innerHTML += `
      <option value="${person.id}">
        ${person.name}
      </option>
    `;

    spouseEl.innerHTML += `
      <option value="${person.id}">
        ${person.name}
      </option>
    `;

  });

}



/* =========================
   REALTIME FIREBASE
========================= */

function startRealtime(){

  showLoading();

  onSnapshot(

    collection(db, "people"),

    (snapshot)=>{

      peopleData = [];

      snapshot.forEach(doc=>{

        peopleData.push({

          id: doc.id,

          ...doc.data()

        });

      });

      loadSelectOptions(peopleData);

      renderTree(peopleData);

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

  const father =
  fatherEl.value;

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

      father_id:
      father || null,

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

  fatherEl.value = "";

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
   START
========================= */

startRealtime();
