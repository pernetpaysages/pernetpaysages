export const projects = {
  fr: [
    {
      slug: "projet-01",
      title: "Jardin de villa à Morges",
      city: "Morges",
      type: "Création / rénovation",
      cover: "/media/realisations/projet-01/cover.jpg",
      description: "Recomposition des espaces extérieurs pour structurer les circulations, renforcer la presence vegetale et simplifier l'entretien.",
      services: ["Conception paysagère", "Plantations", "Revêtements extérieurs"],
      constraints: "Topographie existante et harmonisation avec les volumes de la villa.",
      result: "Un jardin lisible, equilibre et agreable a vivre au quotidien.",
      gallery: [
        "/media/realisations/projet-01/01.jpg",
        "/media/realisations/projet-01/02.jpg",
        "/media/realisations/projet-01/avant.jpg"
      ]
    },
    {
      slug: "projet-02",
      title: "Aménagement extérieur à Lausanne",
      city: "Lausanne",
      type: "Aménagement complet",
      cover: "/media/realisations/projet-02/cover.jpg",
      description: "Travail sur les surfaces et les plantations pour creer un extérieur cohérent et durable.",
      services: ["Terrassement", "Plantations", "Mise en gazon"],
      constraints: "Delais serres et coordination avec d'autres intervenants.",
      result: "Un espace fluide et soigne, adapté aux usages du lieu.",
      gallery: ["/media/realisations/projet-02/01.jpg", "/media/realisations/projet-02/02.jpg"]
    },
    {
      slug: "projet-03",
      title: "Plantations et surfaces a Nyon",
      city: "Nyon",
      type: "Plantations / surfaces",
      cover: "/media/realisations/projet-03/cover.jpg",
      description: "Selection vegetale et traitement des sols pour valoriser l'extérieur tout au long des saisons.",
      services: ["Plantations", "Revêtements", "Entretien initial"],
      constraints: "Exposition variable et besoins de maintenance limites.",
      result: "Un ensemble vegetal stable et une lecture plus nette des espaces.",
      gallery: ["/media/realisations/projet-03/01.jpg", "/media/realisations/projet-03/02.jpg"]
    },
    {
      slug: "projet-04",
      title: "Jardin prive a Pully",
      city: "Pully",
      type: "Rénovation",
      cover: "/media/realisations/projet-04/cover.jpg",
      description: "Rafraichissement du jardin existant avec une intervention sobre et fonctionnelle.",
      services: ["Rénovation", "Taille", "Soins saisonniers"],
      constraints: "Conserver l'identite du lieu tout en modernisant l'extérieur.",
      result: "Un jardin plus structure et plus simple a entretenir.",
      gallery: ["/media/realisations/projet-04/01.jpg", "/media/realisations/projet-04/02.jpg"]
    },
    {
      slug: "projet-05",
      title: "Entretien soigne dans l'arc lémanique",
      city: "Arc lemanique",
      type: "Entretien",
      cover: "/media/realisations/projet-05/cover.jpg",
      description: "Suivi régulier de jardins privés pour maintenir leur qualite dans la duree.",
      services: ["Entretien de jardin", "Taille", "Soins saisonniers"],
      constraints: "Intervenir avec regularite sans perturber la vie des occupants.",
      result: "Des extérieurs suivis, propres et harmonieux en toutes saisons.",
      gallery: ["/media/realisations/projet-05/01.jpg", "/media/realisations/projet-05/02.jpg"]
    },
    {
      slug: "projet-06",
      title: "Escaliers et revetements extérieurs",
      city: "Canton de Vaud",
      type: "Ouvrages extérieurs",
      cover: "/media/realisations/projet-06/cover.jpg",
      description: "Mise en oeuvre de circulations extérieures robustes et cohérentes avec le jardin.",
      services: ["Escaliers extérieurs", "Pierre naturelle", "Finitions"],
      constraints: "Gestion des pentes et integration esthetique dans l'existant.",
      result: "Des acces confortables et un extérieur mieux compose.",
      gallery: ["/media/realisations/projet-06/01.jpg", "/media/realisations/projet-06/02.jpg"]
    }
  ],
  en: []
};

projects.en = projects.fr.map((p, index) => {
  const translated = [
    {
      title: "Villa garden in Morges",
      type: "Création / rénovation",
      description: "Outdoor areas reshaped to improve circulation, strengthen planting and simplify long-term care.",
      constraints: "Existing levels and alignment with the villa's architecture.",
      result: "A clear, balanced garden designed for daily use."
    },
    {
      title: "Outdoor layout in Lausanne",
      type: "Complete landscaping",
      description: "Surface work and planting designed to create a cohesive and durable exterior.",
      constraints: "Tight schedule and coordination with other trades.",
      result: "A refined and practical outdoor setting aligned with how the site is used."
    },
    {
      title: "Planting and surfaces in Nyon",
      type: "Planting / surfaces",
      description: "Plant sélection and ground treatment to enhance the garden throughout the seasons.",
      constraints: "Variable exposure and low-maintenance expectations.",
      result: "A stable planting scheme and clearer spatial structure."
    },
    {
      title: "Private garden in Pully",
      type: "Rénovation",
      description: "A careful refresh of the existing garden through understated, functional interventions.",
      constraints: "Preserve the spirit of the place while updating the exterior.",
      result: "A more structured garden that is easier to maintain."
    },
    {
      title: "Care-focused maintenance across the Lake Geneva region",
      type: "Maintenance",
      description: "Regular care for private gardens to preserve quality over time.",
      constraints: "Consistent interventions while respecting occupants' routines.",
      result: "Clean, balanced and well-kept gardens all year round."
    },
    {
      title: "Outdoor steps and surface finishes",
      type: "Exterior construction",
      description: "Execution of robust outdoor circulation elements integrated with the landscape.",
      constraints: "Slope management and cohérent integration with existing features.",
      result: "Comfortable access paths and a more composed outdoor environment."
    }
  ][index];

  return {
    ...p,
    ...translated,
    services: p.services
  };
});



