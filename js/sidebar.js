window.addEventListener("DOMContentLoaded",()=>{

    document.addEventListener("click",(e)=>{

        const menu=document.getElementById("menuToggle");

        const sidebar=document.getElementById("sidebar");

        const overlay=document.getElementById("overlay");

        if(menu && e.target.closest("#menuToggle")){

            sidebar.classList.add("active");

            overlay.classList.add("active");

        }

        if(overlay && e.target===overlay){

            sidebar.classList.remove("active");

            overlay.classList.remove("active");

        }

    });

});