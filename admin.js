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

carregarCorretores();

}else{

loginBox.classList.remove("hidden");
adminPanel.classList.add("hidden");

}

}

verificarSessao();

/* CARREGAR CORRETORES */

async function carregarCorretores(){

const { data } = await supabaseClient
.from("corretores")
.select("id,nome");

const select = document.getElementById("corretor");

select.innerHTML = '<option value="">Selecionar corretor</option>';

data.forEach(c => {

const option = document.createElement("option");

option.value = c.id;
option.textContent = c.nome;

select.appendChild(option);

});

}

/* SALVAR IMÓVEL */

document
.getElementById("form-imovel")
.addEventListener("submit", async (e)=>{

e.preventDefault();

const corretor_id = document.getElementById("corretor").value;

if(!corretor_id){

alert("Selecione um corretor");
return;

}

const titulo = document.getElementById("titulo").value;
const tipo = document.getElementById("tipo").value;
const preco = document.getElementById("preco").value;
const quartos = document.getElementById("quartos").value;
const banheiros = document.getElementById("banheiros").value;
const area = document.getElementById("area").value;
const imagem = document.getElementById("imagem").value;
const tour = document.getElementById("tour").value;
const slug = document.getElementById("slug").value;

/* INSERIR IMÓVEL */

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

alert("Erro: " + error.message);
return;

}

const imovel_id = data.id;

/* PEGAR EXTRAS */

const extras = [...document.querySelectorAll(".extra:checked")]
.map(e => e.value);

/* SALVAR EXTRAS */

for(const extra of extras){

await supabaseClient
.from("imovel_extras")
.insert({
imovel_id: imovel_id,
extra: extra
});

}

alert("Imóvel cadastrado!");

document.getElementById("form-imovel").reset();

});

/* LOGOUT */

async function logout(){

await supabaseClient.auth.signOut();

location.reload();

}
