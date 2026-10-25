import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  countTotalServices,
  getCategory,
  getHighlightRows,
  itemIndex,
  serviceCategories,
} from "@/data/services";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

describe("funcionalidades existentes do site", () => {
  test("categorias e serviços continuam disponíveis", () => {
    assert.deepEqual(
      serviceCategories.map((category) => category.id),
      ["computadores", "celulares", "solucoes-digitais"],
    );

    const desktop = getCategory("computadores");
    const items = itemIndex(desktop);
    assert.equal(items["desktop-diagnostico"].price, 60);
    assert.equal(items["desktop-diagnostico"].priceType, "from");
    assert.ok(countTotalServices() >= 15);
  });

  test("destaques de preço continuam iguais", () => {
    const rows = getHighlightRows();
    assert.equal(rows.length, 2);
    assert.deepEqual(
      rows.map((row) => ({ label: row.label, price: row.price })),
      [
        { label: "Diagnóstico de desktop", price: 60 },
        { label: "Diagnóstico de notebook", price: 60 },
      ],
    );
  });

  test("link do WhatsApp usa o mesmo número configurado", () => {
    const url = buildWhatsAppUrl("5561992890326", "Olá");
    assert.equal(new URL(url).pathname, "/5561992890326");
  });
});
