/* ===== Sound: Tick-Geräusch und Gewinn-Fanfare (Web Audio, keine Dateien nötig) ===== */
(function () {
  var GR = (window.GR = window.GR || {});

  GR.sound = {
    enabled: true,
    ctx: null,

    /* Muss durch eine Nutzeraktion (Klick/Tap) aufgerufen werden */
    init: function () {
      if (!this.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        try { this.ctx = new AC(); } catch (e) { return; }
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
    },

    tone: function (freq, duration, type, volume, delay) {
      if (!this.enabled || !this.ctx) return;
      var t0 = this.ctx.currentTime + (delay || 0);
      var osc = this.ctx.createOscillator();
      var gain = this.ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(volume || 0.05, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    },

    tick: function () {
      this.tone(1100, 0.035, "square", 0.025);
    },

    win: function () {
      var self = this;
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
        self.tone(f, 0.28, "triangle", 0.09, i * 0.11);
      });
      this.tone(1318.5, 0.6, "triangle", 0.08, 0.46);
    }
  };
})();
