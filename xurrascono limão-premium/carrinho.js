/* Xurrascão no Limão — Carrinho de encomenda */
(function () {
  "use strict";

  var WA_NUMERO = "244932110770";
  var CHAVE = "xnl_carrinho";

  var carrinho = carregar();

  var fab = document.getElementById("cartFab");
  var count = document.getElementById("cartCount");
  var overlay = document.getElementById("cartOverlay");
  var drawer = document.getElementById("cartDrawer");
  var fechar = document.getElementById("cartFechar");
  var lista = document.getElementById("cartItens");
  var totalEl = document.getElementById("cartTotal");
  var finalizar = document.getElementById("cartFinalizar");
  var limpar = document.getElementById("cartLimpar");

  if (!fab || !drawer) return;

  /* ---- Persistência ---- */
  function carregar() {
    try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; }
    catch (e) { return {}; }
  }
  function guardar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(carrinho)); } catch (e) {}
  }

  /* ---- Formatação ---- */
  function fmt(n) { return n.toLocaleString("pt-PT") + " Kz"; }

  function totais() {
    var qtd = 0, val = 0;
    Object.keys(carrinho).forEach(function (k) {
      qtd += carrinho[k].qtd;
      val += carrinho[k].qtd * carrinho[k].preco;
    });
    return { qtd: qtd, val: val };
  }

  /* ---- Operações ---- */
  function adicionar(nome, preco, img) {
    if (carrinho[nome]) carrinho[nome].qtd += 1;
    else carrinho[nome] = { qtd: 1, preco: preco, img: img || "" };
    guardar(); render();
  }
  function alterar(nome, delta) {
    if (!carrinho[nome]) return;
    carrinho[nome].qtd += delta;
    if (carrinho[nome].qtd <= 0) delete carrinho[nome];
    guardar(); render();
  }
  function limparTudo() { carrinho = {}; guardar(); render(); }

  /* ---- Render ---- */
  function render() {
    var t = totais();
    count.textContent = t.qtd;
    count.classList.toggle("tem", t.qtd > 0);
    totalEl.textContent = fmt(t.val);

    var nomes = Object.keys(carrinho);
    if (!nomes.length) {
      lista.innerHTML =
        '<div class="cart-vazio">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="21" r="1.6"/><circle cx="18" cy="21" r="1.6"/><path d="M2 3h3l2.4 12.4a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 2-1.6L23 7H6"/></svg>' +
        '<p>O seu carrinho está vazio.<br>Adicione os seus grelhados favoritos!</p></div>';
      finalizar.classList.add("desativado");
      return;
    }
    finalizar.classList.remove("desativado");

    lista.innerHTML = nomes.map(function (nome) {
      var it = carrinho[nome];
      var media = it.img
        ? '<img class="cl-img" src="' + it.img + '" alt="' + esc(nome) + '">'
        : '<div class="cl-img">📷</div>';
      return '<div class="cart-linha">' +
        media +
        '<div class="cl-info"><b>' + esc(nome) + '</b><small>' + fmt(it.preco) + '</small></div>' +
        '<div class="cart-qtd">' +
        '<button data-menos="' + esc(nome) + '" aria-label="Menos">&minus;</button>' +
        '<span>' + it.qtd + '</span>' +
        '<button data-mais="' + esc(nome) + '" aria-label="Mais">+</button>' +
        '</div></div>';
    }).join("");
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---- Mensagem WhatsApp ---- */
  function montarLink() {
    var nomes = Object.keys(carrinho);
    var t = totais();
    var linhas = [];
    linhas.push("Olá Xurrascão no Limão! 🔥");
    linhas.push("Gostaria de fazer a seguinte encomenda:");
    linhas.push("");
    nomes.forEach(function (nome) {
      var it = carrinho[nome];
      linhas.push("• " + it.qtd + "x " + nome + " — " + fmt(it.qtd * it.preco));
    });
    linhas.push("");
    linhas.push("Total: " + fmt(t.val));
    linhas.push("");
    linhas.push("Nome: ");
    linhas.push("Entrega/Take away: ");
    linhas.push("Hora pretendida: ");
    return "https://wa.me/" + WA_NUMERO + "?text=" + encodeURIComponent(linhas.join("\n"));
  }

  /* ---- Abrir / fechar ---- */
  function abrir() { drawer.classList.add("aberto"); overlay.classList.add("aberto"); document.body.style.overflow = "hidden"; }
  function fecharDrawer() { drawer.classList.remove("aberto"); overlay.classList.remove("aberto"); document.body.style.overflow = ""; }

  /* ---- Eventos ---- */
  document.querySelectorAll(".m-add").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var nome = btn.getAttribute("data-nome");
      var preco = parseInt(btn.getAttribute("data-preco"), 10) || 0;
      var img = btn.getAttribute("data-img") || "";
      adicionar(nome, preco, img);
      // feedback visual
      btn.classList.add("feito");
      btn.textContent = "✓";
      setTimeout(function () { btn.classList.remove("feito"); btn.textContent = "+"; }, 700);
      // pequeno "salto" no botão do carrinho
      fab.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }],
        { duration: 300, easing: "ease-out" }
      );
    });
  });

  lista.addEventListener("click", function (e) {
    var mais = e.target.getAttribute && e.target.getAttribute("data-mais");
    var menos = e.target.getAttribute && e.target.getAttribute("data-menos");
    if (mais) alterar(mais, +1);
    if (menos) alterar(menos, -1);
  });

  fab.addEventListener("click", abrir);
  fechar.addEventListener("click", fecharDrawer);
  overlay.addEventListener("click", fecharDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("aberto")) fecharDrawer();
  });

  limpar.addEventListener("click", function () {
    if (Object.keys(carrinho).length && confirm("Quer mesmo limpar o carrinho?")) limparTudo();
  });

  finalizar.addEventListener("click", function (e) {
    if (!Object.keys(carrinho).length) {
      e.preventDefault();
      alert("O seu carrinho está vazio. Adicione itens antes de finalizar.");
      return;
    }
    finalizar.setAttribute("href", montarLink());
    // o link abre o WhatsApp num novo separador (target=_blank)
  });

  render();
})();
