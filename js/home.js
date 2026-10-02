// js/home.js — index.html: magic-link sign-in → one-time profile → module
// grid + certification-test code entry. See js/session.js for auth.

(function () {
  "use strict";
  const { client, escapeHtml } = Session;

  const screens = {
    signin: document.getElementById("screen-signin"),
    profile: document.getElementById("screen-profile"),
    home: document.getElementById("screen-home"),
  };
  function show(name) {
    Object.keys(screens).forEach((k) => screens[k].classList.toggle("hidden", k !== name));
    window.scrollTo(0, 0);
  }

  // ---------------------------------------------------------------------
  // Sign in
  // ---------------------------------------------------------------------
  const signinForm = document.getElementById("signin-form");
  const emailInput = document.getElementById("field-email");
  const emailError = document.getElementById("email-error");
  const sentBanner = document.getElementById("sent-banner");
  const signinBtn = document.getElementById("signin-btn");

  signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    emailError.classList.toggle("visible", !valid);
    if (!valid) return;
    signinBtn.disabled = true;
    signinBtn.textContent = "SENDING…";
    const next = new URLSearchParams(location.search).get("next") || "";
    const redirect = window.location.origin + "/index.html" + (next ? "?next=" + encodeURIComponent(next) : "");
    const { error } = await Session.sendMagicLink(email, redirect);
    if (error) {
      emailError.textContent = error.message;
      emailError.classList.add("visible");
      signinBtn.disabled = false;
      signinBtn.textContent = "EMAIL ME A SIGN-IN LINK";
      return;
    }
    sentBanner.classList.remove("hidden");
    signinBtn.textContent = "LINK SENT — CHECK YOUR EMAIL";
  });

  async function preflight() {
    try {
      const { error } = await client.from("products").select("id", { head: true, count: "exact" }).limit(1);
      if (error && error.code !== "PGRST301" && !/permission|policy|JWT/i.test(error.message)) throw error;
    } catch (err) {
      console.error("[home] preflight failed:", err);
      document.getElementById("preflight-banner").classList.remove("hidden");
    }
  }

  // ---------------------------------------------------------------------
  // Profile (first sign-in)
  // ---------------------------------------------------------------------
  const profileForm = document.getElementById("profile-form");
  const profileBtn = document.getElementById("profile-btn");
  const storeSelect = document.getElementById("field-store");
  const genders = { shoe: null, clothing: null };

  (typeof STORE_LOCATIONS !== "undefined" ? STORE_LOCATIONS : []).forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    storeSelect.appendChild(opt);
  });

  function wireToggle(id, key) {
    const group = document.getElementById(id);
    group.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        genders[key] = btn.dataset.value;
        group.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
        validateProfile();
      });
    });
  }
  wireToggle("shoe-gender-toggle", "shoe");
  wireToggle("clothing-gender-toggle", "clothing");

  function validateProfile() {
    const ok =
      document.getElementById("field-name").value.trim() &&
      storeSelect.value &&
      document.getElementById("field-shoe-size").value.trim() &&
      genders.shoe &&
      document.getElementById("field-clothing-size").value &&
      genders.clothing;
    profileBtn.disabled = !ok;
  }
  profileForm.addEventListener("input", validateProfile);
  profileForm.addEventListener("change", validateProfile);

  let currentUser = null;

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    profileBtn.disabled = true;
    profileBtn.textContent = "SAVING…";
    const row = {
      id: currentUser.id,
      email: currentUser.email,
      name: document.getElementById("field-name").value.trim(),
      store_name: storeSelect.value,
      shoe_size: document.getElementById("field-shoe-size").value.trim(),
      shoe_gender: genders.shoe,
      clothing_size: document.getElementById("field-clothing-size").value,
      clothing_gender: genders.clothing,
      favorite_snack: document.getElementById("field-snack").value.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await client.from("employees").upsert(row);
    if (error) {
      alert("Couldn't save your profile: " + error.message);
      profileBtn.disabled = false;
      profileBtn.textContent = "SAVE & CONTINUE";
      return;
    }
    await enterHome();
  });

  // ---------------------------------------------------------------------
  // Home: module grid
  // ---------------------------------------------------------------------
  const grid = document.getElementById("module-grid");

  async function enterHome() {
    const emp = await Session.getEmployee();
    if (!emp || !emp.store_name) {
      show("profile");
      return;
    }
    // Deep link back to a module/test after magic-link sign-in
    const next = new URLSearchParams(location.search).get("next");
    if (next && /^\/?(module|test)\.html/.test(next)) {
      window.location.replace(next);
      return;
    }
    Session.renderUserChip(emp);
    show("home");
    await renderModules(emp);
  }

  async function renderModules(emp) {
    const [{ data: products }, { data: enabled }, { data: progress }] = await Promise.all([
      client.from("products").select("*").eq("active", true).order("sort"),
      client.from("store_products").select("product_id, enabled").eq("store_name", emp.store_name),
      client.rpc("my_progress"),
    ]);
    const enabledIds = new Set((enabled || []).filter((r) => r.enabled).map((r) => r.product_id));
    // A store with no rows yet (new door) sees everything.
    const filterByStore = (enabled || []).length > 0;
    const list = (products || []).filter((p) => p.id === "full-lineup" || !filterByStore || enabledIds.has(p.id));
    const prog = progress || {};

    if (!list.length) {
      grid.innerHTML = `<div class="empty-state">No modules are turned on for ${escapeHtml(emp.store_name)} yet. Ask your Product Educator.</div>`;
      return;
    }
    grid.innerHTML = list
      .map((p) => {
        const pr = prog[p.id];
        const done = pr && pr.attempts > 0;
        const pct = done ? Math.round((pr.best / pr.best_total) * 100) : null;
        const status = done
          ? `<span class="module-status ${pct === 100 ? "perfect" : pct >= 70 ? "good" : ""}">Best ${pr.best}/${pr.best_total} · ${pr.attempts} attempt${pr.attempts === 1 ? "" : "s"}</span>`
          : `<span class="module-status new">Not started</span>`;
        return `
        <a class="module-card" href="module.html?p=${encodeURIComponent(p.id)}">
          <div class="module-card-img" style="background-image:url('images/${escapeHtml(p.hero_image || "")}')"></div>
          <div class="module-card-body">
            <div class="module-card-pillar">${escapeHtml(p.pillar || "All pillars")}</div>
            <div class="module-card-title">${escapeHtml(p.name)}</div>
            ${status}
          </div>
          <div class="module-card-cta">${done ? "RETAKE" : "START"} &rarr;</div>
        </a>`;
      })
      .join("");
  }

  // Certification test code
  document.getElementById("code-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("field-code").value.trim().toUpperCase();
    const err = document.getElementById("code-error");
    if (code.length < 6) {
      err.textContent = "Enter the 6-character code your Product Educator gave you.";
      err.classList.add("visible");
      return;
    }
    window.location.href = "test.html?code=" + encodeURIComponent(code);
  });

  // ---------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------
  async function boot() {
    preflight();
    // Supabase puts the magic-link token in the URL hash; the client picks
    // it up automatically. Wait for the auth state to settle.
    const { data } = await client.auth.getSession();
    currentUser = data.session ? data.session.user : null;
    client.auth.onAuthStateChange((_event, session) => {
      const u = session ? session.user : null;
      if (u && (!currentUser || currentUser.id !== u.id)) {
        currentUser = u;
        enterHome();
      }
    });
    if (!currentUser) {
      show("signin");
      return;
    }
    await enterHome();
  }
  boot();
})();
