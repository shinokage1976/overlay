import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDyR_p0enA-BWhHc2Ws_Vr9BR5KP2lzd7k",
    authDomain: "overlayrpg.firebaseapp.com",
    projectId: "overlayrpg",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
