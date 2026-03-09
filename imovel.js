const supabaseUrl = "https://zhgfyqkihwyuteexzxgp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2Z5cWtpaHd5dXRlZXh6eGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI5ODYsImV4cCI6MjA4ODYyODk4Nn0.CvVtLoNM_YRf2pU6wuyeeoLiKTPRDIBuIzQpLZL5e64";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

console.log("ID do imóvel:", id);

async function carregar(){

/* BUSCAR IMÓVEL */

const { data: imovel, error } = await supabaseClient
.from("imoveis")
.select(`
*,
corretores ( whatsapp )
`)
.eq("id", id)
.single();

if(error){
console.error("Erro ao carregar imóvel:", error);
return;
}

console.log("Imóvel:", imovel);

/* PREENCHER DADOS */

document.getElementById("titulo").innerText = imovel.titulo;

document.getElementById("preco").innerText = "R$ " + imovel.preco;

document.getElementById("info").innerText =
imovel.quartos + " quartos • " +
imovel.banheiros + " banheiros • " +
imovel.area + "m²";

/* WHATSAPP */

if(imovel.corretores){
document.getElementById("whatsapp").href =
"https://wa.me/" + imovel.corretores.whatsapp;
}

/* TOUR */

if(imovel.tour){
document.getElementById("tour").innerHTML = `
<iframe
width="100%"
height="500"
src="${imovel.tour}"
frameborder="0"
allowfullscreen>
</iframe>
`;
}

/* BUSCAR EXTRAS */

const { data: extras, error } = await supabaseClient
.from("imovel_extras")
.select("extra, imovel_id")
.eq("imovel_id", id);

console.log("Extras encontrados:", extras);

const extrasDiv = document.getElementById("extras");

if(erroExtras){
console.error("Erro extras:", erroExtras);
extrasDiv.innerHTML = "Erro ao carregar extras.";
return;
}

/* MOSTRAR EXTRAS */

if(extras && extras.length > 0){

extrasDiv.innerHTML = extras
.map(e => `<span class="extra-item">${e.extra}</span>`)
.join("");

}else{

extrasDiv.innerHTML = "Nenhum extra informado.";

}

}

carregar();
