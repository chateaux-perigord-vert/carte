# Carte des chateaux du Perigord Vert

Site de la carte touristique reliant dix chateaux et villages entre Nontron
et Mareuil. Chaque lieu a sa fiche, tenue a jour par son proprietaire.

## Pour les proprietaires : modifier votre fiche

1. Ouvrez le dossier `fiches/` sur GitHub.
2. Cliquez sur le fichier portant le nom de votre lieu, par exemple `beauvais.json`.
3. Cliquez sur l'icone crayon, en haut a droite.
4. Modifiez le texte **entre les guillemets**. Ne touchez ni aux guillemets,
   ni aux virgules, ni aux accolades.
5. Mettez la date du jour dans le champ `maj`.
6. Descendez en bas de page, cliquez sur **Commit changes**.

La modification est en ligne au bout d'une a deux minutes. Rechargez la carte
pour la voir.

Un champ laisse vide (`""`) ne s'affiche pas sur la fiche. C'est utile si vous
n'avez pas de site internet, par exemple.

### Le statut, et pourquoi votre fiche annonce une fermeture

Au depart, toutes les fiches portent la mention « Site ferme au public, acces
exterieur uniquement ». C'est volontaire : tant que personne n'a confirme les
conditions de visite, mieux vaut qu'un visiteur soit agreablement surpris de
pouvoir entrer que de faire vingt kilometres pour trouver un portail ferme.

Des que vous renseignez votre fiche, videz le champ `statut` (`""`) et la
mention disparait.

Le champ sert ensuite a signaler toute fermeture, definitive ou saisonniere.
Laissez-le vide si le lieu est ouvert. Rempli,
son texte apparait en tete de fiche, et la liste des lieux porte la mention
« Fermeture signalee ». Par exemple :

    "statut": "Site ferme au public, acces exterieur uniquement."

Le lieu reste sur la carte : il est visible depuis la route, le faire
disparaitre creerait de la confusion. La fiche explique, c'est suffisant.

En cas d'erreur, rien n'est perdu : l'onglet **History** du fichier permet de
revenir a n'importe quelle version precedente.

Vous ne pouvez modifier que votre propre fichier. Les autres fiches et la carte
elle-meme sont hors de votre portee : aucune fausse manoeuvre de votre part ne
peut les abimer.

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
