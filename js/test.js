// js/test.js — test.html?code=XXXXXX: the proctored certification test.
// The PE opens a session on the dashboard and reads out a 6-character
// code; the employee enters it on index.html and lands here. One attempt
// per session (enforced by join_test_session / submit_test_attempt in
// supabase/v2_schema.sql). Prizes are awarded from THIS score.

(function () {
  "use strict";
  const { client, escapeHtml } = Session;
  const code = (new URLSearchParams(location.search).get("code") || "").toUpperCase();

  const screens = {
    ready: document.getElementById("screen-ready"),
    quiz: document.getElementById("screen-quiz"),
    results: document.getElementById("screen-results"),
  };
  function show(name) {
    Object.keys(screens).forEach((k) => screens[k].classList.toggle("hidden", k !== name));
    window.scrollTo(0, 0);
  }

  let session = null;

  async function boot() {
    if (!code) {
      location.replace("index.html");
      return;
    }
    const emp = await Session.requireEmployee();
    if (!emp) return;
    document.getElementById("ready-store").textContent = `Signed in as ${emp.name || emp.email} · ${emp.store_name}.`;
    show("ready");
    document.getElementById("start-btn").addEventListener("click", start, { once: true });
  }

  async function start() {
    const err = document.getElementById("ready-error");
    const btn = document.getElementById("start-btn");
    btn.disabled = true;
    btn.textContent = "LOADING…";
    const { data, error } = await client.rpc("join_test_session", { p_code: code });
    if (error) {
      err.textContent = error.message.replace(/^.*?:\s*/, "");
      err.classList.add("visible");
      btn.disabled = false;
      btn.textContent = "TRY AGAIN";
      btn.addEventListener("click", start, { once: true });
      return;
    }
    session = data;
    if (!session.questions.length) {
      err.textContent = "This session has no questions yet — tell your Product Educator.";
      err.classList.add("visible");
      return;
    }
    document.getElementById("rule-count").textContent = session.questions.length;
    show("quiz");
    const result = await QuizEngine.run(session.questions, { seconds: 20 });
    show("results");
    await submit(result);
  }

  async function submit(result) {
    const banner = document.getElementById("save-banner");
    const bannerText = document.getElementById("save-banner-text");
    const { data, error } = await client.rpc("submit_test_attempt", {
      p_attempt_id: session.attempt_id,
      p_answers: result.answers,
      p_duration_s: result.duration_s,
      p_blur_count: result.blur_count,
    });
    if (error) {
      banner.className = "save-banner error";
      bannerText.textContent = "⚠️ Your test could NOT be submitted: " + error.message + " — do not close this page; show it to your Product Educator.";
      return;
    }
    banner.className = "save-banner ok";
    bannerText.textContent = "✅ Submitted. Your Product Educator can see it now.";

    const badge = QuizEngine.badgeFor(data.score, data.total);
    const pill = document.getElementById("score-tier-pill");
    pill.textContent = badge.label;
    pill.className = `tier-pill ${badge.cls}`;
    document.getElementById("score-number").textContent = `${data.score} / ${data.total}`;
    document.getElementById("score-message").textContent = badge.message;

    const prize = PRIZE_TIERS.find((t) => t.key === data.prize_tier) || getPrize(0);
    document.getElementById("prize-card").classList.toggle("none", prize.key === "none");
    document.getElementById("prize-icon").textContent = prize.icon;
    document.getElementById("prize-title").textContent = prize.label;
    document.getElementById("prize-value").textContent = prize.value || "";
    document.getElementById("prize-note").textContent = prize.note;
  }

  boot();
})();
