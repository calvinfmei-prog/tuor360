const { data } = await supabaseClient.auth.getUser();

if(!data.user){

window.location.href = "/login.html";

}

// =============================
// CONEXÃO SUPABASE
// =============================

const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);


// =============================
// PEGAR CORRETOR DA URL
// exemplo: /dashboard.html?corretor=bruno-aprigio
// =============================

const params = new URLSearchParams(window.location.search);
const corretorSlug = params.get("corretor");

let corretor_id = null;


// =============================
// BUSCAR CORRETOR
// =============================

async function carregarCorretor(){

const { data, error } = await supabaseClient
.from("corretores")
.select("*")
.eq("slug", corretorSlug)
.single();

if(error){
console.error("Erro corretor", error);
return;
}

corretor_id = data.id;

carregarDashboard();

}


// =============================
// CARREGAR DASHBOARD
// =============================

async function carregarDashboard(){

// pegar imóveis do corretor
const { data: imoveis } = await supabaseClient
.from("imoveis")
.select("*")
.eq("corretor_id", corretor_id);


// =============================
// MÉTRICAS
// =============================

document.getElementById("totalImoveis").innerText = imoveis.length;


// valor da carteira
const disponiveis = imoveis.filter(i => i.status !== "vendido");

const valorCarteira = disponiveis.reduce((soma,i)=> soma + Number(i.preco),0);

document.getElementById("valorCarteira").innerText =
valorCarteira.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});


// valor vendido
const vendidos = imoveis.filter(i => i.status === "vendido");

const valorVendido = vendidos.reduce((soma,i)=> soma + Number(i.preco),0);

document.getElementById("valorVendido").innerText =
valorVendido.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});


// =============================
// VISUALIZAÇÕES
// =============================

const ids = imoveis.map(i => i.id);

const { data: visitas } = await supabaseClient
.from("visitas_imoveis")
.select("imovel_id")
.in("imovel_id", ids);


// contar visitas por imóvel
const views = {};

visitas.forEach(v=>{
views[v.imovel_id] = (views[v.imovel_id] || 0) + 1;
});


// total views
const totalViews = visitas.length;

document.getElementById("totalViews").innerText = totalViews;


// =============================
// LISTA DE IMÓVEIS
// =============================

const lista = document.getElementById("listaImoveis");

lista.innerHTML = "";

imoveis.forEach(imovel => {

const viewCount = views[imovel.id] || 0;

const item = document.createElement("div");

item.className = "imovel-admin";

item.innerHTML = `

<h3>${imovel.titulo}</h3>

<p>
${Number(imovel.preco).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
</p>

<p>
👁️ ${viewCount} visualizações
</p>

<p>
Status: ${imovel.status || "disponível"}
</p>

<button onclick="editarImovel(${imovel.id})">
Editar
</button>

<button onclick="excluirImovel(${imovel.id})">
Excluir
</button>

`;

lista.appendChild(item);

});

}


// =============================
// EXCLUIR IMÓVEL
// =============================

async function excluirImovel(id){

const confirmar = confirm("Deseja excluir este imóvel?");

if(!confirmar) return;

await supabaseClient
.from("imoveis")
.delete()
.eq("id", id);

location.reload();

}


// =============================
// EDITAR IMÓVEL (placeholder)
// =============================

function editarImovel(id){

window.location.href = `/admin.html?id=${id}`;

}


// =============================
// INICIAR
// =============================

carregarCorretor();
