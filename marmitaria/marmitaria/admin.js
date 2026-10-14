import * as DB from "./db.js";

const $ = (s) => document.querySelector(s);
const brl = (n) => n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let lista = [], parar = null;

// "Pequena=16; Média=20,50"  <->  [{r, v}]
const lerPrecos = (t) => t.split(";").map(x => x.trim()).filter(Boolean).map(x => {
  const [r, v] = x.includes("=") ? x.split("=") : ["Único", x];
  return { r: r.trim(), v: parseFloat(v.trim().replace(",", ".")) };
}).filter(o => o.r && !isNaN(o.v));
const textoPrecos = (ps) => ps.map(o => `${o.r}=${String(o.v).replace(".", ",")}`).join("; ");

function desenhar(){
  const rows = [...lista].sort((a,b) => (a.cat || "").localeCompare(b.cat || "") || a.nome.localeCompare(b.nome));
  $("#lista").innerHTML = rows.map(p => `<tr>
    <td><strong>${esc(p.nome)}</strong><br><small>${esc(p.cat)}</small></td>
    <td><small>${(p.precos || []).map(o => `${esc(o.r)}: ${brl(o.v)}`).join("<br>")}</small></td>
    <td><select data-status="${p.id}" aria-label="Situação de ${esc(p.nome)}">
      ${[["ativo","À venda"],["esgotado","Esgotado"],["oculto","Oculto"]].map(([v,t]) =>
        `<option value="${v}" ${(p.status || "ativo") === v ? "selected" : ""}>${t}</option>`).join("")}</select></td>
    <td class="acoes"><button class="btn-sec" data-editar="${p.id}">Editar</button>
      <button class="btn-sec btn-perigo" data-apagar="${p.id}">Excluir</button></td></tr>`).join("")
    || '<tr><td colspan="4">Nenhum produto ainda. Cadastre o primeiro ao lado.</td></tr>';
}

function limpar(){
  ["p-id","p-nome","p-cat","p-desc","p-precos","p-img","p-emoji"].forEach(i => $("#"+i).value = "");
  $("#p-status").value = "ativo"; $("#p-erro").textContent = ""; $("#titulo-form").textContent = "Novo produto";
}

async function salvar(){
  const precos = lerPrecos($("#p-precos").value);
  if(!$("#p-nome").value.trim() || !$("#p-cat").value.trim()) return void ($("#p-erro").textContent = "Preencha nome e categoria.");
  if(!precos.length) return void ($("#p-erro").textContent = "Informe ao menos um preço, ex.: Média=20,50");
  const dados = { nome:$("#p-nome").value.trim(), cat:$("#p-cat").value.trim(), desc:$("#p-desc").value.trim(),
    precos, img:$("#p-img").value.trim(), emoji:$("#p-emoji").value.trim(), status:$("#p-status").value };
  try{ await DB.salvarProduto($("#p-id").value || null, dados); limpar(); }
  catch{ $("#p-erro").textContent = "Não foi possível salvar. Confira a política do banco e o e-mail do admin."; }
}

document.addEventListener("click", async (e) => {
  const d = e.target.dataset;
  if(d.editar){
    const p = lista.find(x => x.id === d.editar);
    $("#p-id").value = p.id; $("#p-nome").value = p.nome; $("#p-cat").value = p.cat; $("#p-desc").value = p.desc || "";
    $("#p-precos").value = textoPrecos(p.precos || []); $("#p-img").value = p.img || ""; $("#p-emoji").value = p.emoji || "";
    $("#p-status").value = p.status || "ativo"; $("#titulo-form").textContent = "Editar produto"; scrollTo({ top:0, behavior:"smooth" });
  }
  if(d.apagar && confirm("Excluir este produto?")) DB.apagarProduto(d.apagar);
});
document.addEventListener("change", (e) => { if(e.target.dataset.status) DB.mudarStatus(e.target.dataset.status, e.target.value); });
$("#salvar").onclick = salvar;
$("#limpar").onclick = limpar;
$("#sair").onclick = () => DB.sair();
$("#entrar").onclick = () => DB.entrar($("#l-email").value, $("#l-senha").value)
  .catch(() => $("#l-erro").textContent = "E-mail ou senha incorretos.");

if(!DB.configurado) $("#aviso").hidden = false;
else DB.ouvirUsuario(u => {
  $("#login").hidden = !!u; $("#painel").hidden = !u; $("#sair").hidden = !u; $("#email").textContent = u ? u.email : "";
  parar && parar(); parar = null;
  if(u) parar = DB.ouvirProdutos(l => { lista = l; desenhar(); });
});
