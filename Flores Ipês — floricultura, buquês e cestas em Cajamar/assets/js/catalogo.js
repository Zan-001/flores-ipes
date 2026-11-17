/* Flores Ipês — filtros do catálogo.
   Os 69 arranjos já vêm no HTML, agrupados por categoria; aqui só se mostra
   e se esconde. Sem JavaScript a página continua inteira: todos os arranjos
   aparecem, com foto, nome, preço e link — só não dá para filtrar. */
(function () {
  "use strict";

  var pecas = Array.prototype.slice.call(document.querySelectorAll(".peca"));
  if (!pecas.length) return;

  var grupos = Array.prototype.slice.call(document.querySelectorAll("[data-grupo]"));
  var pilulas = Array.prototype.slice.call(document.querySelectorAll(".pilula[data-filtro]"));
  var busca = document.getElementById("busca");
  var teto = document.getElementById("teto");
  var tetoValor = document.getElementById("teto-valor");
  var conta = document.getElementById("conta");
  var vazio = document.getElementById("vazio");
  var limpar = document.getElementById("limpar");

  var estado = { cat: "todos", texto: "", teto: Number(teto.max) };

  /* "girassois" tem de achar "girassóis", e "BUQUE" tem de achar "buquê".
     U+0300–U+036F é a faixa dos acentos que o NFD separa da letra. */
  function semAcento(s) {
    return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function aplicar() {
    var achados = 0;
    var alvo = semAcento(estado.texto.trim().toLowerCase());

    pecas.forEach(function (p) {
      /* procurar "girassol" tem de trazer a categoria Girassóis inteira, e
         não só os arranjos que repetem a palavra no nome */
      var texto = semAcento(p.getAttribute("data-nome")) + " " +
                  semAcento(nomeCat(p.getAttribute("data-cat")).toLowerCase());
      var ok =
        (estado.cat === "todos" || p.getAttribute("data-cat") === estado.cat) &&
        Number(p.getAttribute("data-preco")) <= estado.teto &&
        (!alvo || texto.indexOf(alvo) !== -1);
      p.hidden = !ok;
      if (ok) achados++;
    });

    grupos.forEach(function (g) {
      var algum = g.querySelector(".peca:not([hidden])");
      g.hidden = !algum;
    });

    vazio.hidden = achados !== 0;

    if (achados === 0) {
      /* a mensagem de "nenhum presente" já diz tudo; o contador sai de cena */
      conta.textContent = "";
      return;
    }

    var texto = achados === 1 ? "1 presente" : achados + " presentes";
    if (estado.cat !== "todos" || alvo || estado.teto < Number(teto.max)) {
      texto += " · " + (estado.cat === "todos" ? "todas as categorias" : nomeCat(estado.cat));
    }
    conta.textContent = texto;
  }

  function nomeCat(slug) {
    var b = pilulas.filter(function (p) { return p.getAttribute("data-filtro") === slug; })[0];
    return b ? b.textContent : slug;
  }

  pilulas.forEach(function (b) {
    b.addEventListener("click", function () {
      estado.cat = b.getAttribute("data-filtro");
      pilulas.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      aplicar();

      /* a pílula escolhida entra em cena dentro da fita */
      if (b.scrollIntoView) {
        b.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      }

      /* e a lista recomeça logo abaixo da barra, sem pular a página toda */
      var barra = document.querySelector(".filtros");
      if (barra) {
        var alvo = barra.offsetTop;
        if (window.scrollY > alvo) window.scrollTo({ top: alvo, behavior: "smooth" });
      }
    });
  });

  var atraso;
  busca.addEventListener("input", function () {
    estado.texto = busca.value;
    clearTimeout(atraso);
    atraso = setTimeout(aplicar, 90);
  });

  teto.addEventListener("input", function () {
    estado.teto = Number(teto.value);
    tetoValor.textContent =
      "R$ " + estado.teto.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    aplicar();
  });

  limpar.addEventListener("click", function () {
    estado = { cat: "todos", texto: "", teto: Number(teto.max) };
    busca.value = "";
    teto.value = teto.max;
    tetoValor.textContent =
      "R$ " + Number(teto.max).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    pilulas.forEach(function (o) { o.setAttribute("aria-pressed", String(o.getAttribute("data-filtro") === "todos")); });
    aplicar();
    /* o botão que foi clicado acabou de sumir junto com o aviso de vazio;
       o foco volta para a busca, que é de onde se recomeça */
    busca.focus();
  });

  /* categoria vinda do link da página inicial */
  if (location.hash) {
    var slug = location.hash.slice(1);
    var b = pilulas.filter(function (p) { return p.getAttribute("data-filtro") === slug; })[0];
    if (b) {
      estado.cat = slug;
      pilulas.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
    }
  }

  aplicar();
})();
