// js/timer.js — per-question countdown for timed quizzes (2026-09-30).
//
// Mike's decision: 20 seconds per question, auto-advance on zero, no back
// button. The point is that you can't tab out and Google a spec in 20 s.
// Also counts "blur" events (tab hidden / window lost focus) so the
// results record how many times someone left the page mid-quiz.

const QuizTimer = (() => {
  const SECONDS_PER_QUESTION = 20;

  function create(opts) {
    const ring = opts.ringEl;        // <svg circle> stroke animates
    const label = opts.labelEl;      // number
    const onExpire = opts.onExpire;  // called once when time hits 0
    const seconds = opts.seconds || SECONDS_PER_QUESTION;
    let deadline = 0;
    let raf = null;
    let expired = false;
    let running = false;
    const circumference = ring ? 2 * Math.PI * Number(ring.getAttribute("r")) : 0;
    if (ring) {
      ring.style.strokeDasharray = circumference;
      ring.style.strokeDashoffset = 0;
    }

    function tick() {
      if (!running) return;
      const remaining = Math.max(0, deadline - performance.now());
      const frac = remaining / (seconds * 1000);
      if (ring) ring.style.strokeDashoffset = circumference * (1 - frac);
      const s = Math.ceil(remaining / 1000);
      if (label) label.textContent = s;
      if (label) label.parentElement.classList.toggle("urgent", s <= 5);
      if (remaining <= 0) {
        running = false;
        if (!expired) {
          expired = true;
          onExpire && onExpire();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    return {
      start() {
        expired = false;
        running = true;
        deadline = performance.now() + seconds * 1000;
        cancelAnimationFrame(raf);
        tick();
      },
      stop() {
        running = false;
        cancelAnimationFrame(raf);
      },
      remainingMs() {
        return Math.max(0, deadline - performance.now());
      },
    };
  }

  // Blur/visibility tracking — call once per quiz; returns a getter.
  function trackBlur() {
    let count = 0;
    const bump = () => { count += 1; };
    document.addEventListener("visibilitychange", () => { if (document.hidden) bump(); });
    window.addEventListener("blur", bump);
    return () => count;
  }

  return { create, trackBlur, SECONDS_PER_QUESTION };
})();
