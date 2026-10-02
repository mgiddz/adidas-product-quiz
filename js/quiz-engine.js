// js/quiz-engine.js — the timed question runner shared by module.html
// (shoe modules) and test.html (proctored certification test).
//
// Given questions from the server (NO answer key — see supabase/v2_schema.sql),
// it shows one at a time with a 20-second countdown (js/timer.js), locks
// the first tap, auto-advances, and hands back the answer list for
// server-side grading. There is no back button by design.
//
// Answer shape sent to the RPCs: [{ id, answer }] where answer is the
// chosen option TEXT for 'mc', or the array of item texts (in the
// employee's order) for 'order'. Unanswered = null answer (graded wrong).

const QuizEngine = (() => {
  const { escapeHtml } = Session;

  function run(questions, opts) {
    return new Promise((resolve) => {
      const el = {
        progressLabel: document.getElementById("progress-label"),
        progressFill: document.getElementById("progress-fill"),
        questionText: document.getElementById("question-text"),
        optionList: document.getElementById("option-list"),
        orderList: document.getElementById("order-list"),
        imageWrap: document.getElementById("question-image-wrap"),
        image: document.getElementById("question-image"),
        lockOrderBtn: document.getElementById("lock-order-btn"),
        ring: document.getElementById("timer-ring"),
        timerLabel: document.getElementById("timer-label"),
      };
      const answers = [];
      const startedAt = performance.now();
      const blurCount = QuizTimer.trackBlur();
      let idx = 0;
      let locked = false;
      let workingOrder = null;
      const timer = QuizTimer.create({
        ringEl: el.ring,
        labelEl: el.timerLabel,
        seconds: opts && opts.seconds,
        onExpire: () => {
          if (locked) return;
          // Time's up: for order questions, submit whatever order they have;
          // for mc, submit null.
          const q = questions[idx];
          commit(q.type === "order" ? workingOrder.slice() : null, true);
        },
      });

      function render() {
        const q = questions[idx];
        locked = false;
        el.progressLabel.textContent = `Question ${idx + 1} of ${questions.length}`;
        el.progressFill.style.width = `${Math.round((idx / questions.length) * 100)}%`;
        el.optionList.classList.add("hidden");
        el.orderList.classList.add("hidden");
        el.lockOrderBtn.style.display = "none";
        el.imageWrap.classList.add("hidden");
        el.questionText.textContent = q.prompt;
        if (q.image) {
          el.image.src = `images/${q.image}`;
          el.imageWrap.classList.remove("hidden");
        }
        if (q.type === "order") renderOrder(q);
        else renderMc(q);
        timer.start();
      }

      function renderMc(q) {
        el.optionList.classList.remove("hidden");
        el.optionList.innerHTML = "";
        q.options.forEach((text) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "option-btn";
          btn.textContent = text;
          btn.addEventListener("click", () => {
            if (locked) return;
            el.optionList.querySelectorAll("button").forEach((b) => {
              b.disabled = true;
              b.classList.toggle("selected", b === btn);
            });
            commit(text, false);
          });
          el.optionList.appendChild(btn);
        });
      }

      function renderOrder(q) {
        workingOrder = q.options.slice(); // server already shuffled
        el.orderList.classList.remove("hidden");
        el.lockOrderBtn.style.display = "";
        el.lockOrderBtn.disabled = false;
        el.lockOrderBtn.onclick = () => {
          if (locked) return;
          el.lockOrderBtn.disabled = true;
          commit(workingOrder.slice(), false);
        };
        drawOrder();
      }

      function drawOrder() {
        el.orderList.innerHTML = "";
        workingOrder.forEach((text, i) => {
          const row = document.createElement("div");
          row.className = "order-row";
          row.innerHTML = `<div class="order-rank">${i + 1}</div>
            <div class="order-label">${escapeHtml(text)}</div>
            <div class="order-controls">
              <button type="button" data-dir="-1" ${i === 0 ? "disabled" : ""} aria-label="Move up">&uarr;</button>
              <button type="button" data-dir="1" ${i === workingOrder.length - 1 ? "disabled" : ""} aria-label="Move down">&darr;</button>
            </div>`;
          row.querySelectorAll("button").forEach((b) => {
            b.addEventListener("click", () => {
              if (locked) return;
              const j = i + Number(b.dataset.dir);
              [workingOrder[i], workingOrder[j]] = [workingOrder[j], workingOrder[i]];
              drawOrder();
            });
          });
          el.orderList.appendChild(row);
        });
      }

      function commit(answer, timedOut) {
        if (locked) return;
        locked = true;
        timer.stop();
        answers.push({ id: questions[idx].id, answer, timed_out: !!timedOut });
        if (timedOut) {
          el.questionText.textContent = "⏱ Time's up";
        }
        setTimeout(() => {
          idx += 1;
          if (idx >= questions.length) {
            el.progressFill.style.width = "100%";
            resolve({
              answers: answers.map((a) => ({ id: a.id, answer: a.answer })),
              duration_s: Math.round((performance.now() - startedAt) / 1000),
              blur_count: blurCount(),
              timed_out: answers.filter((a) => a.timed_out).length,
            });
          } else {
            render();
          }
        }, timedOut ? 900 : 450);
      }

      render();
    });
  }

  // Badge by percentage (v1's 18/14/10-of-20 thresholds, generalized).
  function badgeFor(score, total) {
    const pct = total ? score / total : 0;
    if (pct >= 0.9) return { label: "LEGEND STATUS", cls: "legend", message: "Elite-level product knowledge. You're ready to lead floor training." };
    if (pct >= 0.7) return { label: "SPECIALIST", cls: "specialist", message: "Strong grasp of this shoe. A quick pass over the misses and you're set." };
    if (pct >= 0.5) return { label: "ROOKIE", cls: "rookie", message: "Solid start. Hit the study guide and run it again." };
    return { label: "KEEP STUDYING", cls: "study", message: "Give the cheat sheet another read, then retake." };
  }

  function renderBreakdown(container, details) {
    container.innerHTML = "";
    details.forEach((d, i) => {
      const your = Array.isArray(d.your_answer) ? d.your_answer.join(" → ") : d.your_answer == null ? "(no answer — time ran out)" : d.your_answer;
      const correct = Array.isArray(d.correct_answer) ? d.correct_answer.join(" → ") : d.correct_answer;
      const item = document.createElement("div");
      item.className = `breakdown-item ${d.correct ? "correct" : "incorrect"}`;
      item.innerHTML = `
        <div class="bq-header">
          <div class="bq-question">Q${i + 1}. ${escapeHtml(d.prompt)}</div>
          <div class="bq-icon">${d.correct ? "✅" : "❌"}</div>
        </div>
        <div class="bq-answer your-answer ${d.correct ? "" : "wrong"}">Your answer: ${escapeHtml(your)}</div>
        ${d.correct ? "" : `<div class="bq-answer correct-answer">Correct answer: ${escapeHtml(correct)}</div>`}
        ${d.explain ? `<div class="bq-explain">${escapeHtml(d.explain)}</div>` : ""}`;
      container.appendChild(item);
    });
  }

  return { run, badgeFor, renderBreakdown };
})();
