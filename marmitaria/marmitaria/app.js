import { LOJA } from "./config.js";
import * as DB from "./db.js";

// Cardápio de exemplo: aparece só enquanto o Supabase não estiver configurado.
const DEMO = [
  { id:"d1", cat:"Marmitas", nome:"Frango grelhado", desc:"Arroz, feijão, filé de frango, salada e farofa.", emoji:"🍗", precos:[{r:"Pequena",v:16},{r:"Média",v:20},{r:"Grande",v:25}] },
  { id:"d2", cat:"Marmitas", nome:"Bife acebolado", desc:"Arroz, feijão, bife com cebola, batata e salada.", emoji:"🥩", precos:[{r:"Média",v:23},{r:"Grande",v:28}] },
  { id:"d3", cat:"Bebidas", nome:"Refrigerante lata", desc:"Lata 350 ml, gelada.", emoji:"🥤", precos:[{r:"Cola",v:6},{r:"Guaraná",v:6}] },
  { id:"d4", cat:"Extras", nome:"Pudim", desc:"Fatia de pudim de leite.", emoji:"🍮", status:"esgotado", precos:[{r:"Fatia",v:7}] }
];
const ORDEM = ["Marmitas", "Bebidas", "Extras"];

let produtos = [], cat = null, carrinho = ler();
const $ = (s) => document.querySelector(s);
const brl = (n) => n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function ler(){ try{ return JSON.parse(localStorage.getItem("carrinho")) || []; }catch{ return []; } }
const gravar = () => { try{ localStorage.setItem("carrinho", JSON.stringify(carrinho)); }catch{} };

/* ---- vitrine ---- */
const visiveis = () => produtos.filter(p => p.status !== "oculto" && p.precos?.length);
const peso = (c) => ORDEM.includes(c) ? ORDEM.indexOf(c) : 99;

function card(p){
  const esg = p.status === "esgotado";
  const foto = p.img ? `<img src="${esc(p.img)}" alt="${esc(p.nome)}" loading="lazy">` : esc(p.emoji || "🍽️");
  const ops = p.precos.map((o,i) => `<option value="${i}">${esc(o.r)} — ${brl(o.v)}</option>`).join("");
  return `<article class="item"><div class="foto">${foto}${esg ? '<span class="selo">Esgotado</span>' : ""}</div>
    <div class="corpo"><h3>${esc(p.nome)}</h3><p>${esc(p.desc)}</p>
    <div class="linha"><select aria-label="Opção de ${esc(p.nome)}" data-sel="${p.id}">${ops}</select>
    <button class="add" data-add="${p.id}" ${esg ? "disabled" : ""}>${esg ? "Esgotado" : "Adicionar"}</button></div></div></article>`;
}

function vitrine(){
  const cs = [...new Set(visiveis().map(p => p.cat))].sort((a,b) => peso(a) - peso(b) || a.localeCompare(b));
  if(!cs.includes(cat)) cat = cs[0];
  $("#categorias").innerHTML = cs.map(c => `<button aria-pressed="${c===cat}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  $("#grade").innerHTML = visiveis().filter(p => p.cat === cat).sort((a,b) => a.nome.localeCompare(b.nome)).map(card).join("")
    || "<p>Nenhum item disponível agora.</p>";
}

/* ---- carrinho ---- */
function adicionar(id){
  const p = produtos.find(x => x.id === id), i = Number(document.querySelector(`[data-sel="${id}"]`).value), o = p.precos[i];
  const chave = `${id}-${i}`, ja = carrinho.find(c => c.chave === chave);
  ja ? ja.qtd++ : carrinho.push({ chave, nome:p.nome, rotulo:o.r, valor:o.v, qtd:1 });
  atualizar();
}
function mudarQtd(chave, d){
  const c = carrinho.find(x => x.chave === chave); if(!c) return;
  c.qtd += d; carrinho = carrinho.filter(x => x.qtd > 0); atualizar();
}
const subtotal = () => carrinho.reduce((s,c) => s + c.valor * c.qtd, 0);
const taxa = () => ($("#f-tipo").value === "entrega" && carrinho.length) ? LOJA.taxaEntrega : 0;

function atualizar(){
  gravar();
  const n = carrinho.reduce((s,c) => s + c.qtd, 0);
  $("#abrir").disabled = !n;
  $("#qtd-total").textContent = n ? `Ver pedido (${n} ${n===1 ? "item" : "itens"})` : "Seu pedido está vazio";
  $("#valor-total").textContent = n ? brl(subtotal()) : "";
  $("#itens").innerHTML = carrinho.map(c => `<div class="linha-carrinho"><strong>${esc(c.nome)}</strong><span>${brl(c.valor*c.qtd)}</span>
    <small>${esc(c.rotulo)}</small><div class="qtd"><button data-menos="${c.chave}" aria-label="Diminuir">−</button>${c.qtd}
    <button data-mais="${c.chave}" aria-label="Aumentar">+</button></div></div>`).join("") || "<p>Adicione itens da vitrine.</p>";
  $("#l-endereco").hidden = $("#f-tipo").value !== "entrega";
  $("#total").textContent = brl(subtotal() + taxa());
  if(!n) gaveta(false);
}
function gaveta(abrir){
  $("#gaveta").classList.toggle("aberta", abrir);
  $("#gaveta").setAttribute("aria-hidden", String(!abrir));
}

/* ---- envio (WhatsApp) ---- */
function enviar(){
  const nome = $("#f-nome").value.trim(), entrega = $("#f-tipo").value === "entrega", end = $("#f-endereco").value.trim();
  if(!nome) return void ($("#erro").textContent = "Informe seu nome.");
  if(entrega && !end) return void ($("#erro").textContent = "Informe o endereço de entrega.");
  $("#erro").textContent = "";
  const obs = $("#f-obs").value.trim();
  const msg = [`*Novo pedido — ${LOJA.nome}*`, "",
    ...carrinho.map(c => `• ${c.qtd}x ${c.nome} (${c.rotulo}) — ${brl(c.valor*c.qtd)}`), "",
    entrega ? `Entrega: ${brl(taxa())}` : "Retirada na loja",
    `*Total: ${brl(subtotal() + taxa())}*`, "",
    `Cliente: ${nome}`, entrega ? `Endereço: ${end}` : null,
    `Pagamento: ${$("#f-pagto").value}`, obs ? `Obs.: ${obs}` : null].filter(l => l !== null).join("\n");
  window.open(`https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
}

/* ---- início ---- */
document.addEventListener("click", (e) => {
  const d = e.target.dataset;
  if(d.cat){ cat = d.cat; vitrine(); }
  if(d.add) adicionar(d.add);
  if(d.mais) mudarQtd(d.mais, 1);
  if(d.menos) mudarQtd(d.menos, -1);
  if(e.target.id === "gaveta") gaveta(false);
});
document.addEventListener("keydown", e => { if(e.key === "Escape") gaveta(false); });
$("#abrir").onclick = () => gaveta(true);
$("#fechar").onclick = () => gaveta(false);
$("#f-tipo").onchange = atualizar;
$("#enviar").onclick = enviar;

document.title = `${LOJA.nome} — Cardápio`;
$("#nome-loja").textContent = LOJA.nome;
$("#slogan").textContent = LOJA.slogan;
$("#infos").innerHTML = `<span>${esc(LOJA.horario)}</span><span>Entrega: ${LOJA.taxaEntrega ? brl(LOJA.taxaEntrega) : "grátis"}</span><span>Pedido pelo WhatsApp</span>`;
$("#rodape").textContent = `${LOJA.nome}, ${LOJA.endereco}`;
atualizar();
if(DB.configurado) DB.ouvirProdutos(l => { produtos = l; vitrine(); });
else { produtos = DEMO; vitrine(); }
