import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    arrayUnion, 
    arrayRemove, 
    onSnapshot,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyC6J1itovI6L8IdGrxVOYmUAK9jTkuWDaI",
    authDomain: "cybernexus-2da05.firebaseapp.com",
    projectId: "cybernexus-2da05",
    storageBucket: "cybernexus-2da05.firebasestorage.app",
    messagingSenderId: "382374361008",
    appId: "1:382374361008:web:c37a321287c3f70a7d8875",
    measurementId: "G-7BK5RX5WXY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// --- UI Elements ---
const authBtn = document.getElementById('authBtn');
const signOutBtn = document.getElementById('signOutBtn');
const userProfile = document.getElementById('userProfile');
const userAvatar = document.getElementById('userAvatar');
window.currentUserBlocklist = [];
// --- Auth Functions ---
authBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        // The onAuthStateChanged listener will handle the rest
    } catch (error) {
        console.error("Login failed:", error);
        window.showNotification("Login failed. Check console.", "error");
    }
});

signOutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.reload(); // Refresh to clear data
    } catch (error) {
        console.error("Logout failed:", error);
    }
});

// --- Main Logic ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // 1. Update UI
        authBtn.style.display = 'none';
        userProfile.style.display = 'flex';
        userAvatar.src = user.photoURL;
        
        // 2. Ensure User Exists in DB
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                createdAt: serverTimestamp(),
                blocklist: [] // Create empty list
            });
        }

        // 3. LISTEN for changes (Real-time!)
        // This runs every time the database changes
        onSnapshot(userRef, (doc) => {
            const data = doc.data();
            if (data && data.blocklist) {
                // Save to window so other scripts can see it
                window.currentUserBlocklist = data.blocklist;
                updateInterfaceWithBlocklist(data.blocklist);
            }
        });

    } else {
        // Logged out
        authBtn.style.display = 'inline-flex';
        userProfile.style.display = 'none';
        window.currentUserBlocklist = [];
    }
});

// --- Global Function for Buttons ---
// We attach this to 'window' so your HTML buttons can call it
// --- Global Function for Buttons ---
window.toggleBlockEntity = async (entityId) => {
    const user = auth.currentUser;
    if (!user) {
        window.showNotification("Please sign in to block threats", "error");
        return;
    }

    if (!window.currentUserBlocklist) window.currentUserBlocklist = [];

    // --- NAME LOOKUP FIX ---
    // Try to find the entity in our data to get its real name
    let entityName = entityId; // Default to ID if name not found
    
    // Check recent threats array
    const threatMatch = window.threatData?.recentThreats?.find(t => t.entityId === entityId);
    if (threatMatch) entityName = threatMatch.entity;
    
    // Check main entities array
    if (entityName === entityId) {
        const entityMatch = window.threatData?.entities?.find(e => e.id === entityId);
        if (entityMatch) entityName = entityMatch.name;
    }
    // -----------------------

    const userRef = doc(db, "users", user.uid);
    const isBlocked = window.currentUserBlocklist.includes(entityId);

    try {
        if (isBlocked) {
            await updateDoc(userRef, { blocklist: arrayRemove(entityId) });
            window.showNotification(`${entityName} unblocked`, "info");
        } else {
            await updateDoc(userRef, { blocklist: arrayUnion(entityId) });
            // Use the real name in the success message!
            window.showNotification(`${entityName} blocked`, "success");
        }
    } catch (error) {
        console.error("Error updating blocklist:", error);
        window.showNotification("Failed to update database", "error");
    }
};

// --- UI Helper ---
window.updateInterfaceWithBlocklist = function(blocklist) {
    // Select buttons by their permanent class, not their changing onclick
    document.querySelectorAll('.block-btn').forEach(btn => {
        const id = btn.getAttribute('data-id');
        
        if (blocklist.includes(id)) {
            // It IS in the blocklist -> Make it RED
            btn.innerHTML = '<i class="fas fa-check"></i> Blocked';
            btn.style.background = 'rgba(255, 77, 109, 0.2)';
            btn.style.color = '#ff4d6d';
            btn.style.borderColor = '#ff4d6d';
            // Update onclick to toggle
            btn.setAttribute('onclick', `toggleBlockEntity('${id}')`);
        } else {
            // It is NOT in the blocklist -> Make it NORMAL
            btn.innerHTML = '<i class="fas fa-ban"></i> Block';
            btn.style.background = ''; 
            btn.style.color = '';
            btn.style.borderColor = '';
            // Update onclick to add
            btn.setAttribute('onclick', `toggleBlockEntity('${id}')`);
        }
    });
};