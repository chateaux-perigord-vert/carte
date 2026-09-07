# Carte des chateaux du Perigord Vert

Site de la carte touristique reliant dix chateaux et villages entre Nontron
et Mareuil. Chaque lieu a sa fiche, tenue a jour par son proprietaire.

## Pour les proprietaires : modifier sa fiche

Chaque proprietaire recoit un lien personnel et secret, de la forme :

    https://chateauxenperigordvert.fr/edit/?c=beauvais-g1bp20fu

Ce lien ouvre directement sa fiche dans un formulaire. Il n'y a ni compte a
creer, ni mot de passe : le lien tient lieu de cle. Il ne donne acces qu'a
une seule fiche.

Le document `FICHE-PROPRIETAIRE.md` est concu pour etre imprime et remis a
chacun avec son lien.

Les liens sont conserves dans `liens-secrets.json`, **qui ne doit jamais
etre depose dans le depot public**. Gardez-le avec les mots de passe.

## Pour les administrateurs

`fiches/index.json` contient la position de chaque monument sur la carte, en
pourcentage de la largeur et de la hauteur de l'image. Ce fichier n'est pas
accessible aux proprietaires.

### Regler la position des points cliquables

Ouvrez la page en ajoutant `?calibrer` a la fin de l'adresse. Cliquez sur
chaque monument dans l'ordre demande. Les coordonnees exactes s'affichent en
bas, pretes a etre collees dans `index.json`.

A refaire si la carte est remplacee par une nouvelle version.

### Retirer un lieu

Ne supprimez rien. Remplissez le champ `statut` de la fiche concernee (voir
plus haut). La vignette reste dessinee sur la carte, la fiche annonce la
fermeture. Rien a retoucher dans l'image.

### Ajouter un lieu

1. Dessiner la vignette du nouveau chateau, dans le meme style que les autres
   (le prompt utilise est conserve dans `sources/`).
2. Ouvrir le fichier GIMP en couches de `sources/`, coller la vignette a sa
   position geographique, ecrire son nom dessous, reexporter en `carte.png`.
3. Creer `fiches/<id>.json` sur le modele d'un existant.
4. Ajouter la ligne correspondante dans `index.json`, puis relancer le mode
   calibrage pour poser le point cliquable.
5. Donner les droits d'edition au proprietaire concerne.

### Le service d'edition

`service/edition.js` est la seule piece qui ne soit pas un fichier statique.
Il recoit les saisies des proprietaires et reecrit les fiches dans le depot.
Il se deploie sur Cloudflare Workers, offre gratuite, sans base de donnees.

Trois variables sont a definir dans Cloudflare :

    GITHUB_TOKEN   secret — jeton GitHub "fine-grained" limite au seul depot
                   carte, permission Contents : Read and write
    LIENS          secret — le contenu de liens-secrets.json
    DEPOT          variable — chateaux-perigord-vert/carte

L'adresse du service deploye doit ensuite etre reportee dans `edit/index.html`,
variable `SERVICE` en haut du script.

Le service ne peut modifier que les champs de contenu d'une fiche. Le nom, le
type et la position du monument lui sont inaccessibles : une saisie erronee ne
peut donc pas deplacer un chateau sur la carte ni le faire disparaitre.

### Ajouter ou retirer un proprietaire

Les liens secrets sont dans `liens-secrets.json`. Pour revoquer un acces,
supprimer la ligne correspondante et mettre a jour la variable LIENS dans
Cloudflare. Pour en creer un, ajouter une ligne associant un nouveau lien
secret a l'identifiant de la fiche.

### Le dossier sources

`sources/` contient le fond aquarelle sans vignettes ni noms, les vignettes
detourees une par une, le fichier GIMP en couches, et les prompts ayant servi
a les produire. Un PNG aplati sans ses sources est un cul-de-sac : avec elles,
n'importe qui peut reprendre le travail. Ne le supprimez pas pour gagner de
la place.

### Essayer en local

Les navigateurs refusent de lire les fichiers de donnees en ouvrant
directement `index.html`. Depuis le dossier du projet :

    python3 -m http.server 8000

puis ouvrir <http://localhost:8000>.

## Structure

    index.html          toute la page : mise en forme et fonctionnement
    carte.png           la carte illustree
    fiches/index.json   liste des lieux et leurs positions (administrateurs)
    fiches/<id>.json    une fiche par lieu (proprietaire concerne)

Le site n'utilise aucune bibliotheque exterieure, aucune police distante et
aucun serveur. C'est un choix : tout ce qui vient d'ailleurs est une chose qui
peut disparaitre et casser la page. En l'etat, l'ensemble fonctionne hors ligne
et restera lisible dans vingt ans.

## Reprendre le projet

Le nom de domaine est la seule piece irremplacable : il est inscrit sur les
QR codes imprimes. Il doit rester au nom de la structure, avec renouvellement
automatique, et au moins deux personnes ayant acces au compte du bureau
d'enregistrement.

Tout le reste est remplacable. Si l'hebergement disparait, il suffit de
deposer ces fichiers ailleurs et de faire pointer le domaine dessus : les
QR codes continuent de fonctionner.
