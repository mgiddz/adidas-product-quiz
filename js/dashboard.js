// js/dashboard.js — dashboard.html only. Reads quiz_submissions through
// Supabase Auth (not the anon-insert-only path app.js uses) — Row Level
// Security scopes what comes back to the signed-in colleague's own store,
// or to every store if their profile is marked is_admin. See
// supabase/schema.sql for the policy.
(function () {
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const whoAmI = document.getElementById("whoami");
  const logoutBtn = document.getElementById("logout-btn");
  const tabsEl = document.getElementById("store-tabs");
  const tableBody = document.getElementById("results-tbody");
  const emptyState = document.getElementById("empty-state");
  const modal = document.getElementById("detail-modal");
  const modalBody = document.getElementById("detail-modal-body");
  const modalClose = document.getElementById("detail-modal-close");

  let allRows = [];
  let activeStore = null;

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function showEmpty(message) {
    tableBody.innerHTML = "";
    emptyState.textContent = message;
    emptyState.classList.remove("hidden");
  }

  function renderTabs(stores) {
    tabsEl.innerHTML = "";
    if (stores.length <= 1) {
      tabsEl.classList.add("hidden");
      return;
    }
    tabsEl.classList.remove("hidden");
    stores.forEach((store) => {
      const count = allRows.filter((r) => r.store_name === store).length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "store-tab" + (store === activeStore ? " active" : "");
      btn.textContent = `${store} (${count})`;
      btn.addEventListener("click", () => {
        activeStore = store;
        renderTabs(stores);
        renderTable();
      });
      tabsEl.appendChild(btn);
    });
  }

  function renderTable() {
    const rows = allRows.filter((r) => r.store_name === activeStore);
    tableBody.innerHTML = "";
    if (!rows.length) {
      showEmpty("No submissions for this store yet.");
      return;
    }
    emptyState.classList.add("hidden");
    rows.forEach((r) => {
      const tr = document.createElement("tr");
      const submitted = r.created_at ? new Date(r.created_at).toLocaleDateString() : "";
      tr.innerHTML = `
        <td>${escapeHtml(r.employee_name)}</td>
        <td>${r.score} / 20</td>
        <td>${escapeHtml(r.store_location)}</td>
        <td>${escapeHtml(submitted)}</td>
      `;
      tr.addEventListener("click", () => openDetail(r));
      tableBody.appendChild(tr);
    });
  }

  function openDetail(r) {
    const answers = Array.isArray(r.answers) ? r.answers : [];
    const submitted = r.created_at ? new Date(r.created_at).toLocaleString() : "";
    modalBody.innerHTML = `
      <h3>${escapeHtml(r.employee_name)}</h3>
      <p><strong>Store:</strong> ${escapeHtml(r.store_name)} — ${escapeHtml(r.store_location)}</p>
      <p><strong>Score:</strong> ${r.score} / 20</p>
      <p><strong>Email:</strong> ${escapeHtml(r.email)}</p>
      <p><strong>Shoe size:</strong> ${escapeHtml(r.shoe_size)} (${escapeHtml(r.shoe_size_gender)})</p>
      <p><strong>Clothing size:</strong> ${escapeHtml(r.clothing_size)} (${escapeHtml(r.clothing_size_gender)})</p>
      <p><strong>Favorite snack:</strong> ${escapeHtml(r.favorite_snack)}${
        r.favorite_snack_other ? " — " + escapeHtml(r.favorite_snack_other) : ""
      }</p>
      ${
        r.open_ended_response
          ? `<p><strong>Why they love adidas:</strong> ${escapeHtml(r.open_ended_response)}</p>`
          : ""
      }
      <p><strong>Submitted:</strong> ${escapeHtml(submitted)}</p>
      <div class="answer-breakdown">
        ${answers
          .map(
            (a) =>
              `<div class="answer-row ${a.correct ? "correct" : "incorrect"}">${
                a.correct ? "✅" : "❌"
              } ${escapeHtml(a.yourAnswer)}</div>`
          )
          .join("")}
      </div>
    `;
    modal.classList.remove("hidden");
  }

  modalClose.addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  logoutBtn.addEventListener("click", async () => {
    await client.auth.signOut();
    window.location.href = "login.html";
  });

  async function init() {
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) {
      window.location.href = "login.html";
      return;
    }

    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("*")
      .eq("id", sessionData.session.user.id)
      .single();

    if (profileError || !profile) {
      whoAmI.textContent =
        "Signed in, but no profile found yet — ask Mike to finish setting up your account.";
      showEmpty("Waiting on account setup.");
      return;
    }

    whoAmI.textContent = profile.is_admin
      ? `${profile.email} — Admin (all stores)`
      : `${profile.email} — ${profile.store_name || "no store assigned yet"}`;

    const { data: rows, error: rowsError } = await client
      .from("quiz_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (rowsError) {
      showEmpty("Couldn't load results: " + rowsError.message);
      return;
    }

    allRows = rows || [];
    if (!allRows.length) {
      showEmpty("No submissions yet.");
      tabsEl.classList.add("hidden");
      return;
    }

    const stores = Array.from(new Set(allRows.map((r) => r.store_name))).sort();
    activeStore = stores[0];
    renderTabs(stores);
    renderTable();
  }

  init();
})();
