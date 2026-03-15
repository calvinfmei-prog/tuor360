const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

/* =========================
LER SLUG DA URL
========================= */

const path = window.location.pathname.replace(/^\/|\/$/g, "");

const partes = path.split("/");

const slugCorretor = partes[0] || null;
const slugImovel = partes[1] || null;

console.log("Corretor:", slugCorretor);
console.log("Imóvel:", slugImovel);

/* =========================
CARREGAR IMÓVEL
========================= */

async function carregar(){

if(!slugImovel){
console.error("Slug do imóvel não encontrado na URL.");
document.body.innerHTML = "Imóvel não encontrado.";
return;
}

const { data: imovel, error } = await supabaseClient
.from("imoveis")
.select(`
*,
corretores ( whatsapp )
`)
.eq("slug", slugImovel)
.single();

if(error){
console.error("Erro ao carregar imóvel:", error);
document.body.innerHTML = "Erro ao carregar imóvel.";
return;
}

if(!imovel){
document.body.innerHTML = "Imóvel não encontrado.";
return;
}

console.log("Imóvel:", imovel);

/* =========================
SELO VENDIDO
========================= */

if(imovel.status === "vendido"){

const selo = document.createElement("div");

selo.className = "selo-vendido";

selo.innerText = "VENDIDO";

document.body.appendChild(selo);

}
  
/* =========================
ESTATÍSTICAS (1 VISITA A CADA 12H)
========================= */

const chaveVisita = "visita_imovel_" + imovel.id;

const agora = Date.now();
const ultimaVisita = localStorage.getItem(chaveVisita);

const limite = 12 * 60 * 60 * 1000; // 12 horas em ms

if(!ultimaVisita || (agora - ultimaVisita) > limite){

await supabaseClient
.from("visitas_imoveis")
.insert({
imovel_id: imovel.id
});

localStorage.setItem(chaveVisita, agora);

}
/* =========================
ESTATÍSTICAS (CONTAR VISITAS)
========================= */

const { count } = await supabaseClient
.from("visitas_imoveis")
.select("*", { count: "exact", head: true })
.eq("imovel_id", imovel.id);

const viewsEl = document.getElementById("views");

if(viewsEl){
viewsEl.innerText = count;
}

/* =========================
Dados para whatsapp
========================= */

document.querySelector('meta[property="og:title"]')
.setAttribute("content", imovel.titulo);

document.querySelector('meta[property="og:description"]')
.setAttribute(
"content",
`${imovel.quartos} quartos • ${imovel.area}m² • R$ ${imovel.preco}`
);

document.querySelector('meta[property="og:image"]')
.setAttribute("content", imovel.imagem);

document.querySelector('meta[property="og:url"]')
.setAttribute("content", window.location.href);

/* =========================
PREENCHER DADOS
========================= */

document.getElementById("titulo").innerText = imovel.titulo;

document.getElementById("preco").innerText = "R$ " + Number(imovel.preco).toLocaleString("pt-BR");

const statusEl = document.getElementById("status");

if(imovel.status === "vendido"){

statusEl.innerHTML = "🔴 Vendido";

}else{

statusEl.innerHTML = "🟢 Disponível";

}

document.getElementById("info").innerText =
imovel.quartos + " quartos • " +
imovel.banheiros + " banheiros • " +
imovel.area + "m²";

/* =========================
WHATSAPP
========================= */

if(imovel.corretores){
document.getElementById("whatsapp").href =
"https://wa.me/" + imovel.corretores.whatsapp;
}

/* =========================
TOUR
========================= */

if(imovel.tour){

document.getElementById("tour").innerHTML = `
<iframe
width="100%"
height="500"
src="${imovel.tour}"
frameborder="0"
allowfullscreen>
</iframe>
`;

}

/* =========================
BUSCAR EXTRAS
========================= */

const { data: extras, error: erroExtras } = await supabaseClient
.from("imovel_extras")
.select("extra")
.eq("imovel_id", imovel.id);

console.log("Extras encontrados:", extras);

const extrasDiv = document.getElementById("extras");

if(erroExtras){
console.error("Erro extras:", erroExtras);
extrasDiv.innerHTML = "Erro ao carregar extras.";
return;
}

/* =========================
ÍCONES DOS EXTRAS
========================= */

const iconesExtras = {

"Piscina": "🏊",
"Garagem": "🚗",
"Academia": "🏋️",
"Área Gourmet": "🍖",
"Churrasqueira": "🔥",
"Elevador": "🛗",
"Varanda": "🌅",
"Jardim": "🌳",
"Portaria 24h": "🛡️",
"Ar Condicionado": "❄️"

};

/* =========================
MOSTRAR EXTRAS
========================= */

if(extras && extras.length > 0){

extrasDiv.innerHTML = extras
.map(e => {

const icone = iconesExtras[e.extra] || "✔️";

return `
<span class="extra-item">
<span class="extra-icone">${icone}</span>
${e.extra}
</span>
`;

})
.join("");

}else{

extrasDiv.innerHTML = "Nenhum extra informado.";

}

}

/* =========================
INICIAR
========================= */

carregar();
