const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const { data, error } = await supabaseClient
.from("imoveis")
.select(`
*,
corretores ( whatsapp ),
imovel_extras ( extra )
`)
.eq("id", id)
.single();

if(error){
console.error(error);
return;
}

document.getElementById("titulo").innerText = data.titulo;

document.getElementById("preco").innerText = "R$ " + data.preco;

document.getElementById("info").innerText =
data.quartos + " quartos • " +
data.banheiros + " banheiros • " +
data.area + "m²";

document.getElementById("whatsapp").href =
"https://wa.me/" + data.corretores.whatsapp;

/* TOUR */

document.getElementById("tour").innerHTML = `
<iframe
width="100%"
height="500"
src="${data.tour}"
frameborder="0"
allowfullscreen>
</iframe>
`;

/* EXTRAS */

const extrasDiv = document.getElementById("extras");

if(data.imovel_extras && data.imovel_extras.length > 0){

extrasDiv.innerHTML = data.imovel_extras
.map(e => `<span class="extra-item">${e.extra}</span>`)
.join("");

}else{

extrasDiv.innerHTML = "Nenhum extra informado.";

}

}

carregar();
