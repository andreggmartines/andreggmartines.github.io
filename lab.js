/*
 * O "laboratório" da página: um pedaço da loja do portfólio com três defeitos
 * que o visitante liga e desliga. As verificações abaixo rodam de verdade contra
 * estas funções, com os mesmos IDs dos testes do repositório (CT08, CT20, CT24).
 */
(function () {
  "use strict";

  var FRETE = 1990;              // R$ 19,90 em centavos
  var FRETE_GRATIS_A_PARTIR = 20000;
  var ESTOQUE_INICIAL = 5;

  var bugs = false;

  // ---------------------------------------------------------- a loja ----
  function calcularFrete(subtotal) {
    // Regra: grátis a partir de R$ 200,00. O bug usa ">" e cobra em 200,00.
    var gratis = bugs ? subtotal > FRETE_GRATIS_A_PARTIR : subtotal >= FRETE_GRATIS_A_PARTIR;
    return gratis ? 0 : FRETE;
  }

  function novaLoja() {
    var estoque = ESTOQUE_INICIAL;
    var pedidoAberto = false;
    var reembolsos = [];
    return {
      estoque: function () { return estoque; },
      pedidoAberto: function () { return pedidoAberto; },
      comprar: function () {
        if (estoque < 1 || pedidoAberto) return false;
        estoque -= 1; pedidoAberto = true; return true;
      },
      cancelar: function () {
        if (!pedidoAberto) return false;
        pedidoAberto = false;
        if (!bugs) estoque += 1;          // o bug esquece de devolver o item
        return true;
      },
      reembolsar: function (chave) {
        // Regra: a mesma chave não gera um segundo reembolso. O bug ignora a chave.
        var repetida = reembolsos.some(function (r) { return r.chave === chave; });
        if (repetida && !bugs) return false;
        reembolsos.push({ chave: chave, valor: 5000 });
        return true;
      },
      reembolsos: function () { return reembolsos.length; }
    };
  }

  // ----------------------------------------------------- verificações ----
  var reais = function (c) {
    return "R$ " + (c / 100).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  var TESTES = [
    { id: "ct08", nome: "CT08 · frete em exatamente R$ 200,00", rodar: function () {
        var obtido = calcularFrete(20000);
        return obtido === 0 ? null : "esperado " + reais(0) + ", obtido " + reais(obtido);
    }},
    { id: "ct20", nome: "CT20 · cancelamento devolve o item", rodar: function () {
        var l = novaLoja(); l.comprar(); l.cancelar();
        return l.estoque() === ESTOQUE_INICIAL ? null : "esperado estoque " + ESTOQUE_INICIAL + ", obtido " + l.estoque();
    }},
    { id: "ct24", nome: "CT24 · clique duplo no reembolso", rodar: function () {
        var l = novaLoja(); l.reembolsar("pedido-1-a"); l.reembolsar("pedido-1-a");
        return l.reembolsos() === 1 ? null : "esperado 1 reembolso, obtido " + l.reembolsos();
    }}
  ];

  function rodarTestes() {
    var falhas = 0;
    TESTES.forEach(function (t) {
      var erro = t.rodar();
      var el = document.querySelector('[data-check="' + t.id + '"]');
      if (!el) return;
      el.classList.toggle("check--fail", !!erro);
      el.classList.toggle("check--pass", !erro);
      el.textContent = erro ? t.nome + ": falhou, " + erro : t.nome + ": passou";
      if (erro) falhas += 1;
    });
    var estado = document.getElementById("lab-state");
    if (estado) {
      estado.textContent = falhas
        ? falhas + " de 3 verificações falhando, cada uma no bug certo"
        : "3 de 3 verificações passando";
      estado.classList.toggle("lab__state--fail", falhas > 0);
    }
  }

  // ------------------------------------------------------ a interface ----
  var loja = novaLoja();
  var $ = function (id) { return document.getElementById(id); };

  function desenhar() {
    var sub = Number($("subtotal").value);
    var frete = calcularFrete(sub);
    $("frete").textContent = reais(frete);
    $("total").textContent = reais(sub + frete);
    $("estoque").textContent = String(loja.estoque());
    $("comprar").disabled = loja.pedidoAberto() || loja.estoque() < 1;
    $("cancelar").disabled = !loja.pedidoAberto();
    $("reembolsos").textContent = String(loja.reembolsos());
  }

  function iniciar() {
    if (!$("bugs")) return;
    $("bugs").addEventListener("click", function () {
      bugs = !bugs;
      this.setAttribute("aria-checked", String(bugs));
      document.querySelector(".lab").classList.toggle("lab--bugs", bugs);
      loja = novaLoja();
      desenhar(); rodarTestes();
    });
    $("subtotal").addEventListener("change", desenhar);
    $("comprar").addEventListener("click", function () { loja.comprar(); desenhar(); });
    $("cancelar").addEventListener("click", function () { loja.cancelar(); desenhar(); });
    // Mesma chave em todo clique do mesmo pedido: é o que protege do clique duplo.
    $("reembolso").addEventListener("click", function () { loja.reembolsar("pedido-1-a"); desenhar(); });
    desenhar(); rodarTestes();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
