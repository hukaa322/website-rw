fetch("data/struktur.json")

.then(response=>response.json())

.then(data=>{

const grid=document.getElementById("structureGrid");

data.forEach(item=>{

grid.innerHTML+=`

<div class="member-card">

<img src="${item.foto}" class="member-photo">

<h3>${item.nama}</h3>

<h4>${item.jabatan}</h4>

<p>

<i class="fa-solid fa-phone"></i>

${item.telepon}

</p>

</div>

`;

});

});