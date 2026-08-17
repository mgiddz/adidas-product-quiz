// js/app.js
//
// Screen state machine: intake -> quiz -> results.
// Quiz content comes from js/questions.js. Supabase connection comes from
// js/config.js. This file wires them together and owns all DOM rendering.
//
// Quiz UX (per the Design prototype, which takes precedence over the build
// spec for quiz content/format — see MEMORY.md): each question reveals
// correct/incorrect immediately with an explanation, rather than holding
// feedback until the end. The intake form and Supabase submission are kept
// from the build spec, since the prototype doesn't cover those at all.

(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------

  const state = {
    screen: "intake", // 'intake' | 'quiz' | 'results'
    intake: {
      employeeName: "",
      storeName: "",
      storeLocation: "",
      shoeSize: "",
      shoeSizeGender: null, // 'M' | 'W'
      clothingSize: "",
      clothingSizeGender: null, // 'M' | 'W'
      email: "",
      favoriteSnack: "",
      favoriteSnackOther: "",
    },
    // quizIdx counts across QUIZ_QUESTIONS.length graded questions, then
    // one more step for the open-ended question.
    quizIdx: 0,
    // answers[i] is null until answered. For type 'mc': { selectedIndex, correct }.
    // For type 'order': { order: [...indices], correct }.
    answers: new Array(QUIZ_QUESTIONS.length).fill(null),
    openEndedResponse: "",
  };

  const TOTAL_STEPS = QUIZ_QUESTIONS.length + 1; // 20 graded + 1 open-ended

  // Working (not-yet-checked) order arrangement for the current order
  // question — reset whenever a fresh, unanswered order question is shown.
  let workingOrder = null;

  // ---------------------------------------------------------------------
  // Supabase client (may be unconfigured — handled gracefully)
  // ---------------------------------------------------------------------

  let supabaseClient = null;
  const supabaseConfigured =
    typeof SUPABASE_URL === "string" &&
    typeof SUPABASE_ANON_KEY === "string" &&
    !SUPABASE_URL.includes("YOUR_SUPABASE") &&
    !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");

  if (supabaseConfigured && window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else if (!supabaseConfigured) {
    console.warn(
      "[quiz] Supabase is not configured yet — fill in js/config.js. " +
        "Submissions will still show a score on-screen but won't be saved."
    );
  }

  // ---------------------------------------------------------------------
  // DOM refs
  // ---------------------------------------------------------------------

  const screens = {
    intake: document.getElementById("screen-intake"),
    quiz: document.getElementById("screen-quiz"),
    results: document.getElementById("screen-results"),
  };

  function showScreen(name) {
    state.screen = name;
    Object.keys(screens).forEach((key) => {
      screens[key].classList.toggle("hidden", key !== name);
    });
    window.scrollTo(0, 0);
  }

  // ---------------------------------------------------------------------
  // Intake screen
  // ---------------------------------------------------------------------

  const intakeForm = document.getElementById("intake-form");
  const startBtn = document.getElementById("start-quiz-btn");
  const snackSelect = document.getElementById("field-snack");
  const snackOtherWrap = document.getElementById("field-snack-other-wrap");
  const emailError = document.getElementById("email-error");

  function setupToggleGroup(groupEl, onChange) {
    groupEl.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        groupEl.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        onChange(btn.dataset.value);
        validateIntake();
      });
    });
  }

  setupToggleGroup(document.getElementById("shoe-gender-toggle"), (val) => {
    state.intake.shoeSizeGender = val;
  });
  setupToggleGroup(document.getElementById("clothing-gender-toggle"), (val) => {
    state.intake.clothingSizeGender = val;
  });

  snackSelect.addEventListener("change", () => {
    state.intake.favoriteSnack = snackSelect.value;
    snackOtherWrap.classList.toggle("hidden", snackSelect.value !== "Other");
    validateIntake();
  });

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateIntake() {
    const i = state.intake;
    const requiredFilled =
      i.employeeName.trim() &&
      i.storeName.trim() &&
      i.storeLocation.trim() &&
      i.shoeSize.toString().trim() &&
      i.shoeSizeGender &&
      i.clothingSize &&
      i.clothingSizeGender &&
      i.email.trim() &&
      i.favoriteSnack &&
      (i.favoriteSnack !== "Other" || i.favoriteSnackOther.trim());

    const emailOk = isValidEmail(i.email.trim());
    emailError.classList.toggle("visible", i.email.trim().length > 0 && !emailOk);

    startBtn.disabled = !(requiredFilled && emailOk);
    return requiredFilled && emailOk;
  }

  function handleIntakeFieldChange(e) {
    const field = e.target.dataset.field;
    if (!field) return;
    state.intake[field] = e.target.value;
    validateIntake();
  }
  // Listen to both events: text/email inputs fire 'input' on every keystroke;
  // <select> reliably fires 'change' across all browsers (and 'input' in most
  // modern ones too) — belt and suspenders so the clothing-size dropdown
  // always updates state.
  intakeForm.addEventListener("input", handleIntakeFieldChange);
  intakeForm.addEventListener("change", handleIntakeFieldChange);

  intakeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateIntake()) return;
    state.quizIdx = 0;
    renderQuizStep();
    showScreen("quiz");
  });

  // ---------------------------------------------------------------------
  // Quiz screen
  // ---------------------------------------------------------------------

  const progressLabel = document.getElementById("progress-label");
  const sectionLabel = document.getElementById("section-label");
  const progressFill = document.getElementById("progress-fill");
  const questionText = document.getElementById("question-text");
  const optionList = document.getElementById("option-list");
  const orderList = document.getElementById("order-list");
  const explanationBox = document.getElementById("explanation-box");
  const questionImageWrap = document.getElementById("question-image-wrap");
  const questionImage = document.getElementById("question-image");
  const questionImageCaption = document.getElementById("question-image-caption");
  const openEndedWrap = document.getElementById("open-ended-wrap");
  const openEndedInput = document.getElementById("open-ended-input");
  const checkOrderBtn = document.getElementById("check-order-btn");
  const nextBtn = document.getElementById("next-btn");

  function isOpenEndedStep() {
    return state.quizIdx >= QUIZ_QUESTIONS.length;
  }

  function renderQuizStep() {
    const stepNum = state.quizIdx + 1;
    progressLabel.textContent = `Question ${stepNum} of ${TOTAL_STEPS}`;
    progressFill.style.width = `${Math.round((state.quizIdx / TOTAL_STEPS) * 100)}%`;

    // Reset all sub-sections; each branch below reveals what it needs.
    optionList.classList.add("hidden");
    orderList.classList.add("hidden");
    openEndedWrap.classList.add("hidden");
    explanationBox.classList.add("hidden");
    checkOrderBtn.classList.add("hidden");
    questionImageWrap.classList.add("hidden");
    nextBtn.classList.remove("hidden");

    if (isOpenEndedStep()) {
      sectionLabel.textContent = "Your Take";
      questionText.textContent = OPEN_ENDED_QUESTION.prompt;
      openEndedWrap.classList.remove("hidden");
      openEndedInput.value = state.openEndedResponse;
      nextBtn.textContent = "Submit";
      nextBtn.disabled = false;
      return;
    }

    const q = QUIZ_QUESTIONS[state.quizIdx];
    sectionLabel.textContent = q.section;
    questionText.textContent = q.prompt;

    if (q.image) {
      questionImage.src = `images/${q.image}`;
      questionImage.alt = q.imageCaption || q.section;
      questionImageCaption.textContent = q.imageCaption || "";
      questionImageWrap.classList.remove("hidden");
    }

    if (q.type === "order") {
      renderOrderQuestion(q);
    } else {
      renderMcQuestion(q);
    }
  }

  function renderMcQuestion(q) {
    optionList.classList.remove("hidden");
    optionList.innerHTML = "";

    const answer = state.answers[state.quizIdx]; // null until answered
    const locked = answer !== null;

    q.options.forEach((optionText, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option-btn";
      btn.textContent = optionText;

      if (locked) {
        btn.disabled = true;
        if (i === q.correctIndex) btn.classList.add("correct");
        else if (i === answer.selectedIndex) btn.classList.add("incorrect");
      } else {
        btn.addEventListener("click", () => selectMcAnswer(q, i));
      }

      optionList.appendChild(btn);
    });

    if (locked) {
      showExplanation(q.explain);
      nextBtn.disabled = false;
      nextBtn.textContent = "Next Question";
    } else {
      nextBtn.classList.add("hidden");
    }
  }

  function selectMcAnswer(q, selectedIndex) {
    if (state.answers[state.quizIdx] !== null) return; // already answered
    state.answers[state.quizIdx] = {
      type: "mc",
      selectedIndex,
      correct: selectedIndex === q.correctIndex,
    };
    renderQuizStep();
  }

  function renderOrderQuestion(q) {
    orderList.classList.remove("hidden");

    const answer = state.answers[state.quizIdx]; // null until checked
    const locked = answer !== null;

    if (locked) {
      renderOrderRows(q, answer.order, true);
      showExplanation(q.explain);
      nextBtn.disabled = false;
      nextBtn.textContent = "Next Question";
    } else {
      if (!workingOrder) workingOrder = [...q.startOrder];
      renderOrderRows(q, workingOrder, false);
      checkOrderBtn.classList.remove("hidden");
      nextBtn.classList.add("hidden");
    }
  }

  function renderOrderRows(q, order, locked) {
    orderList.innerHTML = "";
    order.forEach((itemIdx, pos) => {
      const row = document.createElement("div");
      row.className = "order-row";
      if (locked) {
        row.classList.add(itemIdx === pos ? "correct" : "incorrect");
      }

      const rank = document.createElement("div");
      rank.className = "order-rank";
      rank.textContent = pos + 1;

      const label = document.createElement("div");
      label.className = "order-label";
      label.textContent = q.items[itemIdx];

      row.appendChild(rank);
      row.appendChild(label);

      if (!locked) {
        const controls = document.createElement("div");
        controls.className = "order-controls";

        const upBtn = document.createElement("button");
        upBtn.type = "button";
        upBtn.textContent = "↑";
        upBtn.disabled = pos === 0;
        upBtn.addEventListener("click", () => moveOrderItem(pos, -1));

        const downBtn = document.createElement("button");
        downBtn.type = "button";
        downBtn.textContent = "↓";
        downBtn.disabled = pos === order.length - 1;
        downBtn.addEventListener("click", () => moveOrderItem(pos, 1));

        controls.appendChild(upBtn);
        controls.appendChild(downBtn);
        row.appendChild(controls);
      }

      orderList.appendChild(row);
    });
  }

  function moveOrderItem(pos, dir) {
    const target = pos + dir;
    if (target < 0 || target >= workingOrder.length) return;
    [workingOrder[pos], workingOrder[target]] = [workingOrder[target], workingOrder[pos]];
    renderQuizStep();
  }

  checkOrderBtn.addEventListener("click", () => {
    const q = QUIZ_QUESTIONS[state.quizIdx];
    const correct = workingOrder.every((itemIdx, pos) => itemIdx === pos);
    state.answers[state.quizIdx] = { type: "order", order: [...workingOrder], correct };
    workingOrder = null;
    renderQuizStep();
  });

  function showExplanation(text) {
    explanationBox.textContent = text;
    explanationBox.classList.remove("hidden");
  }

  openEndedInput.addEventListener("input", () => {
    state.openEndedResponse = openEndedInput.value;
  });

  nextBtn.addEventListener("click", async () => {
    if (isOpenEndedStep()) {
      await finishQuiz();
      return;
    }
    state.quizIdx += 1;
    workingOrder = null;
    renderQuizStep();
  });

  // ---------------------------------------------------------------------
  // Grading + results screen
  // ---------------------------------------------------------------------

  const badgePill = document.getElementById("score-tier-pill");
  const scoreNumber = document.getElementById("score-number");
  const scoreMessage = document.getElementById("score-message");
  const breakdownList = document.getElementById("breakdown-list");
  const statusMessage = document.getElementById("status-message");
  const retakeBtn = document.getElementById("retake-btn");

  function gradeQuiz() {
    let score = 0;
    const detailed = QUIZ_QUESTIONS.map((q, i) => {
      const answer = state.answers[i];
      let correct = false;
      let yourAnswerText;
      let correctAnswerText;

      if (q.type === "order") {
        const order = answer ? answer.order : q.startOrder;
        correct = answer ? answer.correct : false;
        yourAnswerText = order.map((idx) => q.items[idx]).join(" → ");
        correctAnswerText = q.items.join(" → ");
      } else {
        const selectedIndex = answer ? answer.selectedIndex : null;
        correct = selectedIndex === q.correctIndex;
        yourAnswerText = selectedIndex === null ? "(no answer)" : q.options[selectedIndex];
        correctAnswerText = q.options[q.correctIndex];
      }

      if (correct) score += 1;
      return {
        questionId: q.id,
        type: q.type,
        prompt: q.prompt,
        yourAnswerText,
        correctAnswerText,
        correct,
      };
    });
    return { score, detailed };
  }

  function renderResults(score, detailed) {
    const badge = getBadge(score);
    badgePill.textContent = badge.label;
    badgePill.style.background = badge.bg;
    badgePill.style.color = badge.color;
    scoreNumber.textContent = `${score} / ${QUIZ_QUESTIONS.length}`;
    scoreMessage.textContent = badge.message;

    breakdownList.innerHTML = "";
    detailed.forEach((d, i) => {
      const item = document.createElement("div");
      item.className = `breakdown-item ${d.correct ? "correct" : "incorrect"}`;
      item.innerHTML = `
        <div class="bq-header">
          <div class="bq-question">Q${i + 1}. ${escapeHtml(d.prompt)}</div>
          <div class="bq-icon">${d.correct ? "✅" : "❌"}</div>
        </div>
        <div class="bq-answer your-answer ${d.correct ? "" : "wrong"}">Your answer: ${escapeHtml(
        d.yourAnswerText
      )}</div>
        ${
          d.correct
            ? ""
            : `<div class="bq-answer correct-answer">Correct answer: ${escapeHtml(
                d.correctAnswerText
              )}</div>`
        }
      `;
      breakdownList.appendChild(item);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  async function submitToSupabase(payload) {
    if (!supabaseClient) {
      return { ok: false, reason: "not_configured" };
    }
    try {
      const { error } = await supabaseClient.from("quiz_submissions").insert([payload]);
      if (error) throw error;
      return { ok: true };
    } catch (err) {
      console.error("[quiz] Supabase insert failed:", err);
      return { ok: false, reason: "insert_failed", error: err };
    }
  }

  async function finishQuiz() {
    const { score, detailed } = gradeQuiz();

    const payload = {
      employee_name: state.intake.employeeName.trim(),
      store_name: state.intake.storeName.trim(),
      store_location: state.intake.storeLocation.trim(),
      shoe_size: state.intake.shoeSize.toString().trim(),
      shoe_size_gender: state.intake.shoeSizeGender,
      clothing_size: state.intake.clothingSize,
      clothing_size_gender: state.intake.clothingSizeGender,
      email: state.intake.email.trim(),
      favorite_snack: state.intake.favoriteSnack,
      favorite_snack_other:
        state.intake.favoriteSnack === "Other" ? state.intake.favoriteSnackOther.trim() : null,
      answers: detailed.map((d) => ({
        questionId: d.questionId,
        type: d.type,
        yourAnswer: d.yourAnswerText,
        correct: d.correct,
      })),
      score,
      open_ended_response: state.openEndedResponse.trim() || null,
    };

    // Show results immediately regardless of save outcome — the in-browser
    // score is the primary delivery mechanism (build spec §4/§9).
    renderResults(score, detailed);
    showScreen("results");

    statusMessage.textContent = "Saving your results…";
    statusMessage.classList.remove("error");

    const result = await submitToSupabase(payload);
    if (result.ok) {
      statusMessage.textContent = "Results saved. Nice work!";
    } else if (result.reason === "not_configured") {
      statusMessage.textContent =
        "Your score is shown above. (Admin note: Supabase isn't configured yet — see js/config.js.)";
      statusMessage.classList.add("error");
    } else {
      statusMessage.textContent =
        "Your score is shown above, but we couldn't save it — please show this screen to your manager just in case.";
      statusMessage.classList.add("error");
    }
  }

  retakeBtn.addEventListener("click", () => {
    state.quizIdx = 0;
    state.answers = new Array(QUIZ_QUESTIONS.length).fill(null);
    state.openEndedResponse = "";
    openEndedInput.value = "";
    workingOrder = null;
    renderQuizStep();
    showScreen("quiz");
  });

  // ---------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------

  validateIntake();
  showScreen("intake");
})();
