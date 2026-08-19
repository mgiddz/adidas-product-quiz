// js/auth.js — login.html only. Handles sign-in and colleague self-signup
// against Supabase Auth. See supabase/schema.sql for the `profiles` table
// and trigger that gives every new signup a row keyed to their store.
(function () {
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const signinPanel = document.getElementById("signin-panel");
  const signupPanel = document.getElementById("signup-panel");
  const showSigninBtn = document.getElementById("show-signin");
  const showSignupBtn = document.getElementById("show-signup");
  const errorBox = document.getElementById("auth-error");
  const successBox = document.getElementById("auth-success");
  const storeSelect = document.getElementById("signup-store");

  (typeof STORE_LOCATIONS !== "undefined" ? STORE_LOCATIONS : []).forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    storeSelect.appendChild(opt);
  });

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("hidden");
    successBox.classList.add("hidden");
  }

  function showSuccess(msg) {
    successBox.textContent = msg;
    successBox.classList.remove("hidden");
    errorBox.classList.add("hidden");
  }

  function clearMessages() {
    errorBox.classList.add("hidden");
    successBox.classList.add("hidden");
  }

  showSignupBtn.addEventListener("click", () => {
    showSignupBtn.classList.add("active");
    showSigninBtn.classList.remove("active");
    signupPanel.classList.remove("hidden");
    signinPanel.classList.add("hidden");
    clearMessages();
  });

  showSigninBtn.addEventListener("click", () => {
    showSigninBtn.classList.add("active");
    showSignupBtn.classList.remove("active");
    signinPanel.classList.remove("hidden");
    signupPanel.classList.add("hidden");
    clearMessages();
  });

  signinPanel.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessages();
    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value;
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      showError(error.message);
      return;
    }
    window.location.href = "dashboard.html";
  });

  signupPanel.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessages();
    const store = storeSelect.value;
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;

    if (!store) {
      showError("Please select your store.");
      return;
    }
    if (password.length < 8) {
      showError("Password must be at least 8 characters.");
      return;
    }

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { store_name: store } },
    });

    if (error) {
      showError(error.message);
      return;
    }

    if (data.session) {
      window.location.href = "dashboard.html";
    } else {
      showSuccess("Account created! Check your email to confirm it, then sign in above.");
      signupPanel.reset();
    }
  });

  // Already signed in? Skip straight to the dashboard.
  client.auth.getSession().then(({ data }) => {
    if (data.session) window.location.href = "dashboard.html";
  });
})();
