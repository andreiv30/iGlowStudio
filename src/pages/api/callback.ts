// Pasul 2: GitHub se întoarce aici cu un cod. Îl schimbăm pe un token și îl trimitem
// ferestrei /admin prin mesajul pe care îl așteaptă Decap CMS.
import type { APIRoute } from 'astro';

export const prerender = false;

// Pe cPanel aplicația rulează în spatele unui proxy, deci adresa publică vine din SITE_URL.
const publicOrigin = (url: URL) => (process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : url.origin);

const page = (status: 'success' | 'error', payload: object, origin: string) => `<!doctype html>
<html lang="ro"><head><meta charset="utf-8"><title>Autentificare</title></head><body>
<p>${status === 'success' ? 'Autentificare reușită. Poți închide fereastra.' : 'Autentificarea nu a reușit. Închide fereastra și încearcă din nou.'}</p>
<script>
(function () {
  var origin = ${JSON.stringify(origin)};
  var message = 'authorization:github:${status}:' + ${JSON.stringify(JSON.stringify(payload))};
  function receive(e) {
    if (e.origin !== origin) return;
    window.opener.postMessage(message, origin);
    window.removeEventListener('message', receive);
  }
  window.addEventListener('message', receive, false);
  if (window.opener) window.opener.postMessage('authorizing:github', origin);
})();
</script></body></html>`;

export const GET: APIRoute = async ({ url, cookies }) => {
  const html = (body: string, status = 200) => new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expected = cookies.get('decap_oauth_state')?.value;
  cookies.delete('decap_oauth_state', { path: '/api' });

  if (!code || !state || !expected || state !== expected) {
    return html(page('error', { message: 'Cerere invalidă (state).' }, publicOrigin(url)), 400);
  }

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: new URL('/api/callback', publicOrigin(url)).toString(),
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { access_token?: string; error_description?: string };
  if (!res.ok || !data.access_token) {
    return html(page('error', { message: data.error_description || 'GitHub nu a returnat un token.' }, publicOrigin(url)), 400);
  }
  return html(page('success', { token: data.access_token, provider: 'github' }, publicOrigin(url)));
};
