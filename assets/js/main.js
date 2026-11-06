(function () {
  document.documentElement.classList.add("js");

  // Mobile menu
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  // Reveal on scroll
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Count-up numbers
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce || !("IntersectionObserver" in window)) { el.textContent = target + suffix; return; }
    var obs = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      var start = null;
      (function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / 1400, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    });
    obs.observe(el);
  });

  // Membership form -> opens the visitor's mail client with a prefilled request
  var form = document.getElementById("iscrizione");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var rows = [
        ["Nome", "nome"], ["Cognome", "cognome"], ["Data di nascita", "nascita"],
        ["Telefono", "telefono"], ["E-mail", "email"],
        ["Provincia Ordine di iscrizione", "provincia"],
        ["Numero di iscrizione all'Ordine", "numero"],
        ["Data di iscrizione all'Ordine", "data_ordine"]
      ];
      var body = "Richiesta di iscrizione ad ANGPI\n\n" + rows.map(function (r) {
        return r[0] + ": " + d.get(r[1]);
      }).join("\n") + "\n\nHo letto l'informativa privacy e acconsento al trattamento dei dati personali (GDPR, Reg. UE 2016/679).";
      var href = "mailto:info@angpi.it?subject=" + encodeURIComponent("Richiesta di iscrizione ANGPI - " + d.get("cognome") + " " + d.get("nome")) +
        "&body=" + encodeURIComponent(body);
      var status = document.getElementById("form-status");
      status.hidden = false;
      status.textContent = "Si sta aprendo il tuo programma di posta con la richiesta già compilata: premi Invia per completare l'iscrizione.";
      window.location.href = href;
    });
  }
})();
