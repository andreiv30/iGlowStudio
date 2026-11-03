<?php
// Încarcă datele aplicației OAuth GitHub pentru panoul /admin.
// Valorile NU stau în repo: vin din fișierul .config.php, scris la deploy de GitHub Actions
// (din secretele OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, SITE_URL), sau pus manual pe server.
$file = __DIR__ . '/.config.php';
$cfg = is_file($file) ? require $file : [];
return [
    'client_id' => $cfg['client_id'] ?? '',
    'client_secret' => $cfg['client_secret'] ?? '',
    'site_url' => rtrim($cfg['site_url'] ?? ('https://' . ($_SERVER['HTTP_HOST'] ?? '')), '/'),
];
