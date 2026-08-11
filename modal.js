import { db } from './firebase.js';

import {

  doc,

  updateDoc,

  deleteDoc

} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { state } from './store.js';

import { populateSelect } from './utils.js';



/* =========================
   ELEMENT
========================= */

const modal =
document.getElementById("modal");

const editName =
document.getElementById("editName");

const editBirth =
document.getElementById("editBirth");

const editDeath =
document.getElementById("editDeath");

const editGender =
document.getElementById("editGender");

const editFather =
document.getElementById("editFather");

const editMother =
document.getElementById("editMother");

const editSpouse =
document.getElementById("editSpouse");

const saveBtn =
document.getElementById("saveEditBtn");

const deleteBtn =
document.getElementById("deleteBtn");

const closeBtn =
document.getElementById("closeModalBtn");



/* =========================
   GLOBAL
========================= */

let currentId = null;



/* =========================
   OPEN MODAL
========================= */

window.openModal = function(person){

  currentId = person.id;

  modal.style.display = "flex";



  editName.value =
  person.name || "";



  editBirth.value =
  person.birth_date || "";



  editDeath.value =
  person.death_date || "";



  editGender.value =
  person.gender || "";



  populateSelect(
    editFather,
    state.people,
    "-- Pilih Ayah --",
    person.father_id || "",
    person.id
  );



  populateSelect(
    editMother,
    state.people,
    "-- Pilih Ibu --",
    person.mother_id || "",
    person.id
  );



  populateSelect(
    editSpouse,
    state.people,
    "-- Pilih Pasangan --",
    person.spouse_id || "",
    person.id
  );

}



/* =========================
   CLOSE MODAL
========================= */

window.closeModal = function(){

  modal.style.display = "none";

}



/* =========================
   SAVE EDIT
========================= */

async function saveEdit(){

  if(!currentId) return;



  await updateDoc(

    doc(db, "people", currentId),

    {

      name:
      editName.value,

      birth_date:
      editBirth.value,

      death_date:
      editDeath.value || null,

      gender:
      editGender.value,

      father_id:
      editFather.value || null,

      mother_id:
      editMother.value || null,

      spouse_id:
      editSpouse.value || null

    }

  );



  closeModal();

}



/* =========================
   DELETE
========================= */

async function deletePerson(){

  if(!currentId) return;



  const confirmDelete = confirm(

    "Hapus anggota ini?"

  );



  if(!confirmDelete) return;



  await deleteDoc(

    doc(db, "people", currentId)

  );



  closeModal();

}



/* =========================
   EVENT
========================= */

saveBtn.addEventListener(

  "click",

  saveEdit

);



deleteBtn.addEventListener(

  "click",

  deletePerson

);



closeBtn.addEventListener(

  "click",

  closeModal

);
