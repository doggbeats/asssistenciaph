export interface Project {
  id: string;
  name: string;
  category?: string;
  description?: string;
  problem: string;
  link?: string;
  image?: string;
  hoverImage?: string;
  oldPrice?: number;
  price?: number;
  priceLabel?: string;
  payment?: string;
  ctaLabel?: string;
}

export const projects: Project[] = [
{
  id: "code-ph",
  name: "CODE_PH — Soluções Digitais",
  category: "Site Institucional",
  description:
    "Site profissional para apresentação e venda de serviços e soluções digitais, com assistente virtual integrado e atendimento pelo WhatsApp.",
  problem:
    "Centralizar serviços, produtos e solicitações de orçamento em um único endereço, facilitando o atendimento aos clientes por meio de um assistente virtual e integração com WhatsApp.",
  link: "https://asssistenciaph.vercel.app/",
  image: "/assitentev.jpg",
  hoverImage: "/assitentev2.jpg",
  oldPrice: 1699,
  price: 1499,
    payment: "Avista ou R$ 500 entrada + 3 parcelas de R$ 366",

  ctaLabel: "COMPRAR AGORA PELO WHATSAPP",
},

  {
    id: "Catalogo-tenis",
    name: " + Tênis",
    description:
      "Catálogo digital de tênis com fotos tamanhos ,cores, preços e pedido direto pelo WhatsApp site de identidade profissional tudo em apenas um link.",
    problem:
      "Vender online sem depender de divulgar peça por peça nas redes: reunir catálogo, preços, descontos e contato em um único endereço que funciona no celular.",
    link: "https://catalago-whatsapp.vercel.app/",
    image: "/catalogo-tenis.jpg",
    hoverImage: "/catalago1.jpg",
    oldPrice: 799,
    price: 599,
    payment: "Avista ou R$ 400 entrada + 2 parcelas de R$ 200",
  },
 
    {
    id: "portfolio-codeph",
    name: "Portfólio Profissional",
    description:
      "Portfólio digital com apresentação completa de formação, projetos e contato.",
    problem:
      "Assistente virtual integrado ao portfólio, desenvolvido para responder perguntas sobre experiências profissionais, competências técnicas, projetos e informações do currículo, utilizando os dados disponibilizados à aplicação.",
   link: "https://portifolio-cyber.vercel.app/",
      image: "/portifolio.jpg",
      hoverImage: "/portifolio1.jpg",
    oldPrice: 599,
    price: 399,
    payment: "Avista ou R$ 300 entrada + 2 parcelas de R$ 150",
  },
  {
    id: "sr-srta-gourmet",
    name: "Sr. e Srta. Gourmet — buffet para eventos",
     description:
    "Site profissional para buffet, com apresentação de serviços, cardápio, informações e formulário para solicitação de orçamentos.",
    problem:
      "Transformar pedidos de orçamento espalhados em mensagens em um fluxo organizado: o cliente monta a solicitação pelo site, envia pelo WhatsApp e o buffet retorna com a proposta avaliando cada evento de forma individual.",
    link: "https://catalago-whatsapp.vercel.app/",
    image: "/Gourmet.jpg",
    hoverImage: "/Gourmet1.jpg",
    oldPrice: 999,
    price: 799,
    payment: "Avista ou R$ 500 entrada + 2 parcelas de R$ 250",
  },

   {
    id: "pdv-gestao",
     name: "PDV gestão de vendas",
     description:
    "Site profissional para buffet, com apresentação de serviços, cardápio, informações e formulário para solicitação de orçamentos.",
     problem:
      "Gerenciar vendas, estoque e clientes de forma integrada: o sistema permite registrar produtos, controlar estoque, emitir notas fiscais e gerar relatórios de vendas, facilitando a gestão do negócio.",
    link: "https://pdv-vendas-balcao.vercel.app/",
    image: "/pdv.jpg",
    hoverImage: "/pdv1.jpg",
    oldPrice: 1700,
    price: 1499,
    payment: "Entrada de 500 R$ + 3 parcelas de 400 R$",
  
  },
];
