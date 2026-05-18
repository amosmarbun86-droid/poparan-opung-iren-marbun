import { db } from './firebase.js';

import {

  doc,

  updateDoc,

  deleteDoc

} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";



/* =========================
   ELEMENT
========================= */

const modal =
document.getElementById("modal");

const editName =
document.getElementById("editName");

const editBirth =
document.getElementById("editBirth");

const editGender =
document.getElementById("editGender");

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



  editGender.value =
  person.gender || "";

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

      gender:
      editGender.value

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
