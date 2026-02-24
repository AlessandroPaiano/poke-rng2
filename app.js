<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Gen 1 RNG Gym Run</title>
  <style>
    :root{
      --bg:#0b0f19; --panel:rgba(255,255,255,.06); --panel2:rgba(255,255,255,.08);
      --text:rgba(255,255,255,.92); --muted:rgba(255,255,255,.65);
      --shadow:0 10px 30px rgba(0,0,0,.35); --radius:18px;
      --mono:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
      --sans:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji";
    }
    [data-theme="light"]{--bg:#f6f7fb;--panel:rgba(0,0,0,.06);--panel2:rgba(0,0,0,.08);--text:rgba(0,0,0,.88);--muted:rgba(0,0,0,.60);--shadow:0 10px 30px rgba(0,0,0,.12)}
    *{box-sizing:border-box}
    body{margin:0;font-family:var(--sans);background:var(--bg);color:var(--text);min-height:100vh;display:flex;justify-content:center}
    .wrap{width:min(980px,100%);padding:14px 14px 40px;display:grid;gap:14px}
    header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;background:var(--panel);border-radius:var(--radius);box-shadow:var(--shadow)}
    header h1{margin:0;font-size:16px;display:flex;flex-direction:column;gap:2px}
    header h1 span{font-size:12px;color:var(--muted);font-weight:600}
    .btn{border:0;background:var(--panel2);color:var(--text);padding:9px 12px;border-radius:12px;cursor:pointer;font-weight:800;letter-spacing:.2px}
    .btn:hover{filter:brightness(1.12)} .btn:active{transform:translateY(1px)}
    .btn.primary{background:rgba(125,211,252,.18);border:1px solid rgba(125,211,252,.35)}
    .btn.danger{background:rgba(251,113,133,.16);border:1px solid rgba(251,113,133,.35)}
    .toggle{display:flex;align-items:center;gap:8px;color:var(--muted);font-weight:700;font-size:12px;user-select:none}
    .toggle input{accent-color:#7dd3fc}
    .grid{display:grid;grid-template-columns:1fr;gap:14px}
    @media(min-width:900px){.grid{grid-template-columns:1.1fr .9fr;align-items:start}}
    .card{background:var(--panel);border-radius:var(--radius);box-shadow:var(--shadow);padding:12px 14px}
    .phase{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
    .phase .label{font-weight:900;font-size:14px}
    .phase .sub{color:var(--muted);font-size:12px;font-family:var(--mono)}
    .wheelWrap{display:grid;place-items:center;gap:10px;padding:6px 0 2px}
    canvas{width:min(380px,86vw);height:min(380px,86vw);border-radius:999px;background:rgba(255,255,255,.04);box-shadow:var(--shadow)}
    .pointer{width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-bottom:24px solid rgba(255,255,255,.85);position:relative;top:-10px;filter:drop-shadow(0 6px 8px rgba(0,0,0,.35))}
    .spinRow{display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;margin:4px 0}
    .result{font-family:var(--mono);font-size:12px;color:var(--muted);text-align:center;min-height:18px}
    .pill{padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);font-size:11px;font-weight:900;white-space:nowrap}
    .party{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px}
    .slot{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:10px;min-height:66px;display:flex;flex-direction:column;gap:6px}
    [data-theme="light"] .slot{background:rgba(0,0,0,.03);border-color:rgba(0,0,0,.10)}
    .slot .name{font-weight:900;font-size:12px;line-height:1.2}
    .slot .meta{display:flex;gap:8px;align-items:center;justify-content:space-between;color:var(--muted);font-size:11px;font-family:var(--mono)}
    .inv{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
    .invItem{display:flex;gap:8px;align-items:center;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);font-weight:900;font-size:12px}
    .invItem small{color:var(--muted);font-weight:800;font-family:var(--mono)}
    .battleBox{margin-top:10px;padding:10px 12px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.10)}
    .battleTop{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap}
    .chance{font-size:28px;font-weight:950;letter-spacing:.4px}
    .chance small{font-size:12px;color:var(--muted);font-weight:900;margin-left:6px;font-family:var(--mono)}
    .breakdown{margin-top:8px;padding-top:8px;border-top:1px dashed rgba(255,255,255,.18);font-family:var(--mono);font-size:11px;color:var(--muted);line-height:1.55;white-space:pre-wrap}
    .log{font-family:var(--mono);font-size:11px;color:var(--muted);line-height:1.5;max-height:320px;overflow:auto;padding-right:6px}
    .log .row{padding:8px 0;border-bottom:1px solid rgba(255,255,255,.08)}
    .tag{display:inline-block;padding:1px 6px;border-radius:999px;font-weight:950;font-size:10px;margin-right:6px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:var(--text)}
    .tag.ok{border-color:rgba(134,239,172,.35);background:rgba(134,239,172,.14)}
    .tag.bad{border-color:rgba(251,113,133,.35);background:rgba(251,113,133,.12)}
    .tag.info{border-color:rgba(125,211,252,.35);background:rgba(125,211,252,.12)}
    .foot{color:var(--muted);font-size:12px;line-height:1.4}
    .foot code{font-family:var(--mono)}
  </style>
</head>
<body data-theme="dark">
  <div class="wrap">
    <header>
      <h1>Gen 1 RNG Gym Run
        <span>Wheel-only • Party cresce tra gli stage • Dati via PokéAPI • GitHub Pages ready</span>
      </h1>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end">
        <label class="toggle"><input id="darkToggle" type="checkbox" checked /> Dark</label>
        <button id="restartBtn" class="btn danger">Restart</button>
      </div>
    </header>

    <div class="grid">
      <section class="card">
        <div class="phase">
          <div>
            <div class="label" id="phaseLabel">Loading…</div>
            <div class="sub" id="phaseSub">Scarico dati Gen 1 da PokéAPI…</div>
          </div>
          <div class="pill" id="nextInfo">—</div>
        </div>

        <div class="wheelWrap">
          <div class="pointer" aria-hidden="true"></div>
          <canvas id="wheel" width="720" height="720"></canvas>
          <div class="spinRow">
            <button id="spinBtn" class="btn primary" disabled>Click to Spin</button>
          </div>
          <div class="result" id="resultText"></div>
        </div>

        <div class="battleBox">
          <div class="battleTop">
            <div class="chance" id="chanceText">—<small id="chanceMeta"></small></div>
            <div class="pill" id="stagePill">—</div>
          </div>
          <div class="breakdown" id="breakdownText">—</div>
        </div>

        <div style="margin-top:12px">
          <div style="font-weight:950;font-size:13px;">Party</div>
          <div class="party" id="partyGrid"></div>
        </div>

        <div style="margin-top:12px">
          <div style="font-weight:950;font-size:13px;">Inventory (auto-consume)</div>
          <div class="inv" id="invRow"></div>
        </div>

        <div style="margin-top:12px" class="foot">
          Dati Pokémon (types + stats) caricati da <code>https://pokeapi.co/</code> e cachati in <code>localStorage</code> per velocizzare.
        </div>
      </section>

      <aside class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;">
          <div style="font-weight:950;font-size:13px;">Run Log</div>
          <div class="pill" id="seedPill">—</div>
        </div>
        <div class="log" id="logBox"></div>
        <div style="margin-top:10px" class="foot">
          GitHub Pages: metti <code>index.html</code> e <code>app.js</code> in root → Settings → Pages → Deploy from branch → <code>main</code> / root.
        </div>
      </aside>
    </div>
  </div>

  <script src="./app.js"></script>
</body>
</html>
