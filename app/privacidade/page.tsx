import type { Metadata } from "next";
import Link from "next/link";
import { brand, social } from "@/data/site";
import { quoteWhatsAppUrl, whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Privacidade e LGPD",
  description:
    "Como o site e o assistente virtual da CODE_PH tratam dados pessoais, histórico de conversa e informações de contato.",
};

const contactMessage = "Olá, CODE_PH! Gostaria de falar sobre privacidade e meus dados.";

export default function PrivacidadePage() {
  return (
    <div className="bg-mist">
      <div className="relative overflow-hidden border-b border-ink-line bg-ink text-white">
        <div aria-hidden="true" className="tech-grid pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-6xl px-5 py-14 md:py-16">
          <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            <span aria-hidden="true" className="inline-block h-[7px] w-[7px] bg-neon" />
            Privacidade
          </p>

          <h1 className="mt-6 text-[32px] font-semibold leading-tight tracking-tight md:text-[46px]">
            Privacidade e LGPD
          </h1>

          <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-neutral-400">
            Esta página explica como o site da CODE_PH e o assistente virtual tratam
            informações. O objetivo é ser direto: o assistente não guarda o histórico
            completo da conversa.
          </p>

          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500">
            Última atualização: 25/10/2026
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <div className="space-y-10 text-[14.5px] leading-relaxed text-neutral-700">
          <section>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              01 — Quem trata os dados
            </h2>
            <p className="mt-3">
              O site e o assistente virtual são operados por{" "}
              <strong className="font-semibold text-ink">{brand.legalName}</strong>. O contato
              para assuntos de privacidade pode ser feito pelo WhatsApp comercial ou pelo
              Instagram {social.instagram.label}.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              02 — O que o assistente virtual faz
            </h2>
            <p className="mt-3">
              O assistente recebe a mensagem que você escreve e as mensagens anteriores
              desta mesma sessão para entender o contexto do atendimento. A resposta é
              montada com base na base de conhecimento pública da CODE_PH: serviços,
              condições comerciais publicadas e perguntas frequentes.
            </p>
            <p className="mt-3">
              O histórico completo da conversa não é salvo em banco de dados pela CODE_PH.
              As mensagens ficam apenas na memória da página aberta no seu navegador e são
              descartadas quando a conversa é reiniciada, a página é recarregada ou a aba é
              fechada. O botão “Reiniciar conversa” apaga o histórico local imediatamente.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              03 — Limite de uso e segurança
            </h2>
            <p className="mt-3">
              Para evitar abuso, automatização e sobrecarga, cada requisição ao assistente
              passa por um limite de mensagens por minuto e por dia. Para isso, o servidor
              usa temporariamente um identificador derivado do endereço IP, protegido por
              hash com salt aleatório. O endereço IP em texto puro não é armazenado pela
              aplicação e os contadores são descartados quando a janela de tempo termina.
            </p>
            <p className="mt-3">
              A infraestrutura de hospedagem pode registrar dados técnicos de acesso, como
              endereço IP, data e hora, em logs operacionais, conforme a configuração do
              provedor. Esses registros não incluem o conteúdo das mensagens do assistente.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              04 — Uso opcional de provedor de IA
            </h2>
            <p className="mt-3">
              A CODE_PH pode configurar um provedor de inteligência artificial para
              aperfeiçoar a redação das respostas. Quando isso estiver ativo, a mensagem do
              visitante e os trechos públicos da base de conhecimento necessários para
              responder podem ser enviados a esse provedor exclusivamente para gerar a
              resposta. Documentos internos, chaves de API e dados de outros clientes não
              são enviados.
            </p>
            <p className="mt-3">
              Se nenhum provedor estiver configurado, o assistente funciona de forma local e
              determinística, sem enviar a conversa a terceiros.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              05 — Dados que você não deve enviar
            </h2>
            <p className="mt-3">
              Não envie senhas, códigos de acesso, dados bancários, documentos, exames ou
              outras informações sensíveis pelo chat. Para orçamento e contratação, a
              CODE_PH solicita apenas os dados necessários pelo canal oficial de
              atendimento.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              06 — Orçamento e WhatsApp
            </h2>
            <p className="mt-3">
              O assistente não envia mensagens para o WhatsApp sozinho. Os botões de
              orçamento abrem o aplicativo com uma mensagem inicial; nada é transmitido
              automaticamente. Você revisa e confirma o envio no próprio WhatsApp. Ao
              continuar por lá, valem também as políticas e os termos do aplicativo.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              07 — Seus direitos
            </h2>
            <p className="mt-3">
              Nos termos da Lei Geral de Proteção de Dados (LGPD), você pode solicitar
              informações sobre o tratamento, correção, anonimização ou eliminação de dados
              pessoais que a CODE_PH eventualmente mantenha em seus canais de atendimento.
              Como o assistente não persiste a conversa, não há histórico de chat a ser
              exportado ou apagado pela aplicação.
            </p>
            <p className="mt-3">
              Para exercer seus direitos ou tirar dúvidas, fale com a CODE_PH pelos canais
              oficiais abaixo.
            </p>
          </section>

          <section className="border-t border-line pt-8">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              Canais oficiais
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={whatsappUrl(contactMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                Falar pelo WhatsApp
              </a>
              <a
                href={social.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center border border-line px-5 text-sm font-semibold text-ink transition-colors hover:border-neutral-400"
              >
                {social.instagram.label}
              </a>
            </div>
            <p className="mt-6 text-[12.5px] text-neutral-500">
              Veja também como{" "}
              <a
                href={quoteWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-ink underline underline-offset-4 hover:text-neon-deep"
              >
                enviar seu orçamento pelo WhatsApp
              </a>{" "}
              ou volte para{" "}
              <Link
                href="/"
                className="font-semibold text-ink underline underline-offset-4 hover:text-neon-deep"
              >
                a página inicial
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
