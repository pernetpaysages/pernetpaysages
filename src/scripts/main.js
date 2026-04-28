import "../styles/main.css";
import { projects } from "../data/content.js";`r`n`r`nconst BASE_URL = import.meta.env.BASE_URL || "/";`r`nconst withBase = (path) => `${BASE_URL}${String(path).replace(/^\/+/, "")}`;`r`n`r`nconst GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; // Replace with your GA4 id or keep placeholder to disable analytics.

function initAnalytics() {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") {
    return;
  }
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);
}

function initMobileMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-menu]");
  if (!button || !panel) return;

  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
  });
}

function initReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const items = document.querySelectorAll("[data-reveal]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );
  items.forEach((item) => observer.observe(item));
}

function initProjects() {
  const mount = document.querySelector("[data-projects]");
  if (!mount) return;
  const lang = mount.getAttribute("data-lang") || "fr";
  const list = projects[lang] || [];

  mount.innerHTML = list
    .map(
      (project) => `
      <article class="project-card" data-reveal>
        <img src="${withBase(project.cover)}" alt="${project.title}" loading="lazy" decoding="async" width="1200" height="800" />
        <div class="project-card__body">
          <p class="eyebrow">${project.city} · ${project.type}</p>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <div class="project-card__meta">
            <p><strong>${lang === "fr" ? "Prestations" : "Services"}:</strong> ${project.services.join(", ")}</p>
            <p><strong>${lang === "fr" ? "Contraintes" : "Constraints"}:</strong> ${project.constraints}</p>
            <p><strong>${lang === "fr" ? "Résultat" : "Outcome"}:</strong> ${project.result}</p>
          </div>
          <div class="project-gallery">
            ${project.gallery
              .map(
                (image, idx) =>
                  `<img src="${withBase(image)}" alt="${project.title} ${idx + 1}" loading="lazy" decoding="async" width="800" height="560" />`
              )
              .join("")}
          </div>
        </div>
      </article>
    `
    )
    .join("");
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  const feedback = document.querySelector("[data-form-feedback]");
  if (!form || !feedback) return;

  form.addEventListener("submit", async (event) => {
    const email = form.querySelector("#email");
    const phone = form.querySelector("#phone");
    const name = form.querySelector("#name");
    const message = form.querySelector("#message");
    const trap = form.querySelector("#company");

    if (trap.value.trim()) {
      event.preventDefault();
      return;
    }

    if (!name.value.trim() || !message.value.trim() || (!email.value.trim() && !phone.value.trim())) {
      event.preventDefault();
      feedback.textContent = form.dataset.lang === "fr"
        ? "Merci de renseigner votre nom, votre message et au moins un moyen de contact (email ou téléphone)."
        : "Please provide your name, message, and at least one contact method (email or phone).";
      feedback.className = "form-feedback is-error";
      return;
    }

    if (!window.fetch) return;

    event.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      if (!response.ok) throw new Error("Submission failed");

      feedback.textContent = form.dataset.lang === "fr"
        ? "Merci, votre message a bien été envoyé."
        : "Thank you, your message has been sent.";
      feedback.className = "form-feedback is-success";
      form.reset();
    } catch {
      feedback.textContent = form.dataset.lang === "fr"
        ? "Une erreur est survenue. Vous pouvez aussi nous contacter par email ou téléphone."
        : "Something went wrong. You can also contact us by email or phone.";
      feedback.className = "form-feedback is-error";
    }
  });
}

initAnalytics();
initMobileMenu();
initReveal();
initProjects();
initContactForm();




