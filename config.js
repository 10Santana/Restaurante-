export const LOJA = {
  horarios: [["Segunda a sábado", "11:00 às 15:00"], ["Domingo", "Fechado"]],
  endereco: "Rua Exemplo, 123",
  destaques: [
    { titulo: "Marmitas do dia", frase: "Caseiras, feitas na hora", cat: "Marmitas" },
    { titulo: "Bebidas", frase: "Geladas para acompanhar", cat: "Bebidas" },
    { titulo: "Extras", frase: "Para fechar a refeição", cat: "Extras" }
  ]
};

export const supabaseConfig = {
  url: "https://xanxucukyknrvzziggkz.supabase.co",
  anonKey: "sb_publishable_2IBNiS9c24REai_DJC1wyw_RtHURzg_"
};

export default {
  supabaseUrl: supabaseConfig.url,
  supabaseKey: supabaseConfig.anonKey,
  nomeRestaurante: "Dom 10 Marmitaria",
  whatsapp: "5511969429812",
  whatsappFormatado: "(11) 96942-9812",
  whatsappSecundario: "(11) 99419-6063"
};