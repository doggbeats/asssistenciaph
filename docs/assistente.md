# Assistente virtual da CODE_PH

Assistente de atendimento com recuperação de conhecimento (RAG) integrado ao site
institucional. Ele entende a necessidade do visitante, faz uma pergunta por vez,
consulta a base pública da CODE_PH, recomenda a solução mais aderente e encaminha
para o WhatsApp com uma mensagem de orçamento.

O assistente não substitui a equipe: não confirma preço, prazo, garantia ou
disponibilidade. Quando a base não sustenta uma resposta, ele informa que a equipe
precisa confirmar.

## Visão geral

```text
Navegador
  └─ AssistantWidget (client)
       └─ POST /api/assistant/chat
            ├─ validação Zod e limite de requisições
            ├─ extração de perfil e condução (regras determinísticas)
            ├─ busca lexical BM25 na base pública
            ├─ composição local da resposta (grounded)
            └─ opcional: provedor de IA compatível com OpenAI
                 └─ resposta validada; em falha, usa a resposta local
```

Principais decisões:

- **Sem banco na v1:** a base é versionada em `data/knowledge.ts` e indexada em
  memória na primeira importação. Isso simplifica deploy e manutenção.
- **Recuperação lexical (BM25):** suficiente para uma base pequena e curada, com
  normalização de acentos, remoção de stopwords, stemming simples e sinônimos.
- **Condução determinística:** perguntas, recomendações e ações comerciais são
  calculadas por regras. O provedor de IA é opcional e só reescreve respostas
  fundamentadas.
- **Sem persistência de conversa:** o histórico fica no estado do navegador e é
  enviado a cada requisição apenas para dar contexto.

## Estrutura de arquivos

```text
app/
  api/assistant/chat/route.ts     API POST, validação, limite e erros
  privacidade/page.tsx            aviso de privacidade e LGPD
components/
  assistant/AssistantWidget.tsx   interface flutuante do chat
data/
  knowledge.ts                    base de conhecimento pública
  services.ts                     catálogo canônico de serviços e preços
lib/assistant/
  engine.ts                       orquestração do atendimento
  intent.ts                       extração de perfil e próxima pergunta
  retrieval.ts                    índice e busca BM25
  knowledge.ts                    validação e filtro de documentos públicos
  text.ts                         normalização, sinônimos, PII e utilitários
  safety.ts                       detecção de prompt injection
  prompt.ts                       prompt de sistema e contexto do provedor
  llm.ts                          integração opcional com provedor
  labels.ts                       textos compartilhados com a interface
  rate-limit.ts                   limite em memória por IP (hash)
  schema.ts                       contrato da API com Zod
  types.ts                        tipos compartilhados
docs/
  assistente.md                   esta documentação
tests/
  assistant.test.ts               RAG, condução, preços, injeção, provedor
  rate-limit.test.ts              limite em memória e contrato da rota
  whatsapp.test.ts                codificação do link do WhatsApp
  existing-site.test.ts           preservação de serviços e link do WhatsApp
```

## Base de conhecimento

Cada documento em `data/knowledge.ts` segue o formato:

```ts
{
  id: "assistencia-notebook",
  title: "Assistência técnica para notebooks",
  category: "assistencia",        // assistencia | sites | sistemas | comercial | faq | empresa
  summary: "Resumo curto para o contexto do assistente.",
  content: "Conteúdo completo, em texto simples.",
  tags: ["notebook", "formatacao", "backup"],
  href: "/#servicos",             // opcional
  serviceIds: ["notebook-diagnostico"],
  updatedAt: "2026-10-25",
  status: "published",            // published | draft | archived
  visibility: "public",           // public | internal
}
```

Regras:

- Somente documentos `status: "published"` e `visibility: "public"` entram no índice.
- Rascunhos e documentos internos não são recuperados nem enviados ao provedor de IA.
- O módulo `lib/assistant/knowledge.ts` valida a estrutura com Zod na inicialização.
  Um documento inválido ou com `id` duplicado interrompe o build com mensagem clara.
- Atualize `updatedAt` ao mudar qualquer conteúdo; a data fica disponível na API para auditoria.
- Use apenas informações verificadas. Não cadastre preço, prazo ou garantia que não
  esteja publicado no site ou confirmado pela CODE_PH.
- `serviceIds` devem corresponder aos ids reais de `data/services.ts`; os testes não
  validam essa ligação, então revise ao renomear um serviço.

### Como atualizar sem mexer no chat

1. Edite ou adicione um objeto em `data/knowledge.ts`.
2. Rode `npm test` para validar a estrutura e os cenários de recuperação.
3. Rode `npm run build` e faça o deploy.
4. Nenhuma alteração é necessária no componente ou na API.

## Fluxo de atendimento

O widget abre automaticamente ao carregar o site, com animação suave e tema claro
(branco e preto). A interface é responsiva, com textos legíveis em celular e
desktop. O visitante pode minimizar, fechar ou reiniciar a conversa a qualquer
momento; o campo de texto não recebe foco automático para não abrir o teclado no
celular.

1. O visitante escolhe uma das opções iniciais ou escreve livremente.
2. `extractProfile` identifica domínio (assistência, sites, sistemas), equipamento,
   modelo do celular, tipo de negócio, necessidades, objetivo e canal de vendas.
3. `buildGuidance` decide entre saudação, resposta, pergunta de qualificação ou
   recomendação. A ordem de prioridade é:
   - contato e dúvidas comerciais;
   - perguntas informativas;
   - qualificação específica do domínio;
   - recomendação.
4. A busca recupera até quatro documentos públicos, com reforço para a categoria do
   domínio e para `comercial` quando a pergunta é sobre preço, prazo ou garantia.
5. A resposta local é montada a partir dos serviços canônicos e dos documentos.
6. Se o provedor de IA estiver configurado, ele recebe somente os documentos
   recuperados e a orientação do sistema. A saída passa por uma checagem: valores
   diferentes de R$ 60, promessas de garantia/prazo/desconto, mais de uma pergunta
   ou tentativa de expor o prompt fazem a resposta local prevalecer.
7. A ação de orçamento exibe no chat um resumo com os dados coletados (solução,
   equipamento, modelo do celular, problema, negócio, necessidades, objetivo e
   relato) e abre o WhatsApp com o mesmo resumo, já sem dados sensíveis. O
   assistente não envia mensagens sozinho; o visitante revisa e confirma o envio
   no próprio WhatsApp.

### Uma pergunta por vez

As perguntas de qualificação são únicas e objetivas. Exemplos:

- assistência: equipamento → sintoma → detalhe (backup, tela, frequência);
- celular: modelo do aparelho → problema → detalhe específico do aparelho. O
  orçamento só é liberado depois que o modelo foi solicitado e o problema
  informado. Se o cliente não souber o modelo, o resumo registra "Não informado"
  para a equipe confirmar;
- sites: tipo de negócio → objetivo (apresentar, agendar, vender);
- sistemas: tipo de negócio → necessidade (vendas, estoque, agenda) → canal de venda.

## Contrato da API

`POST /api/assistant/chat`

Requisição:

```json
{
  "message": "Meu notebook está lento",
  "history": [
    { "role": "assistant", "content": "Olá! Como posso ajudar?" },
    { "role": "user", "content": "Meu notebook está lento" }
  ]
}
```

- `message`: 1 a 800 caracteres.
- `history`: até 10 mensagens, cada uma com até 1.200 caracteres.
- Corpo máximo: 16 KB.
- `Content-Type: application/json`.
- A rota aceita apenas a mesma origem (`Origin` igual ao `Host`).

Resposta de sucesso (`200`):

```json
{
  "reply": "Pelo que você descreveu...",
  "sources": [
    {
      "id": "assistencia-celular",
      "title": "Assistência técnica para celulares",
      "category": "assistencia",
      "updatedAt": "2026-10-25"
    }
  ],
  "intent": { "domain": "assistencia", "focus": "celular", "model": "Samsung Galaxy A54" },
  "summary": {
    "fields": [
      { "label": "Equipamento", "value": "celular" },
      { "label": "Modelo do aparelho", "value": "Samsung Galaxy A54" },
      { "label": "Problema", "value": "tela" }
    ],
    "report": "Meu celular está com a tela quebrada."
  },
  "action": { "type": "quote", "label": "Enviar orçamento", "href": "https://wa.me/5561992890326?text=..." },
  "quickReplies": [],
  "mode": "local",
  "confidence": "high",
  "needsHumanConfirmation": true
}
```

Erros:

| Status | `error.code`            | Quando                                        |
| ------ | ----------------------- | --------------------------------------------- |
| 400    | `invalid_json`          | corpo não é JSON                              |
| 400    | `invalid_request`       | validação Zod                                 |
| 403    | `forbidden`             | origem diferente                              |
| 413    | `payload_too_large`     | corpo acima de 16 KB                          |
| 415    | `unsupported_media_type`| `Content-Type` diferente de `application/json`|
| 429    | `rate_limited`          | limite por minuto/dia                         |
| 500    | `internal_error`        | falha inesperada                              |

Todas as respostas usam `Cache-Control: no-store`. Em `429`, o cabeçalho
`Retry-After` informa os segundos.

## Variáveis de ambiente

Todas as chaves são opcionais. Sem elas, o assistente funciona em modo local.

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | — | número do WhatsApp no formato internacional |
| `ASSISTANT_LLM_API_KEY` | — | chave do provedor compatível com OpenAI |
| `ASSISTANT_LLM_MODEL` | — | modelo de chat |
| `ASSISTANT_LLM_BASE_URL` | `https://api.openai.com/v1` | URL base do provedor |
| `ASSISTANT_LLM_MAX_OUTPUT_TOKENS` | `350` | limite de tokens (80–700) |
| `ASSISTANT_LLM_TIMEOUT_MS` | `12000` | timeout (2.000–30.000 ms) |
| `ASSISTANT_LLM_ENABLED` | — | `false` desativa o provedor |
| `ASSISTANT_RATE_LIMIT_PER_MINUTE` | `10` | mensagens por minuto por IP |
| `ASSISTANT_RATE_LIMIT_PER_DAY` | `150` | mensagens por dia por IP |
| `ASSISTANT_RATE_LIMIT_SALT` | aleatório | salt do hash do IP |

`ASSISTANT_LLM_ENABLED=false` tem prioridade: mesmo com chave e modelo, o modo local
é usado.

### Provedores compatíveis

A integração usa o formato `POST {base}/chat/completions`. Funciona com OpenAI e
provedores compatíveis (por exemplo, endpoints que seguem o mesmo contrato). Ajuste
`ASSISTANT_LLM_BASE_URL` e `ASSISTANT_LLM_MODEL` conforme o provedor.

## Segurança e privacidade

- Chaves ficam somente no servidor; nenhuma variável sensível usa `NEXT_PUBLIC_`.
- A mensagem e o histórico são validados com Zod e limitados em tamanho.
- Prompt injection é detectado por padrões normalizados; a mensagem do visitante e
  os documentos são tratados como dados, nunca como instruções.
- O prompt de sistema proíbe expor regras internas, chaves, credenciais ou dados de
  outros clientes.
- Saídas do provedor passam por validação de valores, promessas e quantidade de
  perguntas. Em qualquer dúvida, a resposta local é mantida.
- O perfil interno remove e-mail, CPF, telefone e sequências numéricas longas antes
  de qualquer composição.
- O conteúdo da conversa não é registrado em log. Em falhas, só o tipo do erro é
  registrado.
- O limite de requisições guarda apenas um hash com salt do IP, por no máximo 24h.
- A página `/privacidade` descreve o tratamento e os direitos previstos na LGPD.

### Limitações do limite de requisições

O contador é em memória, por instância. Em ambientes serverless com várias instâncias,
o limite efetivo pode ser maior. Para produção de maior escala, substitua
`lib/assistant/rate-limit.ts` por Redis/Upstash mantendo a interface
`consumeRateLimit`. Documente também a confiança no cabeçalho `x-forwarded-for`:
somente use esse valor quando a plataforma de deploy o define de forma confiável.

## Testes

```bash
npm test
```

Cobertura atual (52 testes):

- estrutura e filtro público da base;
- recuperação por termos, sinônimos e assuntos fora da base;
- condução com uma pergunta por vez;
- fluxo de celular com modelo, problema, resumo e WhatsApp;
- recomendações de assistência, site, PDV e agendamento;
- ausência de informação sem invenção;
- preço, prazo e garantia;
- prompt injection e remoção de PII;
- falha do provedor com fallback local;
- codificação do link do WhatsApp;
- resumo da solicitação no link do WhatsApp;
- encaminhamento do pedido de contato para o WhatsApp;
- limite por minuto/dia e contrato da rota (400, 403, 413, 415, 429);
- preservação do catálogo de serviços e do link de WhatsApp configurado.

Os testes de atendimento chamam `respond(..., { useLlm: false })` para serem
determinísticos. O teste de falha do provedor usa um endereço local inválido e
restaura o ambiente ao final.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`, clique no botão do assistente no canto inferior direito
e teste as opções iniciais.

Verificações antes do deploy:

```bash
npm test
npm run lint
npm run build
```

## Deploy

O projeto é um app Next.js 16 com `cacheComponents` e `partialPrefetching` ativos.
A rota do assistente é dinâmica e usa runtime Node.js.

Requisitos:

- Node.js 20+ (o projeto foi validado com Node 24);
- variáveis de ambiente configuradas na plataforma, nunca no repositório;
- `NEXT_PUBLIC_WHATSAPP_NUMBER` definido para os links de WhatsApp;
- se usar provedor de IA, configurar chave, modelo e, se necessário, URL base.

Passos típicos:

1. Conecte o repositório à plataforma (Vercel, Netlify, Fly.io, VPS etc.).
2. Configure as variáveis em `.env.example` como referência.
3. Rode o build de produção.
4. Teste `/api/assistant/chat` com uma mensagem simples e confirme `Cache-Control:
   no-store`.
5. Confira a página `/privacidade` e os links de orçamento para o WhatsApp.

### Custos

- **Modo local:** sem custo de IA. O custo é apenas hospedagem.
- **Com provedor:** custo por token de entrada e saída. O contexto é limitado a até
  quatro documentos (trechos de 1.800 caracteres) e 350 tokens de saída por padrão.
  Para estimar, considere o preço do modelo escolhido e o volume de mensagens.
- **Banco de dados:** não é necessário na v1.

## Migração futura para busca semântica

A recuperação está isolada em `lib/assistant/retrieval.ts`. Para evoluir para
PostgreSQL + pgvector:

1. Crie uma tabela `knowledge_documents` com `id`, `title`, `category`, `summary`,
   `content`, `tags`, `updated_at`, `status`, `visibility` e `embedding vector(n)`.
2. Gere embeddings apenas de documentos publicados e públicos.
3. Implemente `searchKnowledge` com similaridade de cosseno e um filtro mínimo de
   relevância.
4. Combine busca lexical e semântica (híbrida) para preservar termos exatos, como
   nomes de serviços e valores.
5. Mantenha a mesma assinatura de `RetrievalResult` para não alterar o motor nem a
   interface.
6. Adicione testes de relevância e um fallback para quando o provedor de embeddings
   falhar.

Enquanto a base for pequena e curada, o BM25 em memória é mais simples, previsível e
barato.

## Solução de problemas

| Sintoma | Verificação |
| --- | --- |
| Assistente responde sempre em modo local | confira `ASSISTANT_LLM_API_KEY`, `ASSISTANT_LLM_MODEL` e `ASSISTANT_LLM_ENABLED` |
| Resposta do provedor é ignorada | a saída pode ter valor, prazo, garantia ou mais de uma pergunta; o fallback local é intencional |
| `429` ao testar | o limite é por IP; aguarde ou ajuste `ASSISTANT_RATE_LIMIT_PER_MINUTE` |
| Documento novo não aparece | confirme `status: "published"`, `visibility: "public"`, `updatedAt` e rode o build |
| Build falha na base | a mensagem indica o `id` e o campo inválido; corrija `data/knowledge.ts` |
| Link do WhatsApp sem número | defina `NEXT_PUBLIC_WHATSAPP_NUMBER` no ambiente de build |
| Chat não abre | verifique o CSP em `next.config.ts`; a chamada é same-origin (`connect-src 'self'`) |
