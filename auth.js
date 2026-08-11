import { auth, db } from './firebase.js';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
  doc,
  updateDoc,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";



/* =========================
   ELEMENT
========================= */

const authTitle =
document.getElementById("authTitle");

const loginForm =
document.getElementById("loginForm");

const registerForm =
document.getElementById("registerForm");

const showRegisterLink =
document.getElementById("showRegisterLink");

const showLoginLink =
document.getElementById("showLoginLink");

const loginEmail =
document.getElementById("loginEmail");

const loginPassword =
document.getElementById("loginPassword");

const loginBtn =
document.getElementById("loginBtn");

const loginError =
document.getElementById("loginError");

const registerEmail =
document.getElementById("registerEmail");

const registerToken =
document.getElementById("registerToken");

const registerBtn =
document.getElementById("registerBtn");

const registerError =
document.getElementById("registerError");

const logoutBtn =
document.getElementById("logoutBtn");

const treesLogoutBtn =
document.getElementById("treesLogoutBtn");



/* =========================
   TOGGLE LOGIN / REGISTER
========================= */

showRegisterLink.addEventListener("click", (e)=>{

  e.preventDefault();

  loginError.textContent = "";
  loginForm.classList.add("hidden-form");
  registerForm.classList.remove("hidden-form");
  authTitle.textContent = "🔑 Daftar dengan Token";

});

showLoginLink.addEventListener("click", (e)=>{

  e.preventDefault();

  registerError.textContent = "";
  registerForm.classList.add("hidden-form");
  loginForm.classList.remove("hidden-form");
  authTitle.textContent = "🔒 Masuk";

});



/* =========================
   LOGIN (ADMIN / AKUN BIASA)
========================= */

async function handleLogin(){

  loginError.textContent = "";

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if(!email || !password){

    loginError.textContent =
      "Email dan password wajib diisi";

    return;

  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Memproses...";

  try{

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    loginPassword.value = "";

  } catch(err){

    loginError.textContent =
      "Email atau password salah";

  } finally {

    loginBtn.disabled = false;
    loginBtn.textContent = "Masuk";

  }

}

loginBtn.addEventListener("click", handleLogin);

loginPassword.addEventListener("keydown", (e)=>{

  if(e.key === "Enter"){
    handleLogin();
  }

});



/* =========================
   REGISTER DENGAN TOKEN
   Token = kode dari admin, sekaligus
   dipakai sebagai password akun baru.
   Setiap token cuma bisa dipakai sekali,
   dicek lewat koleksi Firestore "invites".
========================= */

async function handleRegister(){

  registerError.textContent = "";

  const email = registerEmail.value.trim();
  const token = registerToken.value.trim();

  if(!email || !token){

    registerError.textContent =
      "Email dan token wajib diisi";

    return;

  }

  registerBtn.disabled = true;
  registerBtn.textContent = "Memproses...";

  try{

    const inviteRef = doc(db, "invites", token);

    // Transaksi: baca + "kunci" token (used:true) secara atomic,
    // supaya dua orang tidak bisa lolos memakai token yang sama
    // meski submit hampir bersamaan.
    try{

      await runTransaction(db, async (transaction)=>{

        const inviteSnap = await transaction.get(inviteRef);

        if(!inviteSnap.exists()){
          throw new Error("not-found");
        }

        if(inviteSnap.data().used){
          throw new Error("already-used");
        }

        transaction.update(inviteRef, {
          used: true,
          used_by_email: email,
          used_at: serverTimestamp()
        });

      });

    } catch(txErr){

      if(txErr.message === "not-found"){

        registerError.textContent =
          "Token tidak ditemukan, cek lagi dengan admin";

      } else if(txErr.message === "already-used"){

        registerError.textContent =
          "Token ini sudah pernah dipakai";

      } else {

        registerError.textContent =
          "Gagal mendaftar, coba lagi";

      }

      return;

    }

    try{

      await createUserWithEmailAndPassword(
        auth,
        email,
        token
      );

    } catch(createErr){

      // Token sudah terpakai duluan tapi akun gagal dibuat,
      // lepaskan lagi tokennya supaya tidak hangus sia-sia.
      await updateDoc(inviteRef, {
        used: false,
        used_by_email: null,
        used_at: null
      });

      throw createErr;

    }

    registerToken.value = "";

  } catch(err){

    if(err.code === "auth/email-already-in-use"){

      registerError.textContent =
        "Email ini sudah terdaftar, silakan Masuk";

    } else if(err.code === "auth/invalid-email"){

      registerError.textContent =
        "Format email tidak valid";

    } else if(err.code === "auth/weak-password"){

      registerError.textContent =
        "Token terlalu pendek (minimal 6 karakter), minta token baru ke admin";

    } else {

      registerError.textContent =
        "Gagal mendaftar, coba lagi";

    }

  } finally {

    registerBtn.disabled = false;
    registerBtn.textContent = "Daftar";

  }

}

registerBtn.addEventListener("click", handleRegister);

registerToken.addEventListener("keydown", (e)=>{

  if(e.key === "Enter"){
    handleRegister();
  }

});



/* =========================
   LOGOUT
========================= */

logoutBtn.addEventListener("click", ()=>{

  signOut(auth);

});

treesLogoutBtn.addEventListener("click", ()=>{

  signOut(auth);

});



/* =========================
   AUTH STATE
   Memberi tahu app.js kapan boleh
   mulai/berhenti mengambil data,
   lewat custom event supaya modul
   tidak perlu saling import langsung.
========================= */

onAuthStateChanged(auth, (user)=>{

  if(user){

    document.body.classList.remove("logged-out");

    document.dispatchEvent(
      new CustomEvent("app:auth-ready", { detail: { user } })
    );

  } else {

    document.body.classList.add("logged-out");

    document.dispatchEvent(
      new CustomEvent("app:auth-signed-out")
    );

  }

});
