fetch("data/layanan.json")
.then(res=>res.json())
.then(data=>{

const grid=document.getElementById("layananGrid");

data.forEach(item=>{

grid.innerHTML+=`

<div class="service-card">

<div class="service-icon">

<i class="fa-solid ${item.icon}"></i>

</div>

<h3>${item.judul}</h3>

<p>${item.deskripsi}</p>

<span>

<i class="fa-regular fa-clock"></i>

${item.waktu}

</span>

<button>

Ajukan Sekarang

</button>

</div>

`;

});

});