# 🌆 Urban Escapade

**Urban Escapade** is a static, educational website designed to showcase the rich diversity of Indian states through an engaging and interactive experience.

🔗 **Live Website**: [Urban Escapade](https://siddharth-y26.github.io/Urban-Escapade/)

---

## 📌 Overview

Urban Escapade is an interactive digital platform that explores Indian states through:

- 🏛️ Cultural heritage highlights  
- 🗺️ Geographical features  
- 📍 State-specific insights  

Users can start from a centralized homepage and navigate to individual state pages via an interactive map. The map allows hovering and clicking on states like **Uttar Pradesh**, which highlights the state and displays tooltips with links to detailed pages.

---

## 🧰 Technologies Used

### 🌐 HTML
- Structures pages (e.g., `Karnataka.html`, `TamilNadu.html`)
- Semantic elements like `<header>`, `<nav>`, `<section>`, `<footer>`
- Integrated links, tooltips, and map elements

### 🎨 CSS
- Styling and layout management
- Responsive design for various devices
- Interactive map effects and visual hierarchy

### ⚙️ JavaScript
- Interactive map functionality (hover, click, tooltip)
- State-based redirection
- Dynamic search functionality
- Real-time **Weather API** data display
- **Overpass API** for nearby transport data
- Sliders, popups, and dynamic UI behavior

### 🔐 Firebase
- User authentication (login & sign-up)
- Secure credential storage
- Session persistence
- Backendless scalability

---

## 🔄 Workflow

### 1️⃣ Login Page (`index.html`)
**Purpose:** Entry point to the website, ensures authenticated access  
**Features:**
- Form inputs for username and password  
- Toggle to switch between login and account creation  
- Logic handled in `login.js` for:
  - Input validation  
  - Firebase authentication  
  - Redirect to `india.html` on success  

### 2️⃣ India Overview Page (`india.html`)
**Purpose:** Central dashboard after login  
**Features:**
- Video background with overlay text  
- Search bar for manual state lookup  
- Interactive map with clickable states  
- JavaScript libraries: `d3.js`, `jquery.js`  

### 3️⃣ State Pages (e.g., `TamilNadu.html`)
**Purpose:** Display information about individual Indian states  
**Features:**
- State-specific title and banner  
- Cultural, geographical, and tourism content  
- Cards with attractions and images  
- Real-time weather via **Weather API**  
- Nearby transport options via **Overpass API**  
- "Back to India" button for navigation  

---

## 📱 Mobile Compatibility

Urban Escapade is mobile-responsive and designed to adapt across various screen sizes, ensuring accessibility on both desktop and mobile devices.

---

## ✅ Conclusion

Urban Escapade successfully integrates **HTML**, **CSS**, **JavaScript**, and **Firebase** to create an immersive and informative platform for exploring the states of India. Key highlights include:

- Secure user login and account creation  
- Interactive and intuitive map-based navigation  
- Real-time weather and transport data integration  
- Consistent, modular, and responsive design  

The project demonstrates how modern frontend technologies can be combined with cloud services to build scalable and educational web applications.

---
