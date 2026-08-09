/* Photo estimate page: show only the question sections for the
   services the visitor picked. Plain show/hide, nothing fancy. */

(function () {
  "use strict";

  var picks = document.querySelectorAll(".pick-card input[type=checkbox]");
  var heading = document.querySelector(".svc-heading");

  function refresh() {
    var anyOpen = false;
    picks.forEach(function (box) {
      var section = document.getElementById(box.getAttribute("data-section"));
      if (!section) return;
      section.hidden = !box.checked;
      if (box.checked) anyOpen = true;
    });
    if (heading) heading.hidden = !anyOpen;
  }

  picks.forEach(function (box) {
    box.addEventListener("change", function () {
      refresh();
      // when a service is picked, bring its questions into view
      if (box.checked) {
        var section = document.getElementById(box.getAttribute("data-section"));
        if (section) section.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  });

  refresh();
})();
