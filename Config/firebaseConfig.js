import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA-XqZsoCG36OvRnqEVhxFAqDkEbB_fQ2U",
  authDomain: "leavemeanote-b48fe.firebaseapp.com",
  databaseURL: "https://leavemeanote-b48fe-default-rtdb.firebaseio.com",
  projectId: "leavemeanote-b48fe",
  storageBucket: "leavemeanote-b48fe.firebasestorage.app",
  messagingSenderId: "307843657828",
  appId: "1:307843657828:web:d7c6f1311fca9022036f71",
  measurementId: "G-NZQ60E4QQN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById('menu-btn');
    const dropdown = document.getElementById('dropdown');

    if (menuBtn && dropdown) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        const dropdownLinks = document.querySelectorAll('.dropdown-menu a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', () => {
                dropdown.classList.remove('active');
            });
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('active');
        });
    }

    const form = document.getElementById('note-form');
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const sentTime = localStorage.getItem("note_sent_time");
    if (sentTime) {
        const timeElapsed = new Date().getTime() - parseInt(sentTime);
        if (timeElapsed > twentyFourHours) {
            localStorage.removeItem("note_sent_time");
        } else if (form) {
            form.innerHTML = `
                <center> 
                    <p style="color: #f8f8f8; text-align: center; font-weight: bold; padding: 10px;">Thank you! You have already sent the notes and the song.</p> 
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6" style="width: 32px; height: 32px; color: #f8f8f8;">
                      <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 0 0-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634Zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 0 1-.189-.866c0-.298.059-.605.189-.866Zm2.023 6.828a.75.75 0 1 0-1.06-1.06 3.75 3.75 0 0 1-5.304 0 .75.75 0 0 0-1.06 1.06 5.25 5.25 0 0 0 7.424 0Z" clip-rule="evenodd" />
                    </svg> 
                </center>
            `;
        }
    }

    const notesContainer = document.getElementById('notes-container');
 
    const pfpList = [
        "https://i.pinimg.com/736x/30/17/1f/30171f7a8bd1a806bef6939cb764e2ba.jpg",
        "https://i.pinimg.com/736x/33/b0/36/33b0366004dfb618bffedc5ca293b0ff.jpg",
        "https://i.pinimg.com/1200x/6e/7a/25/6e7a257ff929e35940dea5288ef51278.jpg",
        "https://i.pinimg.com/736x/7c/8a/da/7c8adab5463f50a4f0cb84342776cdd8.jpg"
    ];

    if (notesContainer) {
        notesContainer.style.overflowY = "auto";
        notesContainer.style.scrollbarWidth = "none"; 
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `#notes-container::-webkit-scrollbar { display: none; }`; 
        document.head.appendChild(styleSheet);
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentSentTime = localStorage.getItem("note_sent_time");
            if (currentSentTime) {
                const elapsed = new Date().getTime() - parseInt(currentSentTime);
                if (elapsed <= twentyFourHours) {
                    return;
                } else {
                    localStorage.removeItem("note_sent_time");
                }
            }

            const nameInput = document.getElementById('sender-name').value.trim();
            const message = document.getElementById('sender-message').value;
            const spotifyUrl = document.getElementById('sender-spotify').value;

            try {
                const querySnapshot = await getDocs(collection(db, "visitor_notes"));
                let nameExists = false;
                
                querySnapshot.forEach((doc) => {
                    const existingName = doc.data().name;
                    if (existingName && existingName.trim().toLowerCase() === nameInput.toLowerCase()) {
                        nameExists = true;
                    }
                });

                if (nameExists) {
                    return;
                }

                let spotifyEmbedUrl = "";
                if (spotifyUrl.includes("spotify.com")) {
                    spotifyEmbedUrl = spotifyUrl.replace("open.spotify.com/", "open.spotify.com/embed/");
                }

                const randomPfp = pfpList[Math.floor(Math.random() * pfpList.length)];

                await addDoc(collection(db, "visitor_notes"), {
                    name: nameInput,
                    message: message,
                    spotifyEmbed: spotifyEmbedUrl,
                    pfp: randomPfp,
                    createdAt: serverTimestamp()
                });
                
                localStorage.setItem("note_sent_time", new Date().getTime().toString());
                form.innerHTML = `<p style="color: #ffffff; text-align: center; font-weight: bold; padding: 10px;">Thank you! Your note and Spotify song have been successfully sent.</p>`;
            } catch (error) {
                console.error("Gagal mengirim data: ", error);
            }
        });
    }

    if (notesContainer) {
        const q = query(collection(db, "visitor_notes"), orderBy("createdAt", "desc"));
        onSnapshot(q, async (snapshot) => {
            notesContainer.innerHTML = "";
            const now = new Date().getTime();

            for (const documentSnap of snapshot.docs) {
                const data = documentSnap.data();

                if (data.createdAt) {
                    const messageTime = data.createdAt.toDate().getTime();
                    if (now - messageTime > twentyFourHours) {
                        try {
                            await deleteDoc(doc(db, "visitor_notes", documentSnap.id));
                            continue;
                        } catch (err) {
                            console.error("Gagal menghapus pesan kedaluwarsa:", err);
                        }
                    }
                }

                const cardItem = document.createElement('div');
                cardItem.style.cssText = "box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.1); background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.2); padding: 15px; border-radius: 12px; display: flex; align-items: flex-start; gap: 12px; margin: 12px 0; overflow: visible;";
                
                let spotifyHtml = "";
                if (data.spotifyEmbed) {
                    spotifyHtml = `<div style="margin-top: 10px; width: 100%;"><iframe src="${data.spotifyEmbed}?utm_source=generator&theme=0" width="100%" height="80" style="border-radius:12px; border:none;" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div>`;
                }

                const displayPfp = data.pfp || pfpList[Math.floor(Math.random() * pfpList.length)];

                cardItem.innerHTML = `
                    <img src="${displayPfp}" alt="PFP" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.6); flex-shrink: 0;">
                    <div style="display: flex; flex-direction: column; width: 100%;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <strong style="color: #ffffff; font-size: 25px; font-weight: bold;">${data.name}</strong>
                        </div>
                        <p style="font-size: 14px; font-weight: bold; color: #ffffff; line-height: 1.4; opacity: 0.95; margin: 0;">${data.message}</p>
                        ${spotifyHtml}
                    </div>
                `;
                
                notesContainer.appendChild(cardItem);
            }
        });
    }

    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            } else {
                entry.target.classList.remove('show');
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.card, .project-container, .mini-title');
    elementsToAnimate.forEach(el => {
        el.classList.add('scroll-animate');
        observer.observe(el);
    });
});
