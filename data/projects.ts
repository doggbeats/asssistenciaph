export interface Project {
  id: string;
  name: string;
  description: string;
  problem: string;
  link?: string;
}

export const projects: Project[] = [
  {
    id: "vizion-store",
    name: "VIZION STORE",
    description:
      "Loja online de streetwear e moda masculina com catálogo por categorias, busca, favoritos, carrinho, promoções e atendimento direto pelo WhatsApp.",
    problem:
      "Vender online sem depender de divulgar peça por peça nas redes: reunir catálogo, preços, descontos e contato em um único endereço que funciona no celular.",
    link: "https://vizionstore61.com.br/",
  },
  {
    id: "barbearia-nobre",
    name: "Sistema de agendamento online",
    description:
      "Sistema de gestão e agendamento online para barbearias, manicures, profissionais de cílios, salões de beleza e diversos tipos de negócio. Organize clientes, serviços, horários, equipe, reservas pelo celular e controle de caixa em uma única plataforma.",
    problem:
      "Trocar o agendamento por mensagens por um fluxo online: o cliente escolhe o serviço, o barbeiro e o horário e confirma sozinho, sem a barbearia precisar responder um por um.",
    link: "https://agendamentos-jobs.vercel.app/",
  },
  {
    id: "electrics",
    name: "ELECTRICS — catálogo de eletrônicos",
    description:
      "Catálogo de eletrônicos com categorias, páginas de produto, preço promocional e contato com o vendedor no WhatsApp. O painel administrativo cuida de produtos, preços, promoções e tamanhos.",
    problem:
      "Manter preço e promoção atualizados atrasava a divulgação. Com o painel, a loja edita o catálogo em um lugar só e o cliente vê a oferta e fala com o vendedor em dois toques.",
    link: "https://catalago-whatsapp.vercel.app/",
  },
  {
    id: "ana-paula-rh",
    name: "Ana Paula RH — vagas e candidaturas",
    description:
      "Plataforma de recrutamento com vitrine de vagas por categoria, página da vaga com salário, cidade e modalidade, candidatura online e área administrativa para publicar as vagas.",
    problem:
      "Reunir divulgação e candidaturas em um endereço só: a empresa publica pelo painel e o candidato se candidata pelo link, em vez de organizar currículos no e-mail e no WhatsApp.",
    link: "https://anapaularh.vercel.app/",
  },
  {
    id: "recrutamento-trafego-pago",
    name: "Landing page Recruta RH",
    description:
      "Landing page de captação do serviço de recrutamento com tráfego pago: situações do cliente, serviços inclusos, processo em quatro passos e contato direto por WhatsApp e e-mail.",
    problem:
      "Explicar o serviço antes da primeira conversa: a página mostra oferta, processo e canais de contato numa tela só, em vez de repetir a mesma explicação em mensagens.",
    link: "https://recrutarh.vercel.app/",
  },
  {
    id: "portfolio-codeph",
    name: "Portfólio Profissional",
    description:
      "Portfólio com trajetória profissional, tecnologias, projetos, experiência e contato, pensado para ser enviado junto do currículo.",
    problem:
      "Reunir formação, projetos e contato em um endereço único e atualizado, em vez de espalhar a apresentação em anexos e mensagens.Assistente virtual integrado ao portfólio, desenvolvido para responder perguntas sobre experiências profissionais, competências técnicas, projetos e informações do currículo, utilizando os dados disponibilizados à aplicação.",
    link: "https://portifolio-cyber.vercel.app/",
  },
  {
    id: "sr-srta-gourmet",
    name: "Sr. e Srta. Gourmet — buffet para eventos",
    description:
      "Site institucional do buffet com seções de quem somos, serviços, galeria e contatos, além de um montador de orçamento: o cliente escolhe serviços, cardápio, bebidas e equipe e a mensagem sai pronta pelo WhatsApp.",
    problem:
      "Transformar pedidos de orçamento espalhados em mensagens em um fluxo organizado: o cliente monta a solicitação pelo site, envia pelo WhatsApp e o buffet retorna com a proposta avaliando cada evento.",
    link: "https://sresragourmet.vercel.app/",
  },
];
