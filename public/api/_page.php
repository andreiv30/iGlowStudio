<?php
// Pagina simplă folosită de login și de generatorul de parole, în culorile iGlow.
function iglow_page(string $title, string $body): void {
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: no-referrer');
    $t = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    echo <<<HTML
<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>{$t} · iGlow Studio</title>
<style>
  :root { --espresso:#1a130d; --mocha:#261b15; --caramel:#b18b5a; --auriu:#d4b48a; --alb:#fbfbfa; --nisip:#d9cfc3; }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px 16px; background:var(--espresso); color:var(--alb); font:16px/1.55 system-ui,-apple-system,"Segoe UI",Arial,sans-serif; }
  .box { width:100%; max-width:380px; background:var(--mocha); border-radius:14px; padding:36px 28px; display:flex; flex-direction:column; gap:18px; }
  h1 { margin:0; font:400 28px/1.15 Georgia,"Times New Roman",serif; }
  h1 em { color:var(--auriu); }
  p { margin:0; color:var(--nisip); font-size:15px; }
  label { display:flex; flex-direction:column; gap:6px; font-size:12px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--nisip); }
  input { font:inherit; font-size:16px; letter-spacing:0; text-transform:none; color:var(--alb); background:var(--espresso); border:1px solid #3c2d23; border-radius:10px; padding:12px 14px; min-height:48px; }
  input:focus { outline:2px solid var(--caramel); outline-offset:1px; }
  button { font:inherit; min-height:50px; border:0; border-radius:10px; background:var(--caramel); color:var(--espresso); font-size:13px; font-weight:600; letter-spacing:.2em; text-transform:uppercase; cursor:pointer; }
  button:hover { background:var(--auriu); }
  .err { color:#f2b8a8; font-size:14px; }
  code { display:block; word-break:break-all; background:var(--espresso); border-radius:10px; padding:12px; font-size:13px; color:var(--auriu); user-select:all; }
</style>
</head>
<body><main class="box">{$body}</main></body>
</html>
HTML;
    exit;
}
