/* Z&H Florida Group — shared behaviour: language toggle, scroll reveals, month strips */
(function(){
  "use strict";

  /* mark JS alive so scroll-reveal hiding only applies when it can be undone */
  document.documentElement.className += ' js';

  /* ---------- language ---------- */
  var en = document.getElementById("btn-en");
  var es = document.getElementById("btn-es");

  function setLang(l){
    var s = (l === "es");
    document.body.classList.toggle("es", s);
    document.documentElement.lang = s ? "es" : "en";
    if (en) { en.setAttribute("aria-pressed", String(!s)); }
    if (es) { es.setAttribute("aria-pressed", String(s)); }
    /* month strip cells, and <option> text — iOS Safari won't hide options with CSS */
    Array.prototype.forEach.call(document.querySelectorAll(".m, option[data-en]"), function(c){
      c.textContent = c.getAttribute(s ? "data-es" : "data-en") || c.textContent;
    });
    try { localStorage.setItem("zh-lang", l); } catch(e){}
  }

  if (en) { en.addEventListener("click", function(){ setLang("en"); }); }
  if (es) { es.addEventListener("click", function(){ setLang("es"); }); }

  var saved = null;
  try { saved = localStorage.getItem("zh-lang"); } catch(e){}
  setLang(saved || ((navigator.language || "en").toLowerCase().indexOf("es") === 0 ? "es" : "en"));

  /* ---------- month strips (home page only) ---------- */
  var LBL_EN = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  var LBL_ES = ["E","F","M","A","M","J","J","A","S","O","N","D"];
  function build(id, litCount){
    var host = document.getElementById(id);
    if (!host) { return; }
    for (var i = 0; i < 12; i++){
      var d = document.createElement("div");
      d.className = "m";
      d.textContent = (document.body.classList.contains("es") ? LBL_ES : LBL_EN)[i];
      d.setAttribute("data-en", LBL_EN[i]); d.setAttribute("data-es", LBL_ES[i]);
      if (i < litCount) { d.setAttribute("data-lit", "1"); }
      host.appendChild(d);
    }
  }
  build("cal-them", 4);
  build("cal-us", 12);

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function lightUp(host){
    var cells = host.querySelectorAll('.m[data-lit="1"]');
    Array.prototype.forEach.call(cells, function(c, n){
      if (reduce) { c.classList.add("lit"); return; }
      setTimeout(function(){ c.classList.add("lit"); }, n * 65);
    });
  }

  /* ---------- reveal on scroll ---------- */
  if ("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (!e.isIntersecting) { return; }
        e.target.classList.add("in");
        var strip = e.target.querySelector(".months");
        if (strip && !strip.dataset.done){ strip.dataset.done = "1"; lightUp(strip); }
        io.unobserve(e.target);
      });
    }, { threshold: .16, rootMargin: "0px 0px -40px 0px" });

    Array.prototype.forEach.call(document.querySelectorAll(".rv"), function(el){ io.observe(el); });
  } else {
    Array.prototype.forEach.call(document.querySelectorAll(".rv"), function(el){ el.classList.add("in"); });
    Array.prototype.forEach.call(document.querySelectorAll(".months"), lightUp);
  }

  /* ---------- attribution: proves which leads came from paid ads ----------
     Without this, "that one was a referral" is unanswerable in April.
     Captures utm tags, gclid and fbclid on arrival and carries them to the form.
     (Careful: never write a star-slash sequence inside this comment.) ---------- */
  try {
    var q = new URLSearchParams(location.search), keep = {};
    ["utm_source","utm_medium","utm_campaign","utm_content","gclid","fbclid"].forEach(function(k){
      if (q.get(k)) { keep[k] = q.get(k); }
    });
    if (Object.keys(keep).length) {
      sessionStorage.setItem("zh-src", Object.keys(keep).map(function(k){ return k + "=" + keep[k]; }).join(" | "));
    }
    if (!sessionStorage.getItem("zh-land")) {
      sessionStorage.setItem("zh-land", location.pathname + (document.referrer ? "  <- " + document.referrer : "  <- direct"));
    }
    if (!sessionStorage.getItem("zh-first")) {
      sessionStorage.setItem("zh-first", new Date().toISOString().slice(0,16).replace("T"," "));
    }
    var s = document.getElementById("src"), l = document.getElementById("lnd"), t = document.getElementById("fst");
    if (s) { s.value = sessionStorage.getItem("zh-src") || "organic / direct"; }
    if (l) { l.value = sessionStorage.getItem("zh-land") || ""; }
    if (t) { t.value = sessionStorage.getItem("zh-first") || ""; }
    var n = document.getElementById("nxt");
    if (n) { n.value = location.origin + "/thanks.html"; }
  } catch(e){}
})();
