// ===================================
// AJPLUS AI Navigation System
// ===================================

console.log("AJPLUS AI Started");

// Fungua screen
function goTo(page){

    // Ficha screen zote
    document.querySelectorAll(".screen").forEach(screen=>{
        screen.classList.remove("active");
    });

    // Onyesha screen inayotakiwa
    const target = document.getElementById("screen-" + page);

    if(target){
        target.classList.add("active");
    }else{
        console.error("Screen haipo:", page);
    }
}

// Tabs za Login/Register
function switchAuthTab(tab){

    document.querySelectorAll(".atab").forEach(btn=>{
        btn.classList.remove("active");
    });

    document.querySelectorAll(".aform").forEach(form=>{
        form.classList.remove("active");
    });

    if(tab === "signup"){
        document.getElementById("tab-signup")?.classList.add("active");
        document.getElementById("signup-form")?.classList.add("active");
    }

    if(tab === "login"){
        document.getElementById("tab-login")?.classList.add("active");
        document.getElementById("login-form")?.classList.add("active");
    }
}

// Dashboard
function showDash(page){

    goTo("dashboard");

    document.querySelectorAll(".dash-page").forEach(item=>{
        item.classList.remove("active");
    });

    document.getElementById("dash-" + page)?.classList.add("active");
}

// Sidebar
function toggleSidebar(){
    document.querySelector(".sidebar")?.classList.toggle("open");
}
