<?php
// Pasul 1 al autentificării Decap CMS: trimite utilizatorul la GitHub.
$cfg = require __DIR__ . '/_config.php';
header('Cache-Control: no-store');
if ($cfg['client_id'] === '') {
    http_response_code(500);
    exit('Lipsește client_id pentru GitHub OAuth (api/.config.php).');
}
$state = bin2hex(random_bytes(16));
setcookie('decap_oauth_state', $state, [
    'expires' => time() + 600,
    'path' => '/api/',
    'secure' => strpos($cfg['site_url'], 'https://') === 0,
    'httponly' => true,
    'samesite' => 'Lax',
]);
$params = http_build_query([
    'client_id' => $cfg['client_id'],
    'redirect_uri' => $cfg['site_url'] . '/api/callback.php',
    'scope' => 'repo,user',
    'state' => $state,
]);
header('Location: https://github.com/login/oauth/authorize?' . $params, true, 302);
