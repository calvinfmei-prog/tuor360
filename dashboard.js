// =============================
// CONEXÃO SUPABASE
// =============================

const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// =============================
// VARIÁVEIS
// =============================

let corretor_id = null;
let corretor_nome = "";
let imovelEditando = null;


// =============================
// VERIFICAR SESSÃO
// =============================

async function verificarSessao(){

const { data } = await supabaseClient.auth.getSession();

if(!data.session){

window.location.replace("/login.html");
return false;

}

return true;

}

const userId = userData.user.id;


// =============================
// BUSCAR CORRETOR
// =============================

const { data, error } = await supabaseClient
.from("corretores")
.select("*")
.eq("user_id", userId)
.single();

if(error){
console.error("Erro ao buscar corretor", error);
return;
}

corretor_id = data.id;
corretor_nome = data.nome;

carregarDashboard();

}


// =============================
// CARREGAR DASHBOARD
// =============================

async function carregarDashboard(){

document.getElementById("nomeCorretor").innerText =
`Olá, ${corretor_nome}`;
  
const { data: imoveis } = await supabaseClient
.from("imoveis")
.select("*")
.eq("corretor_id", corretor_id);


// =============================
// MÉTRICAS
// =============================

document.getElementById("totalImoveis").innerText = imoveis.length;


// valor carteira
const disponiveis = imoveis.filter(i => i.status !== "vendido");

const valorCarteira = disponiveis.reduce((soma,i)=> soma + Number((i.preco || "0").replace(/\./g,"")),0);

document.getElementById("valorCarteira").innerText =
valorCarteira.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});


// valor vendido
const vendidos = imoveis.filter(i => i.status === "vendido");

const valorVendido = vendidos.reduce((soma,i)=> soma + Number((i.preco || "0").replace(/\./g,"")),0);

document.getElementById("valorVendido").innerText =
valorVendido.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});


// =============================
// VISUALIZAÇÕES
// =============================

const ids = imoveis.map(i => i.id);


// buscar extras
const { data: extrasData } = await supabaseClient
.from("imovel_extras")
.select("imovel_id, extra")
.in("imovel_id", ids);


// organizar extras por imóvel
const extrasPorImovel = {};

if(extrasData){
extrasData.forEach(e=>{

if(!extrasPorImovel[e.imovel_id]){
extrasPorImovel[e.imovel_id] = [];
}

extrasPorImovel[e.imovel_id].push(e.extra);

});
}


// buscar visitas
const { data: visitas } = await supabaseClient
.from("visitas_imoveis")
.select("imovel_id")
.in("imovel_id", ids);


// contar visualizações
const views = {};

if(visitas){
visitas.forEach(v=>{
views[v.imovel_id] = (views[v.imovel_id] || 0) + 1;
});
}

const totalViews = visitas ? visitas.length : 0;

document.getElementById("totalViews").innerText = totalViews;


// =============================
// LISTA DE IMÓVEIS
// =============================

const lista = document.getElementById("listaImoveis");

lista.innerHTML = "";

imoveis.forEach(imovel => {

const viewCount = views[imovel.id] || 0;

const extras = extrasPorImovel[imovel.id] || [];

const item = document.createElement("div");

item.className = "imovel-admin";

item.innerHTML = `

<h3>${imovel.titulo}</h3>

<p>
${Number((imovel.preco || "0").replace(/\./g,"")).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
</p>

<p>
🛏️ ${imovel.quartos || 0} quartos • 
🚿 ${imovel.banheiros || 0} banheiros • 
📐 ${imovel.area || 0} m²
</p>

<p>
👁️ ${viewCount} visualizações
</p>

<p>
Status: ${imovel.status || "disponível"}
</p>

<p>
⭐ Extras: ${extras.length ? extras.join(", ") : "Nenhum"}
</p>

<button onclick="editarImovel(${imovel.id})">
Editar
</button>

<button onclick="marcarVendido(${imovel.id})">
Vendido
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

const { error } = await supabaseClient
.from("imoveis")
.delete()
.eq("id", id);

if(error){
alert("Erro ao excluir");
console.error(error);
return;
}

alert("Imóvel excluído!");

location.reload();

}


// =============================
// MARCAR VENDIDO
// =============================

async function marcarVendido(id){

const confirmar = confirm("Marcar este imóvel como vendido?");

if(!confirmar) return;

const { error } = await supabaseClient
.from("imoveis")
.update({status:"vendido"})
.eq("id", id);

if(error){
alert("Erro ao atualizar");
console.error(error);
return;
}

alert("Imóvel marcado como vendido");

location.reload();

}


// =============================
// EDITAR IMÓVEL (MODAL)
// =============================

async function editarImovel(id){

imovelEditando = id;

const { data, error } = await supabaseClient
.from("imoveis")
.select("*")
.eq("id", id)
.single();

if(error){
console.error(error);
return;
}

document.getElementById("editTitulo").value = data.titulo;
document.getElementById("editPreco").value = data.preco;

document.getElementById("editQuartos").value = data.quartos || "";
document.getElementById("editBanheiros").value = data.banheiros || "";
document.getElementById("editArea").value = data.area || "";

document.getElementById("editStatus").value = data.status || "disponivel";


// =============================
// BUSCAR EXTRAS
// =============================

const { data: extrasData } = await supabaseClient
.from("imovel_extras")
.select("extra")
.eq("imovel_id", id);

const extras = extrasData ? extrasData.map(e => e.extra) : [];


document.getElementById("extraPiscina").checked = extras.includes("Piscina");
document.getElementById("extraGaragem").checked = extras.includes("Garagem");
document.getElementById("extraAcademia").checked = extras.includes("Academia");
document.getElementById("extraGourmet").checked = extras.includes("Área Gourmet");


document.getElementById("modalEditar").style.display = "flex";

}


// =============================
// SALVAR EDIÇÃO
// =============================

async function salvarEdicao(){

const titulo = document.getElementById("editTitulo").value;
const preco = document.getElementById("editPreco").value;

const quartos = document.getElementById("editQuartos").value;
const banheiros = document.getElementById("editBanheiros").value;
const area = document.getElementById("editArea").value;

const status = document.getElementById("editStatus").value;


// =============================
// ATUALIZAR IMÓVEL
// =============================

const { error } = await supabaseClient
.from("imoveis")
.update({
titulo,
preco,
quartos,
banheiros,
area,
status
})
.eq("id", imovelEditando);

if(error){
alert("Erro ao salvar imóvel");
console.error(error);
return;
}


// =============================
// CAPTURAR EXTRAS
// =============================

let extras = [];

if(document.getElementById("extraPiscina").checked) extras.push("Piscina");
if(document.getElementById("extraGaragem").checked) extras.push("Garagem");
if(document.getElementById("extraAcademia").checked) extras.push("Academia");
if(document.getElementById("extraGourmet").checked) extras.push("Área Gourmet");


// =============================
// REMOVER EXTRAS ANTIGOS
// =============================

await supabaseClient
.from("imovel_extras")
.delete()
.eq("imovel_id", imovelEditando);


// =============================
// INSERIR NOVOS EXTRAS
// =============================

const extrasInsert = extras.map(extra => ({
imovel_id: imovelEditando,
extra: extra
}));

if(extrasInsert.length > 0){

const { error: errorExtras } = await supabaseClient
.from("imovel_extras")
.insert(extrasInsert);

if(errorExtras){
console.error(errorExtras);
}

}

alert("Imóvel atualizado!");

fecharModal();
carregarDashboard();

}


// =============================
// FECHAR MODAL
// =============================

function fecharModal(){

document.getElementById("modalEditar").style.display = "none";

}

// =============================
// LOGOUT
// =============================

async function logout(){

await supabaseClient.auth.signOut();

// replace impede voltar para o dashboard
window.location.replace("/login.html");

}

// =============================
// INICIAR COM PROTEÇÃO
// =============================

(async () => {

const autorizado = await verificarSessao();

if(autorizado){
iniciarDashboard();
}

})();
