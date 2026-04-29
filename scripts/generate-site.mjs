import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { copy, faqs, pages, projects, services, site } from "../src/data/site.js";

const root = process.cwd();
const languages = ["fr", "en"];
const pageKeys = ["home", "services", "projects", "about", "contact", "privacy", "legal"];
const responsiveWidths = [480, 760, 1100, 1600, 2200];

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

function variantPath(path, width, ext) {
  return path.replace(/\.(jpe?g|png|webp|avif)$/i, `-${width}.${ext}`);
}

function publicPathExists(path) {
  return existsSync(join(root, "public", path.replace(/^\//, "")));
}

function variantsFor(path, ext) {
  return responsiveWidths
    .map((width) => {
      const variant = variantPath(path, width, ext);
      return publicPathExists(variant) ? { width, path: variant } : null;
    })
    .filter(Boolean);
}

function srcsetFor(path, ext) {
  return variantsFor(path, ext)
    .map((variant) => `${variant.path} ${variant.width}w`)
    .join(", ");
}

function preloadImage(path, sizes = "100vw") {
  const avif = optimizedPath(path, "avif");
  const webp = optimizedPath(path, "webp");
  const avifSrcset = srcsetFor(avif, "avif");
  const webpSrcset = srcsetFor(webp, "webp");
  const srcset = avifSrcset || webpSrcset;
  const format = avifSrcset ? "avif" : "webp";
  const base = avifSrcset ? avif : webp;
  const variants = variantsFor(base, format);
  const href = variants.find((variant) => variant.width === 1100)?.path || variants.at(-1)?.path || base;
  const preloadHref = publicPathExists(href) ? href : base;
  const srcsetAttr = srcset ? ` imagesrcset="${attr(srcset)}"` : "";

  return `<link rel="preload" as="image" href="${attr(preloadHref)}"${srcsetAttr} imagesizes="${attr(sizes)}" type="image/${format}" fetchpriority="high" />`;
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
  const avif = optimizedPath(path, "avif");
  const webp = optimizedPath(path, "webp");
  const jpgSrcset = srcsetFor(jpg, "jpg");
  const avifSrcset = srcsetFor(avif, "avif");
  const webpSrcset = srcsetFor(webp, "webp");
  const loadingAttr = loading ? ` loading="${attr(loading)}"` : "";
  const priority = fetchpriority || (loading === "lazy" ? "low" : "");
  const priorityAttr = priority ? ` fetchpriority="${attr(priority)}"` : "";
  const classAttr = className ? ` class="${attr(className)}"` : "";
  const jpgSrcsetAttr = jpgSrcset ? ` srcset="${attr(jpgSrcset)}" sizes="${attr(sizes)}"` : "";
  const webpSrcsetValue = webpSrcset || webp;
  const altText = decorative ? "" : alt;

  return `<picture${classAttr}>
    ${avifSrcset ? `<source srcset="${attr(avifSrcset)}" type="image/avif" sizes="${attr(sizes)}" />` : ""}
    <source srcset="${attr(webpSrcsetValue)}" type="image/webp" sizes="${attr(sizes)}" />
    <img src="${attr(jpg)}"${jpgSrcsetAttr} alt="${attr(altText)}"${loadingAttr}${priorityAttr} decoding="async" />
  </picture>`;
}

function logoMarkup(className, width, height, loading = "eager") {
  const sizes = className === "footer-logo" ? "220px" : "(max-width: 520px) 152px, 210px";
  const avif = "/media/optimized/logo-pernet-paysages-wordmark-220.avif 220w, /media/optimized/logo-pernet-paysages-wordmark-420.avif 420w, /media/optimized/logo-pernet-paysages-wordmark-560.avif 560w";
  const webp = "/media/optimized/logo-pernet-paysages-wordmark-220.webp 220w, /media/optimized/logo-pernet-paysages-wordmark-420.webp 420w, /media/optimized/logo-pernet-paysages-wordmark-560.webp 560w";
  const loadingAttr = loading === "lazy" ? ` loading="lazy" fetchpriority="low"` : "";

  return `<picture class="${attr(className)}">
    <source srcset="${attr(avif)}" type="image/avif" sizes="${attr(sizes)}" />
    <source srcset="${attr(webp)}" type="image/webp" sizes="${attr(sizes)}" />
    <img src="/media/logo-pernet-paysages-wordmark.png" alt="${attr(site.name)}" width="${width}" height="${height}"${loadingAttr} decoding="async" />
  </picture>`;
}

function button(href, label, variant = "primary") {
  return `<a class="button button--${attr(variant)}" href="${attr(href)}"><span>${escapeHtml(label)}</span></a>`;
}

function whatsappMessage(lang) {
  return lang === "fr"
    ? "Bonjour Luca, je souhaite parler de mon jardin."
    : "Hello Luca, I would like to discuss a landscaping project.";
}

function whatsappLink(lang) {
  return `${site.whatsappHref}?text=${encodeURIComponent(whatsappMessage(lang))}`;
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

function pageHeading(lang, key, label, title, lead, imagePath, actions = "") {
  const sectionClass = key === "contact" ? "page-hero page-hero--contact" : "page-hero";
  const image = imagePath && key !== "contact"
    ? `<div class="page-hero__media">${imageMarkup(imagePath, pageImageAlt(lang, key, title), { className: "media-frame", loading: "eager" })}</div>`
    : "";
  const heroActions = actions || `
          ${button(route(lang, "contact"), copy[lang].quoteCta, "primary")}
          ${button(route(lang, "projects"), lang === "fr" ? "Voir les réalisations" : "View projects", "secondary")}`;
  return `<section class="${sectionClass}" aria-labelledby="${attr(key)}-title">
    <div class="container page-hero__grid">
      <div class="page-hero__copy">
        <p class="eyebrow">${escapeHtml(label)}</p>
        <h1 id="${attr(key)}-title">${escapeHtml(title)}</h1>
        <p class="lead">${escapeHtml(lead)}</p>
        <div class="hero-actions">
          ${heroActions}
        </div>
      </div>
      ${image}
    </div>
  </section>`;
}

function schema(lang) {
  const description =
    lang === "fr"
      ? "Paysagiste pour la création, la rénovation et l'entretien de jardins dans le canton de Vaud et sur l'arc lémanique."
      : "Landscaper for garden creation, renovation and maintenance across the canton of Vaud and the Lake Geneva region.";

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
      addressRegion: "Vaud",
      addressCountry: "CH"
    },
    areaServed: [
      "Canton de Vaud",
      "Arc lémanique",
      "Lake Geneva region"
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
  const preloadByPage = {
    home: preloadImage(site.images.hero, "100vw"),
    services: preloadImage(site.images.services, "(min-width: 900px) 44vw, 100vw"),
    projects: preloadImage(site.images.projects, "(min-width: 900px) 44vw, 100vw"),
    about: preloadImage(site.images.about, "(min-width: 900px) 44vw, 100vw"),
    contact: preloadImage(site.images.contact, "100vw")
  };
  const preload = preloadByPage[key] ? `  ${preloadByPage[key]}\n` : "";

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
  <meta name="theme-color" content="#123525" />
  <meta name="robots" content="index, follow" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <link rel="icon" href="/media/favicon.png" type="image/png" />
${preload}
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
      ${logoMarkup("brand-logo", 214, 104)}
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
      <a class="mobile-contact-link" href="${attr(route(lang, "contact"))}">${lang === "fr" ? "Contact" : "Contact"}</a>
      ${button(route(lang, "contact"), c.quoteCta, "primary button--header")}
      <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu" aria-label="${escapeHtml(c.menu)}">
        <span class="menu-toggle__line" aria-hidden="true"></span>
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
      ${logoMarkup("footer-logo", 260, 127, "lazy")}
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

function serviceIcon(id) {
  const icons = {
    conception: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 39V10" /><path d="M24 20c-6 0-10-3-12-8 6 0 10 3 12 8Z" /><path d="M24 29c7 0 12-4 14-11-7 0-12 4-14 11Z" /></svg>`,
    surfaces: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 32h24" /><path d="M16 24h22" /><path d="M10 40h22" /><path d="M28 10l10 10" /><path d="M23 15l10 10" /></svg>`,
    entretien: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M15 34c10-2 16-8 20-20" /><path d="M17 18c4 0 8 3 9 7" /><path d="M28 28c4 0 7 2 9 5" /><path d="M12 38h24" /></svg>`,
    plantations: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 38V15" /><path d="M24 26c-6 0-10-3-12-8 6 0 10 3 12 8Z" /><path d="M24 23c6 0 10-3 12-8-6 0-10 3-12 8Z" /><path d="M14 38h20" /></svg>`
  };

  return icons[id] ?? icons.conception;
}

function homePage(lang) {
  const c = copy[lang];
  const h = c.home;
  const homeServiceIds = ["conception", "surfaces", "entretien", "plantations"];
  const featuredServices = homeServiceIds
    .map((id) => services.find((service) => service.id === id))
    .filter(Boolean);
  const previewProjects = projects.slice(0, 4);

  const serviceCards = featuredServices
    .map((service, index) => {
      const item = service[lang];
      const title = service.id === "surfaces"
        ? (lang === "fr" ? "Aménagements extérieurs" : "Exterior works")
        : service.id === "entretien"
          ? (lang === "fr" ? "Entretien & suivi" : "Maintenance & care")
          : item.title;
      return `<article class="service-teaser service-teaser--${index + 1}" data-reveal>
        <span class="service-teaser__icon">${serviceIcon(service.id)}</span>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(item.short)}</p>
      </article>`;
    })
    .join("");

  const projectCards = previewProjects
    .map((project) => projectCard(project, lang, true))
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
      ${button(route(lang, "projects"), lang === "fr" ? "Voir les réalisations" : "View projects", "light")}
    </div>
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
<section class="section section--home-close">
  <div class="container home-close">
    <div class="home-close__about">
      <p class="eyebrow">${lang === "fr" ? "À propos" : "About"}</p>
      <h2>${escapeHtml(h.aboutTitle)}</h2>
      <p>${escapeHtml(h.aboutText)}</p>
      ${button(route(lang, "about"), lang === "fr" ? "Découvrir l'entreprise" : "About the business", "secondary")}
    </div>
    <div class="home-close__cta">
      <p class="eyebrow">${lang === "fr" ? "Contact" : "Contact"}</p>
      <h2>${escapeHtml(h.finalCtaTitle)}</h2>
      <p>${escapeHtml(h.finalCtaText)}</p>
      ${button(route(lang, "contact"), c.quoteCta, "primary")}
    </div>
  </div>
</section>
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

  if (compact) {
    return `<article class="project-card project-card--compact" data-reveal>
      <div class="project-card__media">${imageMarkup(project.cover, project.title[lang], { className: "project-cover" })}</div>
      <div class="project-card__body">
        <h3>${escapeHtml(project.title[lang])}</h3>
        <p>${escapeHtml(project.category[lang])}</p>
      </div>
    </article>`;
  }

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

  return `<form class="form" data-contact-form data-lang="${attr(lang)}" method="POST" action="https://api.web3forms.com/submit">
    <input type="hidden" name="access_key" value="${attr(site.web3FormsAccessKey)}" />
    <input type="hidden" name="subject" value="${lang === "fr" ? "Nouvelle demande de devis - Pernet Paysages" : "New quote request - Pernet Paysages"}" />
    <input type="hidden" name="from_name" value="Site Pernet Paysages" />
    <input type="checkbox" name="botcheck" class="honeypot" tabindex="-1" autocomplete="off" />
    <div class="field">
      <label for="name">${escapeHtml(c.name)} *</label>
      <input id="name" name="name" autocomplete="name" required />
    </div>
    <div class="field">
      <label for="contact">${escapeHtml(c.contact)} *</label>
      <input id="contact" name="contact" autocomplete="on" required />
    </div>
    <div class="field">
      <label for="message">${escapeHtml(c.message)} *</label>
      <textarea id="message" name="message" required></textarea>
    </div>
    <button class="button button--primary" type="submit">${escapeHtml(copy[lang].quoteCta)}</button>
    <p class="form-note">${escapeHtml(c.consent)}</p>
    <p class="form-feedback" data-form-feedback aria-live="polite"></p>
    <div class="form-modal" data-form-modal hidden role="status" aria-live="polite">
      <div class="form-modal__panel" data-form-modal-panel></div>
    </div>
    <noscript><p class="form-note">${escapeHtml(c.fallback)}</p></noscript>
  </form>`;
}

function contactPage(lang) {
  const c = copy[lang];
  const page = c.contactPage;
  const prepare = page.prepare.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const heroActions = `
          ${button(whatsappLink(lang), c.whatsappCta, "primary contact-hero")}
          ${button(`tel:${site.phoneHref}`, `${c.phoneCta} ${site.phoneDisplay}`, "secondary")}`;

  return layout(lang, "contact", `${pageHeading(lang, "contact", page.eyebrow, page.h1, page.lead, site.images.contact, heroActions)}
<section class="section">
  <div class="container contact-grid">
    ${contactForm(lang)}
    <div class="contact-side">
      <div class="contact-note">
        <p><strong>${lang === "fr" ? "Zone d’intervention" : "Service area"}</strong></p>
        <p>${escapeHtml(site.serviceArea[lang])}</p>
      </div>
      <div class="prepare-box">
        <h2>${escapeHtml(page.prepareTitle)}</h2>
        <ul>${prepare}</ul>
      </div>
    </div>
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
  <link rel="icon" href="/media/favicon.png" type="image/png" />
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
