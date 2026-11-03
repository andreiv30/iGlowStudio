<?php
// Generator de hash pentru parolele din /admin. Nu salvează nimic:
// scrie parola, copiază rezultatul în api/.config.php, la utilizatorul tău.
require __DIR__ . '/_page.php';
$cfg = require __DIR__ . '/_config.php';
// După ce utilizatorii sunt configurați, generatorul se oprește. Pentru o parolă nouă,
// adaugă temporar 'generator_parole' => true în api/.config.php, apoi scoate-l.
$raw = is_file(__DIR__ . '/.config.php') ? (require __DIR__ . '/.config.php') : [];
if (count($cfg['users']) > 0 && empty($raw['generator_parole'])) {
    http_response_code(404);
    iglow_page('Indisponibil', '<h1>Generator <em>oprit</em></h1><p>Pentru o parolă nouă, adaugă temporar <strong>\'generator_parole\' => true,</strong> în api/.config.php, generează parola, apoi scoate rândul.</p>');
}
$out = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $p = (string) ($_POST['p'] ?? '');
    if (strlen($p) < 10) {
        $out = '<p class="err" role="alert">Parola trebuie să aibă cel puțin 10 caractere.</p>';
    } else {
        $h = htmlspecialchars(password_hash($p, PASSWORD_DEFAULT), ENT_QUOTES, 'UTF-8');
        $out = "<p>Copiază rândul de mai jos în <strong>api/.config.php</strong>, între ghilimelele utilizatorului:</p><code>{$h}</code>";
    }
}
iglow_page('Parolă nouă', <<<HTML
<h1>Parolă <em>nouă</em></h1>
<p>Alege o parolă de cel puțin 10 caractere. Pagina doar o transformă într-un cod securizat, nu o salvează.</p>
{$out}
<form method="post" autocomplete="off">
  <div style="display:flex;flex-direction:column;gap:14px">
    <label for="p">Parolă<input id="p" name="p" type="password" autocomplete="new-password" minlength="10" required></label>
    <button type="submit">Generează</button>
  </div>
</form>
HTML);
