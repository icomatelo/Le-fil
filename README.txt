LE FIL - Projet Netlify avec médias indépendants et traduction

Le backend récupère les flux RSS de Blast, Mediapart, Reporterre, Basta!, The Intercept,
ProPublica, Democracy Now!, openDemocracy, DeSmog et Follow the Money selon les rubriques.
Les titres et résumés des flux non francophones sont traduits en français à l'affichage.
Le titre original reste visible sous le titre traduit. Les liens ouvrent toujours l'article source.

La traduction utilise actuellement le point d'accès public Google Translate (non contractuel,
sans garantie de disponibilité ni de quota). Pour une exploitation durable, remplacer ce
service par une API de traduction avec clé secrète configurée dans Netlify.
Les traductions portent uniquement sur les titres et extraits RSS, pas sur le texte intégral
des articles. Les conditions d'utilisation et droits de chaque éditeur restent applicables.

Déploiement :
1. Créer un dépôt GitHub nommé lefil.
2. Déposer à sa racine index.html, netlify.toml et le dossier netlify/.
3. Dans Netlify : Add new site > Import an existing project > GitHub.
4. Sélectionner le dépôt. Publier le dossier racine (.) sans commande de build.
5. Utiliser l'adresse *.netlify.app fournie.

Les flux sont publics et peuvent changer. Les flux en erreur sont ignorés, les autres continuent.
