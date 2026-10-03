// js/module.js — module.html?p=<product id>: intro (video if the product
// has one, otherwise hero photo + bullets) → timed quiz → server-graded
// results. Attempts are saved by submit_module_attempt (see
// supabase/v2_schema.sql); the employee can retake as often as they like —
// prizes are earned on the proctored test (test.html), not here.

(function () {
  "use strict";
  const { client, escapeHtml } = Session;
  const productId = new URLSearchParams(location.search).get("p");

  const screens = {
    intro: document.getElementById("screen-intro"),
    quiz: document.getElementById("screen-quiz"),
    results: document.getElementById("screen-results"),
  };
  function show(name) {
    Object.keys(screens).forEach((k) => screens[k].classList.toggle("hidden", k !== name));
    window.scrollTo(0, 0);
  }

  let product = null;
  let employee = null;

  async function boot() {
    if (!productId) {
      location.replace("index.html");
      return;
    }
    employee = await Session.requireEmployee();
    if (!employee) return;

    const { data, error } = await client.from("products").select("*").eq("id", productId).maybeSingle();
    if (error || !data) {
      alert("That module isn't available.");
      location.replace("index.html");
      return;
    }
    product = data;
    renderIntro();
    show("intro");
  }

  function renderIntro() {
    document.title = `${product.name} — adidas Running`;
    document.getElementById("intro-pillar").textContent = product.pillar || "Module";
    document.getElementById("intro-title").textContent = product.name.toUpperCase();
    document.getElementById("rule-count").textContent = product.questions_per_quiz;
    const bullets = document.getElementById("intro-bullets");
    bullets.innerHTML = (product.intro_bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join("");

    const media = document.getElementById("intro-media");
    const startBtn = document.getElementById("start-btn");
    const note = document.getElementById("video-gate-note");

    if (product.video_url) {
      // Video gate: the quiz unlocks when the video ends.
      media.innerHTML = `<video id="intro-video" controls playsinline preload="metadata" poster="images/${escapeHtml(product.hero_image || "")}">
          <source src="${escapeHtml(product.video_url)}" type="video/mp4" />
        </video>`;
      const v = document.getElementById("intro-video");
      note.textContent = "Watch the video to the end to unlock the quiz.";
      v.addEventListener("ended", () => {
        startBtn.disabled = false;
        note.textContent = "";
      });
    } else {
      media.innerHTML = `<img class="intro-hero" src="images/${escapeHtml(product.hero_image || "")}" alt="${escapeHtml(product.name)}" />`;
      startBtn.disabled = false;
    }

    startBtn.addEventListener("click", startQuiz, { once: true });
  }

  async function startQuiz() {
    // Keep the shoe name out of the browser tab while the quiz runs
    // (audit 2026-10-03). Restored on the results screen.
    document.title = "Timed quiz — adidas Running";
    const { data: questions, error } = await client.rpc("get_module_questions", { p_product_id: productId });
    if (error || !questions || !questions.length) {
      alert("Couldn't load questions: " + (error ? error.message : "no questions yet"));
      return;
    }
    show("quiz");
    const result = await QuizEngine.run(questions, { seconds: 20 });
    show("results");
    await grade(result);
  }

  async function grade(result) {
    const banner = document.getElementById("save-banner");
    const bannerText = document.getElementById("save-banner-text");
    banner.className = "save-banner";
    bannerText.textContent = "Grading…";

    const { data, error } = await client.rpc("submit_module_attempt", {
      p_product_id: productId,
      p_answers: result.answers,
      p_duration_s: result.duration_s,
      p_blur_count: result.blur_count,
    });
    if (error) {
      banner.className = "save-banner error";
      bannerText.textContent = "⚠️ Couldn't grade or save this attempt: " + error.message + " — screenshot this and tell your Product Educator.";
      return;
    }
    banner.className = "save-banner ok";
    bannerText.textContent = `✅ Saved to your record${result.blur_count ? ` (left the page ${result.blur_count}×)` : ""}.`;

    const badge = QuizEngine.badgeFor(data.score, data.total);
    const pill = document.getElementById("score-tier-pill");
    pill.textContent = badge.label;
    pill.className = `tier-pill ${badge.cls}`;
    document.getElementById("score-number").textContent = `${data.score} / ${data.total}`;
    document.getElementById("score-message").textContent = badge.message;
    QuizEngine.renderBreakdown(document.getElementById("breakdown-list"), data.details || []);
  }

  document.getElementById("retake-btn").addEventListener("click", () => location.reload());

  boot();
})();
