// =============================
// CONEXÃO SUPABASE
// =============================

const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// =============================
// VERIFICAR ADMIN
// =============================

async function verificarAdmin(){

const { data: userData } = await supabaseClient.auth.getUser();

if(!userData.user){
  window.location.replace("/login.html");
  return false;
}

const { data, error } = await supabaseClient
.from("corretores")
.select("is_admin, nome")
.eq("user_id", userData.user.id)
.single();

if(error || !data.is_admin){
  alert("Acesso negado");
  window.location.replace("/dashboard.html");
  return false;
}

document.getElementById("nomeAdmin").innerText = `Admin: ${data.nome}`;

return true;
}

// =============================
// CARREGAR DADOS
// =============================

async function carregarPainel(){

// =============================
// TOTAL CORRETORES
// =============================

const { count: totalCorretores } = await supabaseClient
.from("corretores")
.select("*", { count: "exact", head: true });

document.getElementById("totalCorretores").innerText = totalCorretores || 0;


// =============================
// BUSCAR IMÓVEIS + CORRETORES
// =============================

const { data: imoveis } = await supabaseClient
.from("imoveis")
.select(`
*,
corretores ( nome )
`);

if(!imoveis){
  return;
}

// =============================
// MÉTRICAS
// =============================

const totalImoveis = imoveis.length;

const valorTotal = imoveis.reduce(
  (soma, i) => soma + Number(i.preco || 0),
  0
);

const vendidos = imoveis.filter(i => i.status === "vendido");

const valorVendido = vendidos.reduce(
  (soma, i) => soma + Number(i.preco || 0),
  0
);

// =============================
// VISUALIZAÇÕES
// =============================

const { count: totalViews } = await supabaseClient
.from("visitas_imoveis")
.select("*", { count: "exact", head: true });

// =============================
// RENDER METRICS
// =============================

document.getElementById("totalImoveis").innerText = totalImoveis;

document.getElementById("valorTotal").innerText =
valorTotal.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

document.getElementById("valorVendido").innerText =
valorVendido.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

document.getElementById("totalViews").innerText = totalViews || 0;


// =============================
// LISTA DE IMÓVEIS
// =============================

const lista = document.getElementById("listaImoveis");

lista.innerHTML = "";

imoveis.forEach(imovel => {

const item = document.createElement("div");

item.className = "imovel-admin";

item.innerHTML = `

<h3>${imovel.titulo}</h3>

<p>
R$ ${Number(imovel.preco).toLocaleString("pt-BR")}
</p>

<p>
🛏️ ${imovel.quartos || 0} quartos • 
🚿 ${imovel.banheiros || 0} banheiros • 
🚗 ${imovel.vagas_garagem || 0} vagas • 
📐 ${imovel.area || 0} m²
</p>

<p>
👤 Corretor: ${imovel.corretores?.nome || "N/A"}
</p>

<p>
Status: ${imovel.status || "disponível"}
</p>

`;

lista.appendChild(item);

});

}

// =============================
// LOGOUT
// =============================

async function logout(){

await supabaseClient.auth.signOut();

window.location.replace("/login.html");

}

// =============================
// INICIAR
// =============================

(async () => {

const autorizado = await verificarAdmin();

if(autorizado){
  carregarPainel();
}

})();
