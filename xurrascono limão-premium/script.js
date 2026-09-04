/* Xurrascão no Limão — JS partilhado */
(function () {
  "use strict";

  document.querySelectorAll("[data-ano]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Menu móvel */
  var hamb = document.querySelector(".hamb");
  var nav = document.querySelector(".nav");
  if (hamb && nav) {
    hamb.addEventListener("click", function () {
      var aberto = nav.classList.toggle("aberta");
      hamb.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("aberta");
        hamb.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Animações de entrada */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* Lightbox da galeria */
  var itens = Array.prototype.slice.call(document.querySelectorAll(".g-item img"));
  if (itens.length) {
    var lb = document.createElement("div");
    lb.className = "lb";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-label", "Galeria de imagens");
    lb.innerHTML =
      '<button class="lb-fechar" aria-label="Fechar">&#10005;</button>' +
      '<button class="lb-seta esq" aria-label="Anterior">&#10094;</button>' +
      '<img src="" alt="">' +
      '<div class="lb-legenda"></div>' +
      '<button class="lb-seta dir" aria-label="Seguinte">&#10095;</button>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector("img");
    var lbLeg = lb.querySelector(".lb-legenda");
    var atual = 0;

    function mostrar(i) {
      atual = (i + itens.length) % itens.length;
      var im = itens[atual];
      lbImg.src = im.currentSrc || im.src;
      lbImg.alt = im.alt || "";
      var fig = im.closest(".g-item");
      lbLeg.textContent = (fig && fig.getAttribute("data-legenda")) || "";
    }
    function abrir(i) { mostrar(i); lb.classList.add("aberta"); document.body.style.overflow = "hidden"; }
    function fechar() { lb.classList.remove("aberta"); document.body.style.overflow = ""; }

    itens.forEach(function (im, i) {
      im.closest(".g-item").addEventListener("click", function () { abrir(i); });
    });
    lb.querySelector(".lb-fechar").addEventListener("click", fechar);
    lb.querySelector(".lb-seta.esq").addEventListener("click", function (e) { e.stopPropagation(); mostrar(atual - 1); });
    lb.querySelector(".lb-seta.dir").addEventListener("click", function (e) { e.stopPropagation(); mostrar(atual + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) fechar(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("aberta")) return;
      if (e.key === "Escape") fechar();
      if (e.key === "ArrowLeft") mostrar(atual - 1);
      if (e.key === "ArrowRight") mostrar(atual + 1);
    });
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) mostrar(atual + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });
  }

  /* Destaque das categorias do menu ao rolar */
  var cats = document.querySelectorAll(".cats a");
  if (cats.length && "IntersectionObserver" in window) {
    var blocos = [];
    cats.forEach(function (a) {
      var alvo = document.querySelector(a.getAttribute("href"));
      if (alvo) blocos.push({ lig: a, sec: alvo });
    });
    var io2 = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          cats.forEach(function (a) { a.classList.remove("ativo"); });
          var b = blocos.find(function (x) { return x.sec === e.target; });
          if (b) b.lig.classList.add("ativo");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    blocos.forEach(function (b) { io2.observe(b.sec); });
  }
})();
