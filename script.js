const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

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

    window.location.href = "painel.html";

  }catch(e){

    erro.innerText = "Erro ao conectar ao servidor.";
    console.error(e);

  }

}
