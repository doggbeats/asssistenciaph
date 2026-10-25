/**
 * Base de conhecimento pública do assistente da CODE_PH.
 *
 * Regras de manutenção:
 * - use apenas informações verificadas e já publicadas no site ou confirmadas pela CODE_PH;
 * - não cadastre preços, prazos, garantias ou condições que não estejam aprovados;
 * - documentos com `status: "draft"` ou `visibility: "internal"` não são recuperados pelo chat;
 * - atualize `updatedAt` sempre que o conteúdo mudar.
 */

export type KnowledgeCategory =
  | "assistencia"
  | "sites"
  | "sistemas"
  | "comercial"
  | "faq"
  | "empresa";

export type KnowledgeStatus = "published" | "draft" | "archived";
export type KnowledgeVisibility = "public" | "internal";

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: KnowledgeCategory;
  summary: string;
  content: string;
  tags: string[];
  href?: string;
  serviceIds?: string[];
  updatedAt: string;
  status: KnowledgeStatus;
  visibility: KnowledgeVisibility;
}

const UPDATED_AT = "2026-10-25";

export const knowledgeDocuments: KnowledgeDocument[] = [
  {
    id: "assistencia-diagnostico",
    title: "Diagnóstico técnico de computadores, notebooks e celulares",
    category: "assistencia",
    summary:
      "Avaliação para identificar a causa de falhas antes de indicar ou executar qualquer serviço.",
    content: `A CODE_PH realiza diagnóstico de computadores, notebooks e celulares para identificar a origem de travamentos, lentidão, desligamentos, erros e outras falhas.

O diagnóstico de desktop e notebook tem valor de referência a partir de R$ 60. O diagnóstico de celular depende do aparelho e precisa ser confirmado com a CODE_PH.

Nenhum diagnóstico definitivo é dado antes da avaliação do equipamento. A causa, a viabilidade de reparo e o valor final são informados após a análise.`,
    tags: [
      "diagnostico",
      "avaliacao",
      "computador",
      "notebook",
      "celular",
      "lentidao",
      "lento",
      "travamento",
      "travando",
      "desliga",
      "erro",
      "manutencao",
      "conserto",
      "reparo",
    ],
    href: "/#servicos",
    serviceIds: ["desktop-diagnostico", "notebook-diagnostico", "cel-diagnostico"],
    updatedAt: UPDATED_AT,
    status: "published",
    visibility: "public",
  },
  {
    id: "assistencia-desktop",
    title: "Assistência técnica para computadores desktop",
    category: "assistencia",
    summary:
      "Formatação, backup, instalação de programas, manutenção e upgrade de computadores de mesa.",
    content: `A CODE_PH atende computadores desktop, all in one e computadores gamer.

Serviços disponíveis:
- Backup e recuperação de dados: cópia de documentos, fotos e programas em um dispositivo indicado pelo cliente.
- Diagnóstico de problemas: identificação da causa de travamentos, desligamentos, erros e falhas, com valor de referência a partir de R$ 60.
- Formatação completa com backup de até 100GB: salvamento prévio dos arquivos, instalação limpa do Windows e retorno dos dados.
- Formatação completa sem backup: instalação limpa do Windows com drivers, atualizações, Pacote Office, Adobe Reader, WinRAR e outros programas essenciais.
- Instalação e configuração de programas: Office, navegadores, antivírus, leitores de PDF, inicialização, contas, impressora, rede e preferências.
- Manutenção completa: aspiração de poeira, limpeza de ventoinhas, troca de pasta térmica do processador e higienização externa.
- Upgrade de SSD com formatação completa: instalação do SSD, Windows, drivers, Pacote Office e demais programas essenciais. A peça não está inclusa.

Com exceção do diagnóstico, os valores desses serviços são definidos após avaliação. Formatação e manutenção não são apresentadas como solução garantida antes de conhecer o problema.`,
    tags: [
      "computador",
      "desktop",
      "pc",
      "gamer",
      "all in one",
      "formatacao",
      "formatar",
      "windows",
      "backup",
      "manutencao",
      "limpeza",
      "pasta termica",
      "ssd",
      "upgrade",
      "programas",
      "office",
      "antivirus",
      "impressora",
      "rede",
    ],
    href: "/#servicos",
    serviceIds: [
      "desktop-backup",
      "desktop-diagnostico",
      "desktop-formatacao-completa",
      "desktop-formatacao",
      "desktop-programas",
      "desktop-manutencao",
      "desktop-upgrade-formatacao",
    ],
    updatedAt: UPDATED_AT,
    status: "published",
    visibility: "public",
  },
  {
    id: "assistencia-notebook",
    title: "Assistência técnica para notebooks",
    category: "assistencia",
    summary:
      "Formatação, backup, instalação de programas, manutenção e upgrade de notebooks de qualquer marca.",
    content: `A CODE_PH atende notebooks de qualquer marca, com ou sem inicialização.

Serviços disponíveis:
- Backup e recuperação de dados: cópia de documentos, fotos e programas em um dispositivo indicado pelo cliente.
- Diagnóstico de problemas: identificação da causa de travamentos, desligamentos, erros e falhas, com valor de referência a partir de R$ 60.
- Formatação completa com backup de até 100GB: salvamento prévio dos arquivos, instalação limpa do Windows e retorno dos dados.
- Formatação completa sem backup: instalação limpa do Windows com drivers, atualizações, Pacote Office, Adobe Reader, WinRAR e outros programas essenciais.
- Instalação e configuração de programas: Office, navegadores, antivírus, leitores de PDF, inicialização, contas, impressora, rede e preferências.
- Manutenção completa: aspiração de poeira, limpeza de ventoinhas, troca de pasta térmica do processador e higienização externa.
- Upgrade de SSD com formatação completa: instalação do SSD, Windows, drivers, Pacote Office e demais programas essenciais. A peça não está inclusa.

Com exceção do diagnóstico, os valores desses serviços são definidos após avaliação. Antes de indicar formatação ou troca de peça, a CODE_PH avalia o estado do notebook e confirma a necessidade.`,
    tags: [
      "notebook",
      "laptop",
      "note",
      "portatil",
      "formatacao",
      "formatar",
      "windows",
      "backup",
      "manutencao",
      "limpeza",
      "pasta termica",
      "ssd",
      "upgrade",
      "programas",
      "office",
      "antivirus",
      "nao liga",
      "lento",
      "travando",
    ],
    href: "/#servicos",
    serviceIds: [
      "notebook-backup",
      "notebook-diagnostico",
      "notebook-formatacao-completa",
      "notebook-formatacao",
      "notebook-programas",
      "notebook-manutencao",
      "notebook-upgrade-formatacao",
    ],
    updatedAt: UPDATED_AT,
    status: "published",
    visibility: "public",
  },
  {
    id: "assistencia-celular",
    title: "Assistência técnica para celulares Android e iPhone",
    category: "assistencia",
    summary:
      "Diagnóstico, configuração, manutenção e troca de componentes de celulares, com valor conforme o modelo.",
    content: `A CODE_PH atende celulares Android e iPhone.

Serviços disponíveis:
- Diagnóstico: verificação do aparelho para identificar a origem do problema. O valor depende do modelo e é confirmado com a CODE_PH.
- Desbloqueio de conta Google: somente para o proprietário do aparelho. O valor depende do modelo.
- Configuração: contas, notificações, backup, Wi-Fi e transferência de dados.
- Troca de componentes: tela, bateria, carregador e outras peças. O valor depende do modelo e da peça.
- Manutenção: limpeza de conectores, revisão geral e pequenos reparos.
- Instalação e configuração de aplicativos: instalação, atualização e ajuste dos aplicativos do dia a dia.

Não há diagnóstico definitivo antes da avaliação. A disponibilidade de peças e o valor final são confirmados após a análise do aparelho.`,
    tags: [
      "celular",
      "smartphone",
      "iphone",
      "android",
      "aparelho",
      "tela",
      "bateria",
      "carregador",
      "conector",
      "desbloqueio",
      "conta google",
      "configuracao",
      "aplicativos",
      "manutencao",
      "conserto",
      "diagnostico",
    ],
    href: "/#servicos",
    serviceIds: [
      "cel-diagnostico",
      "Desbloqueio conta google",
      "cel-configuracao",
      "cel-troca",
      "cel-manutencao",
      "cel-aplicativos",
    ],
    updatedAt: UPDATED_AT,
    status: "published",
    visibility: "public",
  },
  {
    id: "assistencia-pecas",
    title: "Peças, componentes e disponibilidade",
    category: "assistencia",
    summary:
      "A necessidade e a disponibilidade de peças são confirmadas na avaliação do equipamento.",
    content: `Peças e componentes não aparecem como produtos avulsos na lista de serviços da CODE_PH.

Quando uma peça é necessária, como SSD, tela, bateria ou conector, a CODE_PH confirma o modelo, a disponibilidade e o valor durante a avaliação. No serviço de upgrade de SSD com formatação, a peça não está inclusa no valor do serviço.

Não há informação publicada sobre venda de peças, acessórios ou equipamentos novos. Para esse tipo de necessidade, a equipe da CODE_PH precisa confirmar o atendimento.`,
    tags: [
      "peca",
      "pecas",
      "componente",
      "componentes",
      "ssd",
      "tela",
      "bateria",
      "conector",
      "acessorio",
      "disponibilidade",
      "venda",
      "comprar",
    ],
    href: "/#servicos",
    updatedAt: UPDATED_AT,
    status: "published",
    visibility: "public",
  },
  {
    id: "sites-institucional",
    title: "Site para empresas com fechamento pelo WhatsApp",
    category: "sites",
    summary:
      "Site profissional para apresentar a empresa, os serviços e os canais de contato, com direcionamento ao WhatsApp.",
    content: `O Site para Empresas + Fechamento via WhatsApp é indicado para quem precisa de uma presença profissional na internet e quer facilitar o contato com clientes.

O serviço inclui:
- site profissional com a identidade da empresa;
- botão de WhatsApp em todas as páginas;
- apresentação de serviços, produtos e diferenciais;
- formulário de contato que abre direto no WhatsApp;
- otimização para celulares e para o Google;
- configuração de domínio e hospedagem.

O conteúdo, o escopo, o prazo e o valor são definidos após avaliação da necessidade. A CODE_PH não promete posição no Google nem volume de vendas.`,
    tags: [
      "site",
      "website",
      "institucional",
      "empresa",
      "presenca digital",
      "divulgar",
      "divulgacao",
      "whatsapp",
      "contato",
      "formulario",
      "dominio",
      "hospedagem",
      "google",
      "celular",
      "landing page",
      "portfolio",
    ],
    href: "/#servicos",
    serviceIds: ["sd-site-empresas"],
    updatedAt: UPDATED_AT,
    status: "published",
    visibility: "public",
  },
  {
    id: "sites-catalogo",
    title: "Catálogo digital com pedidos pelo WhatsApp",
    category: "sites",
    summary:
      "Catálogo online com produtos, fotos e preços, compartilhável por link e com pedido enviado pelo WhatsApp.",
    content: `O Sistema de Catálogo Digital + WhatsApp é indicado para quem vende produtos e quer organizar a divulgação e os pedidos em um único link.

O serviço inclui:
- produtos organizados com fotos e preços;
- facilidade para compartilhar nas redes sociais;
- atendimento direto pelo WhatsApp;
- escolha de produtos pelo cliente e envio do pedido pelo WhatsApp.

É uma solução de catálogo e contato, não uma loja virtual completa com checkout e pagamento online. Para loja virtual completa, a CODE_PH precisa avaliar o escopo.

O valor é definido após avaliação.`,
    tags: [
      "catalogo",
      "digital",
      "produtos",
      "vitrine",
      "link",
      "whatsapp",
      "pedido",
      "pedidos",
      "vender",
      "vendas",
      "loja",
      "loja virtual",
      "ecommerce",
      "checkout",
      "redes sociais",
    ],
    href: "/#servicos",
    serviceIds: ["sd-catalogo-digital"],
    updatedAt: UPDATED_AT,
    status: "published",
    visibility: "public",
  },
  {
    id: "sites-outros-formatos",
    title: "Landing pages, portfólios e loja virtual",
    category: "sites",
    summary:
      "Formatos específicos de site são avaliados como projeto; a CODE_PH não mantém pacotes públicos separados.",
    content: `A CODE_PH já desenvolveu projetos de portfólio profissional e de catálogo para venda pelo WhatsApp.

Landing pages e portfólios podem ser avaliados como projeto de site, com escopo definido conforme o conteúdo e o objetivo. Não existe um pacote público separado com preço ou prazo fechado.

A loja virtual com checkout e pagamento online não está publicada como serviço de prateleira. O catálogo digital com pedido pelo WhatsApp é a solução publicada para venda de produtos. Uma loja virtual completa precisa ser avaliada pela CODE_PH.`,
    tags: [
      "landing page",
      "pagina",
      "portfolio",
      "portifolio",
      "loja virtual",
      "ecommerce",
      "checkout",
      "pagamento online",
      "projeto",
      "site",
    ],
    href: "/#servicos",
    updatedAt: UPDATED_AT,
    status: "published",
    visibility: "public",
  },
  {
    id: "sistemas-pdv",
    title: "PDV e controle de vendas e estoque para pequenos comércios",
    category: "sistemas",
    summary:
      "Sistema de PDV para balcão, com cadastro de produtos, estoque, vendas e histórico de movimentações.",
    content: `O PDV da CODE_PH é indicado para padarias, distribuidoras, lojas de conveniência, mercearias e comércios similares que precisam organizar produtos, estoque e vendas em um só lugar.

O sistema inclui:
- cadastro de produtos e preços;
- controle de estoque;
- registro de vendas;
- histórico de movimentações;
- painel de gestão simples;
- acesso online pelo celular ou computador.

O escopo, as integrações e o valor são confirmados após avaliação do processo do cliente. Não há informação publicada sobre emissão de nota fiscal, integração fiscal ou aplicativo offline neste serviço.`,
    tags: [
      "pdv",
      "ponto de venda",
      "caixa",
      "balcao",
      "vendas",
      "estoque",
      "produtos",
      "distribuidora",
      "padaria",
      "mercearia",
      "conveniencia",
      "comercio",
      "pedidos",
      "entregas",
      "gestao",
      "sistema",
    ],
    href: "/#servicos",
    serviceIds: ["sd-sistema-gestao"],
    updatedAt: UPDATED_AT,
    status: "published",
    visibility: "public",
  },
  {
    id: "sistemas-agendamento",
    title: "Sistema de agendamento para barbearias, salões e profissionais autônomos",
    category: "sistemas",
    summary:
      "Agenda online com cadastro de clientes e serviços, horários disponíveis e contato pelo WhatsApp.",
    content: `O Sistema de Agendamento é indicado para barbearias, salões de beleza, manicures, profissionais de cílios, designers de sobrancelhas e autônomos que precisam organizar horários.

O sistema inclui:
- agendamento de serviços online;
- cadastro de clientes e serviços;
- organização de horários disponíveis;
- integração com WhatsApp para contato e confirmação de agendamentos;
- acesso pelo celular ou computador;
- organização da agenda.

O escopo, as integrações e o valor são confirmados após avaliação da necessidade.`,
    tags: [
      "agendamento",
      "agenda",
      "agendar",
      "horario",
      "horarios",
      "barbearia",
      "salao",
      "beleza",
      "manicure",
      "cilios",
      "sobrancelha",
      "autonomo",
      "clientes",
      "servicos",
      "whatsapp",
      "sistema",
    ],
    href: "/#servicos",
    serviceIds: ["sd-sistema-agendamento"],
    updatedAt: UPDATED_AT,
    status: "published",
    visibility: "public",
  },
  {
    id: "sistemas-personalizados",
    title: "Soluções digitais personalizadas",
    category: "sistemas",
    summary:
      "Ferramentas e sistemas sob medida para organizar processos específicos, com escopo definido após avaliação.",
    content: `Além do PDV e do sistema de agendamento, a CODE_PH desenvolve soluções digitais e ferramentas personalizadas para empresas, conforme o processo do cliente.

Não há pacote público, prazo ou preço fechado para soluções personalizadas. A CODE_PH precisa entender o processo, os usuários e o resultado esperado antes de confirmar escopo, prazo e valor.

Integrações com sistemas externos, nota fiscal, aplicativos móveis e outras funcionalidades específicas não devem ser presumidas: precisam ser confirmadas na avaliação.`,
    tags: [
      "sistema",
      "personalizado",
      "sob medida",
      "ferramenta",
      "processo",
      "integracao",
      "empresa",
      "gestao",
      "automacao",
      "desenvolvimento",
    ],
    href: "/#servicos",
    updatedAt: UPDATED_AT,
    status: "published",
    visibility: "public",
  },
  {
    id: "condicoes-comerciais",
    title: "Preços, prazos, pagamento e condições comerciais",
    category: "comercial",
    summary:
      "A maioria dos serviços é orçada após avaliação; o único valor público de referência é o diagnóstico a partir de R$ 60.",
    content: `A maior parte dos serviços da CODE_PH tem valor definido após avaliação da necessidade ou do equipamento. O site não publica tabela de preços fechados para formatação, manutenção, upgrades, sites, sistemas, catálogo ou agendamento.

O único valor público de referência é o diagnóstico de desktop e notebook, a partir de R$ 60. O diagnóstico de celular depende do modelo.

Não há informação publicada sobre:
- formas de pagamento, entrada ou parcelamento;
- prazos de entrega ou de execução;
- garantia dos serviços;
- política de desconto ou promoções.

Essas condições precisam ser confirmadas diretamente com a CODE_PH antes de qualquer contratação. Nenhum valor, prazo ou garantia deve ser presumido pelo assistente.`,
    tags: [
      "preco",
      "precos",
      "valor",
      "valores",
      "custo",
      "custa",
      "quanto",
      "orcamento",
      "pagamento",
      "parcelamento",
      "entrada",
      "prazo",
      "prazos",
      "garantia",
      "condicoes",
      "desconto",
      "avaliacao",
      "diagnostico",
      "60",
    ],
    href: "/#contato",
    updatedAt: UPDATED_AT,
    status: "published",
    visibility: "public",
  },
  {
    id: "faq-atendimento",
    title: "Como solicitar orçamento e como funciona o atendimento",
    category: "faq",
    summary:
      "O atendimento começa pelo WhatsApp; escopo e condições são confirmados antes do serviço.",
    content: `Para solicitar atendimento, o cliente pode:
- falar diretamente pelo WhatsApp;
- usar os botões de orçamento do site, que abrem o WhatsApp com uma mensagem inicial;
- conversar com o assistente virtual para organizar a necessidade antes do contato.

A mensagem inicial é apenas um ponto de partida. A conversa continua no WhatsApp, onde a CODE_PH confirma escopo, valor e condições antes de iniciar qualquer serviço.

O envio da mensagem não significa contratação automática.

Para serviços digitais, a avaliação considera o objetivo, o conteúdo e as funcionalidades necessárias. Para assistência técnica, considera o equipamento e o problema relatado.`,
    tags: [
      "orcamento",
      "atendimento",
      "como funciona",
      "solicitar",
      "contratar",
      "whatsapp",
      "contato",
      "telefone",
      "formulario",
      "site",
      "servico",
      "avaliacao",
      "pedido",
    ],
    href: "/#contato",
    updatedAt: UPDATED_AT,
    status: "published",
    visibility: "public",
  },
  {
    id: "faq-informacoes",
    title: "Informações necessárias para iniciar um atendimento",
    category: "faq",
    summary:
      "Informe o equipamento e o problema ou, para projetos digitais, o negócio, o objetivo e as funcionalidades desejadas.",
    content: `Para agilizar o atendimento técnico, informe:
- o tipo de equipamento: computador desktop, notebook ou celular;
- a marca e o modelo, se souber;
- o que está acontecendo e desde quando;
- se o equipamento liga, se a tela responde e se há arquivos importantes que precisam de backup.

Para sites, catálogos, sistemas e agendamento, informe:
- o tipo de negócio;
- o que você quer divulgar, vender ou organizar;
- se já tem site, domínio ou conteúdo pronto;
- quais funcionalidades são necessárias;
- qual resultado você espera.

Não é necessário enviar senhas, dados bancários, documentos ou outras informações sensíveis pelo chat. A CODE_PH confirma quais dados são realmente necessários.`,
    tags: [
      "informacoes",
      "dados",
      "necessario",
      "iniciar",
      "modelo",
      "equipamento",
      "problema",
      "negocio",
      "objetivo",
      "funcionalidades",
      "backup",
      "arquivos",
      "dominio",
      "conteudo",
    ],
    href: "/#contato",
    updatedAt: UPDATED_AT,
    status: "published",
    visibility: "public",
  },
  {
    id: "empresa-code-ph",
    title: "Sobre a CODE_PH",
    category: "empresa",
    summary:
      "Assistência técnica para computadores, notebooks e celulares e soluções digitais para pessoas e empresas.",
    content: `A CODE_PH — Assistência Técnica & Soluções Digitais atende pessoas, comércios, profissionais autônomos e pequenas empresas.

Atua em duas frentes:
- assistência técnica para computadores, notebooks e celulares;
- soluções digitais: sites, catálogo digital, PDV, controle de estoque, sistema de agendamento e ferramentas personalizadas.

O atendimento acontece pelo WhatsApp. O Instagram é @code_ph_sd. O site reúne serviços, projetos e os canais de contato.`,
    tags: [
      "code_ph",
      "empresa",
      "sobre",
      "quem somos",
      "assistencia tecnica",
      "solucoes digitais",
      "whatsapp",
      "instagram",
      "atendimento",
      "pessoas",
      "empresas",
      "autonomos",
    ],
    href: "/#inicio",
    updatedAt: UPDATED_AT,
    status: "published",
    visibility: "public",
  },
  {
    id: "privacidade-assistente",
    title: "Privacidade do assistente virtual",
    category: "empresa",
    summary:
      "A conversa do assistente não é armazenada pela CODE_PH; o histórico fica apenas na sessão do navegador.",
    content: `O assistente virtual não salva o histórico completo da conversa em banco de dados. As mensagens permanecem na sessão aberta no navegador e são descartadas quando a conversa é encerrada ou a página é recarregada.

Para limitar abuso, a API registra temporariamente um identificador derivado do endereço IP, sem armazenar o conteúdo das mensagens. Esses contadores são descartados após a janela de limite.

Se um provedor de IA estiver configurado pela CODE_PH, a mensagem e os trechos públicos da base de conhecimento podem ser enviados a esse provedor apenas para gerar a resposta. O provedor não recebe documentos internos.

Não envie senhas, dados bancários, documentos ou informações sensíveis pelo chat. Para exercer direitos previstos na LGPD, fale com a CODE_PH pelos canais oficiais.`,
    tags: [
      "privacidade",
      "lgpd",
      "dados",
      "historico",
      "conversa",
      "armazenamento",
      "seguranca",
      "ia",
      "provedor",
      "ip",
    ],
    href: "/privacidade",
    updatedAt: UPDATED_AT,
    status: "published",
    visibility: "public",
  },
];
