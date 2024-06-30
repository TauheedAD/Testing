// Initialize Firebase
var firebaseConfig = {
    apiKey: "AIzaSyC-0fUj1x9c-luQVvndqyx_4wUCGCWOgBE",
    authDomain: "chatapp-1b5e3.firebaseapp.com",
    databaseURL: "https://chatapp-1b5e3-default-rtdb.firebaseio.com",
    projectId: "chatapp-1b5e3",
    storageBucket: "chatapp-1b5e3.appspot.com",
    messagingSenderId: "396450741683",
    appId: "1:396450741683:web:72211e6b4b5e9ff6779fc6"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase Auth reference
const auth = firebase.auth();
const db = firebase.database();

// DOM elements
const contactsList = document.getElementById('contacts-list');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message');
const logoutBtn = document.getElementById('logout');
const userUidInput = document.getElementById('user-uid');
const connectButton = document.getElementById('connect-to-social-media');

// Event listener for the button click
connectButton.addEventListener('click', () => {
    window.location.href = 'media.html';
});
// Realtime authentication state listener
auth.onAuthStateChanged(user => {
    if (user) {
        sessionStorage.setItem('uid', user.uid);
        userUidInput.value = user.uid;
        loadContacts(user.uid); // Load contacts when user is authenticated
    } else {
        sessionStorage.removeItem('uid');
        userUidInput.value = '';
        contactsList.innerHTML = ''; // Clear contacts list if user is not authenticated
        messagesDiv.innerHTML = ''; // Clear messages if user is not authenticated
    }
});

// Load contacts function
function loadContacts(uid) {
    contactsList.innerHTML = '';
    db.ref('users').once('value').then(snapshot => {
        snapshot.forEach(childSnapshot => {
            const contactUid = childSnapshot.key;
            if (contactUid !== uid) {
                const contact = childSnapshot.val();
                const li = document.createElement('li');
                li.textContent = contact.username;
                li.dataset.uid = contactUid;
                li.addEventListener('click', () => {
                    setActiveContact(li);
                    loadChat(uid, contactUid);
                });
                contactsList.appendChild(li);
            }
        });
    }).catch(error => {
        console.error('Error loading contacts:', error.message);
    });
}

// Set active contact
function setActiveContact(selectedLi) {
    const contactItems = contactsList.children;
    for (let item of contactItems) {
        item.classList.remove('active');
    }
    selectedLi.classList.add('active');
}

// Load chat messages function
// Load chat messages function
function loadChat(userUid, contactUid) {
    const chatId = [userUid, contactUid].sort().join('_');
    db.ref('chats/' + chatId).on('value', snapshot => {
        messagesDiv.innerHTML = '';
        snapshot.forEach(childSnapshot => {
            const message = childSnapshot.val();
            const messageId = childSnapshot.key;

            const messageItem = document.createElement('div');
            messageItem.classList.add('message-item');
            messageItem.setAttribute('data-id', messageId);
            
            const messageText = document.createElement('p');
            messageText.textContent = `${message.senderUsername}: ${message.text}`;
            
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteMessage(chatId, messageId));
            
            messageItem.appendChild(messageText);
            messageItem.appendChild(deleteButton);
            messagesDiv.appendChild(messageItem);
        });
    });
}
// Function to delete a message
function deleteMessage(chatId, messageId) {
    if (confirm('Are you sure you want to delete this message?')) {
        // Remove the message from Firebase Realtime Database
        db.ref('chats/' + chatId + '/' + messageId).remove()
            .then(() => {
                console.log('Message deleted successfully.');
                // Optionally, remove the message from the DOM
                document.querySelector(`[data-id="${messageId}"]`).remove();
            })
            .catch(error => {
                console.error('Error deleting message:', error);
                alert('message deleted');
            });
    }
}


// Send message
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();
    if (messageText === '') return;

    const userUid = document.getElementById('user-uid').value;
    const activeContact = document.querySelector('#contacts-list li.active');
    if (!activeContact) {
        alert('Please select a contact to send a message.');
        return;
    }
    const contactUid = activeContact.dataset.uid;
    const chatId = [userUid, contactUid].sort().join('_');

    db.ref('users/' + userUid).once('value').then(snapshot => {
        const username = snapshot.val().username;
        const messageData = {
            text: messageText,
            senderUid: userUid,
            senderUsername: username,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        db.ref('chats/' + chatId).push(messageData);
    });

    messageInput.value = '';
}

// Logout
function logout() {
    auth.signOut().then(() => {
        sessionStorage.removeItem('uid');
        document.getElementById('user-uid').value = '';
        window.location.href = 'index.html'; // Redirect to login page after logout
    }).catch(error => {
        alert(error.message);
    });
}


// Send message function
sendMessageBtn.addEventListener('click', () => {
    const messageText = messageInput.value.trim();
    if (messageText === '') return;

    const userUid = userUidInput.value;
    const activeContact = document.querySelector('#contacts-list li.active');
    if (!activeContact) {
        alert('Please select a contact to send a message.');
        return;
    }
    const contactUid = activeContact.dataset.uid;
    const chatId = [userUid, contactUid].sort().join('_');

    db.ref('users/' + userUid).once('value').then(snapshot => {
        const username = snapshot.val().username;
        const messageData = {
            text: messageText,
            senderUid: userUid,
            senderUsername: username,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        db.ref('chats/' + chatId).push(messageData);
    }).catch(error => {
        console.error('Error sending message:', error.message);
    });

    messageInput.value = '';
});

// Logout function
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        sessionStorage.removeItem('uid');
        userUidInput.value = '';
        window.location.href = 'login.html'; // Redirect to login page
    }).catch(error => {
        console.error('Logout error:', error.message);
        alert(error.message);
    });
});