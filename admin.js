const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

const loginBox = document.getElementById("loginBox");
const adminPanel = document.getElementById("adminPanel");

/* =========================
FUNÇÃO PARA GERAR SLUG
========================= */
function gerarSlug(texto){
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* =========================
LOGIN
========================= */
document.getElementById("loginForm").addEventListener("submit", async (e)=>{
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if(error){
    alert("Erro no login: " + error.message);
  } else {
    verificarSessao();
  }
});

/* =========================
VERIFICAR SESSÃO
========================= */
async function verificarSessao(){
  const { data: { session } } = await supabaseClient.auth.getSession();

  if(session){
    loginBox.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    carregarCorretores();
  } else {
    loginBox.classList.remove("hidden");
    adminPanel.classList.add("hidden");
  }
}

verificarSessao();

/* =========================
CARREGAR CORRETORES
========================= */
async function carregarCorretores(){
  const { data } = await supabaseClient.from("corretores").select("id,nome");

  const select = document.getElementById("corretor");
  select.innerHTML = '<option value="">Selecionar corretor</option>';

  data.forEach(c => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.nome;
    select.appendChild(option);
  });
}

/* =========================
SALVAR IMÓVEL
========================= */
document.getElementById("form-imovel").addEventListener("submit", async (e)=>{
  e.preventDefault();

  const corretor_id = document.getElementById("corretor").value;
  if(!corretor_id){
    alert("Selecione um corretor");
    return;
  }

  
  const titulo = document.getElementById("titulo").value;
  const tipo = document.getElementById("tipo").value;
  // Captura o valor do input
  let precoRaw = document.getElementById("preco").value;
  // Remove pontos de milhar e troca vírgula por ponto
  const preco = parseFloat(precoRaw.replace(/\./g, "").replace(",", "."));
  const quartos = parseInt(document.getElementById("quartos").value);
  const banheiros = parseInt(document.getElementById("banheiros").value);
  const area = parseInt(document.getElementById("area").value);
  const imagem = document.getElementById("imagem").value;
  const tour = document.getElementById("tour").value;
  const slug = gerarSlug(titulo);

  /* Inserir imóvel */
  const { data, error } = await supabaseClient
    .from("imoveis")
    .insert({
      titulo,
      tipo,
      preco,
      quartos,
      banheiros,
      area,
      imagem,
      tour,
      slug,
      corretor_id
    })
    .select()
    .single();

  if(error){
    console.error(error);
    alert("Erro: " + error.message);
    return;
  }

  const imovel_id = data.id;

  /* Salvar extras */
  const extras = [...document.querySelectorAll(".extra:checked")].map(e => e.value);
  for(const extra of extras){
    await supabaseClient.from("imovel_extras").insert({ imovel_id, extra });
  }

  alert("Imóvel cadastrado com sucesso!");
  document.getElementById("form-imovel").reset();
});

/* =========================
LOGOUT
========================= */
async function logout(){
  await supabaseClient.auth.signOut();
  location.reload();
}
