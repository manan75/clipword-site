// Waitlist form: posts to the Google Apps Script web app in apps-script/Code.gs,
// which appends a row to the sign-up Sheet. Paste the deployment URL here (README, step 3).
const SIGNUP_URL = "https://script.google.com/macros/s/AKfycbzQEHAuQeaaFjRtaRHEqajaZZzVaYC3nqJ-BWQA-mnXadwcJxGz70H8elF2xJDFBEUIcw/exec";

(function () {
  const form = document.getElementById("join");
  if (!form) return;

  const email = form.querySelector("#email");
  const button = form.querySelector("button[type=submit]");
  const status = form.querySelector(".form-status");
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Which post or channel sent the visitor, e.g. ?ref=x or ?utm_source=linkedin. No personal data.
  const params = new URLSearchParams(location.search);
  const source = (params.get("ref") || params.get("utm_source") || "").slice(0, 40);

  function show(text, kind) {
    status.textContent = text;
    status.className = "form-status" + (kind ? " " + kind : "");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = email.value.trim();

    if (!EMAIL_RE.test(value) || value.length > 254) {
      email.setAttribute("aria-invalid", "true");
      show("Please enter a valid email address.", "err");
      email.focus();
      return;
    }
    email.removeAttribute("aria-invalid");

    if (!SIGNUP_URL) {
      show("Sign-ups open very soon. Please check back in a day or two.", "err");
      return;
    }

    const languages = [...form.querySelectorAll("input[name=lang]:checked")].map((box) => box.value);
    // URL-encoded body is a "simple" request, so the browser skips the CORS preflight
    // that Apps Script can't answer.
    const body = new URLSearchParams({
      email: value,
      languages: languages.join(","),
      source,
      website: form.querySelector("#website").value,
    });

    button.disabled = true;
    show("Adding you…");
    try {
      const response = await fetch(SIGNUP_URL, { method: "POST", body });
      const result = await response.json();
      if (result.ok) {
        form.querySelectorAll("input, button").forEach((el) => (el.disabled = true));
        show("You're on the list! We'll email you when the test opens.", "ok");
        return;
      }
      const messages = {
        email: "Please enter a valid email address.",
        busy: "Lots of sign-ups right now. Please try again in an hour.",
      };
      show(messages[result.error] || "Something went wrong. Please try again.", "err");
    } catch (error) {
      show("Couldn't reach the server. Check your connection and try again.", "err");
    }
    button.disabled = false;
  });
})();
