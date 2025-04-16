let isCreating = false;

document.getElementById("toggleForm").addEventListener("click", function () {
  isCreating = !isCreating;
  document.getElementById("formTitle").textContent = isCreating ? "Create Account" : "Login";
  document.getElementById("actionBtn").textContent = isCreating ? "Register" : "Login";
  this.textContent = isCreating ? "Back to login" : "Create new account";
});

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (isCreating) {
    createAccount(username, password);
  } else {
    login(username, password);
  }
});

function createAccount(username, password) {
  const email = username.includes('@') ? username : `${username}@example.com`;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      db.collection("users").doc(userCredential.user.uid).set({
        username: username,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert("Account created successfully. Please log in.");
      document.getElementById("toggleForm").click();
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
}
// Login logic
function login(username, password) {
  const email = username.includes('@') ? username : `${username}@example.com`;
  if (username === "admin" && password === "admin123") {
    localStorage.setItem("loggedInUser", username);
    window.location.href = "india.html";
    return;
  }
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      localStorage.setItem("loggedInUser", username);
      window.location.href = "india.html";
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
}
