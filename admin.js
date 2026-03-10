const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

const loginBox = document.getElementById("loginBox");
const adminPanel = document.getElementById("adminPanel");

/* LOGIN */

document
.getElementById("loginForm")
.addEventListener("submit", async (e)=>{

e.preventDefault();

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { error } = await supabaseClient.auth.signInWithPassword({
email,
password
});

if(error){

alert("Erro no login: " + error.message);

}else{

verificarSessao();

}

});

/* VERIFICAR SESSÃO */

async function verificarSessao(){

const { data: { session } } = await supabaseClient.auth.getSession();

if(session){

loginBox.classList.add("hidden");
adminPanel.classList.remove("hidden");

}else{

loginBox.classList.remove("hidden");
adminPanel.classList.add("hidden");

}

}

verificarSessao();

/* SALVAR IMÓVEL */

document
.getElementById("form-imovel")
.addEventListener("submit", async (e)=>{

e.preventDefault();

const titulo = document.getElementById("titulo").value;
const tipo = document.getElementById("tipo").value;
const preco = document.getElementById("preco").value;
const quartos = document.getElementById("quartos").value;
const banheiros = document.getElementById("banheiros").value;
const area = document.getElementById("area").value;
const imagem = document.getElementById("imagem").value;
const tour = document.getElementById("tour").value;

/* BUSCAR CORRETOR */

const { data: corretor } = await supabaseClient
.from("corretores")
.select("id")
.limit(1)
.single();

/* INSERIR */

const { error } = await supabaseClient
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
corretor_id: corretor.id
});

if(error){

alert("Erro: " + error.message);

}else{

alert("Imóvel cadastrado!");

document.getElementById("form-imovel").reset();

}

});

/* LOGOUT */

async function logout(){

await supabaseClient.auth.signOut();

location.reload();

}
