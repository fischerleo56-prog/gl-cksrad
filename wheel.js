/* ===== Das Rad: Zeichnen auf Canvas + Dreh-Animation ===== */
(function () {
  var GR = (window.GR = window.GR || {});
  var TAU = Math.PI * 2;
  var FONT = '700 {s}px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

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
    return (0.299 * r + 0.587 * g + 0.114 * b) > 160;
  }

  function Wheel(canvas) {
    var self = this;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.entries = [];
    this.rotation = 0;
    this.spinning = false;
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
    var R = c * 0.95;

    /* weißer Rand */
    ctx.beginPath(); ctx.arc(c, c, c, 0, TAU); ctx.fillStyle = "#ffffff"; ctx.fill();

    var n = this.entries.length;
    if (!n) {
      ctx.beginPath(); ctx.arc(c, c, R, 0, TAU); ctx.fillStyle = "#232731"; ctx.fill();
      ctx.fillStyle = "#9097a6";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = FONT.replace("{s}", Math.round(s * 0.045));
      ctx.fillText(GR.T.empty, c, c + s * 0.14);
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
      if (n > 1) {
        ctx.lineWidth = Math.max(1.5, s * 0.004);
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      }
    }

    /* Beschriftung */
    var fs = Math.max(10, Math.min(s * 0.055, 0.72 * R * seg * 0.65));
    var maxW = c * 0.6;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (var k = 0; k < n; k++) {
      var color = GR.colorFor(k, n);
      ctx.save();
      ctx.translate(c, c);
      ctx.rotate(this.rotation + k * seg + seg / 2);
      var label = this.fitText(this.entries[k], maxW, fs, 9);
      ctx.fillStyle = isLight(color) ? "#1a1400" : "#ffffff";
      ctx.fillText(label, R - c * 0.07, 0);
      ctx.restore();
    }
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
        self.draw();
        onEnd(winner);
      }
    }
    requestAnimationFrame(frame);
    return true;
  };

  GR.Wheel = Wheel;
})();
