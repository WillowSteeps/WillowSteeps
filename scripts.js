// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAMOc6n_-UxqouQ8YcPb21cZ7tA79ISRSM",
    authDomain: "willowsteeps-fcca5.firebaseapp.com",
    projectId: "willowsteeps-fcca5",
    storageBucket: "willowsteeps-fcca5.appspot.com",
    messagingSenderId: "814830989524",
    appId: "1:814830989524:web:5b55c19b4155e58564cb41",
    measurementId: "G-ZLP5BZGBLQ",
    databaseURL: "https://willowsteeps-fcca5-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
    const reviewForm = document.getElementById('review-form');
    const reviewsList = document.getElementById('reviews-list');
    const randomTeaElement = document.getElementById('random-tea');
    const homePage = document.getElementById('home-page');
    const reviewsPage = document.getElementById('reviews-page');
    const chatPage = document.getElementById('chat-page');
    const navHome = document.getElementById('nav-home');
    const navReviews = document.getElementById('nav-reviews');
    const navChat = document.getElementById('nav-chat');
    const chatForm = document.getElementById('chat-form');
    const chatList = document.getElementById('chat-list');
    const chatMessage = document.getElementById('chat-message');
    const signInButton = document.getElementById('sign-in-button');
    const signOutButton = document.getElementById('sign-out-button');
    const userInfo = document.getElementById('user-info');
    let currentUser = null;

    // Function to handle sign-in
    const signIn = () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                currentUser = result.user;
                userInfo.textContent = `Signed in as ${currentUser.displayName}`;
                signInButton.style.display = 'none';
                signOutButton.style.display = 'block';
                chatForm.style.display = 'block';
            })
            .catch((error) => {
                console.error("Error signing in: ", error);
            });
    };

    // Function to handle sign-out
    const signOutUser = () => {
        signOut(auth)
            .then(() => {
                currentUser = null;
                userInfo.textContent = '';
                signInButton.style.display = 'block';
                signOutButton.style.display = 'none';
                chatForm.style.display = 'none';
            })
            .catch((error) => {
                console.error("Error signing out: ", error);
            });
    };

    // Event listeners for sign-in and sign-out buttons
    signInButton.addEventListener('click', signIn);
    signOutButton.addEventListener('click', signOutUser);

    const loadRandomTea = async () => {
        const teas = [];
        const querySnapshot = await getDocs(collection(db, "reviews"));
        querySnapshot.forEach((doc) => {
            const review = doc.data();
            if (!teas.includes(review.name)) {
                teas.push(review.name);
            }
        });

        if (teas.length > 0) {
            const randomIndex = new Date().getDate() % teas.length;
            randomTeaElement.innerHTML = `Today's tea recommendation: ${teas[randomIndex]}`;
        } else {
            randomTeaElement.innerHTML = `No tea reviews available yet.`;
        }
    };

    const loadReviews = async () => {
        const querySnapshot = await getDocs(collection(db, "reviews"));
        reviewsList.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const review = doc.data();
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review card mb-3';
            reviewElement.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${review.name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">Rating: ${review.rating}/10</h6>
                    <p class="card-text">${review.review}</p>
                </div>
            `;
            reviewsList.appendChild(reviewElement);
        });
    };

    const saveReview = async (review) => {
        try {
            await addDoc(collection(db, "reviews"), review);
            loadReviews();
            loadRandomTea();
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    reviewForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('tea-name').value;
        const rating = document.getElementById('tea-rating').value;
        const review = document.getElementById('tea-review').value;

        if (name && rating && review) {
            const newReview = {
                name,
                rating: parseInt(rating),
                review
            };
            saveReview(newReview);
            reviewForm.reset();
        }
    });

    const showHomePage = () => {
        homePage.style.display = 'block';
        reviewsPage.style.display = 'none';
        chatPage.style.display = 'none';
    };

    const showReviewsPage = () => {
        homePage.style.display = 'none';
        reviewsPage.style.display = 'block';
        chatPage.style.display = 'none';
        loadReviews();
    };

    const showChatPage = () => {
        homePage.style.display = 'none';
        reviewsPage.style.display = 'none';
        chatPage.style.display = 'block';
    };

    navHome.addEventListener('click', showHomePage);
    navReviews.addEventListener('click', showReviewsPage);
    navChat.addEventListener('click', showChatPage);

    // Chat functionality
    chatForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const message = chatMessage.value;
        if (message.trim() && currentUser) {
            push(ref(realtimeDb, 'chat/'), {
                message,
                name: currentUser.displayName
            });
            chatMessage.value = '';
        }
    });

    onChildAdded(ref(realtimeDb, 'chat/'), (data) => {
        const { message, name } = data.val();
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.innerHTML = `<strong>${name}:</strong> ${message}`;
        chatList.appendChild(messageElement);
        chatList.scrollTop = chatList.scrollHeight;
    });

    loadRandomTea();
    showHomePage();

    const now = new Date();
    const millisTillMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0) - now;
    setTimeout(function () {
        loadRandomTea();
        setInterval(loadRandomTea, 24 * 60 * 60 * 1000);
    }, millisTillMidnight);
});
