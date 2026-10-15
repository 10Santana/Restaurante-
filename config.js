// Dados da loja e do Supabase. Edite só este arquivo.
export const LOJA = {
  nome: "Dom 10 Marmitaria",
  slogan: "Faça seu pedido pelo WhatsApp.",
  whatsapp: "5511969429812",          // número que recebe os pedidos (DDI + DDD + número)
  contatos: ["5511969429812", "5511994196063"],   // aparecem no topo e no rodapé
  taxaEntrega: 5,
  pedidoMinimo: 30,                   // 0 = sem mínimo
  entregaGratisAcima: 100,            // 0 = nunca grátis
  tempoEntrega: "30 a 50 min",
  regiao: "sua região",               // ex.: "Centro e bairros vizinhos"
  horario: "Seg a sáb, 11h às 15h",
  horarios: [["Segunda a sábado", "11:00 às 15:00"], ["Domingo", "Fechado"]],   // exemplo: troque pelos reais
  endereco: "Rua Exemplo, 123",
  // Faixa de destaques do topo. "img" = link da foto (vazio mostra o emoji). "cat" = categoria que abre ao clicar.
  destaques: [
    { titulo: "Marmitas do dia", frase: "Caseiras, feitas na hora", cat: "Marmitas", emoji: "🍛", img: "" },
    { titulo: "Bebidas", frase: "Geladas para acompanhar", cat: "Bebidas", emoji: "🥤", img: "" },
    { titulo: "Extras", frase: "Para fechar a refeição", cat: "Extras", emoji: "🍮", img: "" }
  ]
};
// Supabase > Project Settings > API. Use a chave "anon" (public). Nunca a "service_role".
export const supabaseConfig = {
  url: "COLE_AQUI",      // ex.: https://abcdxyz.supabase.co
  anonKey: "COLE_AQUI"
};
