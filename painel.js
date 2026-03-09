const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

const corretorId = sessionStorage.getItem("corretorId");
const corretorNome = sessionStorage.getItem("corretorNome");

if(!corretorId){
  window.location.href = "index.html";
}

let whatsappCorretor = "";

async function carregarCorretor(){

const { data } = await supabaseClient
.from("corretores")
.select("whatsapp")
.eq("id", corretorId)
.single();

whatsappCorretor = data.whatsapp;

}

document.getElementById("titulo").innerText =
"Imóveis de " + corretorNome;

async function carregarImoveis(){

await carregarCorretor();

const { data, error } = await supabaseClient
.from("imoveis")
.select("*")
.eq("corretor_id", corretorId);

const lista = document.getElementById("listaImoveis");

lista.innerHTML = "";

if(error){
lista.innerHTML = "Erro ao carregar imóveis.";
return;
}

if(data.length === 0){
lista.innerHTML = "Nenhum imóvel cadastrado.";
return;
}

data.forEach(imovel => {

lista.innerHTML += `

<div class="card">

<img src="${imovel.imagem}" class="card-img">

<div class="card-body">

<h3>${imovel.titulo}</h3>

<p>
${imovel.quartos} quartos •
${imovel.area}m²
</p>

<h4>R$ ${imovel.preco}</h4>

<a href="imovel.html?id=${imovel.id}" class="btn-preto">
Ver Imóvel
</a>

<a href="https://wa.me/${whatsappCorretor}" class="btn-verde">
Falar no WhatsApp
</a>

</div>

</div>

`;

});

}
function filtrar(tipo){

if(tipo === "todos"){

carregarImoveis()

}else{

carregarImoveis(tipo)

}

}
function logout(){
sessionStorage.clear();
window.location.href = "index.html";
}

carregarImoveis();
