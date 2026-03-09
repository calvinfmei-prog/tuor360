const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function carregarImovel(){

const { data, error } = await supabaseClient
.from("imoveis")
.select("*")
.eq("id", id)
.single();

if(error){
document.body.innerHTML = "Erro ao carregar imóvel.";
return;
}

document.getElementById("titulo").innerText = data.titulo;

document.getElementById("tour").innerHTML = `
<iframe
width="100%"
height="500"
src="${data.tour}"
frameborder="0"
allowfullscreen>
</iframe>
`;

}

carregarImovel();
