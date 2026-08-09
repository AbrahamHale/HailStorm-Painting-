/* ==================================================================
   HERITAGE PAINTING — shared site JS
   ==================================================================

   >>> PHONE NUMBER — CHANGE IT HERE <<<
   This is the one spot that controls the phone number everywhere on
   the site. Edit these two lines, then run tools/set-phone.sh (see
   README) to also update the static fallbacks baked into the HTML
   for people browsing with JavaScript off.
   ================================================================== */

var PHONE_DISPLAY = "(907) 414-7475";
var PHONE_TEL = "+19074147475";

/* ================================================================== */

(function () {
  "use strict";

  // Fill every phone slot from the constants above.
  // Markup contract: <a href="tel:..." data-phone-href><span data-phone>...</span></a>
  document.querySelectorAll("[data-phone]").forEach(function (el) {
    el.textContent = PHONE_DISPLAY;
  });
  document.querySelectorAll("[data-phone-href]").forEach(function (el) {
    el.setAttribute("href", "tel:" + PHONE_TEL);
  });

  // Mobile nav: close the <details> menu on outside click, Escape,
  // or after choosing a link.
  var nav = document.querySelector(".nav");
  if (nav) {
    document.addEventListener("click", function (e) {
      if (nav.open && !nav.contains(e.target)) nav.open = false;
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") nav.open = false;
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.open = false; });
    });

  }

  // Mark the current page in both navs for styling + screen readers.
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a, .nav-desktop a").forEach(function (a) {
    var target = a.getAttribute("href").split("/").pop();
    if (target === here) a.setAttribute("aria-current", "page");
  });
})();
