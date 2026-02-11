# Sujet 4 : Cabinet de conseil pour aider les entreprises à s’implanter

Vous êtes un cabinet de conseil qui aide les multinationales à s’implanter dans des régions comme l’Amérique Latine, l’Afrique ou l’Asie du Sud-Est en limitant des conflits avec les communautés locales et en leur donnant des conseils éthiques pour être bien vus (typiquement, apporter des avantages aux communautés locales).

Conseil : Montrez que “la consultation de votre cabinet fonctionne” en mettant en avant des cas d’investissement les choses se sont bien passées (= communauté favorable au projet et pas de violences et d’éviction). Le déplacement reste acceptable s’il est bien géré, idem pour les dégradations environnementales. Vous avez le droit de choisir certains cas en disant que votre cabinet y est intervenu ! Rien ne vous empêche d’ajouter une colonne fictive pour ça, il faut juste penser à le préciser quelque part (une note de bas de page ?).

Détails pour la notation
On doit vous noter sur la publication de couches et la création de cartes : du coup, vous n’êtes pas évalués sur tout les parties “architecture web” qu’on a vues en cours !

# Ce sur quoi vous êtes notés :

### Ce sur quoi vous êtes notés :

- GeoServer (publication de couches)
- OpenLayers
- Leaflet
- HTML et CSS basiques (styliser un minimum le contenu)

### Ce sur quoi vous n’êtes PAS notés :

Docker

Git

Déploiement du GeoServer

NodeJS

Important
Ne pas être noté sur les éléments ci-dessus, ça veut dire que vous pouvez (et DEVEZ) me demander de l’aide si ça coince quelque part. Envoyez-moi un mail si vous n’arrivez pas/plus à faire tourner votre architecture web ou même si vous avez du mal à mettre votre projet en ligne sur Git pour le rendu final.

Ajouter à sa carte absolument tous les éléments demandés ne permet pas d’atteindre la note maximale (mais déjà une très bonne note). Les derniers points sont accordés au style de la carte, sa mise en page et à des fonctionnalités supplémentaires que vous ajoutez (qu’on aura pas vues en cours, pour prouver que vous êtes capables de faire plus que répéter les éléments vus en TP).

On notera aussi le code en lui-même donc faites nous des commentaires utiles et indentez-le bien !

Éléments demandés à minima

Pour la partie GeoServer
Notée par Marie

Un GeoServer qui sert au moins une couche de points requêtable et une couche de polygones. Vous pouvez (et devrez probablement) servir plus de couches.

SOIT deux pages web, une pour Leaflet et une pour OpenLayers (option recommandée), SOIT une page web qui contient à la fois une carte OpenLayers et une carte Leaflet (peu recommandé, sauf si vous savez ce que vous faites).

Le code final build (npm run build) et visible sur le serveur de production localhost:80.

Le code mis en ligne sur un projet GitHub (on ne demande pas de branch, etc. mais juste d’avoir le code final sur GitHub).

Sur la/les page(s) web
Notée par les deux profs

Un titre

Vos noms

Un petit texte pour présenter votre choix de jeu de données. Si vous travaillez sur la donnée Land Matrix Agri, mettez-vous dans votre rôle. Vous êtes un lobby de l’agriculture ? Des défenseurs des droits des communautés locales ? Vous regardez où se trouve la production mondiale de soja et son augmentation par année ? Inventez-nous un peu de contexte pour votre site.

Sur la carte OpenLayers
Notée par Marie

Au moins 2 fonds de cartes, 1 couche WMS et 1 couche WFS.

Un menu pour choisir entre deux fonds de carte (utilisez des radio buttons).

Un menu qui permet d’afficher / masquer les autres couches de la carte.

Un menu qui vous permet de filtrer une des couches WMS (probablement “deals”).

Une couche accompagnée d’une table attributaire.

Une échelle et une légende*.

Comme on n’a pas pu voir la légende ensemble en cours, n’importe quelle méthode sera acceptée. Vous pouvez même la dessiner dans Inkscape/Illustrator et l’importer au format JPEG/PNG/SVG. Je vous conseille quand même d’aller voir dans le TP “enrichir ma carte”, j’ai donné des indices ;)

Sur la carte Leaflet
Notée par Bastien

Un menu de gestion des couches pour afficher/masquer :

Deux fonds de base (carte/satellite par exemple)

Une ou plusieurs couches personnalisées (on doit pouvoir afficher plusieurs couches personnalisées en même temps)

Au moins une couche personnalisée avec :

Un stle défini dynamiquement selon les attributs (donc avec une fonction !)

Un popup (soigné si possible) qui s’affiche au clic sur une entité

Rendu
Le rendu est attendu avant le 8 Février 2026. Quand votre code est en ligne sur GitHub, prévenez-nous par mail : marie.gradeler@gmail.com et bastien.cahier@gmail.com.

Allez, au travail ! Faites-nous de magnifiques cartes !