/* ===== Speicher: localStorage mit sicherem Fallback ===== */
(function () {
  var GR = (window.GR = window.GR || {});

  GR.storage = {
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem("gluecksrad." + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        window.localStorage.setItem("gluecksrad." + key, JSON.stringify(value));
      } catch (e) { /* z. B. privater Modus – dann eben ohne Speichern */ }
    }
  };
})();
