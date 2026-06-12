console.log("AJPLUS AI Loaded");

function goTo(page) {

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const target = document.getElementById("screen-" + page);

    if (target) {
        target.classList.add("active");
    } else {
        console.log("Screen haipo:", page);
    }
}

function switchAuthTab(tab) {

    document.querySelectorAll(".atab").forEach(btn => {
        btn.classList.remove("active");
    });

    document.querySelectorAll(".aform").forEach(form => {
        form.classList.remove("active");
    });

    if (tab === "login") {
        document.getElementById("tab-login")?.classList.add("active");
        document.getElementById("form-login")?.classList.add("active");
    }

    if (tab === "signup") {
        document.getElementById("tab-signup")?.classList.add("active");
        document.getElementById("form-signup")?.classList.add("active");
    }
}

function showDash(page) {
    goTo("dashboard");
}

function toggleSidebar() {
    console.log("Sidebar");
}

function doLogin() {
    goTo("dashboard");
}

function doSignup() {
    goTo("dashboard");
}

function doDemo() {
    goTo("dashboard");
}

function sendMessage() {

    const input = document.getElementById("chat-input");
    const msgs = document.getElementById("chat-msgs");

    if (!input || !msgs) return;

    const text = input.value.trim();

    if (text === "") return;

    msgs.innerHTML += `
        <div class="msg user">
            ${text}
        </div>
    `;

    input.value = "";

    msgs.scrollTop = msgs.scrollHeight;
}

function handleKey(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoGrow(el) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
}

function quickPrompt(text) {
    const input = document.getElementById("chat-input");

    if (input) {
        input.value = text;
        sendMessage();
    }
}
