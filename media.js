// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC-0fUj1x9c-luQVvndqyx_4wUCGCWOgBE",
    authDomain: "chatapp-1b5e3.firebaseapp.com",
    databaseURL: "https://chatapp-1b5e3-default-rtdb.firebaseio.com",
    projectId: "chatapp-1b5e3",
    storageBucket: "chatapp-1b5e3.appspot.com",
    messagingSenderId: "396450741683",
    appId: "1:396450741683:web:72211e6b4b5e9ff6779fc6"
};
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const storage = firebase.storage();
const storageRef = storage.ref();
const connectButton = document.getElementById('post-your-pics');
const backbtn = document.getElementById('back');

// Event listener for the button click
connectButton.addEventListener('click', () => {
    window.location.href = 'upload.html';
});

backbtn.addEventListener('click', () => {
    window.location.href = 'chat.html';
});

// Function to display uploaded images in the media feed
function displayImages() {
    const mediaFeed = document.getElementById('media-feed');

    // Fetch images from Firebase Realtime Database
    database.ref('media').on('child_added', (snapshot) => {
        const imageData = snapshot.val();
        const imageName = snapshot.key;
        const imageUrl = imageData.url;

        // Create image element
        const image = document.createElement('img');
        image.src = imageUrl;

        // Create container for the image
        const mediaItem = document.createElement('div');
        mediaItem.classList.add('media-item');
        mediaItem.appendChild(image);

        // Create like button
        const likeButton = document.createElement('button');
        likeButton.innerText = 'Like';
        likeButton.addEventListener('click', () => {
            likeImage(imageName); // Pass image name to like function
        });
        mediaItem.appendChild(likeButton);

        // Create comments toggle button
        const commentsButton = document.createElement('button');
        commentsButton.innerText = 'Comments';
        commentsButton.addEventListener('click', () => {
            toggleComments(mediaItem, imageName);
        });
        mediaItem.appendChild(commentsButton);

        // Create container for comments
        const commentsContainer = document.createElement('div');
        commentsContainer.classList.add('comments-container');
        mediaItem.appendChild(commentsContainer);

        // Create input for new comments
        const commentInput = document.createElement('input');
        commentInput.type = 'text';
        commentInput.placeholder = 'Write a comment...';
        mediaItem.appendChild(commentInput);

        // Create button to submit new comment
        const submitCommentButton = document.createElement('button');
        submitCommentButton.innerText = 'Post Comment';
        submitCommentButton.addEventListener('click', () => {
            const commentText = commentInput.value.trim();
            if (commentText !== '') {
                commentImage(imageName, commentText);
                commentInput.value = ''; // Clear input after commenting
            }
        });
        mediaItem.appendChild(submitCommentButton);

        // Fetch and display likes count
        fetchLikes(imageName).then((likes) => {
            const likesCount = document.createElement('span');
            likesCount.innerText = 'Likes: ' + likes;
            mediaItem.appendChild(likesCount);

            // Update likes count in real-time when changed
            database.ref('media/' + imageName + '/likes').on('value', (snapshot) => {
                likesCount.innerText = 'Likes: ' + snapshot.numChildren();
            });
        });

        // Append media item to media feed
        mediaFeed.appendChild(mediaItem);
    });
}

// Function to toggle comments visibility
function toggleComments(mediaItem, imageName) {
    const commentsContainer = mediaItem.querySelector('.comments-container');
    if (commentsContainer.style.display === 'none' || commentsContainer.style.display === '') {
        fetchComments(imageName, commentsContainer);
        commentsContainer.style.display = 'block';
    } else {
        commentsContainer.style.display = 'none';
    }
}

// Function to fetch and display comments for an image
function fetchComments(imageName, commentsContainer) {
    // Clear previous comments if any
    commentsContainer.innerHTML = '';

    // Fetch comments from Firebase
    database.ref('media/' + imageName + '/comments').on('child_added', (commentSnapshot) => {
        const commentData = commentSnapshot.val();
        const commentUserId = commentData.userId;
        const commentText = commentData.comment;

        // Fetch username based on userId
        database.ref('users/' + commentUserId + '/username').once('value').then((usernameSnapshot) => {
            const username = usernameSnapshot.val();

            // Display comment with username
            const commentElement = document.createElement('div');
            commentElement.innerHTML = `<strong>${username}: </strong>${commentText}`;
            commentsContainer.appendChild(commentElement);
        }).catch((error) => {
            console.error('Error fetching username:', error);
        });
    });
}

// Function to add a new comment to an image
function commentImage(imageName, comment) {
    const userId = firebase.auth().currentUser.uid;

    // Push comment to database
    database.ref('media/' + imageName + '/comments').push({
        userId: userId,
        comment: comment
    }).then(() => {
        console.log('Comment added successfully.');
    }).catch((error) => {
        console.error('Error adding comment:', error);
    });
}

// Function to like an image
function likeImage(imageName) {
    const userId = firebase.auth().currentUser.uid;

    // Check if user already liked the image
    database.ref('media/' + imageName + '/likes/' + userId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            // User already liked the image, so unlike it
            database.ref('media/' + imageName + '/likes/' + userId).remove();
        } else {
            // User hasn't liked the image, so like it
            database.ref('media/' + imageName + '/likes/' + userId).set(true);
        }
    }).catch((error) => {
        console.error('Error liking image:', error);
    });
}

// Load images and initialize on page load
window.onload = function() {
    displayImages();
};





function likeImage(imageName) {
    const userId = firebase.auth().currentUser.uid;

    // Check if user already liked the image
    database.ref('media/' + imageName + '/likes/' + userId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            // User already liked the image, so unlike it
            database.ref('media/' + imageName + '/likes/' + userId).remove();
        } else {
            // User hasn't liked the image, so like it
            database.ref('media/' + imageName + '/likes/' + userId).set(true);
        }
    }).catch((error) => {
        console.error('Error liking image:', error);
    });
}


// Function to comment on an image
function commentImage(imageName, comment) {
    const userId = firebase.auth().currentUser.uid;

    // Push comment to database
    database.ref('media/' + imageName + '/comments').push({
        userId: userId,
        comment: comment
    }).then(() => {
        console.log('Comment added successfully.');
    }).catch((error) => {
        console.error('Error adding comment:', error);
    });
}

// Function to fetch likes count for an image
function fetchLikes(imageName) {
    return database.ref('media/' + imageName + '/likes').once('value').then((snapshot) => {
        return snapshot.numChildren(); // Return number of likes
    }).catch((error) => {
        console.error('Error fetching likes:', error);
    });
}

// Load images and initialize on page load
window.onload = function() {
    displayImages();
};
