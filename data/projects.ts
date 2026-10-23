export interface Project {
  id: string;
  name: string;
  description?: string;
  problem: string;
  link?: string;
  image?: string;
}

export const projects: Project[] = [
  {
    id: "vizion-store",
    name: "Vizion Store",
    
    problem:
      "Vender online sem depender de divulgar peça por peça nas redes: reunir catálogo, preços, descontos e contato em um único endereço que funciona no celular.",
    link: "https://vizionstore61.com.br/",
    image: "/loja-vizion.png",
  },

  {
    id: "Catalogo-tenis",
    name: " + Tênis",

    problem:
      "Vender online sem depender de divulgar peça por peça nas redes: reunir catálogo, preços, descontos e contato em um único endereço que funciona no celular.",
    link: "https://catalago-whatsapp.vercel.app/",
    image: "/catalogo-tenis.jpg",
  },
 
  {
    id: "portfolio-codeph",
    name: "Portfólio Profissional",
    problem:
      "Reunir formação, projetos e contato em um endereço único e atualizado, em vez de espalhar a apresentação em anexos e mensagens.Assistente virtual integrado ao portfólio, desenvolvido para responder perguntas sobre experiências profissionais, competências técnicas, projetos e informações do currículo, utilizando os dados disponibilizados à aplicação.",
    link: "https://portifolio-cyber.vercel.app/",
      image: "/portifolio.jpg",
  },
  {
    id: "sr-srta-gourmet",
    name: "Sr. e Srta. Gourmet — buffet para eventos",
    problem:
      "Transformar pedidos de orçamento espalhados em mensagens em um fluxo organizado: o cliente monta a solicitação pelo site, envia pelo WhatsApp e o buffet retorna com a proposta avaliando cada evento.",
    link: "https://sresragourmet.vercel.app/",
    image: "/Gourmet.jpg",
  },
    {
    id: "pdv-gestao",
  name: "PDV gestãode vendas",
    problem:
      "Gerenciar vendas, estoque e clientes de forma integrada: o sistema permite registrar produtos, controlar estoque, emitir notas fiscais e gerar relatórios de vendas, facilitando a gestão do negócio.",
    link: "https://pdv-vendas-balcao.vercel.app/",
    image: "/pdv.jpg",
  },
];
