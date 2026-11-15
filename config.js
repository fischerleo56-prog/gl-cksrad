/* ===== Konfiguration: Farben, Vorlagen, Grenzen ===== */
(function () {
  var GR = (window.GR = window.GR || {});

  GR.MIN_ENTRIES = 2;
  GR.MAX_ENTRIES = 40;
  GR.HISTORY_MAX = 10;

  GR.COLORS = [
    "#e8503a", "#f28c28", "#f5c518", "#2fa84f", "#1f9bd1",
    "#5b5fcf", "#a64fc0", "#e04a8f", "#18a89a", "#7ab317"
  ];

  GR.DEFAULT_ENTRIES = ["Pizza", "Burger", "Sushi", "Pasta", "Döner", "Salat"];

  GR.PRESETS = [
    { name: "Ja / Nein", entries: ["Ja", "Nein"] },
    { name: "Zahlen 1–10", entries: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] },
    { name: "Würfel", entries: ["1", "2", "3", "4", "5", "6"] },
    { name: "Essen", entries: ["Pizza", "Burger", "Sushi", "Pasta", "Döner", "Salat", "Tacos", "Curry"] },
    { name: "Wahrheit oder Pflicht", entries: ["Wahrheit", "Pflicht"] },
    { name: "Wer fängt an?", entries: ["Spieler 1", "Spieler 2", "Spieler 3", "Spieler 4"] },
    { name: "Preise", entries: ["Hauptgewinn", "Gutschein", "Trostpreis", "Nochmal drehen", "Niete", "Überraschung"] }
  ];

  /* Farbe für Segment i von n; vermeidet gleiche Farbe bei letztem und erstem Segment */
  GR.colorFor = function (i, n) {
    var len = GR.COLORS.length;
    var idx = i % len;
    if (n > 1 && i === n - 1 && idx === 0) idx = Math.floor(len / 2);
    return GR.COLORS[idx];
  };
})();
