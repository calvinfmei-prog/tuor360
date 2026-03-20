const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function login(event){

// impede reload do form
if(event){
event.preventDefault();
}

const email = document.getElementById("email").value;
const senha = document.getElementById("senha").value;

const { data, error } = await supabaseClient.auth.signInWithPassword({
email: email,
password: senha
});

if(error){

alert("Erro no login");
return;

}

// login ok
async function login(event){

// impede reload do form
if(event){
  event.preventDefault();
}

const email = document.getElementById("email").value;
const senha = document.getElementById("senha").value;

const { data, error } = await supabaseClient.auth.signInWithPassword({
  email: email,
  password: senha
});

if(error){
  alert("Erro no login");
  return;
}

// pegar usuário logado
const user = data.user;

if(!user){
  alert("Erro ao obter usuário");
  return;
}

// buscar se é admin
const { data: corretor, error: erroCorretor } = await supabaseClient
.from("corretores")
.select("is_admin")
.eq("user_id", user.id)
.single();

if(erroCorretor){
  console.error(erroCorretor);
  alert("Erro ao carregar dados do usuário");
  return;
}

// redirecionamento inteligente
if(corretor.is_admin){
  window.location.replace("/admin-geral.html");
}else{
  window.location.replace("/dashboard.html");
}

}
