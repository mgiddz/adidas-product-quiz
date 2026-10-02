// js/session.js — shared auth + helpers for the v2 employee pages
// (index.html, module.html, test.html). Loaded after config.js.
//
// Employees sign in with a Supabase magic link (no password). Their record
// lives in `employees` (keyed to auth.users.id). Staff (PEs/admins) use
// login.html + `profiles` instead — a staff user can still take modules,
// they just also get an employee row the first time they do.

const Session = (() => {
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  async function getUser() {
    const { data } = await client.auth.getSession();
    return data.session ? data.session.user : null;
  }

  async function getEmployee() {
    const user = await getUser();
    if (!user) return null;
    const { data } = await client.from("employees").select("*").eq("id", user.id).maybeSingle();
    return data;
  }

  async function sendMagicLink(email, redirectTo) {
    return client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo || window.location.origin + "/index.html" },
    });
  }

  async function signOut() {
    await client.auth.signOut();
    window.location.href = "index.html";
  }

  // Sends the person to index.html (sign-in / profile) if they aren't a
  // signed-in employee with a completed profile. Returns the employee row.
  async function requireEmployee() {
    const user = await getUser();
    if (!user) {
      window.location.replace("index.html?next=" + encodeURIComponent(location.pathname + location.search));
      return null;
    }
    const emp = await getEmployee();
    if (!emp || !emp.store_name) {
      window.location.replace("index.html?next=" + encodeURIComponent(location.pathname + location.search));
      return null;
    }
    return emp;
  }

  function fmtDate(iso) {
    return iso ? new Date(iso).toLocaleDateString() : "";
  }

  // Header user chip: "Name · Store · Sign out"
  function renderUserChip(emp) {
    const el = document.getElementById("user-chip");
    if (!el || !emp) return;
    el.innerHTML = `<span class="chip-name">${escapeHtml(emp.name || emp.email)}</span>
      <span class="chip-store">${escapeHtml(emp.store_name || "")}</span>
      <button type="button" class="btn-link light" id="chip-signout">Sign out</button>`;
    el.classList.remove("hidden");
    document.getElementById("chip-signout").addEventListener("click", signOut);
  }

  return { client, escapeHtml, getUser, getEmployee, sendMagicLink, signOut, requireEmployee, fmtDate, renderUserChip };
})();
