// Camada de dados: só este arquivo conversa com o Supabase.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";
import { supabaseConfig } from "./config.js";

export const configurado = !supabaseConfig.url.startsWith("COLE");
const sb = configurado ? createClient(supabaseConfig.url, supabaseConfig.anonKey) : null;

// colunas do banco <-> campos usados pelo app
const doBanco = (r) => ({ id: r.id, nome: r.nome, cat: r.categoria, desc: r.descricao, precos: r.precos, img: r.img, emoji: r.emoji, status: r.status });
const paraBanco = (d) => ({ nome: d.nome, categoria: d.cat, descricao: d.desc, precos: d.precos, img: d.img, emoji: d.emoji, status: d.status });
const checar = ({ error }) => { if (error) throw error; };

async function carregar(cb) {
  const { data, error } = await sb.from("produtos").select("*");
  if (!error) cb(data.map(doBanco));
}

// Entrega a lista agora e de novo a cada mudança. Retorna a função para parar de ouvir.
export function ouvirProdutos(cb) {
  carregar(cb);
  const canal = sb.channel("produtos-" + Math.random().toString(36).slice(2))
    .on("postgres_changes", { event: "*", schema: "public", table: "produtos" }, () => carregar(cb))
    .subscribe();
  return () => sb.removeChannel(canal);
}

export const salvarProduto = async (id, d) =>
  checar(await (id ? sb.from("produtos").update(paraBanco(d)).eq("id", id) : sb.from("produtos").insert(paraBanco(d))));
export const apagarProduto = async (id) => checar(await sb.from("produtos").delete().eq("id", id));
export const mudarStatus = async (id, status) => checar(await sb.from("produtos").update({ status }).eq("id", id));

export const entrar = async (email, senha) => checar(await sb.auth.signInWithPassword({ email, password: senha }));
export const sair = () => sb.auth.signOut();
export const ouvirUsuario = (cb) => { sb.auth.onAuthStateChange((_evento, sessao) => cb(sessao?.user ?? null)); };
