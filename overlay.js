import { db } from "./firebase.js";
import { doc, onSnapshot, updateDoc } from
"https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const ref = doc(db, "userSheet", "personagem01");
let estado = {};

// Remove tags HTML e aspas, retorna string limpa
function stripHtmlAndQuotes(s) {
  if (!s) return "";
  // se for algo como "<img src='...'>", extrai o src
  const srcMatch = s.match(/src\s*=\s*["']([^"']+)["']/i);
  if (srcMatch) return srcMatch[1].trim();
  // remove tags HTML restantes
  return s.replace(/<[^>]*>/g, "").trim();
}

// Tenta extrair ID de vários formatos do Google Drive
function extractDriveId(url) {
  if (!url) return null;
  // formatos comuns
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/,          // /d/ID/
    /id=([a-zA-Z0-9_-]+)/,                    // ?id=ID
    /\/file\/d\/([a-zA-Z0-9_-]+)\/view/       // /file/d/ID/view
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && m[1]) return m[1];
  }
  return null;
}

// Gera possíveis URLs diretos do Drive a partir de um input
function driveToDirectCandidates(raw) {
  const s = stripHtmlAndQuotes(raw);
  if (!s) return [];
  // se já for um uc?export=view ou download, devolve tal qual
  if (s.includes("drive.google.com/uc?")) return [s];
  // se já for um link direto https://lh3.googleusercontent.com/... devolve
  if (s.startsWith("https://") && s.includes("googleusercontent.com")) return [s];

  const id = extractDriveId(s);
  if (!id) return [s]; // devolve o que tiver, pode ser outro host
  // tenta duas variantes
  return [
    `https://drive.google.com/uc?export=view&id=${id}`,
    `https://drive.google.com/uc?export=download&id=${id}`
  ];
}

// Testa se uma imagem carrega (resolve true/false)
function testImage(url, timeout = 8000) {
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;
    const timer = setTimeout(() => {
      if (!done) { done = true; resolve(false); }
    }, timeout);
    img.onload = () => { if (!done) { done = true; clearTimeout(timer); resolve(true); } };
    img.onerror = () => { if (!done) { done = true; clearTimeout(timer); resolve(false); } };
    img.src = url;
  });
}

// Escolhe o primeiro candidato que carregar
async function chooseWorkingImage(raw) {
  const candidates = driveToDirectCandidates(raw);
  for (const c of candidates) {
    try {
      const ok = await testImage(c);
      if (ok) return c;
    } catch (e) {
      console.warn("Erro ao testar imagem:", c, e);
    }
  }
  return null;
}

onSnapshot(ref, async (snap) => {
  estado = snap.data() || {};

  // obtém URLs possíveis e escolhe o que funcionar
  const normalRaw = estado.imagemNormal || "";
  const instintoRaw = estado.imagemInstinto || "";

  const normalUrl = await chooseWorkingImage(normalRaw);
  const instintoUrl = await chooseWorkingImage(instintoRaw);

  const fotoEl = document.getElementById("foto");

  // se nenhum funcionar, mostra fallback visual e loga
  if (estado.instintoAtivo) {
    if (instintoUrl) {
      fotoEl.src = instintoUrl;
    } else {
      console.error("Imagem de instinto não carregou. Valor Firestore:", instintoRaw);
      fotoEl.removeAttribute("src");
      fotoEl.alt = "Imagem instinto indisponível";
      fotoEl.style.background = "#330000";
      fotoEl.style.width = "150px";
      fotoEl.style.height = "150px";
      fotoEl.style.display = "block";
    }
  } else {
    if (normalUrl) {
      fotoEl.src = normalUrl;
    } else {
      console.error("Imagem normal não carregou. Valor Firestore:", normalRaw);
      fotoEl.removeAttribute("src");
      fotoEl.alt = "Imagem normal indisponível";
      fotoEl.style.background = "#222222";
      fotoEl.style.width = "150px";
      fotoEl.style.height = "150px";
      fotoEl.style.display = "block";
    }
  }

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
