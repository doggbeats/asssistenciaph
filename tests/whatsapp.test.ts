import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

describe("link do WhatsApp", () => {
  test("normaliza o número e codifica a mensagem", () => {
    const message = "Olá!\nQuero um orçamento: formatação & backup (100%).";
    const url = new URL(buildWhatsAppUrl("+55 (61) 99289-0326", message));

    assert.equal(url.origin, "https://wa.me");
    assert.equal(url.pathname, "/5561992890326");
    assert.equal(url.searchParams.get("text"), message);
    assert.match(url.href, /Ol%C3%A1/);
    assert.match(url.href, /%0A/);
    assert.match(url.href, /%26/);
  });

  test("sem número configurado, abre o seletor de contato do WhatsApp", () => {
    const url = new URL(buildWhatsAppUrl("", "Olá"));
    assert.equal(url.pathname, "/");
    assert.equal(url.searchParams.get("text"), "Olá");
  });
});
