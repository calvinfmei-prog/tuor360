const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

const ADMIN_UID = "0cde13d4-2d6f-46f0-af7a-efc20965e2d1";

/* VERIFICAR LOGIN */

async function verificarLogin(){

const { data: { user }, error } = await supabaseClient.auth.getUser();

if(!user){

alert("Você precisa estar logado.");
window.location.href = "/";

return;

}

if(user.id !== ADMIN_UID){

alert("Acesso negado.");
window.location.href = "/";

}

}

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

/* BUSCAR SEU ID DE CORRETOR */

const { data: corretor } = await supabaseClient
.from("corretores")
.select("id")
.limit(1)
.single();

/* INSERIR IMÓVEL */

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

window.location.href = "/";

}

verificarLogin();
