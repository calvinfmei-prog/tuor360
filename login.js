const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function login(){

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
window.location.href = "/dashboard.html";

}
