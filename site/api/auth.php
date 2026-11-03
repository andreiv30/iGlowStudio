<?php
// Login pentru /admin cu utilizator și parolă (andreea, elena...).
// Decap CMS deschide această pagină într-o fereastră. După o parolă corectă,
// îi trimitem token-ul GitHub de pe server, prin mesajul pe care îl așteaptă Decap.
require __DIR__ . '/_page.php';
$cfg = require __DIR__ . '/_config.php';

session_name('iglow_admin');
session_set_cookie_params(['lifetime' => 0, 'path' => '/api/', 'secure' => strpos($cfg['site_url'], 'https://') === 0, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

if ($cfg['github_token'] === '' || count($cfg['users']) === 0) {
    http_response_code(500);
    iglow_page('Configurare lipsă', '<h1>Configurare <em>lipsă</em></h1><p>Fișierul <strong>api/.config.php</strong> nu există pe server sau nu conține token-ul GitHub și utilizatorii.</p>');
}

// ---- limită de încercări: 5 greșeli la 15 minute, pe adresă IP ----
$ip = $_SERVER['REMOTE_ADDR'] ?? 'necunoscut';
$lockFile = sys_get_temp_dir() . '/iglow_login_' . sha1($ip . __DIR__);
$attempts = ['count' => 0, 'since' => time()];
if (is_file($lockFile)) {
    $saved = json_decode((string) file_get_contents($lockFile), true);
    if (is_array($saved) && time() - ($saved['since'] ?? 0) < 900) $attempts = $saved;
}
$blocked = $attempts['count'] >= 5;

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = strtolower(trim((string) ($_POST['user'] ?? '')));
    $pass = (string) ($_POST['pass'] ?? '');
    $csrf = (string) ($_POST['csrf'] ?? '');

    if ($blocked) {
        $error = 'Prea multe încercări greșite. Încearcă din nou peste 15 minute.';
    } elseif (!hash_equals($_SESSION['csrf'] ?? '', $csrf)) {
        $error = 'Sesiunea a expirat. Încearcă din nou.';
    } elseif (isset($cfg['users'][$user]) && password_verify($pass, $cfg['users'][$user])) {
        @unlink($lockFile);
        // Verificăm tokenul la GitHub înainte să-l dăm panoului, ca problemele să fie explicate clar.
        $problem = iglow_check_token($cfg['github_token'], $cfg['repo']);
        if ($problem !== '') {
            iglow_page('Problemă cu tokenul', '<h1>Parola e corectă, dar <em>tokenul</em> nu merge</h1><p>' . $problem . '</p><p>Corectează tokenul în <strong>public_html/api/.config.php</strong> și încearcă din nou.</p>');
        }
        session_regenerate_id(true);
        $u = htmlspecialchars($user, ENT_QUOTES, 'UTF-8');
        unset($_SESSION['csrf']);
        $origin = json_encode($cfg['site_url'], JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);
        $message = json_encode('authorization:github:success:' . json_encode(['token' => $cfg['github_token'], 'provider' => 'github'], JSON_UNESCAPED_SLASHES), JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);
        iglow_page('Autentificat', <<<HTML
<h1>Bine ai venit, <em>{$u}</em></h1>
<p>Te conectăm la panou. Fereastra se poate închide.</p>
<script>
(function () {
  var origin = {$origin};
  var message = {$message};
  function receive(e) {
    if (e.origin !== origin) return;
    window.opener.postMessage(message, origin);
    window.removeEventListener('message', receive);
    setTimeout(function () { window.close(); }, 400);
  }
  window.addEventListener('message', receive, false);
  if (window.opener) window.opener.postMessage('authorizing:github', origin);
})();
</script>
HTML);
    } else {
        $attempts['count']++;
        @file_put_contents($lockFile, json_encode($attempts), LOCK_EX);
        usleep(400000);
        $error = $attempts['count'] >= 5 ? 'Prea multe încercări greșite. Încearcă din nou peste 15 minute.' : 'Utilizator sau parolă greșită.';
    }
}

function iglow_check_token(string $token, string $repo): string {
    if (!function_exists('curl_init')) return '';
    $ch = curl_init('https://api.github.com/repos/' . $repo);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $token, 'Accept: application/vnd.github+json', 'User-Agent: iglow-admin'],
    ]);
    $body = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($body === false || $code === 0) return ''; // serverul nu poate verifica; lăsăm panoul să încerce
    $data = json_decode((string) $body, true) ?: [];
    $msg = htmlspecialchars((string) ($data['message'] ?? ''), ENT_QUOTES, 'UTF-8');
    $r = htmlspecialchars($repo, ENT_QUOTES, 'UTF-8');
    if ($code === 401) return "GitHub nu recunoaște tokenul (401 – {$msg}). Verifică să fie copiat complet, între ghilimele simple, fără spații, și să nu fi expirat.";
    if ($code === 403) return "GitHub refuză tokenul (403 – {$msg}).";
    if ($code === 404) return "Tokenul nu vede repo-ul <strong>{$r}</strong> (404). La tokenul fine-grained alege <em>Only select repositories → iGlowStudio</em>.";
    if ($code !== 200) return "GitHub a răspuns cu eroarea {$code} – {$msg}.";
    if (empty($data['permissions']['push'])) return "Tokenul vede repo-ul, dar nu are drept de scriere. La tokenul fine-grained, la <em>Repository permissions → Contents</em>, alege <strong>Read and write</strong>, apoi salvează.";
    return '';
}

$_SESSION['csrf'] = bin2hex(random_bytes(16));
$csrf = $_SESSION['csrf'];
$err = $error ? '<p class="err" role="alert">' . htmlspecialchars($error, ENT_QUOTES, 'UTF-8') . '</p>' : '';
iglow_page('Autentificare', <<<HTML
<h1>Panou <em>iGlow</em></h1>
<p>Intră cu utilizatorul și parola ta.</p>
{$err}
<form method="post" autocomplete="on">
  <input type="hidden" name="csrf" value="{$csrf}">
  <div style="display:flex;flex-direction:column;gap:14px">
    <label for="user">Utilizator<input id="user" name="user" autocomplete="username" autocapitalize="none" required></label>
    <label for="pass">Parolă<input id="pass" name="pass" type="password" autocomplete="current-password" required></label>
    <button type="submit">Intră în panou</button>
  </div>
</form>
HTML);
