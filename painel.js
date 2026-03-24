const params = new URLSearchParams(window.location.search);
let slugCorretor = params.get("corretor");

// se não tiver ?corretor= pega direto da URL
if(!slugCorretor){
  const path = window.location.pathname.replace(/^\/|\/$/g, "");
  if(path){
    slugCorretor = path.split("/")[0];
  }
}

const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

let corretorId = sessionStorage.getItem("corretorId");
let corretorNome = sessionStorage.getItem("corretorNome");

let whatsappCorretor = "";

// LISTA ORIGINAL
let todosImoveis = [];

// FILTRO TIPO
let tipoFiltro = "todos";


async function inicializarCorretor(){

  if(slugCorretor && !corretorId){

    const { data: corretor } = await supabaseClient
      .from("corretores")
      .select("*")
      .eq("slug", slugCorretor)
      .single();

    if(corretor){

      corretorId = corretor.id;
      corretorNome = corretor.nome;

      sessionStorage.setItem("corretorId", corretor.id);
      sessionStorage.setItem("corretorNome", corretor.nome);

    }

  }

  if (!corretorId) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("titulo").innerText =
  "Imóveis Exclusivos de " + corretorNome;

}


async function carregarCorretor(){

  const { data } = await supabaseClient
    .from("corretores")
    .select("whatsapp")
    .eq("id", corretorId)
    .single();

  whatsappCorretor = data.whatsapp;

}


async function carregarImoveis(){

  await inicializarCorretor();
  await carregarCorretor();

  const { data, error } = await supabaseClient
    .from("imoveis")
    .select("*")
    .eq("corretor_id", corretorId);

  const lista = document.getElementById("listaImoveis");

  if (error) {
    lista.innerHTML = "Erro ao carregar imóveis.";
    return;
  }

  todosImoveis = data;

  aplicarFiltros();

}


function aplicarFiltros(){

  let lista = [...todosImoveis];

  const busca = document.getElementById("busca")?.value.toLowerCase() || "";

  const statusFiltro = document.getElementById("filtroStatus")?.value || "todos";

  const ordem = document.getElementById("ordenarValor")?.value || "nenhum";
  console.log("ordem selecionada:", ordem);


  // FILTRO TIPO (venda / aluguel)

  if(tipoFiltro !== "todos"){
    lista = lista.filter(i => i.tipo === tipoFiltro);
  }


  // BUSCA POR NOME

  if(busca){
    lista = lista.filter(imovel =>
      imovel.titulo.toLowerCase().includes(busca)
    );
  }


  // FILTRO STATUS

  if(statusFiltro !== "todos"){
    lista = lista.filter(imovel =>
      imovel.status === statusFiltro
    );
  }


  // ORDENAR VALOR

  if(ordem === "maior"){
    lista.sort((a,b)=> Number(b.preco) - Number(a.preco));
}

  if(ordem === "menor"){
    lista.sort((a,b)=> Number(a.preco) - Number(b.preco));
}


  renderizarImoveis(lista);

}


function renderizarImoveis(data){

  const lista = document.getElementById("listaImoveis");

  lista.innerHTML = "";

  if (data.length === 0) {
    lista.innerHTML = "Nenhum imóvel encontrado.";
    return;
  }

  data.forEach(imovel => {

    const status = imovel.status === "vendido"
      ? '<span class="status-vendido">🔴 Vendido</span>'
      : '<span class="status-disponivel">🟢 Disponível</span>';

    // tratar dados
    const preco = Number(imovel.preco || 0);
    const quartos = imovel.quartos || 0;
    const banheiros = imovel.banheiros || 0;
    const area = imovel.area || 0;

    // fallback de imagem
    const imagem = imovel.imagem 
      ? imovel.imagem 
      : "https://via.placeholder.com/400x250?text=Sem+Imagem";

    // mensagem whatsapp personalizada
    const mensagem = encodeURIComponent(
      `Olá! Tenho interesse no imóvel: ${imovel.titulo} - R$ ${preco.toLocaleString("pt-BR")}`
    );

    lista.innerHTML += `

    <div class="card">

      <img src="${imagem}" class="card-img" onerror="this.src='https://via.placeholder.com/400x250?text=Imagem+Indisponível'">

      <div class="card-body">

        <h3>${imovel.titulo}</h3>

        <p class="status-imovel">
        ${status}
        </p>

        <p>
        🛏️ ${quartos} quartos •
        🚿 ${banheiros} banheiros •
        📐 ${area}m²
        </p>

        <h4>R$ ${preco.toLocaleString("pt-BR")}</h4>

        <a href="/${slugCorretor}/${imovel.slug}" class="btn-preto">
        Ver Imóvel
        </a>

        <a href="https://wa.me/${whatsappCorretor}?text=${mensagem}" target="_blank" class="btn-verde">
        Falar no WhatsApp
        </a>

      </div>

    </div>

    `;

  });

}

// FILTRO TIPO (botões venda/aluguel)

function filtrar(tipo){
  tipoFiltro = tipo;
  aplicarFiltros();
}


function logout(){
  sessionStorage.clear();
  window.location.href = "index.html";
}


carregarImoveis();
