const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const corretorId = sessionStorage.getItem("corretorId");
const corretorNome = sessionStorage.getItem("corretorNome");

if(!corretorId){
  window.location.href = "index.html";
}

document.getElementById("titulo").innerText =
"Imóveis de " + corretorNome;

async function carregarImoveis(){

const { data, error } = await supabase
  .from("imoveis")
  .select("*")
  .eq("corretor_id", corretorId);

const lista = document.getElementById("listaImoveis");

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

<h3>${imovel.titulo}</h3>

<p>Preço: ${imovel.preco}</p>

<a href="${imovel.tour}" target="_blank">Ver Tour</a>

</div>
`;

});

}

function logout(){
sessionStorage.clear();
window.location.href = "index.html";
}

carregarImoveis();
