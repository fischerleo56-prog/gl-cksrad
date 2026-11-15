/* ===== Sprachumschalter: merkt sich die Wahl und wechselt in den Sprachordner ===== */
(function () {
  var select = document.getElementById("langSelect");
  if (!select) return;

  select.addEventListener("change", function () {
    var lang = select.value;
    try { window.localStorage.setItem("gluecksrad.lang", JSON.stringify(lang)); } catch (e) { /* egal */ }
    window.location.href = lang + ".html";
  });
})();
