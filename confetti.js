/* ===== Konfetti-Effekt auf einem eigenen Canvas ===== */
(function () {
  var GR = (window.GR = window.GR || {});
  var COLORS = ["#ff3d71", "#ffc83d", "#3ddc97", "#3dc1ff", "#c44dff", "#ff4de1", "#ffffff"];
  var raf = null;

  GR.confetti = {
    burst: function () {
      var canvas = document.getElementById("confetti");
      if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var ctx = canvas.getContext("2d");
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = window.innerWidth, h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = w < 600 ? 110 : 190;
      var parts = [];
      for (var i = 0; i < count; i++) {
        var fromLeft = i % 2 === 0;
        var angle = (fromLeft ? -60 : -120) * Math.PI / 180 + (Math.random() - 0.5) * 0.9;
        var speed = 9 + Math.random() * 11;
        parts.push({
          x: fromLeft ? w * 0.1 : w * 0.9,
          y: h * 0.75,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 6 + Math.random() * 7,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.4,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          life: 0
        });
      }

      if (raf) cancelAnimationFrame(raf);
      var frames = 0;
      (function step() {
        ctx.clearRect(0, 0, w, h);
        var alive = false;
        for (var j = 0; j < parts.length; j++) {
          var p = parts[j];
          p.vy += 0.32;
          p.vx *= 0.992;
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vr;
          p.life++;
          if (p.y < h + 30) alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = Math.max(0, 1 - p.life / 190);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        }
        frames++;
        if (alive && frames < 240) {
          raf = requestAnimationFrame(step);
        } else {
          ctx.clearRect(0, 0, w, h);
          raf = null;
        }
      })();
    }
  };
})();
