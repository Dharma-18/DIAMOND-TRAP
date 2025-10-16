// Import the functions you need from the Firebase SDKs
// We are using the web URLs to make it work directly in the browser without any build tools.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Your web app's Firebase configuration (pasted from your Firebase project)
const firebaseConfig = {
  apiKey: "AIzaSyCX7T-o0jGm9w-30_E_HUxakrXHh_JdINc",
  authDomain: "diamond-catcher-game.firebaseapp.com",
  projectId: "diamond-catcher-game",
  storageBucket: "diamond-catcher-game.firebasestorage.app",
  messagingSenderId: "931020246197",
  appId: "1:931020246197:web:0c2779e831a153270342fc"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Records a game result to the Firestore database.
 * This function will be called from your main script.js file.
 * @param {'win' | 'lose'} gameResult - The result of the game.
 * @param {string} playerId - An identifier for the player (their name).
 */
async function recordGameResult(gameResult, playerId) {
  // If the playerId is empty, we'll set it to "Anonymous"
  const playerName = playerId ? playerId.trim() : "Anonymous";

  try {
    // 'game_results' is the name of the collection we are saving to in Firestore.
    // Firestore will automatically create this collection the first time you save data.
    const docRef = await addDoc(collection(db, "game_results"), {
      result: gameResult,
      playerId: playerName,
      timestamp: serverTimestamp() // Adds the server's current time automatically
    });
    console.log("Game result saved successfully with ID: ", docRef.id);
  } catch (e) {
    console.error("Error saving game result to Firestore: ", e);
  }
}

// IMPORTANT: This line makes the recordGameResult function available
// for your other game scripts (like script.js) to use.
window.recordGameResult = recordGameResult;

console.log("Firebase is initialized and ready!");