import { db } from "./firebase.js";
import { doc, onSnapshot, updateDoc } from
"https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const ref = doc(db, "userSheet", "personagem01");

let estado = {};

// Função para converter link do Google Drive em link direto
function driveToDirect(url) {
  if (!url) return "";

  // Extrai o ID do link
  const match = url.match(/\/d\/(.*?)\//);
  if (!match) return url;

  const id = match[1];
  return `https://drive.google.com/uc?export=view&id=${id}`;
}

onSnapshot(ref, (snap) => {
  estado = snap.data();

  // Converte automaticamente os links
  const imgNormal = driveToDirect(estado.imagemNormal);
  const imgInstinto = driveToDirect(estado.imagemInstinto);

  document.getElementById("foto").src =
    estado.instintoAtivo ? imgInstinto : imgNormal;

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
