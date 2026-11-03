<?php
// Pasul 2: GitHub revine aici cu un cod. Îl schimbăm pe un token și îl trimitem
// ferestrei /admin prin mesajul pe care îl așteaptă Decap CMS.
$cfg = require __DIR__ . '/_config.php';
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');

function respond(string $status, array $payload, string $origin): void {
    $message = 'authorization:github:' . $status . ':' . json_encode($payload, JSON_UNESCAPED_SLASHES);
    $text = $status === 'success'
        ? 'Autentificare reușită. Poți închide fereastra.'
        : 'Autentificarea nu a reușit. Închide fereastra și încearcă din nou.';
    $o = json_encode($origin, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);
    $m = json_encode($message, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);
    echo "<!doctype html><html lang=\"ro\"><head><meta charset=\"utf-8\"><title>Autentificare</title></head><body><p>{$text}</p>
<script>
(function () {
  var origin = {$o};
  var message = {$m};
  function receive(e) {
    if (e.origin !== origin) return;
    window.opener.postMessage(message, origin);
    window.removeEventListener('message', receive);
  }
  window.addEventListener('message', receive, false);
  if (window.opener) window.opener.postMessage('authorizing:github', origin);
})();
</script></body></html>";
    exit;
}

$code = $_GET['code'] ?? '';
$state = $_GET['state'] ?? '';
$expected = $_COOKIE['decap_oauth_state'] ?? '';
setcookie('decap_oauth_state', '', ['expires' => time() - 3600, 'path' => '/api/']);

if ($code === '' || $state === '' || $expected === '' || !hash_equals($expected, $state)) {
    http_response_code(400);
    respond('error', ['message' => 'Cerere invalidă (state).'], $cfg['site_url']);
}

$ch = curl_init('https://github.com/login/oauth/access_token');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_HTTPHEADER => ['Accept: application/json', 'User-Agent: iglow-decap-oauth'],
    CURLOPT_POSTFIELDS => http_build_query([
        'client_id' => $cfg['client_id'],
        'client_secret' => $cfg['client_secret'],
        'code' => $code,
        'redirect_uri' => $cfg['site_url'] . '/api/callback.php',
    ]),
]);
$body = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
$data = json_decode($body ?: '{}', true) ?: [];

if ($http !== 200 || empty($data['access_token'])) {
    http_response_code(400);
    respond('error', ['message' => $data['error_description'] ?? 'GitHub nu a returnat un token.'], $cfg['site_url']);
}
respond('success', ['token' => $data['access_token'], 'provider' => 'github'], $cfg['site_url']);
