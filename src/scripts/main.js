import "../styles/main.css";

function initPageTransitions() {
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const supportsTransitions = !motionQuery.matches;

  const setReady = () => {
    document.body.classList.remove("is-leaving");
    document.body.classList.add("is-ready");
  };

  if (!supportsTransitions) {
    document.documentElement.classList.remove("page-transitions");
    setReady();
    return;
  }

  window.addEventListener("pageshow", setReady);
  setReady();

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest("a[href]");
    if (!link) return;
    if (link.target && link.target !== "_self") return;
    if (link.hasAttribute("download")) return;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return;

    event.preventDefault();
    document.body.classList.add("is-leaving");

    window.setTimeout(() => {
      window.location.href = url.href;
    }, 170);
  });
}

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

function showFormModal(form, message, type) {
  const modal = form.querySelector("[data-form-modal]");
  const panel = form.querySelector("[data-form-modal-panel]");
  if (!modal || !panel) return;

  panel.textContent = message;
  panel.className = `form-modal__panel is-${type}`;
  modal.hidden = false;

  window.clearTimeout(showFormModal.timeout);
  showFormModal.timeout = window.setTimeout(() => {
    modal.hidden = true;
  }, type === "success" ? 5200 : 4200);
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
          validation: "ERROR: il manque votre nom, un téléphone ou email, ou votre message.",
          email: "Merci de renseigner une adresse email valide.",
          success: "Merci, votre message a bien été envoyé.",
          successModal: "Merci. Votre demande est bien partie, nous vous répondrons rapidement.",
          error: "ERROR: une erreur est survenue. Vous pouvez aussi nous contacter par email ou téléphone.",
          errorModal: "ERROR: le message n'a pas pu partir. Vous pouvez aussi appeler ou écrire par email."
        }
      : {
          validation: "ERROR: your name, phone or email, or message is missing.",
          email: "Please enter a valid email address.",
          success: "Thank you, your message has been sent.",
          successModal: "Thank you. Your request has been sent, and we will reply quickly.",
          error: "ERROR: something went wrong. You can also contact us by email or phone.",
          errorModal: "ERROR: the message could not be sent. You can also call or email."
        };

    if (honeypot?.checked) {
      event.preventDefault();
      return;
    }

    const contactValue = contact.value.trim();
    if (!name.value.trim() || !message.value.trim() || !contactValue) {
      event.preventDefault();
      setFeedback(feedback, text.validation, "error");
      showFormModal(form, text.validation, "error");
      return;
    }

    if (contactValue.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue)) {
      event.preventDefault();
      setFeedback(feedback, text.email, "error");
      showFormModal(form, text.email, "error");
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
      showFormModal(form, text.successModal, "success");
      form.reset();
    } catch {
      setFeedback(feedback, text.error, "error");
      showFormModal(form, text.errorModal, "error");
    }
  });
}

initPageTransitions();
initMobileMenu();
initReveal();
initContactForm();
