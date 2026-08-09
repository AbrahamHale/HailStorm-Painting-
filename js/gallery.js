/* Gallery: reads images.json (rebuilt by tools/prep_photos.py) and
   renders the photo grid. Before/after pairs -- files named
   <base>-before.jpg + <base>-after.jpg -- render as a draggable
   wipe slider. Plain vanilla JS. */

(function () {
  "use strict";

  var grid = document.getElementById("gallery");
  var filterRow = document.getElementById("gallery-filters");
  if (!grid) return;

  // section headings, in display order
  var SECTIONS = [
    ["exterior-residential", "Exterior — Homes"],
    ["exterior-commercial", "Exterior — Commercial"],
    ["interior-residential", "Interior — Homes"],
    ["interior-commercial", "Interior — Commercial"],
    ["furniture", "Furniture"]
  ];

  function titleFromFile(file) {
    return file.replace(/\.(jpe?g|png)$/i, "").replace(/-/g, " ");
  }

  /* ---------- before/after slider ---------- */

  function makeSlider(pair) {
    // pair: {before: entry, after: entry}
    var fig = document.createElement("figure");
    fig.dataset.folder = pair.after.folder;

    var box = document.createElement("div");
    box.className = "ba";

    var after = new Image();
    after.src = "images/" + pair.after.folder + "/" + pair.after.file;
    after.alt = pair.after.alt;
    after.loading = "lazy";
    after.decoding = "async";

    var top = document.createElement("div");
    top.className = "ba-top";
    var before = new Image();
    before.src = "images/" + pair.before.folder + "/" + pair.before.file;
    before.alt = pair.before.alt;
    before.loading = "lazy";
    before.decoding = "async";
    top.appendChild(before);

    var handle = document.createElement("div");
    handle.className = "ba-handle";
    handle.setAttribute("role", "slider");
    handle.setAttribute("tabindex", "0");
    handle.setAttribute("aria-label", "Before and after comparison — arrow keys to move");
    handle.setAttribute("aria-valuemin", "0");
    handle.setAttribute("aria-valuemax", "100");

    var lb = document.createElement("span");
    lb.className = "ba-label ba-label-before";
    lb.textContent = "Before";
    var la = document.createElement("span");
    la.className = "ba-label ba-label-after";
    la.textContent = "After";

    box.appendChild(after);
    box.appendChild(top);
    box.appendChild(handle);
    box.appendChild(lb);
    box.appendChild(la);
    fig.appendChild(box);

    var cap = document.createElement("figcaption");
    cap.textContent = "Before / after — drag the handle";
    fig.appendChild(cap);

    function setPos(pct) {
      pct = Math.max(0, Math.min(100, pct));
      top.style.width = pct + "%";
      handle.style.left = pct + "%";
      handle.setAttribute("aria-valuenow", String(Math.round(pct)));
      // keep the before image sized to the full box so it lines up
      before.style.width = box.clientWidth + "px";
    }

    function posFromEvent(e) {
      var rect = box.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      setPos((x / rect.width) * 100);
    }

    var dragging = false;
    box.addEventListener("pointerdown", function (e) {
      dragging = true;
      box.setPointerCapture(e.pointerId);
      posFromEvent(e);
    });
    box.addEventListener("pointermove", function (e) {
      if (dragging) posFromEvent(e);
    });
    box.addEventListener("pointerup", function () { dragging = false; });
    box.addEventListener("pointercancel", function () { dragging = false; });

    handle.addEventListener("keydown", function (e) {
      var now = parseFloat(handle.getAttribute("aria-valuenow") || "50");
      if (e.key === "ArrowLeft") { setPos(now - 5); e.preventDefault(); }
      if (e.key === "ArrowRight") { setPos(now + 5); e.preventDefault(); }
    });

    // initial position once layout is known
    requestAnimationFrame(function () { setPos(50); });
    window.addEventListener("resize", function () {
      setPos(parseFloat(handle.getAttribute("aria-valuenow") || "50"));
    });

    return fig;
  }

  /* ---------- plain photo ---------- */

  function makePhoto(entry) {
    var fig = document.createElement("figure");
    fig.dataset.folder = entry.folder;

    var link = document.createElement("a");
    link.href = "images/" + entry.folder + "/" + entry.file;

    var img = new Image();
    img.src = "images/thumbs/" + entry.folder + "/" + entry.file;
    img.alt = entry.alt;
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 640;
    img.height = 480;

    link.appendChild(img);
    fig.appendChild(link);
    return fig;
  }

  /* ---------- load + render ---------- */

  fetch("images.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var pairs = {};   // "folder/base" -> {before, after}
      var singles = [];

      data.images.forEach(function (entry) {
        if (entry.role === "before" || entry.role === "after") {
          var key = entry.folder + "/" + entry.pair;
          pairs[key] = pairs[key] || {};
          pairs[key][entry.role] = entry;
        } else {
          singles.push(entry);
        }
      });

      // one titled section per category, in a fixed order
      SECTIONS.forEach(function (def) {
        var folder = def[0], label = def[1];
        var inFolder = singles.filter(function (e) { return e.folder === folder; });
        var folderPairs = Object.keys(pairs).filter(function (k) {
          return k.indexOf(folder + "/") === 0 && pairs[k].before && pairs[k].after;
        });
        if (!inFolder.length && !folderPairs.length) return;

        var section = document.createElement("section");
        section.className = "gallery-section";
        section.dataset.folder = folder;

        var h = document.createElement("h2");
        h.textContent = label;
        section.appendChild(h);

        var g = document.createElement("div");
        g.className = "gallery-grid";
        folderPairs.forEach(function (k) { g.appendChild(makeSlider(pairs[k])); });
        inFolder.forEach(function (e) { g.appendChild(makePhoto(e)); });
        section.appendChild(g);
        grid.appendChild(section);
      });

      if (filterRow) {
        filterRow.hidden = false;
        filterRow.querySelectorAll("button").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var want = btn.getAttribute("data-filter");
            filterRow.querySelectorAll("button").forEach(function (b) {
              b.setAttribute("aria-pressed", b === btn ? "true" : "false");
            });
            grid.querySelectorAll(".gallery-section").forEach(function (sec) {
              sec.hidden = want !== "all" && sec.dataset.folder !== want;
            });
          });
        });
      }
    })
    .catch(function () {
      grid.innerHTML = "<p>Couldn't load the gallery. Call me and I'll text you photos instead.</p>";
    });
})();
