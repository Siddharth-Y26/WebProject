let isCreating = false;

// Toggle between login and register form
document.getElementById("toggleForm").addEventListener("click", function () {
  isCreating = !isCreating;
  document.getElementById("formTitle").textContent = isCreating ? "Create Account" : "Login";
  document.getElementById("actionBtn").textContent = isCreating ? "Register" : "Login";
  this.textContent = isCreating ? "Back to login" : "Create new account";
});

// Handle form submit
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

// Create account logic
function createAccount(username, password) {
  if (username.toLowerCase() === "admin") {
    alert("Cannot create an admin account.");
    return;
  }

  if (localStorage.getItem(`user_${username}`)) {
    alert("Username already exists!");
  } else {
    localStorage.setItem(`user_${username}`, password);
    alert("Account created successfully. You can now log in.");
    document.getElementById("toggleForm").click(); // switch to login mode
  }
}

// Login logic
function login(username, password) {
  // Check for admin login
  if (username === "admin" && password === "admin123") {
    localStorage.setItem("loggedInUser", username);
    window.location.href = "india.html";
    return;
  }

  // Check if user exists in localStorage
  const storedPassword = localStorage.getItem(`user_${username}`);
  if (storedPassword && storedPassword === password) {
    localStorage.setItem("loggedInUser", username);
    window.location.href = "india.html";
  } else {
    alert("Invalid username or password.");
  }
}