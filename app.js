import { db } from './firebase.js';

import {
  collection,
  addDoc,
  getDocs
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

const addBtn =
document.getElementById("addBtn");



/* =========================
   GET ALL PEOPLE
========================= */

async function getPeople() {

  const snapshot =
  await getDocs(
    collection(db, "people")
  );

  let people = [];

  snapshot.forEach(doc => {

    people.push({

      id: doc.id,

      ...doc.data()

    });

  });

  return people;
}



/* =========================
   LOAD SELECT OPTIONS
========================= */

function loadSelectOptions(people) {

  /* RESET OPTION */

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

  /* LOAD PEOPLE */

  people.forEach(person => {

    /* OPTION AYAH */

    fatherEl.innerHTML += `
      <option value="${person.id}">
        ${person.name}
      </option>
    `;

    /* OPTION PASANGAN */

    spouseEl.innerHTML += `
      <option value="${person.id}">
        ${person.name}
      </option>
    `;

  });

}



/* =========================
   LOAD TREE
========================= */

async function loadTree() {

  const people =
  await getPeople();

  /* LOAD DROPDOWN */

  loadSelectOptions(people);

  /* BUILD TREE */

  const treeData =
  buildTree(people);

  /* DRAW TREE */

  if (treeData) {

    drawTree(treeData);

  }

}



/* =========================
   ADD PERSON
========================= */

async function addPerson() {

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



  /* VALIDATION */

  if (!name) {

    alert("Nama wajib diisi");

    return;

  }



  /* SAVE FIREBASE */

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
      gender || null

    }

  );



  /* RESET FORM */

  nameEl.value = "";

  birthEl.value = "";

  fatherEl.value = "";

  spouseEl.value = "";

  genderEl.value = "";



  /* RELOAD TREE */

  loadTree();

}



/* =========================
   BUTTON EVENT
========================= */

addBtn.addEventListener(
  "click",
  addPerson
);



/* =========================
   START
========================= */

loadTree();
