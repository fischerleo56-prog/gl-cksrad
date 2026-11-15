/* ===== Das Rad: Zeichnen auf Canvas + Dreh-Animation ===== */
(function () {
  var GR = (window.GR = window.GR || {});
  var TAU = Math.PI * 2;
  var FONT = '700 {s}px "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

  function mod(a, n) { return ((a % n) + n) % n; }

  function randInt(n) {
    if (window.crypto && window.crypto.getRandomValues) {
      var buf = new Uint32Array(1);
      var limit = Math.floor(4294967296 / n) * n; // vermeidet Modulo-Verzerrung
      do { window.crypto.getRandomValues(buf); } while (buf[0] >= limit);
      return buf[0] % n;
    }
    return Math.floor(Math.random() * n);
  }
  GR.randInt = randInt;

  function isLight(hex) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 165;
  }

  function Wheel(canvas) {
    var self = this;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.entries = [];
    this.rotation = 0;
    this.spinning = false;
    this.lightPhase = 0;
    this.size = 0;
    this.dpr = 1;
    this.onTick = null;

    this.resize();
    if ("ResizeObserver" in window) {
      new ResizeObserver(function () { self.resize(); }).observe(canvas.parentElement);
    } else {
      window.addEventListener("resize", function () { self.resize(); });
    }
  }

  Wheel.prototype.resize = function () {
    var rect = this.canvas.parentElement.getBoundingClientRect();
    var s = Math.floor(rect.width);
    if (!s) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.size = s;
    this.canvas.width = Math.round(s * this.dpr);
    this.canvas.height = Math.round(s * this.dpr);
    this.draw();
  };

  Wheel.prototype.setEntries = function (entries) {
    this.entries = entries.slice();
    this.draw();
  };

  Wheel.prototype.pointerIndex = function () {
    var n = this.entries.length;
    if (!n) return -1;
    var seg = TAU / n;
    var a = mod(-Math.PI / 2 - this.rotation, TAU);
    return Math.floor(a / seg) % n;
  };

  Wheel.prototype.fitText = function (text, maxW, fs, minFs) {
    var ctx = this.ctx, f = fs;
    ctx.font = FONT.replace("{s}", f);
    while (ctx.measureText(text).width > maxW && f > minFs) {
      f -= 1;
      ctx.font = FONT.replace("{s}", f);
    }
    if (ctx.measureText(text).width > maxW) {
      while (text.length > 1 && ctx.measureText(text + "…").width > maxW) text = text.slice(0, -1);
      text = text + "…";
    }
    return text;
  };

  Wheel.prototype.draw = function () {
    var ctx = this.ctx, s = this.size;
    if (!s) return;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, s, s);

    var c = s / 2;
    var R = c * 0.9;

    /* goldener Rand */
    var rim = ctx.createLinearGradient(0, 0, s, s);
    rim.addColorStop(0, "#ffe27a");
    rim.addColorStop(0.5, "#b8821f");
    rim.addColorStop(1, "#ffe27a");
    ctx.beginPath(); ctx.arc(c, c, c * 0.985, 0, TAU); ctx.fillStyle = rim; ctx.fill();
    ctx.beginPath(); ctx.arc(c, c, c * 0.935, 0, TAU); ctx.fillStyle = "#1a1245"; ctx.fill();

    /* blinkende Lämpchen */
    var lights = 28;
    for (var l = 0; l < lights; l++) {
      var la = (l / lights) * TAU;
      var on = (l + this.lightPhase) % 2 === 0;
      ctx.beginPath();
      ctx.arc(c + Math.cos(la) * c * 0.96, c + Math.sin(la) * c * 0.96, Math.max(1.8, c * 0.017), 0, TAU);
      ctx.fillStyle = on ? "#fff6c9" : "#c98a2b";
      ctx.fill();
    }

    var n = this.entries.length;
    if (!n) {
      ctx.beginPath(); ctx.arc(c, c, R, 0, TAU); ctx.fillStyle = "#2a2060"; ctx.fill();
      ctx.fillStyle = "#cfc9ff";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = FONT.replace("{s}", Math.round(s * 0.045));
      ctx.fillText("Füge Einträge hinzu", c, c + s * 0.14);
      return;
    }

    var seg = TAU / n;

    /* Segmente */
    for (var i = 0; i < n; i++) {
      var a0 = this.rotation + i * seg;
      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.arc(c, c, R, a0, a0 + seg);
      ctx.closePath();
      ctx.fillStyle = GR.colorFor(i, n);
      ctx.fill();
      ctx.lineWidth = Math.max(1, s * 0.003);
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.stroke();
    }

    /* sanfte Tiefenwirkung */
    var shade = ctx.createRadialGradient(c, c, 0, c, c, R);
    shade.addColorStop(0, "rgba(0,0,0,0.35)");
    shade.addColorStop(0.5, "rgba(0,0,0,0)");
    shade.addColorStop(1, "rgba(0,0,0,0.12)");
    ctx.beginPath(); ctx.arc(c, c, R, 0, TAU); ctx.fillStyle = shade; ctx.fill();

    /* Beschriftung */
    var maxFs = Math.min(s * 0.06, 0.72 * R * seg * 0.7);
    var fs = Math.max(9, maxFs);
    var maxW = c * 0.58;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (var k = 0; k < n; k++) {
      var color = GR.colorFor(k, n);
      var light = isLight(color);
      ctx.save();
      ctx.translate(c, c);
      ctx.rotate(this.rotation + k * seg + seg / 2);
      var label = this.fitText(this.entries[k], maxW, fs, 9);
      ctx.fillStyle = light ? "#1b1240" : "#ffffff";
      if (!light) { ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 3; }
      ctx.fillText(label, R - c * 0.06, 0);
      ctx.restore();
    }

    /* dunkle Ringkante innen */
    ctx.beginPath(); ctx.arc(c, c, R, 0, TAU);
    ctx.lineWidth = Math.max(2, s * 0.006);
    ctx.strokeStyle = "rgba(11,8,32,0.6)";
    ctx.stroke();
  };

  /* Dreht das Rad; onEnd bekommt den Index des Gewinners */
  Wheel.prototype.spin = function (onEnd) {
    var n = this.entries.length;
    if (this.spinning || n < GR.MIN_ENTRIES) return false;

    var self = this;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var seg = TAU / n;
    var winner = randInt(n);
    var offset = (Math.random() - 0.5) * seg * 0.7; /* irgendwo innerhalb des Segments landen */
    var targetRot = -Math.PI / 2 - (winner + 0.5) * seg - offset;
    var from = this.rotation;
    var turns = reduced ? 1 : 5 + Math.floor(Math.random() * 3);
    var delta = mod(targetRot - from, TAU) + TAU * turns;
    var duration = reduced ? 1200 : 5200 + Math.random() * 1600;
    var start = null;
    var lastIdx = this.pointerIndex();

    this.spinning = true;

    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      var e = 1 - Math.pow(1 - t, 3);
      self.rotation = from + delta * e;
      self.lightPhase = Math.floor(ts / 160) % 2;

      var idx = self.pointerIndex();
      if (idx !== lastIdx) {
        lastIdx = idx;
        if (self.onTick) self.onTick(t);
      }
      self.draw();

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        self.spinning = false;
        self.rotation = mod(self.rotation, TAU);
        self.lightPhase = 0;
        self.draw();
        onEnd(winner);
      }
    }
    requestAnimationFrame(frame);
    return true;
  };

  GR.Wheel = Wheel;
})();
