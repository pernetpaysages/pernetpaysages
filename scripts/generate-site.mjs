import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { copy, faqs, pages, projects, services, site } from "../src/data/site.js";

const root = process.cwd();
const languages = ["fr", "en"];
const pageKeys = ["home", "services", "projects", "about", "contact", "privacy", "legal"];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function attr(value) {
  return escapeHtml(value);
}

function stripTags(value) {
  return String(value).replace(/<[^>]*>/g, "");
}

function route(lang, key) {
  return site.routes[lang][key];
}

function otherLang(lang) {
  return lang === "fr" ? "en" : "fr";
}

function urlFor(path) {
  return new URL(path, site.baseUrl).toString();
}

function optimizedPath(path, ext = "jpg") {
  if (!path || path.startsWith("http") || path.includes("/optimized/")) return path;
  return path.replace(/^\/media\//, "/media/optimized/").replace(/\.(jpe?g|png)$/i, `.${ext}`);
}

function imageMarkup(path, alt, options = {}) {
  const {
    className = "",
    loading = "lazy",
    fetchpriority,
    sizes = "(min-width: 900px) 50vw, 100vw",
    decorative = false
  } = options;
  const jpg = optimizedPath(path, "jpg");
  const webp = optimizedPath(path, "webp");
  const loadingAttr = loading ? ` loading="${attr(loading)}"` : "";
  const priorityAttr = fetchpriority ? ` fetchpriority="${attr(fetchpriority)}"` : "";
  const classAttr = className ? ` class="${attr(className)}"` : "";
  const altText = decorative ? "" : alt;

  return `<picture${classAttr}>
    <source srcset="${attr(webp)}" type="image/webp" sizes="${attr(sizes)}" />
    <img src="${attr(jpg)}" alt="${attr(altText)}"${loadingAttr}${priorityAttr} decoding="async" />
  </picture>`;
}

function button(href, label, variant = "primary") {
  return `<a class="button button--${attr(variant)}" href="${attr(href)}"><span>${escapeHtml(label)}</span></a>`;
}

function pageImageAlt(lang, key, fallback) {
  const labels = {
    fr: {
      services: "Terrasse en pierre naturelle bordée de plantations",
      projects: "Escalier en pierre traversant un jardin planté",
      about: "Massifs fleuris entretenus dans un jardin résidentiel",
      contact: "Massifs et cheminements dans un jardin du canton de Vaud"
    },
    en: {
      services: "Natural stone terrace bordered by planting",
      projects: "Stone steps crossing a planted garden",
      about: "Flowering beds maintained in a residential garden",
      contact: "Planting beds and paths in a garden in Vaud"
    }
  };
  return labels[lang][key] || fallback;
}

function pageHeading(lang, key, label, title, lead, imagePath) {
  const image = imagePath
    ? `<div class="page-hero__media">${imageMarkup(imagePath, pageImageAlt(lang, key, title), { className: "media-frame", loading: "eager" })}</div>`
    : "";
  return `<section class="page-hero" aria-labelledby="${attr(key)}-title">
    <div class="container page-hero__grid">
      <div class="page-hero__copy">
        <p class="eyebrow">${escapeHtml(label)}</p>
        <h1 id="${attr(key)}-title">${escapeHtml(title)}</h1>
        <p class="lead">${escapeHtml(lead)}</p>
        <div class="hero-actions">
          ${button(route(lang, "contact"), copy[lang].quoteCta, "primary")}
          ${button(route(lang, "projects"), lang === "fr" ? "Voir les réalisations" : "View projects", "secondary")}
        </div>
      </div>
      ${image}
    </div>
  </section>`;
}

function schema(lang) {
  const description =
    lang === "fr"
      ? "Paysagiste à Morges pour la création, la rénovation et l'entretien de jardins dans le canton de Vaud."
      : "Landscaper in Morges for garden creation, renovation and maintenance across the canton of Vaud.";

  return {
    "@context": "https://schema.org",
    "@type": "LandscapingBusiness",
    "@id": `${site.baseUrl}/#business`,
    name: site.name,
    url: site.baseUrl,
    image: urlFor(site.images.og),
    telephone: site.phoneHref,
    email: site.email,
    description,
    priceRange: "Sur devis",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Morges",
      addressRegion: "Vaud",
      addressCountry: "CH"
    },
    areaServed: [
      "Morges",
      "Canton de Vaud",
      "Lausanne",
      "Arc lémanique"
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00"
    }
  };
}

function head(lang, key) {
  const meta = pages[lang][key];
  const langCode = copy[lang].locale;
  const canonical = urlFor(route(lang, key));
  const ogImage = urlFor(site.images.og);
  const alternateFr = urlFor(route("fr", key));
  const alternateEn = urlFor(route("en", key));
  const escapedTitle = escapeHtml(meta.title);
  const escapedDescription = escapeHtml(meta.description);

  return `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapedTitle}</title>
  <meta name="description" content="${escapedDescription}" />
  <link rel="canonical" href="${attr(canonical)}" />
  <link rel="alternate" hreflang="fr-CH" href="${attr(alternateFr)}" />
  <link rel="alternate" hreflang="en" href="${attr(alternateEn)}" />
  <link rel="alternate" hreflang="x-default" href="${attr(alternateFr)}" />
  <meta property="og:site_name" content="${attr(site.name)}" />
  <meta property="og:title" content="${escapedTitle}" />
  <meta property="og:description" content="${escapedDescription}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${attr(canonical)}" />
  <meta property="og:image" content="${attr(ogImage)}" />
  <meta property="og:locale" content="${attr(langCode)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapedTitle}" />
  <meta name="twitter:description" content="${escapedDescription}" />
  <meta name="twitter:image" content="${attr(ogImage)}" />
  <link rel="icon" href="/media/favicon.svg" type="image/svg+xml" />
  <script type="application/ld+json">${JSON.stringify(schema(lang))}</script>
  <script type="module" src="/src/scripts/main.js"></script>
</head>`;
}

function header(lang, activeKey) {
  const c = copy[lang];
  const frPath = route("fr", activeKey in site.routes.fr ? activeKey : "home");
  const enPath = route("en", activeKey in site.routes.en ? activeKey : "home");
  const nav = site.nav[lang]
    .map(([key, label]) => {
      const current = key === activeKey ? ' aria-current="page"' : "";
      return `<li><a class="nav-link" href="${attr(route(lang, key))}"${current}>${escapeHtml(label)}</a></li>`;
    })
    .join("");

  return `<a class="skip-link" href="#contenu">${escapeHtml(c.skip)}</a>
<header class="site-header" data-site-header>
  <div class="container site-header__inner">
    <a class="brand" href="${attr(route(lang, "home"))}" aria-label="${attr(site.name)}">
      <img src="/media/logo-symbol.svg" alt="" width="48" height="48" />
      <span>${escapeHtml(site.name)}</span>
    </a>
    <nav class="main-nav" aria-label="${lang === "fr" ? "Navigation principale" : "Main navigation"}">
      <ul>${nav}</ul>
    </nav>
    <div class="header-tools">
      <span class="lang-switch" aria-label="${lang === "fr" ? "Choix de langue" : "Language switcher"}">
        <a href="${attr(frPath)}"${lang === "fr" ? ' aria-current="true"' : ""}>FR</a>
        <span aria-hidden="true">/</span>
        <a href="${attr(enPath)}"${lang === "en" ? ' aria-current="true"' : ""}>EN</a>
      </span>
      ${button(route(lang, "contact"), c.quoteCta, "primary button--header")}
      <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu">
        <span class="menu-toggle__line" aria-hidden="true"></span>
        <span class="menu-toggle__line" aria-hidden="true"></span>
        <span class="sr-only">${escapeHtml(c.menu)}</span>
      </button>
    </div>
  </div>
  <nav id="mobile-menu" class="mobile-menu" data-mobile-menu hidden aria-label="${lang === "fr" ? "Navigation mobile" : "Mobile navigation"}">
    <div class="container">
      <ul>${nav}</ul>
      <div class="mobile-menu__cta">${button(route(lang, "contact"), c.quoteCta, "primary")}</div>
    </div>
  </nav>
</header>`;
}

function footer(lang) {
  const c = copy[lang];
  const nav = [
    ["services", site.nav[lang].find(([key]) => key === "services")[1]],
    ["projects", site.nav[lang].find(([key]) => key === "projects")[1]],
    ["about", site.nav[lang].find(([key]) => key === "about")[1]],
    ["contact", site.nav[lang].find(([key]) => key === "contact")[1]],
    ["privacy", lang === "fr" ? "Confidentialité" : "Privacy"],
    ["legal", lang === "fr" ? "Mentions légales" : "Legal notice"]
  ]
    .map(([key, label]) => `<a href="${attr(route(lang, key))}">${escapeHtml(label)}</a>`)
    .join("");

  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <img src="/media/logo-pernet-paysages.svg" alt="${attr(site.name)}" width="220" height="90" />
      <p>${escapeHtml(c.footerBaseline)}</p>
    </div>
    <div>
      <p class="footer-title">${escapeHtml(c.contactTitle)}</p>
      <p><a href="tel:${attr(site.phoneHref)}">${escapeHtml(site.phoneDisplay)}</a><br />
      <a href="mailto:${attr(site.email)}">${escapeHtml(site.email)}</a></p>
      <p>${escapeHtml(site.serviceArea[lang])}</p>
    </div>
    <div>
      <p class="footer-title">${escapeHtml(c.footerNav)}</p>
      <nav class="footer-nav" aria-label="${lang === "fr" ? "Liens de pied de page" : "Footer links"}">${nav}</nav>
    </div>
  </div>
</footer>`;
}

function layout(lang, key, main) {
  return `<!doctype html>
<html lang="${attr(copy[lang].locale)}">
${head(lang, key)}
<body>
${header(lang, key)}
<main id="contenu">
${main}
</main>
${footer(lang)}
</body>
</html>
`;
}

function ctaBlock(lang, title, text, linkLabel = copy[lang].quoteCta) {
  return `<section class="section">
  <div class="container">
    <div class="cta-band">
      <div>
        <p class="eyebrow">${lang === "fr" ? "Contact" : "Contact"}</p>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(text)}</p>
      </div>
      ${button(route(lang, "contact"), linkLabel, "light")}
    </div>
  </div>
</section>`;
}

function homePage(lang) {
  const c = copy[lang];
  const h = c.home;
  const featuredServices = services.filter((service) => service.featured).slice(0, 4);
  const previewProjects = projects.slice(0, 3);

  const proof = h.proof
    .map((item) => `<li><span>${escapeHtml(item)}</span></li>`)
    .join("");

  const serviceCards = featuredServices
    .map((service, index) => {
      const item = service[lang];
      return `<article class="service-teaser service-teaser--${index + 1}" data-reveal>
        <p class="service-teaser__number">0${index + 1}</p>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.short)}</p>
        <a class="text-link" href="${attr(route(lang, "services"))}#${attr(service.id)}">${lang === "fr" ? "Détail de la prestation" : "Service details"}</a>
      </article>`;
    })
    .join("");

  const projectCards = previewProjects
    .map((project) => projectCard(project, lang, true))
    .join("");

  const steps = c.method
    .map(([title, text], index) => `<article class="step" data-reveal>
      <span class="step__index">${String(index + 1).padStart(2, "0")}</span>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(text)}</p>
    </article>`)
    .join("");

  return layout(lang, "home", `<section class="home-hero" aria-labelledby="home-title">
  ${imageMarkup(site.images.hero, lang === "fr" ? "Jardin avec escalier en pierre et vue sur le Léman" : "Garden with stone steps and a Lake Geneva view", {
    className: "home-hero__image",
    loading: "eager",
    fetchpriority: "high",
    sizes: "100vw"
  })}
  <div class="home-hero__shade" aria-hidden="true"></div>
  <div class="container home-hero__content">
    <p class="eyebrow">${escapeHtml(h.eyebrow)}</p>
    <h1 id="home-title">${escapeHtml(h.h1)}</h1>
    <p>${escapeHtml(h.lead)}</p>
    <div class="hero-actions">
      ${button(route(lang, "contact"), c.quoteCta, "primary")}
      ${button(route(lang, "services"), c.secondaryCta, "light")}
    </div>
  </div>
</section>
<section class="trust-strip" aria-label="${lang === "fr" ? "Points de confiance" : "Trust points"}">
  <div class="container trust-strip__inner">
    <p>${escapeHtml(h.trust)}</p>
    <ul>${proof}</ul>
  </div>
</section>
<section class="section section--intro">
  <div class="container intro-grid">
    <div>
      <p class="eyebrow">${lang === "fr" ? "Prestations principales" : "Main services"}</p>
      <h2>${escapeHtml(h.servicesTitle)}</h2>
    </div>
    <p class="lead">${escapeHtml(h.servicesLead)}</p>
  </div>
  <div class="container service-teaser-grid">${serviceCards}</div>
</section>
<section class="section section--stone">
  <div class="container section-head">
    <div>
      <p class="eyebrow">${lang === "fr" ? "Réalisations" : "Projects"}</p>
      <h2>${escapeHtml(h.projectsTitle)}</h2>
    </div>
    <p>${escapeHtml(h.projectsLead)}</p>
  </div>
  <div class="container project-preview-grid">${projectCards}</div>
  <div class="container section-action">${button(route(lang, "projects"), lang === "fr" ? "Voir la galerie" : "View the gallery", "secondary")}</div>
</section>
<section class="section">
  <div class="container section-head">
    <div>
      <p class="eyebrow">${lang === "fr" ? "Méthode" : "Method"}</p>
      <h2>${escapeHtml(h.methodTitle)}</h2>
    </div>
  </div>
  <div class="container steps-grid">${steps}</div>
</section>
<section class="section section--split">
  <div class="container split-layout">
    <div class="split-layout__copy">
      <p class="eyebrow">${lang === "fr" ? "À propos" : "About"}</p>
      <h2>${escapeHtml(h.aboutTitle)}</h2>
      <p>${escapeHtml(h.aboutText)}</p>
      ${button(route(lang, "about"), lang === "fr" ? "Découvrir l'entreprise" : "About the business", "secondary")}
    </div>
    <div class="split-layout__media">${imageMarkup(site.images.about, lang === "fr" ? "Massifs et entretien paysager" : "Planting beds and landscape maintenance", { className: "media-frame media-frame--tall" })}</div>
  </div>
</section>
${ctaBlock(lang, h.finalCtaTitle, h.finalCtaText)}
`);
}

function servicesPage(lang) {
  const c = copy[lang];
  const page = c.servicesPage;
  const serviceLinks = services
    .map((service) => `<a href="#${attr(service.id)}">${escapeHtml(service[lang].title)}</a>`)
    .join("");

  const serviceDetails = services
    .map((service, index) => {
      const item = service[lang];
      const includes = item.includes.map((include) => `<li>${escapeHtml(include)}</li>`).join("");
      return `<article id="${attr(service.id)}" class="service-detail" data-reveal>
        <div class="service-detail__index">${String(index + 1).padStart(2, "0")}</div>
        <div class="service-detail__body">
          <h2>${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.short)}</p>
          <p><strong>${lang === "fr" ? "Bénéfice client:" : "Client benefit:"}</strong> ${escapeHtml(item.benefit)}</p>
        </div>
        <div class="service-detail__aside">
          <h3>${lang === "fr" ? "Inclus selon projet" : "Included by project"}</h3>
          <ul>${includes}</ul>
          ${button(`${route(lang, "contact")}?service=${service.id}`, c.quoteCta, "secondary")}
        </div>
      </article>`;
    })
    .join("");

  const faqItems = faqs[lang]
    .map(([question, answer]) => `<article class="faq-item" data-reveal>
      <h3>${escapeHtml(question)}</h3>
      <p>${escapeHtml(answer)}</p>
    </article>`)
    .join("");

  return layout(lang, "services", `${pageHeading(lang, "services", page.eyebrow, page.h1, page.lead, site.images.services)}
<section class="section section--tight">
  <div class="container service-index">
    <p class="eyebrow">${escapeHtml(page.introTitle)}</p>
    <nav aria-label="${lang === "fr" ? "Liste des prestations" : "Service list"}">${serviceLinks}</nav>
  </div>
</section>
<section class="section">
  <div class="container service-detail-list">${serviceDetails}</div>
</section>
<section class="section section--stone">
  <div class="container section-head">
    <div>
      <p class="eyebrow">FAQ</p>
      <h2>${escapeHtml(page.faqTitle)}</h2>
    </div>
  </div>
  <div class="container faq-grid">${faqItems}</div>
</section>
${ctaBlock(lang, lang === "fr" ? "Un projet à cadrer ?" : "Need to frame a project?", lang === "fr" ? "Expliquez le contexte du jardin, même brièvement. Une réponse claire vaut mieux qu'un long formulaire." : "Briefly explain the garden context. A clear message is better than a long form.")}
`);
}

function projectCard(project, lang, compact = false) {
  const tags = project.tags[lang].map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  const gallery = compact
    ? ""
    : `<div class="project-card__gallery">
      ${project.gallery.map((image, index) => imageMarkup(image, `${project.title[lang]} ${index + 1}`, { className: "project-thumb" })).join("")}
    </div>`;

  return `<article class="project-card${compact ? " project-card--compact" : ""}" data-reveal>
    <div class="project-card__media">${imageMarkup(project.cover, project.title[lang], { className: "project-cover" })}</div>
    <div class="project-card__body">
      <p class="eyebrow">${escapeHtml(project.location[lang])} · ${escapeHtml(project.category[lang])}</p>
      <h3>${escapeHtml(project.title[lang])}</h3>
      <p>${escapeHtml(project.description[lang])}</p>
      <div class="tag-list">${tags}</div>
      ${gallery}
    </div>
  </article>`;
}

function projectsPage(lang) {
  const c = copy[lang];
  const page = c.projectsPage;
  const categories = [...new Set(projects.map((project) => project.category[lang]))]
    .map((category) => `<span>${escapeHtml(category)}</span>`)
    .join("");
  const cards = projects.map((project) => projectCard(project, lang)).join("");

  return layout(lang, "projects", `${pageHeading(lang, "projects", page.eyebrow, page.h1, page.lead, site.images.projects)}
<section class="section section--tight">
  <div class="container category-rail" aria-label="${lang === "fr" ? "Catégories de projets" : "Project categories"}">${categories}</div>
</section>
<section class="section section--stone">
  <div class="container projects-grid">${cards}</div>
</section>
${ctaBlock(lang, page.ctaTitle, page.ctaText)}
`);
}

function aboutPage(lang) {
  const c = copy[lang];
  const page = c.aboutPage;
  const sections = page.sections
    .map(([title, text]) => `<article class="about-block" data-reveal>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(text)}</p>
    </article>`)
    .join("");

  return layout(lang, "about", `${pageHeading(lang, "about", page.eyebrow, page.h1, page.lead, site.images.about)}
<section class="section">
  <div class="container about-grid">${sections}</div>
</section>
${ctaBlock(lang, lang === "fr" ? "Un échange direct pour votre jardin" : "A direct conversation about your garden", lang === "fr" ? "Décrivez votre besoin: création, entretien, rénovation, terrasse, plantation ou intervention technique." : "Describe what you need: creation, maintenance, renovation, terrace, planting or technical work.")}
`);
}

function contactForm(lang) {
  const c = copy[lang].contactPage.form;
  const projectOptions =
    lang === "fr"
      ? ["Création paysagère", "Rénovation", "Entretien régulier", "Terrasse ou revêtement", "Plantations ou gazon", "Élagage ou abattage", "Autre demande"]
      : ["Landscape creation", "Renovation", "Regular maintenance", "Terrace or surface", "Planting or lawn", "Tree pruning or felling", "Other request"];
  const options = projectOptions.map((option) => `<option value="${attr(option)}">${escapeHtml(option)}</option>`).join("");

  return `<form class="form" data-contact-form data-lang="${attr(lang)}" method="POST" action="https://api.web3forms.com/submit">
    <input type="hidden" name="access_key" value="${attr(site.web3FormsAccessKey)}" />
    <input type="hidden" name="subject" value="${lang === "fr" ? "Nouvelle demande de devis - Pernet Paysages" : "New quote request - Pernet Paysages"}" />
    <input type="hidden" name="from_name" value="Site Pernet Paysages" />
    <input type="checkbox" name="botcheck" class="honeypot" tabindex="-1" autocomplete="off" />
    <div class="field">
      <label for="name">${escapeHtml(c.name)} *</label>
      <input id="name" name="name" autocomplete="name" required />
    </div>
    <div class="form-row">
      <div class="field">
        <label for="email">${escapeHtml(c.email)}</label>
        <input id="email" name="email" type="email" autocomplete="email" />
      </div>
      <div class="field">
        <label for="phone">${escapeHtml(c.phone)}</label>
        <input id="phone" name="phone" type="tel" autocomplete="tel" />
      </div>
    </div>
    <div class="form-row">
      <div class="field">
        <label for="commune">${escapeHtml(c.commune)}</label>
        <input id="commune" name="commune" autocomplete="address-level2" />
      </div>
      <div class="field">
        <label for="project_type">${escapeHtml(c.projectType)}</label>
        <select id="project_type" name="project_type">
          <option value="">${lang === "fr" ? "Sélectionner" : "Select"}</option>
          ${options}
        </select>
      </div>
    </div>
    <div class="field">
      <label for="message">${escapeHtml(c.message)} *</label>
      <textarea id="message" name="message" required></textarea>
    </div>
    <button class="button button--primary" type="submit">${escapeHtml(copy[lang].quoteCta)}</button>
    <p class="form-note">${escapeHtml(c.consent)}</p>
    <p class="form-feedback" data-form-feedback aria-live="polite"></p>
    <noscript><p class="form-note">${escapeHtml(c.fallback)}</p></noscript>
  </form>`;
}

function contactPage(lang) {
  const c = copy[lang];
  const page = c.contactPage;
  const prepare = page.prepare.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  return layout(lang, "contact", `${pageHeading(lang, "contact", page.eyebrow, page.h1, page.lead, site.images.contact)}
<section class="section">
  <div class="container contact-grid">
    <div>
      <div class="contact-actions">
        ${button(`tel:${site.phoneHref}`, `${c.phoneCta} ${site.phoneDisplay}`, "primary")}
        ${button(`mailto:${site.email}`, c.emailCta, "secondary")}
      </div>
      <div class="contact-note">
        <p><strong>${lang === "fr" ? "Zone d’intervention" : "Service area"}</strong></p>
        <p>${escapeHtml(site.serviceArea[lang])}</p>
      </div>
      <div class="prepare-box">
        <h2>${escapeHtml(page.prepareTitle)}</h2>
        <ul>${prepare}</ul>
      </div>
    </div>
    ${contactForm(lang)}
  </div>
</section>
`);
}

function legalPage(lang, key) {
  const content = copy[lang][key];
  const items = content.body
    .map(([title, text]) => `<section class="legal-section">
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(text)}</p>
    </section>`)
    .join("");

  return layout(lang, key, `<section class="page-hero page-hero--simple">
  <div class="container narrow">
    <p class="eyebrow">${key === "privacy" ? (lang === "fr" ? "Confidentialité" : "Privacy") : (lang === "fr" ? "Légal" : "Legal")}</p>
    <h1>${escapeHtml(content.h1)}</h1>
  </div>
</section>
<section class="section">
  <div class="container narrow legal-content">${items}</div>
</section>
`);
}

function rootIndex() {
  return `<!doctype html>
<html lang="fr-CH">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="refresh" content="0; url=/fr/" />
  <title>Pernet Paysages</title>
  <meta name="description" content="Pernet Paysages, paysagiste à Morges et dans le canton de Vaud." />
  <link rel="canonical" href="${attr(site.baseUrl)}/" />
  <link rel="icon" href="/media/favicon.svg" type="image/svg+xml" />
</head>
<body>
  <main>
    <h1>Pernet Paysages</h1>
    <p>Redirection vers <a href="/fr/">la version française</a>. English version: <a href="/en/">Pernet Paysages in English</a>.</p>
  </main>
</body>
</html>
`;
}

function notFoundPage() {
  const fr = copy.fr.notFound;
  const en = copy.en.notFound;
  return `<!doctype html>
<html lang="fr-CH">
${head("fr", "home").replace(pages.fr.home.title, "404 | Pernet Paysages").replace(pages.fr.home.description, "Page introuvable.")}
<body>
${header("fr", "home")}
<main id="contenu">
  <section class="section not-found">
    <div class="container not-found__grid">
      <div>
        <p class="eyebrow">404</p>
        <h1>${escapeHtml(fr.h1)}</h1>
        <p>${escapeHtml(fr.text)}</p>
        <div class="hero-actions">
          ${button(route("fr", "home"), fr.home, "primary")}
          ${button(route("fr", "contact"), fr.contact, "secondary")}
        </div>
      </div>
      <div>
        <p class="eyebrow">404</p>
        <h2>${escapeHtml(en.h1)}</h2>
        <p>${escapeHtml(en.text)}</p>
        <div class="hero-actions">
          ${button(route("en", "home"), en.home, "primary")}
          ${button(route("en", "contact"), en.contact, "secondary")}
        </div>
      </div>
    </div>
  </section>
</main>
${footer("fr")}
</body>
</html>
`;
}

function sitemap() {
  const paths = ["/", ...languages.flatMap((lang) => pageKeys.map((key) => route(lang, key)))];
  const urls = paths
    .map((path) => `  <url><loc>${escapeHtml(urlFor(path))}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function robots() {
  return `User-agent: *
Allow: /

Sitemap: ${site.baseUrl}/sitemap.xml
`;
}

function write(path, content) {
  const full = join(root, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content, "utf8");
}

write("index.html", rootIndex());
write("404.html", notFoundPage());
for (const lang of languages) {
  write(route(lang, "home").slice(1) + "index.html", homePage(lang));
  write(route(lang, "services").slice(1) + "index.html", servicesPage(lang));
  write(route(lang, "projects").slice(1) + "index.html", projectsPage(lang));
  write(route(lang, "about").slice(1) + "index.html", aboutPage(lang));
  write(route(lang, "contact").slice(1) + "index.html", contactPage(lang));
  write(route(lang, "privacy").slice(1) + "index.html", legalPage(lang, "privacy"));
  write(route(lang, "legal").slice(1) + "index.html", legalPage(lang, "legal"));
}
write("public/sitemap.xml", sitemap());
write("public/robots.txt", robots());

console.log("Generated static site pages.");
