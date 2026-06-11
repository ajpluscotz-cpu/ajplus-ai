// ====================================
// AJPLUS AI Main Application
// ====================================

console.log("AJPLUS AI Started Successfully");

// Navigation
function goTo(page){
    console.log("Opening:", page);
}

// Authentication
function loginUser(){
    alert("Login system coming soon...");
}

function registerUser(){
    alert("Registration system coming soon...");
}

// AI Chat
function sendMessage(){
    const input = document.getElementById("chatInput");

    if(!input) return;

    const message = input.value.trim();

    if(message === "") return;

    console.log("User:", message);

    input.value = "";
}

// Dashboard
function openDashboard(){
    console.log("Dashboard Opened");
}
