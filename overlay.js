import { db } from "./firebase.js";
import { doc, onSnapshot, updateDoc } from
"https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const ref = doc(db, "userSheet", "personagem01");

let estado = {};

onSnapshot(ref, (snap) => {
  estado = snap.data();

  document.getElementById("foto").src =
    estado.instintoAtivo ? estado.imagemInstinto : estado.imagemNormal;

  document.getElementById("vidaTexto").innerText =
    `Vida: ${estado.vida}/${estado.vidaMax}`;

  document.getElementById("vidaBarra").style.width =
    `${Math.min((estado.vida / estado.vidaMax) * 100, 130)}%`;

  document.getElementById("pdTexto").innerText =
    `PD: ${estado.pd}/${estado.pdMax}`;

  document.getElementById("pdBarra").style.width =
    `${Math.min((estado.pd / estado.pdMax) * 100, 130)}%`;
});

document.getElementById("instintoBtn").onclick = async () => {
  await updateDoc(ref, {
    vida: estado.vida + 20,
    pd: estado.pd + 10,
    instintoAtivo: true
  });
};
