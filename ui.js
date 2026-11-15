/* ===== UI: Listen, Vorlagen, Verlauf, Ergebnis-Dialog rendern ===== */
(function () {
  var GR = (window.GR = window.GR || {});

  function $(id) { return document.getElementById(id); }
  GR.$ = $;

  GR.ui = {
    renderEntries: function (entries, onRemove) {
      var ul = $("entryList");
      ul.textContent = "";
      entries.forEach(function (text, i) {
        var li = document.createElement("li");

        var dot = document.createElement("span");
        dot.className = "dot";
        dot.style.background = GR.colorFor(i, entries.length);

        var label = document.createElement("span");
        label.className = "entry-text";
        label.textContent = text;

        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "remove";
        btn.setAttribute("aria-label", text + " entfernen");
        btn.textContent = "×";
        btn.addEventListener("click", function () { onRemove(i); });

        li.appendChild(dot);
        li.appendChild(label);
        li.appendChild(btn);
        ul.appendChild(li);
      });

      $("entryCount").textContent = entries.length;

      var note = $("entryNote");
      if (entries.length < GR.MIN_ENTRIES) {
        note.hidden = false;
        note.className = "note warn";
        note.textContent = "Mindestens " + GR.MIN_ENTRIES + " Einträge nötig, um zu drehen.";
      } else if (entries.length >= GR.MAX_ENTRIES) {
        note.hidden = false;
        note.className = "note warn";
        note.textContent = "Maximal " + GR.MAX_ENTRIES + " Einträge möglich.";
      } else {
        note.hidden = true;
      }
    },

    renderPresets: function (presets, onPick) {
      var box = $("presetChips");
      box.textContent = "";
      presets.forEach(function (p) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "chip";
        b.textContent = p.name;
        b.addEventListener("click", function () { onPick(p); });
        box.appendChild(b);
      });
    },

    renderHistory: function (history) {
      var ol = $("historyList");
      ol.textContent = "";
      history.forEach(function (h) {
        var li = document.createElement("li");
        var name = document.createElement("span");
        name.textContent = h.text;
        var time = document.createElement("time");
        time.textContent = new Date(h.time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
        li.appendChild(name);
        li.appendChild(time);
        ol.appendChild(li);
      });
      $("historyEmpty").hidden = history.length > 0;
      $("clearHistoryBtn").hidden = history.length === 0;
    },

    setResult: function (text) {
      $("resultText").textContent = text;
      var strip = $("resultStrip");
      strip.classList.remove("pop");
      void strip.offsetWidth; /* Animation neu starten */
      strip.classList.add("pop");
    },

    setSpinEnabled: function (enabled) {
      $("spinBtn").disabled = !enabled;
      $("hubBtn").disabled = !enabled;
    },

    openModal: function (winner) {
      $("modalWinner").textContent = winner;
      var dlg = $("resultModal");
      if (typeof dlg.showModal === "function") {
        if (!dlg.open) dlg.showModal();
      } else {
        dlg.setAttribute("open", "");
      }
    },

    closeModal: function () {
      var dlg = $("resultModal");
      if (typeof dlg.close === "function") {
        if (dlg.open) dlg.close();
      } else {
        dlg.removeAttribute("open");
      }
    },

    isModalOpen: function () {
      return $("resultModal").hasAttribute("open");
    },

    wigglePointer: function () {
      var p = document.querySelector(".pointer");
      if (!p || !p.animate) return;
      p.animate(
        [
          { transform: "translateX(-50%) rotate(0deg)" },
          { transform: "translateX(-50%) rotate(-16deg)" },
          { transform: "translateX(-50%) rotate(0deg)" }
        ],
        { duration: 110, easing: "ease-out" }
      );
    }
  };
})();
