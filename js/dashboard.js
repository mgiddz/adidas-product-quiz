// js/dashboard.js — dashboard.html (v2, 2026-09-30). Staff sign in on
// login.html (Supabase Auth email+password → `profiles`). Row Level
// Security scopes everything to the staff member's territory (their
// `profiles.territory` list, or `profiles.store_name`), or every store for
// admins. See supabase/v2_schema.sql.
//
// Tabs: Results (certification tests / module attempts / legacy quiz),
// Employees, Store products (per-store toggles), Test sessions (open a
// proctored session → 6-char code → live roster).

(function () {
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const whoAmI = document.getElementById("whoami");
  const modal = document.getElementById("detail-modal");
  const modalBody = document.getElementById("detail-modal-body");

  let profile = null;
  let products = [];
  let myStores = []; // stores this staff member can see (sorted)

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }
  const fmt = (iso) => (iso ? new Date(iso).toLocaleString() : "");
  const fmtD = (iso) => (iso ? new Date(iso).toLocaleDateString() : "");
  const prizeShort = (key) => {
    const t = (typeof PRIZE_TIERS !== "undefined" ? PRIZE_TIERS : []).find((x) => x.key === key);
    return t ? t.short : key || "";
  };
  const productName = (id) => (products.find((p) => p.id === id) || { name: id }).name;

  function openModal(html) {
    modalBody.innerHTML = html;
    modal.classList.remove("hidden");
  }
  document.getElementById("detail-modal-close").addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });

  document.getElementById("logout-btn").addEventListener("click", async () => {
    await client.auth.signOut();
    window.location.href = "login.html";
  });

  // ---------------------------------------------------------------------
  // Tabs
  // ---------------------------------------------------------------------
  const tabButtons = document.querySelectorAll("#admin-tabs button");
  const loaded = {};
  tabButtons.forEach((b) =>
    b.addEventListener("click", () => {
      tabButtons.forEach((x) => x.classList.toggle("active", x === b));
      document.querySelectorAll(".admin-panel").forEach((p) => p.classList.toggle("hidden", p.id !== "panel-" + b.dataset.tab));
      if (!loaded[b.dataset.tab]) {
        loaded[b.dataset.tab] = true;
        loaders[b.dataset.tab]();
      }
    })
  );

  function fillStoreSelect(sel, opts) {
    sel.innerHTML = "";
    if (opts && opts.allOption) {
      const o = document.createElement("option");
      o.value = "";
      o.textContent = opts.allOption;
      sel.appendChild(o);
    }
    myStores.forEach((s) => {
      const o = document.createElement("option");
      o.value = s;
      o.textContent = s;
      sel.appendChild(o);
    });
  }

  // ---------------------------------------------------------------------
  // Results
  // ---------------------------------------------------------------------
  const resultsStore = document.getElementById("results-store");
  const resultsKind = document.getElementById("results-kind");
  const resultsHead = document.getElementById("results-head");
  const resultsBody = document.getElementById("results-tbody");
  const resultsEmpty = document.getElementById("results-empty");
  let resultRows = [];

  async function loadResults() {
    fillStoreSelect(resultsStore, { allOption: profile.is_admin ? "All stores" : "All my stores" });
    resultsStore.onchange = renderResults;
    resultsKind.onchange = fetchResults;
    await fetchResults();
  }

  async function fetchResults() {
    const kind = resultsKind.value;
    let q;
    if (kind === "test") {
      q = client.from("test_attempts").select("*, employees(name, email), test_sessions(code, opened_at)").order("started_at", { ascending: false });
    } else if (kind === "module") {
      q = client.from("module_attempts").select("*, employees(name, email)").order("created_at", { ascending: false }).limit(500);
    } else {
      q = client.from("quiz_submissions").select("*").order("created_at", { ascending: false });
    }
    const { data, error } = await q;
    if (error) {
      resultsBody.innerHTML = "";
      resultsEmpty.textContent = "Couldn't load: " + error.message;
      resultsEmpty.classList.remove("hidden");
      return;
    }
    resultRows = data || [];
    renderResults();
  }

  function renderResults() {
    const kind = resultsKind.value;
    const store = resultsStore.value;
    const rows = resultRows.filter((r) => !store || r.store_name === store);
    resultsBody.innerHTML = "";
    resultsEmpty.classList.toggle("hidden", rows.length > 0);
    resultsEmpty.textContent = "No results yet.";

    if (kind === "test") {
      resultsHead.innerHTML = "<tr><th>Employee</th><th>Store</th><th>Score</th><th>Prize</th><th>Left page</th><th>Time</th><th>Session</th><th>Submitted</th></tr>";
      rows.forEach((r) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${escapeHtml(r.employees ? r.employees.name || r.employees.email : "")}</td>
          <td>${escapeHtml(r.store_name)}</td>
          <td>${r.submitted_at ? `${r.score} / ${r.total}` : "<em>in progress</em>"}</td>
          <td>${escapeHtml(prizeShort(r.prize_tier))}</td>
          <td class="${r.blur_count ? "warn" : ""}">${r.blur_count || 0}×</td>
          <td>${r.duration_s ? Math.round(r.duration_s / 60) + "m " + (r.duration_s % 60) + "s" : ""}</td>
          <td>${escapeHtml(r.test_sessions ? r.test_sessions.code : "")}</td>
          <td>${escapeHtml(fmt(r.submitted_at || r.started_at))}</td>`;
        tr.addEventListener("click", () => openAttempt(r, r.employees, "Certification test"));
        resultsBody.appendChild(tr);
      });
    } else if (kind === "module") {
      resultsHead.innerHTML = "<tr><th>Employee</th><th>Store</th><th>Module</th><th>Score</th><th>Left page</th><th>When</th></tr>";
      rows.forEach((r) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${escapeHtml(r.employees ? r.employees.name || r.employees.email : "")}</td>
          <td>${escapeHtml(r.store_name)}</td>
          <td>${escapeHtml(productName(r.product_id))}</td>
          <td>${r.score} / ${r.total}</td>
          <td class="${r.blur_count ? "warn" : ""}">${r.blur_count || 0}×</td>
          <td>${escapeHtml(fmt(r.created_at))}</td>`;
        tr.addEventListener("click", () => openAttempt(r, r.employees, productName(r.product_id)));
        resultsBody.appendChild(tr);
      });
    } else {
      resultsHead.innerHTML = "<tr><th>Employee</th><th>Score</th><th>Prize</th><th>Location</th><th>Submitted</th></tr>";
      rows.forEach((r) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${escapeHtml(r.employee_name)}</td><td>${r.score} / 20</td>
          <td>${escapeHtml(prizeShort(r.prize_tier || (typeof getPrize === "function" ? getPrize(r.score).key : "")))}</td>
          <td>${escapeHtml(r.store_location)}</td><td>${escapeHtml(fmtD(r.created_at))}</td>`;
        tr.addEventListener("click", () => openLegacy(r));
        resultsBody.appendChild(tr);
      });
    }
  }

  function openAttempt(r, emp, title) {
    const answers = Array.isArray(r.answers) ? r.answers : [];
    openModal(`<h3>${escapeHtml(emp ? emp.name || emp.email : "")}</h3>
      <p><strong>${escapeHtml(title)}</strong> — ${r.score} / ${r.total}${r.prize_tier ? " · Prize: " + escapeHtml(prizeShort(r.prize_tier)) : ""}</p>
      <p><strong>Store:</strong> ${escapeHtml(r.store_name)} · <strong>Left page:</strong> ${r.blur_count || 0}× · <strong>Time:</strong> ${r.duration_s || 0}s</p>
      <div class="answer-breakdown">${answers.map((a) => {
        const your = Array.isArray(a.your_answer) ? a.your_answer.join(" → ") : a.your_answer == null ? "(no answer)" : a.your_answer;
        const corr = Array.isArray(a.correct_answer) ? a.correct_answer.join(" → ") : a.correct_answer;
        return `<div class="answer-row ${a.correct ? "correct" : "incorrect"}">${a.correct ? "✅" : "❌"} <strong>${escapeHtml(a.prompt)}</strong><br>${escapeHtml(your)}${a.correct ? "" : ` <em>(correct: ${escapeHtml(corr)})</em>`}</div>`;
      }).join("")}</div>`);
  }

  function openLegacy(r) {
    const answers = Array.isArray(r.answers) ? r.answers : [];
    openModal(`<h3>${escapeHtml(r.employee_name)}</h3>
      <p><strong>Store:</strong> ${escapeHtml(r.store_name)}</p>
      <p><strong>Score:</strong> ${r.score} / 20 · <strong>Email:</strong> ${escapeHtml(r.email)}</p>
      <p><strong>Shoe:</strong> ${escapeHtml(r.shoe_size)} (${escapeHtml(r.shoe_size_gender)}) · <strong>Clothing:</strong> ${escapeHtml(r.clothing_size)} (${escapeHtml(r.clothing_size_gender)}) · <strong>Snack:</strong> ${escapeHtml(r.favorite_snack)}</p>
      ${r.open_ended_response ? `<p><strong>Why they love adidas:</strong> ${escapeHtml(r.open_ended_response)}</p>` : ""}
      <p><strong>Submitted:</strong> ${escapeHtml(fmt(r.created_at))}</p>
      <div class="answer-breakdown">${answers.map((a) => `<div class="answer-row ${a.correct ? "correct" : "incorrect"}">${a.correct ? "✅" : "❌"} ${escapeHtml(a.yourAnswer)}</div>`).join("")}</div>`);
  }

  document.getElementById("export-btn").addEventListener("click", () => {
    const store = resultsStore.value;
    const rows = resultRows.filter((r) => !store || r.store_name === store);
    if (!rows.length) return;
    const kind = resultsKind.value;
    const flat = rows.map((r) => {
      if (kind === "legacy") return { employee: r.employee_name, email: r.email, store: r.store_name, score: r.score, total: 20, prize: r.prize_tier, submitted: r.created_at };
      return { employee: r.employees ? r.employees.name : "", email: r.employees ? r.employees.email : "", store: r.store_name, module: r.product_id || "certification", score: r.score, total: r.total, prize: r.prize_tier || "", left_page: r.blur_count, seconds: r.duration_s, when: r.submitted_at || r.created_at || r.started_at };
    });
    const cols = Object.keys(flat[0]);
    const csv = [cols.join(",")].concat(flat.map((o) => cols.map((c) => `"${String(o[c] == null ? "" : o[c]).replace(/"/g, '""')}"`).join(","))).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `adidas-${kind}-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  });

  // ---------------------------------------------------------------------
  // Employees
  // ---------------------------------------------------------------------
  let employees = [];
  async function loadEmployees() {
    const [{ data: emps }, { data: mods }, { data: tests }] = await Promise.all([
      client.from("employees").select("*").order("created_at", { ascending: false }),
      client.from("module_attempts").select("employee_id, product_id, score, total"),
      client.from("test_attempts").select("employee_id, score, total, prize_tier").not("submitted_at", "is", null),
    ]);
    const modsBy = {};
    (mods || []).forEach((m) => { (modsBy[m.employee_id] = modsBy[m.employee_id] || new Set()).add(m.product_id); });
    const bestTest = {};
    (tests || []).forEach((t) => {
      const cur = bestTest[t.employee_id];
      if (!cur || t.score / t.total > cur.score / cur.total) bestTest[t.employee_id] = t;
    });
    employees = (emps || []).map((e) => ({ ...e, modules_done: modsBy[e.id] ? modsBy[e.id].size : 0, best_test: bestTest[e.id] || null }));
    renderEmployees();
    document.getElementById("emp-search").oninput = renderEmployees;
  }
  function renderEmployees() {
    const q = document.getElementById("emp-search").value.trim().toLowerCase();
    const tbody = document.getElementById("emp-tbody");
    const rows = employees.filter((e) => !q || [e.name, e.email, e.store_name].join(" ").toLowerCase().includes(q));
    tbody.innerHTML = rows.map((e) => `<tr>
      <td>${escapeHtml(e.name || "")}</td><td>${escapeHtml(e.store_name || "")}</td><td>${escapeHtml(e.email)}</td>
      <td>${e.modules_done} / ${products.filter((p) => p.active).length}</td>
      <td>${e.best_test ? `${e.best_test.score} / ${e.best_test.total} · ${escapeHtml(prizeShort(e.best_test.prize_tier))}` : "—"}</td>
      <td>${escapeHtml(e.shoe_size || "")}${e.shoe_gender ? " " + e.shoe_gender : ""} · ${escapeHtml(e.clothing_size || "")}${e.clothing_gender ? " " + e.clothing_gender : ""}</td>
      <td>${escapeHtml(fmtD(e.created_at))}</td></tr>`).join("");
    document.getElementById("emp-empty").classList.toggle("hidden", rows.length > 0);
  }

  // ---------------------------------------------------------------------
  // Store products (toggles)
  // ---------------------------------------------------------------------
  const productsStore = document.getElementById("products-store");
  const toggleGrid = document.getElementById("toggle-grid");
  async function loadProducts() {
    fillStoreSelect(productsStore);
    productsStore.onchange = renderToggles;
    await renderToggles();
  }
  async function renderToggles() {
    const store = productsStore.value;
    if (!store) return;
    const { data } = await client.from("store_products").select("product_id, enabled").eq("store_name", store);
    const map = {};
    (data || []).forEach((r) => { map[r.product_id] = r.enabled; });
    toggleGrid.innerHTML = products.map((p) => {
      const on = p.id === "full-lineup" ? true : map[p.id] !== false;
      const locked = p.id === "full-lineup";
      return `<label class="toggle-card ${on ? "on" : ""} ${p.active ? "" : "inactive"}">
        <input type="checkbox" data-product="${escapeHtml(p.id)}" ${on ? "checked" : ""} ${locked ? "disabled" : ""} />
        <div class="toggle-card-img" style="background-image:url('images/${escapeHtml(p.hero_image || "")}')"></div>
        <div><div class="toggle-card-title">${escapeHtml(p.name)}</div>
        <div class="toggle-card-sub">${escapeHtml(p.pillar || "")}${p.active ? "" : " · not launched yet"}${locked ? " · always on" : ""}</div></div>
      </label>`;
    }).join("");
    toggleGrid.querySelectorAll("input[type=checkbox]:not([disabled])").forEach((cb) =>
      cb.addEventListener("change", async () => {
        const banner = document.getElementById("products-banner");
        const text = document.getElementById("products-banner-text");
        const { error } = await client.from("store_products").upsert({
          store_name: store, product_id: cb.dataset.product, enabled: cb.checked, updated_by: profile.id, updated_at: new Date().toISOString(),
        });
        banner.classList.remove("hidden");
        if (error) { banner.className = "save-banner error"; text.textContent = "Couldn't save: " + error.message; cb.checked = !cb.checked; return; }
        banner.className = "save-banner ok";
        text.textContent = `Saved — ${productName(cb.dataset.product)} is ${cb.checked ? "ON" : "OFF"} for ${store}.`;
        cb.closest(".toggle-card").classList.toggle("on", cb.checked);
      })
    );
  }

  // ---------------------------------------------------------------------
  // Test sessions
  // ---------------------------------------------------------------------
  const sessionStore = document.getElementById("session-store");
  const sessionProducts = document.getElementById("session-products");
  const sessionsList = document.getElementById("sessions-list");
  let rosterTimer = null;

  async function loadSessions() {
    fillStoreSelect(sessionStore);
    sessionStore.onchange = renderSessionProducts;
    await renderSessionProducts();
    document.getElementById("open-session-btn").onclick = openSession;
    await renderSessions();
    clearInterval(rosterTimer);
    rosterTimer = setInterval(renderSessions, 10000);
  }
  async function renderSessionProducts() {
    const store = sessionStore.value;
    const { data } = await client.from("store_products").select("product_id, enabled").eq("store_name", store);
    const off = new Set((data || []).filter((r) => !r.enabled).map((r) => r.product_id));
    sessionProducts.innerHTML = products.filter((p) => p.active).map((p) =>
      `<label class="check-chip"><input type="checkbox" value="${escapeHtml(p.id)}" ${off.has(p.id) ? "" : "checked"} /> ${escapeHtml(p.name)}</label>`).join("");
  }
  async function openSession() {
    const err = document.getElementById("session-error");
    err.classList.remove("visible");
    const ids = Array.from(sessionProducts.querySelectorAll("input:checked")).map((i) => i.value);
    if (!ids.length) { err.textContent = "Pick at least one shoe."; err.classList.add("visible"); return; }
    const { error } = await client.rpc("open_test_session", {
      p_store: sessionStore.value, p_product_ids: ids, p_question_count: Number(document.getElementById("session-count").value),
    });
    if (error) { err.textContent = error.message; err.classList.add("visible"); return; }
    await renderSessions();
  }
  async function renderSessions() {
    const { data: sessions } = await client.from("test_sessions").select("*").order("opened_at", { ascending: false }).limit(20);
    if (!sessions || !sessions.length) { sessionsList.innerHTML = `<div class="empty-state">No sessions yet. Open one above.</div>`; return; }
    const rosters = await Promise.all(sessions.map((s) => client.rpc("session_roster", { p_session_id: s.id }).then((r) => r.data || [])));
    sessionsList.innerHTML = sessions.map((s, i) => {
      const open = !s.closed_at && new Date(s.expires_at) > new Date();
      const roster = rosters[i];
      return `<div class="session-card ${open ? "open" : ""}">
        <div class="session-card-head">
          <div>
            <div class="session-code">${escapeHtml(s.code)}</div>
            <div class="session-meta">${escapeHtml(s.store_name)} · ${s.question_count} Qs · ${s.product_ids.map(productName).map(escapeHtml).join(", ")}<br>Opened ${escapeHtml(fmt(s.opened_at))}${s.closed_at ? " · closed " + escapeHtml(fmt(s.closed_at)) : open ? " · <strong>OPEN</strong> (expires " + escapeHtml(fmt(s.expires_at)) + ")" : " · expired"}</div>
          </div>
          ${open ? `<button type="button" class="btn-inline" data-close="${s.id}">Close session</button>` : ""}
        </div>
        <table class="results-table small"><thead><tr><th>Employee</th><th>Status</th><th>Score</th><th>Prize</th><th>Left page</th></tr></thead><tbody>
          ${roster.length ? roster.map((r) => `<tr><td>${escapeHtml(r.employee || r.email)}</td>
            <td>${r.submitted_at ? "Done " + escapeHtml(fmt(r.submitted_at)) : "In progress…"}</td>
            <td>${r.submitted_at ? `${r.score} / ${r.total}` : ""}</td><td>${escapeHtml(prizeShort(r.prize_tier))}</td>
            <td class="${r.blur_count ? "warn" : ""}">${r.blur_count || 0}×</td></tr>`).join("") : `<tr><td colspan="5"><em>Nobody has joined yet.</em></td></tr>`}
        </tbody></table>
      </div>`;
    }).join("");
    sessionsList.querySelectorAll("[data-close]").forEach((b) =>
      b.addEventListener("click", async () => {
        await client.from("test_sessions").update({ closed_at: new Date().toISOString() }).eq("id", b.dataset.close);
        renderSessions();
      })
    );
  }

  const loaders = { results: loadResults, employees: loadEmployees, products: loadProducts, sessions: loadSessions };

  // ---------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------
  async function init() {
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) { window.location.href = "login.html"; return; }
    const { data: p } = await client.from("profiles").select("*").eq("id", sessionData.session.user.id).single();
    if (!p) {
      whoAmI.textContent = "Signed in, but no staff profile found — ask Mike to finish setting up your account.";
      return;
    }
    profile = p;
    const { data: prods } = await client.from("products").select("*").order("sort");
    // Admins see inactive (pre-launch) products too; RLS hides them from employees.
    products = prods || [];

    const all = typeof STORE_LOCATIONS !== "undefined" ? STORE_LOCATIONS.slice() : [];
    if (p.is_admin || p.role === "admin" || p.role === "viewer") myStores = all;
    else myStores = Array.from(new Set([...(p.territory || []), p.store_name].filter(Boolean)));
    myStores.sort();

    whoAmI.textContent = `${p.email} — ${p.is_admin || p.role === "admin" ? "Admin (all stores)" : p.role === "viewer" ? "Viewer (all stores)" : `Product Educator · ${myStores.length} store${myStores.length === 1 ? "" : "s"}`}`;
    loaded.results = true;
    await loadResults();
  }
  init();
})();
