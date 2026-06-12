// Navigation
function goTo(page){

    // Ficha screens zote
    document.querySelectorAll(".screen").forEach(screen=>{
        screen.classList.remove("active");
    });

    // Onyesha screen inayotakiwa
    const target = document.getElementById("screen-" + page);

    if(target){
        target.classList.add("active");
    }else{
        console.error("Screen haijapatikana:", page);
    }
}
