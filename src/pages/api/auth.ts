// Pasul 1 al autentificării Decap CMS: trimite utilizatorul la GitHub.
// Rulează pe server (adapterul Node), nu este generată static.
import type { APIRoute } from 'astro';

export const prerender = false;

// Pe cPanel aplicația rulează în spatele unui proxy, deci adresa publică vine din SITE_URL.
const publicOrigin = (url: URL) => (process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : url.origin);

export const GET: APIRoute = ({ url, cookies, redirect }) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return new Response('Lipsește GITHUB_CLIENT_ID în setările aplicației.', { status: 500 });

  const state = crypto.randomUUID();
  cookies.set('decap_oauth_state', state, { httpOnly: true, secure: publicOrigin(url).startsWith('https:'), sameSite: 'lax', path: '/api', maxAge: 600 });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: new URL('/api/callback', publicOrigin(url)).toString(),
    scope: 'repo,user',
    state,
  });
  return redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
};
