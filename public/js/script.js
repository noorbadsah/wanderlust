(() => {
  "use strict";
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
})();

// Universal: Unauthorized edit/delete/add triggers login redirect
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.fake-login-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const redirectUrl = window.location.pathname;
      window.location.href = "/login?returnTo=" + encodeURIComponent(redirectUrl);
    });
  });
  document.querySelectorAll('.fake-owner-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      alert(`You can’t ${btn.dataset.action} this listing. Only the owner has access.`);
    });
  });
});
