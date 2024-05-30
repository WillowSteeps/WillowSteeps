// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAMOc6n_-UxqouQ8YcPb21cZ7tA79ISRSM",
    authDomain: "willowsteeps-fcca5.firebaseapp.com",
    projectId: "willowsteeps-fcca5",
    storageBucket: "willowsteeps-fcca5.appspot.com",
    messagingSenderId: "814830989524",
    appId: "1:814830989524:web:5b55c19b4155e58564cb41",
    measurementId: "G-ZLP5BZGBLQ"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</scrip

document.addEventListener('DOMContentLoaded', () => {
    const reviewForm = document.getElementById('review-form');
    const reviewsList = document.getElementById('reviews-list');

    // Load reviews from Firestore
    const loadReviews = async () => {
        const querySnapshot = await getDocs(collection(db, "reviews"));
        reviewsList.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const review = doc.data();
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review';
            reviewElement.innerHTML = `
                <h3>${review.name}</h3>
                <p>Rating: ${review.rating}/10</p>
                <p>${review.review}</p>
            `;
            reviewsList.appendChild(reviewElement);
        });
    };

    // Save review to Firestore
    const saveReview = async (review) => {
        try {
            await addDoc(collection(db, "reviews"), review);
            loadReviews();
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    // Handle form submission
    reviewForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('tea-name').value;
        const rating = document.getElementById('tea-rating').value;
        const review = document.getElementById('tea-review').value;

        if (name && rating && review) {
            const newReview = {
                name,
                rating,
                review
            };
            saveReview(newReview);
            reviewForm.reset();
        }
    });

    // Initial load
    loadReviews();
});
