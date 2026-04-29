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

  document.documentElement.classList.add("page-transitions");
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

function showFormModal(form, content, type) {
  const modal = form.querySelector("[data-form-modal]");
  const panel = form.querySelector("[data-form-modal-panel]");
  const mark = form.querySelector("[data-form-modal-mark]");
  const title = form.querySelector("[data-form-modal-title]");
  const text = form.querySelector("[data-form-modal-text]");
  const close = form.querySelector("[data-form-modal-close]");
  if (!modal || !panel) return;

  if (mark) mark.textContent = type === "success" ? "✓" : "!";
  if (title) title.textContent = content.title;
  if (text) text.textContent = content.message;
  panel.className = `form-modal__panel is-${type}`;
  modal.hidden = false;
  close?.focus({ preventScroll: true });

  window.clearTimeout(showFormModal.timeout);
  showFormModal.timeout = window.setTimeout(() => {
    modal.hidden = true;
  }, type === "success" ? 6200 : 5200);
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
          validation: "Complétez le nom, le contact et le message.",
          validationModal: {
            title: "Il manque une information",
            message: "Ajoutez votre nom, un téléphone ou email, puis un court message. Cela suffit pour envoyer la demande."
          },
          email: "L'adresse email semble incomplète.",
          emailModal: {
            title: "Email à vérifier",
            message: "L'adresse contient un @, mais son format ne semble pas complet. Corrigez-la ou indiquez simplement un numéro de téléphone."
          },
          success: "Demande envoyée. Réponse rapide.",
          successModal: {
            title: "Demande envoyée",
            message: "Merci. Votre message est bien parti, Pernet Paysages vous répondra rapidement."
          },
          error: "Le message n'a pas pu partir.",
          errorModal: {
            title: "Envoi impossible",
            message: "Le formulaire n'a pas pu envoyer la demande. Vous pouvez appeler le 079 243 72 24 ou écrire à pernet.paysages@gmail.com."
          },
          sending: "Envoi en cours..."
        }
      : {
          validation: "Please add your name, contact detail and message.",
          validationModal: {
            title: "One detail is missing",
            message: "Add your name, a phone number or email, then a short message. That is enough to send the request."
          },
          email: "The email address looks incomplete.",
          emailModal: {
            title: "Check the email",
            message: "The address contains an @, but the format does not look complete. Correct it or simply enter a phone number."
          },
          success: "Request sent. We will reply quickly.",
          successModal: {
            title: "Request sent",
            message: "Thank you. Your message has been sent, and Pernet Paysages will reply quickly."
          },
          error: "The message could not be sent.",
          errorModal: {
            title: "Could not send",
            message: "The form could not send the request. You can call 079 243 72 24 or email pernet.paysages@gmail.com."
          },
          sending: "Sending..."
        };

    if (honeypot?.checked) {
      event.preventDefault();
      return;
    }

    const contactValue = contact.value.trim();
    if (!name.value.trim() || !message.value.trim() || !contactValue) {
      event.preventDefault();
      setFeedback(feedback, text.validation, "error");
      showFormModal(form, text.validationModal, "error");
      return;
    }

    if (contactValue.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue)) {
      event.preventDefault();
      setFeedback(feedback, text.email, "error");
      showFormModal(form, text.emailModal, "error");
      return;
    }

    if (!window.fetch) return;

    event.preventDefault();
    const formData = new FormData(form);
    const submit = form.querySelector("button[type='submit']");
    const submitLabel = submit?.innerHTML;
    if (submit) {
      submit.disabled = true;
      submit.innerHTML = `<span>${text.sending}</span>`;
    }

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
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.innerHTML = submitLabel;
      }
    }
  });

  form.querySelector("[data-form-modal-close]")?.addEventListener("click", () => {
    const modal = form.querySelector("[data-form-modal]");
    if (modal) modal.hidden = true;
  });

  form.querySelector("[data-form-modal]")?.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) event.currentTarget.hidden = true;
  });

  document.addEventListener("keydown", (event) => {
    const modal = form.querySelector("[data-form-modal]");
    if (event.key === "Escape" && modal && !modal.hidden) modal.hidden = true;
  });
}

initPageTransitions();
initMobileMenu();
initReveal();
initContactForm();
