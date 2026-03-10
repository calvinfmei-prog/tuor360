const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);


/* =========================
LOGIN PELO CÓDIGO
========================= */

async function acessar(event){

  event.preventDefault();

  const codigoInput = document.getElementById("codigo");
  const erro = document.getElementById("erro");

  const codigo = codigoInput.value.trim().toUpperCase();

  erro.innerText = "";

  if(!codigo){
    erro.innerText = "Digite um código.";
    return;
  }

  try{

    const { data, error } = await supabaseClient
      .from("corretores")
      .select("*")
      .eq("codigo", codigo)
      .maybeSingle();

    if(error || !data){
      erro.innerText = "Código inválido.";
      return;
    }

    sessionStorage.setItem("corretorId", data.id);
    sessionStorage.setItem("corretorNome", data.nome);

    if(data.slug){
      sessionStorage.setItem("corretorSlug", data.slug);

      // URL profissional
      window.location.href = "/" + data.slug;

    }else{

      window.location.href = "painel.html";

    }

  }catch(e){

    erro.innerText = "Erro ao conectar ao servidor.";
    console.error(e);

  }

}


/* =========================
ROUTER PARA URLS PROFISSIONAIS
========================= */

document.addEventListener("DOMContentLoaded", function(){

  const path = window.location.pathname.replace(/^\/|\/$/g, "");

  // se estiver na home não faz nada
  if(!path) return;

  const partes = path.split("/");

  const slugCorretor = partes[0];

  // redireciona para o painel mantendo o slug
  window.location.href = "/painel.html?corretor=" + slugCorretor;

});
