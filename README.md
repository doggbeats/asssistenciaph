# CODE_PH — Assistência Técnica & Soluções Digitais

**Tecnologia para pessoas e empresas.**

A CODE_PH é um negócio de assistência técnica e soluções digitais que facilita o acesso dos clientes a serviços de manutenção de computadores, notebooks e celulares, além do desenvolvimento de sites, sistemas e outras soluções digitais.

Nosso objetivo é organizar os serviços em um único ambiente online, permitindo que o cliente conheça as opções disponíveis, identifique o que precisa e entre em contato para solicitar um orçamento.

### Como funciona

- **Site online:** apresenta os serviços, suas descrições e as informações necessárias para solicitar atendimento.
- **Acesso por link:** o cliente pode acessar o site de qualquer lugar, pelo celular ou computador.
- **QR Codes e adesivos:** facilitam a divulgação do negócio em materiais físicos, permitindo que o cliente acesse os serviços apontando a câmera do celular.
- **Solicitação de orçamento:** mostra um resumo da necessidade no chat e abre o WhatsApp com os mesmos dados para o cliente continuar o atendimento.
- **Página de orçamento:** em `/orcamento`, o cliente seleciona os serviços, vê a estimativa e envia a solicitação pelo WhatsApp.
- **Soluções digitais para empresas:** desenvolvimento de sites, sistemas e ferramentas personalizadas para organizar processos e melhorar o atendimento.

### Nosso propósito

Tornar a tecnologia e a assistência técnica mais acessíveis, organizando informações, facilitando o contato e conectando clientes às soluções de que precisam.

## Assistente virtual

O site conta com um assistente com RAG (recuperação de conhecimento) que ajuda o
visitante a identificar a solução adequada, faz uma pergunta por vez e exibe um
resumo da solicitação antes de encaminhar para o WhatsApp. No atendimento de
celular, o assistente pergunta o modelo do aparelho e o problema antes de liberar
o orçamento. O visitante revisa e confirma o envio no aplicativo. Ele não inventa
preços, prazos ou garantias: quando a base pública não confirma uma informação,
encaminha a confirmação para a equipe.

- Interface: `components/assistant/AssistantWidget.tsx`
- API: `POST /api/assistant/chat`
- Base editável: `data/knowledge.ts`
- Documentação completa: [`docs/assistente.md`](docs/assistente.md)
- Privacidade e LGPD: `/privacidade`

## Desenvolvimento

```bash
npm install
copy .env.example .env.local
npm run dev
```

O assistente funciona sem chave de IA. Para usar um provedor compatível com OpenAI,
preencha `ASSISTANT_LLM_API_KEY` e `ASSISTANT_LLM_MODEL`. As demais variáveis estão
documentadas em `.env.example`.

Verificações:

```bash
npm test        # testes do assistente, limite, WhatsApp e site existente
npm run lint
npm run build
```

**CODE_PH — Assistência Técnica & Soluções Digitais.**
