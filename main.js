/* ===== Hauptprogramm: Zustand, Events, Zusammenspiel ===== */
(function () {
  var GR = window.GR;
  var $ = GR.$;
  var ui = GR.ui;

  /* ---------- Zustand laden ---------- */
  function cleanList(list) {
    if (!Array.isArray(list)) return null;
    var out = list
      .filter(function (x) { return typeof x === "string" && x.trim(); })
      .map(function (x) { return x.trim().slice(0, 40); })
      .slice(0, GR.MAX_ENTRIES);
    return out;
  }

  var state = {
    entries: cleanList(GR.storage.get("entries", null)) || GR.DEFAULT_ENTRIES.slice(),
    history: [],
    winner: null /* { index, text } */
  };

  var savedHistory = GR.storage.get("history", []);
  if (Array.isArray(savedHistory)) {
    state.history = savedHistory
      .filter(function (h) { return h && typeof h.text === "string" && typeof h.time === "number"; })
      .slice(0, GR.HISTORY_MAX);
  }

  GR.sound.enabled = GR.storage.get("sound", true) !== false;
  $("soundToggle").checked = GR.sound.enabled;

  var wheel = new GR.Wheel($("wheelCanvas"));

  /* ---------- Synchronisieren ---------- */
  /* skipSave: beim Start die Standard-Einträge nicht speichern, damit sie sich beim Sprachwechsel mit übersetzen */
  function sync(skipSave) {
    wheel.setEntries(state.entries);
    ui.renderEntries(state.entries, removeEntry);
    ui.setSpinEnabled(state.entries.length >= GR.MIN_ENTRIES);
    if (!skipSave) GR.storage.set("entries", state.entries);
  }

  function syncHistory() {
    ui.renderHistory(state.history);
    GR.storage.set("history", state.history);
  }

  /* ---------- Einträge bearbeiten ---------- */
  function addEntry(text) {
    if (wheel.spinning) return;
    text = text.trim().slice(0, 40);
    if (!text || state.entries.length >= GR.MAX_ENTRIES) return;
    state.entries.push(text);
    sync();
  }

  function removeEntry(i) {
    if (wheel.spinning) return;
    state.entries.splice(i, 1);
    sync();
  }

  $("addForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = $("entryInput");
    addEntry(input.value);
    input.value = "";
    input.focus();
  });

  $("shuffleBtn").addEventListener("click", function () {
    if (wheel.spinning) return;
    var a = state.entries;
    for (var i = a.length - 1; i > 0; i--) {
      var j = GR.randInt(i + 1);
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    sync();
  });

  $("clearBtn").addEventListener("click", function () {
    if (wheel.spinning || !state.entries.length) return;
    if (window.confirm(GR.T.confirmClear)) {
      state.entries = [];
      sync();
    }
  });

  ui.renderPresets(GR.PRESETS, function (preset) {
    if (wheel.spinning) return;
    state.entries = preset.entries.slice();
    sync();
  });

  $("clearHistoryBtn").addEventListener("click", function () {
    state.history = [];
    syncHistory();
  });

  $("soundToggle").addEventListener("change", function (e) {
    GR.sound.enabled = e.target.checked;
    GR.storage.set("sound", GR.sound.enabled);
    if (GR.sound.enabled) GR.sound.init();
  });

  /* ---------- Drehen ---------- */
  var lastTick = 0;
  wheel.onTick = function () {
    ui.wigglePointer();
    var now = performance.now();
    if (now - lastTick > 45) {
      lastTick = now;
      GR.sound.tick();
    }
  };

  function spin() {
    if (wheel.spinning || state.entries.length < GR.MIN_ENTRIES) return;
    GR.sound.init();
    ui.closeModal();
    document.body.classList.add("is-spinning");
    ui.setSpinEnabled(false);
    $("spinBtn").querySelector(".spin-label").textContent = GR.T.spinning;

    wheel.spin(function (index) {
      document.body.classList.remove("is-spinning");
      $("spinBtn").querySelector(".spin-label").textContent = GR.T.spin;
      ui.setSpinEnabled(state.entries.length >= GR.MIN_ENTRIES);

      var text = state.entries[index];
      state.winner = { index: index, text: text };

      GR.sound.win();
      GR.confetti.burst();
      ui.setResult(text);

      state.history.unshift({ text: text, time: Date.now() });
      state.history = state.history.slice(0, GR.HISTORY_MAX);
      syncHistory();

      setTimeout(function () {
        if (!wheel.spinning) ui.openModal(text);
      }, 800);
    });
  }

  $("spinBtn").addEventListener("click", spin);
  $("hubBtn").addEventListener("click", spin);

  document.addEventListener("keydown", function (e) {
    if (e.code !== "Space" && e.key !== " ") return;
    var tag = (e.target && e.target.tagName) || "";
    if (/^(INPUT|TEXTAREA|BUTTON|SUMMARY|A|SELECT)$/.test(tag)) return;
    if (ui.isModalOpen()) return;
    e.preventDefault();
    spin();
  });

  /* ---------- Ergebnis-Dialog ---------- */
  $("againBtn").addEventListener("click", function () {
    ui.closeModal();
    spin();
  });

  $("removeWinnerBtn").addEventListener("click", function () {
    var w = state.winner;
    if (w && state.entries[w.index] === w.text) {
      state.entries.splice(w.index, 1);
      sync();
    }
    state.winner = null;
    ui.closeModal();
  });

  $("closeModalBtn").addEventListener("click", ui.closeModal);

  /* Klick auf den dunklen Hintergrund schließt den Dialog */
  $("resultModal").addEventListener("click", function (e) {
    if (e.target === e.currentTarget) ui.closeModal();
  });

  /* ---------- Start ---------- */
  $("year").textContent = new Date().getFullYear();
  sync(true);
  syncHistory();
})();
