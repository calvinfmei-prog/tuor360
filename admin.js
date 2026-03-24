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
SALVAR IMÓVEL (COM UPLOAD)
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
  const preco = document.getElementById("preco").value;

  const quartos = parseInt(document.getElementById("quartos").value) || 0;
  const banheiros = parseInt(document.getElementById("banheiros").value) || 0;
  const suites = parseInt(document.getElementById("suites").value) || 0;
  const lavabos = parseInt(document.getElementById("lavabos").value) || 0;
  const vagas_garagem = parseInt(document.getElementById("vagas").value) || 0;
  const area = parseInt(document.getElementById("area").value) || 0;

  const area_servico = document.getElementById("area_servico").checked;
  const varanda = document.getElementById("varanda").checked;

  const tour = document.getElementById("tour").value;

  const slug = gerarSlug(titulo);

  /* =========================
  UPLOAD DA IMAGEM
  ========================= */
  const fileInput = document.getElementById("imagem");
  const file = fileInput.files[0];

  let urlImagem = null;

  if(file){

    const nomeArquivo = `${corretor_id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabaseClient
      .storage
      .from("imoveis")
      .upload(nomeArquivo, file, { upsert: true });

    if(uploadError){
      console.error(uploadError);
      alert("Erro ao enviar imagem");
      return;
    }

    const { data: urlData } = supabaseClient
      .storage
      .from("imoveis")
      .getPublicUrl(nomeArquivo);

    urlImagem = urlData.publicUrl;
  }

  /* =========================
  INSERIR IMÓVEL
  ========================= */
  const { data, error } = await supabaseClient
    .from("imoveis")
    .insert({
      titulo,
      tipo,
      preco,
      quartos,
      banheiros,
      suites,
      lavabos,
      vagas_garagem,
      area,
      area_servico,
      varanda,
      imagem: urlImagem,
      tour,
      slug,
      corretor_id
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    alert("Erro: " + error.message);
    return;
  }

  const imovel_id = data.id;

  /* =========================
  SALVAR EXTRAS
  ========================= */
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
