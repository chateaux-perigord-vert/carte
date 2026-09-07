/* =====================================================================
   Service d'edition des fiches — Chateaux en Perigord Vert

   Role : recevoir les modifications saisies par les proprietaires et
   reecrire le fichier JSON correspondant dans le depot GitHub.
   C'est la seule piece qui ne soit pas un simple fichier statique.

   A deployer sur Cloudflare Workers (offre gratuite).

   Trois variables a definir dans Cloudflare (Settings > Variables) :

     GITHUB_TOKEN  secret. Jeton GitHub "fine-grained", limite au seul
                   depot carte, avec la permission Contents : Read and write.

     LIENS         secret. Le contenu de liens-secrets.json, qui associe
                   chaque lien secret a une fiche. Exemple :
                   {"beauvais-g1bp20fu":"beauvais","aucors-vm9b0vl7":"aucors"}

     DEPOT         variable ordinaire. Exemple : chateaux-perigord-vert/carte
   ===================================================================== */

const ORIGINE = 'https://chateauxenperigordvert.fr';

const ENTETES = {
  'Access-Control-Allow-Origin': ORIGINE,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Champs que le proprietaire est autorise a modifier.
// Tout le reste (nom, type, position) lui est inaccessible.
const CHAMPS_AUTORISES = [
  'presentation', 'statut', 'horaires', 'tarifs', 'acces',
  'telephone', 'email', 'site', 'evenements', 'maj',
];

const LIMITE_CARACTERES = 2000;
const LIMITE_EVENEMENTS = 40;

export default {
  async fetch(requete, env) {
    const url = new URL(requete.url);

    if (requete.method === 'OPTIONS') {
      return new Response(null, { headers: ENTETES });
    }

    // Le lien secret tient lieu d'authentification
    const cle = url.searchParams.get('c');
    const liens = JSON.parse(env.LIENS || '{}');
    const id = liens[cle];

    if (!id) {
      return reponse({ erreur: 'lien inconnu' }, 403);
    }

    const chemin = `fiches/${id}.json`;

    try {
      if (url.pathname === '/fiche' && requete.method === 'GET') {
        const { contenu } = await lireGitHub(env, chemin);
        return reponse(contenu);
      }

      if (url.pathname === '/enregistrer' && requete.method === 'POST') {
        const envoye = await requete.json();
        const { contenu, sha } = await lireGitHub(env, chemin);
        const fusionnee = fusionner(contenu, envoye);
        await ecrireGitHub(env, chemin, fusionnee, sha, id);
        return reponse({ ok: true });
      }

      return reponse({ erreur: 'route inconnue' }, 404);

    } catch (e) {
      return reponse({ erreur: String(e.message || e) }, 500);
    }
  },
};

/* ---------- Fusion prudente ----------
   On repart toujours de la fiche existante et on n'ecrase que les
   champs autorises. Un envoi malforme ne peut donc pas detruire la
   fiche ni modifier le nom ou la position du monument. */
function fusionner(actuelle, envoyee) {
  const sortie = { ...actuelle };

  for (const champ of CHAMPS_AUTORISES) {
    if (!(champ in envoyee)) continue;

    if (champ === 'evenements') {
      const liste = Array.isArray(envoyee.evenements) ? envoyee.evenements : [];
      sortie.evenements = liste.slice(0, LIMITE_EVENEMENTS).map((ev) => ({
        titre:  texte(ev.titre),
        debut:  date(ev.debut),
        fin:    date(ev.fin),
        detail: texte(ev.detail),
      }));
    } else {
      sortie[champ] = texte(envoyee[champ]);
    }
  }

  return sortie;
}

function texte(v) {
  return typeof v === 'string' ? v.slice(0, LIMITE_CARACTERES) : '';
}

function date(v) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '';
}

/* ---------- Acces au depot GitHub ---------- */
async function lireGitHub(env, chemin) {
  const r = await fetch(
    `https://api.github.com/repos/${env.DEPOT}/contents/${chemin}`,
    { headers: entetesGitHub(env) }
  );
  if (!r.ok) throw new Error('lecture impossible');

  const donnees = await r.json();
  const brut = new TextDecoder().decode(
    Uint8Array.from(atob(donnees.content.replace(/\n/g, '')), (c) => c.charCodeAt(0))
  );
  return { contenu: JSON.parse(brut), sha: donnees.sha };
}

async function ecrireGitHub(env, chemin, contenu, sha, id) {
  const texteFichier = JSON.stringify(contenu, null, 2) + '\n';
  const encode = btoa(
    String.fromCharCode(...new TextEncoder().encode(texteFichier))
  );

  const r = await fetch(
    `https://api.github.com/repos/${env.DEPOT}/contents/${chemin}`,
    {
      method: 'PUT',
      headers: { ...entetesGitHub(env), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Mise a jour de la fiche ${id}`,
        content: encode,
        sha,
      }),
    }
  );
  if (!r.ok) throw new Error('ecriture impossible');
}

function entetesGitHub(env) {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'chateaux-perigord-vert',
  };
}

function reponse(objet, code = 200) {
  return new Response(JSON.stringify(objet), {
    status: code,
    headers: { ...ENTETES, 'Content-Type': 'application/json; charset=utf-8' },
  });
}
