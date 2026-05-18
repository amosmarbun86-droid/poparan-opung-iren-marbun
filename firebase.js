import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAwb3uKq12i0VKYQnLfpmFnOUyosbcJXUI",
  authDomain: "poparan-opung-iren-marbun.firebaseapp.com",
  projectId: "poparan-opung-iren-marbun"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
