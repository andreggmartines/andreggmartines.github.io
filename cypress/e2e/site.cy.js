// O site de um QA também precisa de teste.

describe("Site pessoal", () => {
  beforeEach(() => cy.visit("/"));

  it("mostra a apresentação e o convite para conversar", () => {
    cy.get("[data-cy=hero-title]").should("contain.text", "defeito que custa dinheiro");
    cy.get("[data-cy=hero-cta]").should("have.attr", "href", "#contato");
    cy.get("[data-cy=close-cta]")
      .should("have.attr", "href", "https://www.linkedin.com/in/andreggmartines/");
  });

  it("começa com as 3 verificações do laboratório passando", () => {
    cy.get("[data-cy=lab-state]").should("have.text", "3 de 3 verificações passando");
    ["ct08", "ct20", "ct24"].forEach((id) => {
      cy.get(`[data-cy=check-${id}]`).should("have.class", "check--pass");
    });
  });

  it("no modo com bugs, cada verificação falha no bug certo", () => {
    cy.get("[data-cy=toggle-bugs]").click().should("have.attr", "aria-checked", "true");
    cy.get("[data-cy=lab-state]").should("contain.text", "3 de 3 verificações falhando");
    cy.get("[data-cy=check-ct08]").should("contain.text", "obtido R$ 19,90");
    cy.get("[data-cy=check-ct20]").should("contain.text", "obtido 4");
    cy.get("[data-cy=check-ct24]").should("contain.text", "obtido 2");

    cy.get("[data-cy=toggle-bugs]").click();
    cy.get("[data-cy=lab-state]").should("have.text", "3 de 3 verificações passando");
  });

  it("aplica as regras da loja quando o visitante interage", () => {
    // Valor-limite do frete
    cy.get("[data-cy=subtotal]").select("R$ 199,90");
    cy.get("[data-cy=frete]").should("have.text", "R$ 19,90");
    cy.get("[data-cy=subtotal]").select("R$ 200,00");
    cy.get("[data-cy=frete]").should("have.text", "R$ 0,00");

    // Cancelamento devolve ao estoque
    cy.get("[data-cy=comprar]").click();
    cy.get("[data-cy=estoque]").should("have.text", "4");
    cy.get("[data-cy=cancelar]").click();
    cy.get("[data-cy=estoque]").should("have.text", "5");

    // Clique duplo não gera dois reembolsos
    cy.get("[data-cy=reembolso]").dblclick();
    cy.get("[data-cy=reembolsos]").should("have.text", "1");
  });

  it("aponta para os repositórios dos três projetos", () => {
    cy.get("[data-cy=link-repo]")
      .should("have.attr", "href", "https://github.com/andreggmartines/checkout-qa-portfolio");
    cy.get("[data-cy=link-repo-playwright]")
      .should("have.attr", "href", "https://github.com/andreggmartines/playwright-qa-portfolio");
    cy.get("[data-cy=link-repo-banco]")
      .should("have.attr", "href", "https://github.com/andreggmartines/banco-digital-cypress-qa");
  });

  it("mostra o método em 4 passos, sem a trajetória com datas", () => {
    cy.get("[data-cy=steps] > li").should("have.length", 4);
    cy.get("#trajetoria").should("not.exist");
  });

  it("oferece o currículo público para baixar", () => {
    cy.get("[data-cy=cv-download]")
      .should("have.attr", "href", "assets/Curriculo_Andre_Martines_QA.pdf")
      .and("have.attr", "download");
    // Confere o próprio arquivo: todo PDF começa com "%PDF".
    cy.request("assets/Curriculo_Andre_Martines_QA.pdf").then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.slice(0, 4)).to.eq("%PDF");
    });
  });

  it("não tem travessão no texto visível", () => {
    cy.get("body").invoke("text").should("not.match", /[\u2013\u2014]/);
  });
});
