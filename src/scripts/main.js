import "../styles/main.css";

function initMobileMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-menu]");
  if (!button || !panel) return;

  const setOpen = (open) => {
    button.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
  };

  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    setOpen(!expanded);
  });

  panel.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

function initReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  items.forEach((item) => observer.observe(item));
}

function setFeedback(feedback, message, type) {
  feedback.textContent = message;
  feedback.className = `form-feedback is-${type}`;
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  const feedback = document.querySelector("[data-form-feedback]");
  if (!form || !feedback) return;
  form.noValidate = true;

  form.addEventListener("submit", async (event) => {
    const name = form.querySelector("#name");
    const contact = form.querySelector("#contact");
    const message = form.querySelector("#message");
    const honeypot = form.querySelector("[name='botcheck']");
    const text = form.dataset.lang === "fr"
      ? {
          validation: "Merci de renseigner votre nom, un téléphone ou email, et votre message.",
          email: "Merci de renseigner une adresse email valide.",
          success: "Merci, votre message a bien été envoyé.",
          error: "Une erreur est survenue. Vous pouvez aussi nous contacter par email ou téléphone."
        }
      : {
          validation: "Please provide your name, phone or email, and message.",
          email: "Please enter a valid email address.",
          success: "Thank you, your message has been sent.",
          error: "Something went wrong. You can also contact us by email or phone."
        };

    if (honeypot?.checked) {
      event.preventDefault();
      return;
    }

    const contactValue = contact.value.trim();
    if (!name.value.trim() || !message.value.trim() || !contactValue) {
      event.preventDefault();
      setFeedback(feedback, text.validation, "error");
      return;
    }

    if (contactValue.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue)) {
      event.preventDefault();
      setFeedback(feedback, text.email, "error");
      return;
    }

    if (!window.fetch) return;

    event.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData
      });
      const result = await response.json().catch(() => ({ success: response.ok }));

      if (!response.ok || result.success === false) throw new Error("Submission failed");

      setFeedback(feedback, text.success, "success");
      form.reset();
    } catch {
      setFeedback(feedback, text.error, "error");
    }
  });
}

initMobileMenu();
initReveal();
initContactForm();
