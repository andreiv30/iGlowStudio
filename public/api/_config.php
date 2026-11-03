<?php
// Configurația pentru login-ul din /admin. Valorile NU stau în repo:
// se citesc din fișierul .config.php, creat o singură dată pe server (public_html/api/.config.php).
//
// <?php
// return [
//   'site_url' => 'https://iglowstudio.ro',
//   'github_token' => 'github_pat_...',          // token fine-grained, doar pe repo-ul iGlowStudio, Contents: Read and write
//   'users' => [
//     'andreea' => '$2y$10$...',                  // hash generat din /api/parola.php
//     'elena' => '$2y$10$...',
//   ],
// ];
$file = __DIR__ . '/.config.php';
$cfg = is_file($file) ? require $file : [];
return [
    'site_url' => rtrim($cfg['site_url'] ?? ('https://' . ($_SERVER['HTTP_HOST'] ?? '')), '/'),
    'github_token' => $cfg['github_token'] ?? '',
    'users' => is_array($cfg['users'] ?? null) ? $cfg['users'] : [],
    'repo' => $cfg['repo'] ?? 'andreiv30/iGlowStudio',
];
