// Your Firebase configuration and initialization
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

let logbtn = document.getElementById("logbtn").addEventListener("click", logd);
let regbtn = document.getElementByI("regbtn").addEventListener("click", regd);


function logd(){
    window.location.href="login.html"
}

function regd(){
    window.location.href="register.html"
}