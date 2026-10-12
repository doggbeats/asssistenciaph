export type PriceType = "fixed" | "from" | "evaluation";

export interface ServiceItem {
  id: string;
  name: string;
  detail: string;
  featuresTitle?: string;
  features?: string[];
  priceType: PriceType;
  price?: number;
  quantity: boolean;
  available: boolean;
}

export interface ServiceGroup {
  id: string;
  name: string;
  hint: string;
  items: ServiceItem[];
  hideOnHome?: boolean;
  priceLabel?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  summary: string;
  groups: ServiceGroup[];
}

const desktopItems: ServiceItem[] = [
  {
    id: "desktop-backup",
    name: "Backup  & Recuperação de Dados",
    detail: "Cópia de documentos, fotos e programas em um dispositivo indicado pelo cliente.",
    priceType: "from",
    price: 80,
    quantity: true,
    available: true,
  },
  {
    id: "desktop-diagnostico",
    name: "Diagnóstico de problemas",
    detail: "Identificação da causa de travamentos, desligamentos, erros e falhas.",
    priceType: "from",
    price: 50,
    quantity: true,
    available: true,
  },
  {
    id: "desktop-formatacao-completa",
    name: "Formatação Completa (Com Backup até 100GB)",
    detail:
      "Salvamento prévio de arquivos, instalação limpa do Windows, retorno dos dados do cliente e utilitários essenciais.",
    priceType: "fixed",
    price: 180,
    quantity: true,
    available: true,
  },
  {
    id: "desktop-formatacao",
    name: "Formatação Completa (Sem Backup)",
    detail:
      "Instalação limpa do Windows com drivers e atualizações, Pacote Office, Adobe Reader, WinRAR e outros programas essenciais.",
    priceType: "fixed",
    price: 120,
    quantity: true,
    available: true,
  },
  {
    id: "desktop-programas",
    name: "Instalação e configuração de programas",
    detail: "Office, navegadores, antivírus, leitores de PDF e o que você precisar. Ajustes de inicialização, contas, impressora, rede e preferências do usuário.",
    priceType: "from",
    price: 80,
    quantity: true,
    available: true,
  },
  {
    id: "desktop-manutencao",
    name: "Manutenção completa",
    detail: "Aspiração de poeira, limpeza de ventoinhas, troca de pasta térmica do processador e higienização externa.",
    priceType: "from",
    price: 120,
    quantity: true,
    available: true,
  },
  {
    id: "desktop-upgrade-formatacao",
    name: "Upgrade SSD + formatação completa (SSD não incluso)",
    detail:
      "Instalação do SSD com formatação completa do Windows, drivers, Pacote Office, Adobe Reader e demais programas essenciais. Peça não inclusa.",
    priceType: "fixed",
    price: 200,
    quantity: true,
    available: true,
  },
];

const notebookItems: ServiceItem[] = [
  {
    id: "notebook-backup",
    name: "Backup & Recuperação de Dados",
    detail: "Cópia de documentos, fotos e programas em um dispositivo indicado pelo cliente.",
    priceType: "from",
    price: 80,
    quantity: true,
    available: true,
  },
  {
    id: "notebook-diagnostico",
    name: "Diagnóstico de problemas",
    detail: "Identificação da causa de travamentos, desligamentos, erros e falhas.",
    priceType: "fixed",
    price: 50,
    quantity: true,
    available: true,
  },
  {
    id: "notebook-formatacao-completa",
    name: "Formatação Completa (Com Backup até 100GB)",
    detail:
      "Salvamento prévio de arquivos, instalação limpa do Windows, retorno dos dados do cliente e utilitários essenciais.",
    priceType: "fixed",
    price: 200,
    quantity: true,
    available: true,
  },
  {
    id: "notebook-formatacao",
    name: "Formatação Completa (sem Backup)",
    detail:
      "Instalação limpa do Windows com drivers e atualizações, Pacote Office, Adobe Reader, WinRAR e outros programas essenciais.",
    priceType: "from",
    price: 130,
    quantity: true,
    available: true,
  },
  {
    id: "notebook-programas",
    name: "Instalação e configuração de programas",
    detail: "Office, navegadores, antivírus, leitores de PDF e o que você precisar. Ajustes de inicialização, contas, impressora, rede e preferências do usuário.",
    priceType: "from",
    price: 80,
    quantity: true,
    available: true,
  },
  {
    id: "notebook-manutencao",
    name: "Manutenção completa",
    detail: "Aspiração de poeira, limpeza de ventoinhas, troca de pasta térmica do processador e higienização externa.",
    priceType: "from",
    price: 150,
    quantity: true,
    available: true,
  },
  {
    id: "notebook-upgrade-formatacao",
    name: "Upgrade SSD + formatação completa (SSD não incluso)",
    detail:
      "Instalação do SSD com formatação completa do Windows, drivers, Pacote Office, Adobe Reader e demais programas essenciais. Peça não inclusa.",
    priceType: "fixed",
    price: 220,
    quantity: true,
    available: true,
  },
];

export const serviceCategories: ServiceCategory[] = [
  {
    id: "computadores",
    name: "Desktop & Notebooks",
    summary:
      "Formatação, manutenção, upgrades e configuração de desktops e notebooks.",
    groups: [
      {
        id: "desktop",
        name: "Desktop e Notebooks",
        hint: "PC de mesa, all in one e computadores gamer.",
        items: desktopItems,
      },
      {
        id: "notebook",
        name: "Notebooks",
        hint: "Notebooks de qualquer marca, com ou sem inicialização.",
        items: notebookItems,
      },
    ],
  },
  {
    id: "celulares",
    name: "Celulares",
    summary: "Diagnóstico, formatação, manutenção e configuração de aparelhos.",
    groups: [
      {
        id: "celular",
        name: "Celular",
        hint: "Aparelhos Android e iPhone.",
        items: [
          {
            id: "cel-diagnostico",
            name: "Diagnóstico",
            detail: "Verificação do aparelho para identificar a origem do problema.",
            priceType: "fixed",
            price: 50,
            quantity: true,
            available: true,
          },
          {
            id: "Desbloqueio conta google",
            name: "Desbloqueio de conta Google",
            detail: "Desbloqueio de conta Google em aparelhos bloqueados (Somente com o proprietario do telefone). O valor depende do modelo do aparelho.",
            priceType: "from",
            price: 80,
            quantity: true,
            available: true,
          },
          {
            id: "cel-configuracao",
            name: "Configuração",
            detail: "Contas, notificações, backup, Wi-Fi e transferência de dados.",
            priceType: "evaluation",
            quantity: false,
            available: true,
          },
          {
            id: "cel-troca",
            name: "Troca de componentes",
            detail:
              "Troca de tela, bateria, carregador e outras peças. O valor depende do modelo e da peça.",
            priceType: "evaluation",
            quantity: false,
            available: true,
          },
          {
            id: "cel-manutencao",
            name: "Manutenção",
            detail: "Limpeza de conectores, revisão geral e pequenos reparos.",
            priceType: "evaluation",
            quantity: false,
            available: true,
          },
          {
            id: "cel-aplicativos",
            name: "Instalação e configuração de aplicativos",
            detail: "Instalação, atualização e ajuste dos aplicativos do dia a dia.",
            priceType: "evaluation",
            quantity: true,
            available: true,
          },
        ],
      },
    ],
  },
{
    id: "solucoes-digitais",
    name: "Sites e Sistemas",
    summary:
      "Sites, lojas virtuais, sistemas e integrações para quem precisa estar na internet.",
    groups: [
      {
        id: "sites-solucoes",
        name: "Sites e Sistemas",
        hint: "Projetos sob orçamento conforme a necessidade.",
        items: [
          {
            id: "sd-catalogo-digital",
            name: "Catálogo Digital + WhatsApp",
            detail:
              "Divulgue seus produtos em um único link, facilite o atendimento e torne seus pedidos mais organizados. Seus clientes escolhem os produtos no catálogo e enviam o pedido diretamente pelo WhatsApp.",
            featuresTitle: "Mais praticidade para vender",
            features: [
              "Produtos organizados com fotos e preços",
              "Facilidade para compartilhar nas redes sociais",
              "Atendimento direto pelo WhatsApp",
            ],
            priceType: "from",
            price: 397,
            quantity: false,
            available: true,
          },
          {
            id: "sd-sistema-gestao",
            name: "Sistema de Gestão para Pequenos Comércios",
            detail:
              "Controle seus produtos, estoque e vendas em um só lugar. Organize seu negócio, acompanhe as movimentações e tenha mais facilidade para consultar as informações da sua empresa.",
            features: [
              "Cadastro de produtos e preços",
              "Controle de estoque",
              "Registro de vendas",
              "Histórico de movimentações",
              "Painel de gestão simples e intuitivo",
              "Acesso online pelo celular ou computador",
            ],
            priceType: "from",
            price: 597,
            quantity: false,
            available: true,
          },
          {
            id: "sd-sistema-agendamento",
            name: "Sistema de Agendamento Online",
            detail:
              "Organize seus horários e facilite o agendamento de clientes com um sistema online integrado ao WhatsApp. Ideal para barbearias, salões de beleza, manicures, profissionais de cílios, designers de sobrancelhas e autônomos.",
            features: [
              "Agendamento de serviços online",
              "Cadastro de clientes e serviços",
              "Organização de horários disponíveis",
              "Integração com WhatsApp para contato e confirmação de agendamentos",
              "Acesso pelo celular ou computador",
              "Mais praticidade na organização da sua agenda",
            ],
            priceType: "from",
            price: 699,
            quantity: false,
            available: true,
          },
        ],
      },
    ],
  },
];

function priceRank(item: ServiceItem): number {
  return item.price ?? Number.POSITIVE_INFINITY;
}

for (const category of serviceCategories) {
  for (const group of category.groups) {
    group.items.sort((a, b) => priceRank(a) - priceRank(b));
  }
}

export function getCategory(categoryId: string): ServiceCategory {
  const found = serviceCategories.find((category) => category.id === categoryId);
  return found ?? serviceCategories[0];
}

export function itemIndex(category: ServiceCategory): Record<string, ServiceItem> {
  const index: Record<string, ServiceItem> = {};
  for (const group of category.groups) {
    for (const item of group.items) {
      index[item.id] = item;
    }
  }
  return index;
}

export function groupsShareSameItems(category: ServiceCategory): boolean {
  if (category.groups.length < 2) return false;
  const first = category.groups[0].items.map((item) => item.id).join("|");
  return category.groups.every(
    (group) => group.items.map((item) => item.id).join("|") === first,
  );
}

export function countCategoryItems(category: ServiceCategory): number {
  const names = new Set<string>();
  for (const group of category.groups) {
    for (const item of group.items) names.add(item.name);
  }
  return names.size;
}

export function countTotalServices(): number {
  const names = new Set<string>();
  for (const category of serviceCategories) {
    for (const group of category.groups) {
      for (const item of group.items) names.add(item.name);
    }
  }
  return names.size;
}

export interface HighlightRow {
  label: string;
  priceType: PriceType;
  price?: number;
}

const highlightRows: Array<{
  label: string;
  categoryId: string;
  itemId: string;
  priceType?: PriceType;
  price?: number;
}> = [
  { label: "Formatação completa", categoryId: "computadores", itemId: "desktop-formatacao" },
  {
    label: "Upgrade SSD + formatação completa",
    categoryId: "computadores",
    itemId: "desktop-upgrade-formatacao",
  },
  { label: "Diagnóstico de celular", categoryId: "celulares", itemId: "cel-diagnostico" },
  {
    label: "Catálogo Digital + WhatsApp",
    categoryId: "solucoes-digitais",
    itemId: "sd-catalogo-digital",
  },
];

export function getHighlightRows(): HighlightRow[] {
  const rows: HighlightRow[] = [];

  for (const row of highlightRows) {
    const item = itemIndex(getCategory(row.categoryId))[row.itemId];
    if (!item) continue;
    rows.push({
      label: row.label,
      priceType: row.priceType ?? item.priceType,
      price: row.price ?? item.price,
    });
  }

  return rows;
}
