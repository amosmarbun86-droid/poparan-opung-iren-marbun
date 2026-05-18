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

const nameEl = document.getElementById("name");
const birthEl = document.getElementById("birth");
const fatherEl = document.getElementById("father");

async function getPeople() {

  const snapshot = await getDocs(collection(db, "people"));

  let people = [];

  snapshot.forEach(doc => {
    people.push({
      id: doc.id,
      ...doc.data()
    });
  });

  return people;
}

async function loadTree() {

  const people = await getPeople();

  const treeData = buildTree(people);

  if (treeData) {
    drawTree(treeData);
  }
}

async function addPerson() {

  const name = nameEl.value.trim();
  const birth = birthEl.value;
  const father = fatherEl.value;

  if (!name) {
    alert("Nama wajib diisi");
    return;
  }

  await addDoc(collection(db, "people"), {
    name,
    birth_date: birth,
    father_id: father || null
  });

  loadTree();
}

document.getElementById("addBtn")
  .addEventListener("click", addPerson);

loadTree();
