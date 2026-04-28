# Informations à confirmer

- Confirmer l'année exacte du CFC de paysagiste: les contenus précédents mentionnaient 2013, un brief antérieur mentionnait 2014. La valeur est centralisée dans `src/data/site.js` avec `cfcYear: null` tant qu'elle n'est pas validée.
- Confirmer l'adresse postale complète et, si applicable, l'identifiant d'entreprise à afficher dans les mentions légales.
- Confirmer si le numéro `079 243 72 24` doit être proposé comme contact WhatsApp. Le site n'affiche pas de bouton WhatsApp tant que ce point n'est pas validé.
- Confirmer les lieux exacts des photos de réalisations avant d'utiliser des titres comme “Jardin de villa à Morges” ou “Aménagement extérieur à Lausanne”.
- Vérifier après déploiement que `https://pernet-paysages.ch/` sert bien la redirection statique vers `/fr/`.
- Ajouter ultérieurement une photo humaine réelle de l'entreprise si disponible. Le fichier `public/media/about.jpg` contient un filigrane indiquant une image générée par IA et n'est pas utilisé comme réalisation.
