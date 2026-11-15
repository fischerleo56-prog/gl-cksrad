/* ===== Konfiguration: Farben, Vorlagen, Grenzen (Texte kommen aus i18n.js) ===== */
(function () {
  var GR = (window.GR = window.GR || {});

  GR.MIN_ENTRIES = 2;
  GR.MAX_ENTRIES = 40;
  GR.HISTORY_MAX = 10;

  GR.COLORS = [
    "#e8503a", "#f28c28", "#f5c518", "#2fa84f", "#1f9bd1",
    "#5b5fcf", "#a64fc0", "#e04a8f", "#18a89a", "#7ab317"
  ];

  GR.DEFAULT_ENTRIES = GR.T.defaults.slice();
  GR.PRESETS = GR.T.presets;

  /* Farbe für Segment i von n; vermeidet gleiche Farbe bei letztem und erstem Segment */
  GR.colorFor = function (i, n) {
    var len = GR.COLORS.length;
    var idx = i % len;
    if (n > 1 && i === n - 1 && idx === 0) idx = Math.floor(len / 2);
    return GR.COLORS[idx];
  };
})();
