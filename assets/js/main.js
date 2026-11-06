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

/* ---------- Animation layer ---------- */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  // Split headline into words for the mask reveal
  document.querySelectorAll(".split-words").forEach(function (h) {
    var i = 0;
    (function walk(node, parent) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "w";
            var s = document.createElement("span"); s.style.setProperty("--i", i++); s.textContent = part;
            w.appendChild(s); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) { walk(n); }
      });
    })(h);
  });

  // Scroll progress + hide header on scroll down
  var bar = document.querySelector(".progress");
  var header = document.querySelector(".site-header");
  var lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.setProperty("--p", max > 0 ? Math.min(y / max, 1) : 0);
    if (header) {
      var menuOpen = document.getElementById("menu") && document.getElementById("menu").classList.contains("open");
      header.classList.toggle("hide", y > lastY && y > 240 && !menuOpen);
    }
    lastY = y; ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  if (reduce) return;

  // Hero: cursor glow + parallax
  var hero = document.querySelector(".hero");
  if (hero && !coarse) {
    var shape = hero.querySelector(".hero-shape");
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      hero.style.setProperty("--mx", (x * 100) + "%");
      hero.style.setProperty("--my", (y * 100) + "%");
      if (shape) shape.style.rotate = (-6 + (x - .5) * 8) + "deg";
    });
  }

  if (coarse) return;

  // Cards: spotlight + tilt
  document.addEventListener("mousemove", function (e) {
    var el = e.target.closest && e.target.closest(".card, .member");
    if (!el) return;
    var r = el.getBoundingClientRect();
    var x = e.clientX - r.left, y = e.clientY - r.top;
    el.style.setProperty("--cx", x + "px");
    el.style.setProperty("--cy", y + "px");
    var rx = ((y / r.height) - .5) * -6, ry = ((x / r.width) - .5) * 6;
    el.style.transform = "perspective(800px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-6px)";
  });
  document.addEventListener("mouseout", function (e) {
    var el = e.target.closest && e.target.closest(".card, .member");
    if (el && !el.contains(e.relatedTarget)) el.style.transform = "";
  });

  // Magnetic buttons
  document.querySelectorAll(".btn").forEach(function (b) {
    b.addEventListener("mousemove", function (e) {
      var r = b.getBoundingClientRect();
      b.style.translate = ((e.clientX - r.left - r.width / 2) * .15) + "px " + ((e.clientY - r.top - r.height / 2) * .25) + "px";
    });
    b.addEventListener("mouseleave", function () { b.style.translate = ""; });
  });
})();

/* ---------- Single-file preview router (only when body[data-spa]) ---------- */
(function () {
  if (!document.body.hasAttribute("data-spa")) return;
  var pages = {};
  document.querySelectorAll("[data-page]").forEach(function (p) { pages[p.getAttribute("data-page")] = p; });
  var titles = { home: "ANGPI — La rete nazionale dei giovani Periti Industriali", "chi-siamo": "Chi siamo — ANGPI", eventi: "Eventi — ANGPI", contatti: "Contatti — ANGPI", iscriviti: "Iscriviti — ANGPI" };
  function route() {
    var h = (location.hash || "#home").slice(1);
    if (!pages[h]) { if (location.hash) return; h = "home"; }
    Object.keys(pages).forEach(function (k) { pages[k].classList.toggle("active", k === h); });
    document.querySelectorAll("#menu a").forEach(function (a) {
      if (a.getAttribute("href") === "#" + h) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    document.title = titles[h];
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
})();
