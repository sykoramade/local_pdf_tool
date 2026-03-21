<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LocalPDF — Edit Workspace</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0b0d14;
  --surf:rgba(255,255,255,.03);
  --bord:rgba(255,255,255,.08);
  --bord2:rgba(255,255,255,.14);
  --tx:#f4f6fc;
  --tx2:rgba(255,255,255,.5);
  --tx3:rgba(255,255,255,.28);
  --spring:cubic-bezier(.34,1.56,.64,1);
  --ease:cubic-bezier(.4,0,.2,1);
  --font-body:'DM Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
  --tc:#818cf8;
}
html,body{height:100%;background:var(--bg);font-family:var(--font-body);color:var(--tx);overflow:hidden;display:flex;flex-direction:column}
button{font-family:var(--font-body);cursor:pointer;border:none}
input,select{font-family:var(--font-body)}

/* ── NAV ── */
.nav{
  display:flex;align-items:center;gap:8px;
  padding:0 16px;height:50px;
  border-bottom:1px solid var(--bord);
  background:rgba(11,13,20,.95);
  backdrop-filter:blur(14px);
  flex-shrink:0;z-index:50;
}
.nav-logo{font-size:15px;font-weight:600;letter-spacing:-.3px}
.nav-filename{font-size:12px;color:var(--tx2);flex:1}
.nav-dl{
  background:#6366f1;color:#fff;
  border-radius:8px;padding:7px 14px;
  font-size:11px;font-weight:600;letter-spacing:.03em;
  white-space:nowrap;transition:background .2s;
}
.nav-dl:hover{background:#4f46e5}

/* ── SELECTOR RAIL ── */
.sel-rail{
  position:relative;display:flex;
  background:rgba(255,255,255,.05);
  border:1px solid var(--bord);
  border-radius:11px;padding:3px;
}
.sel-pill{
  position:absolute;top:3px;height:calc(100% - 6px);
  background:#fff;border-radius:8px;
  box-shadow:0 1px 4px rgba(0,0,0,.22);
  transition:transform .28s var(--spring),width .28s var(--spring);
  pointer-events:none;z-index:0;
}
.sel-tab{
  position:relative;z-index:1;flex:1;
  display:flex;align-items:center;justify-content:flex-start;
  gap:6px;padding:9px 8px 9px 10px;
  font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  color:rgba(255,255,255,.3);cursor:pointer;user-select:none;
  transition:color .18s;white-space:nowrap;
}
.sel-tab.active{color:#0b0d14}
.sel-tab .tab-icon{width:14px;height:14px;flex-shrink:0;opacity:.7;transition:opacity .18s}
.sel-tab.active .tab-icon{opacity:1}
.pro-pip{
  font-size:7px;font-weight:700;
  background:rgba(249,112,102,.18);color:#f97066;
  padding:1px 4px;border-radius:3px;margin-left:2px;
}

/* ── LAYER 2 ── */
.l2{
  background:rgba(11,13,20,.92);border-bottom:1px solid var(--bord);
  padding:10px 14px 0;flex-shrink:0;backdrop-filter:blur(14px);
}
.l2-inner{max-width:600px;margin:0 auto}

/* ── LAYER 3 ── */
.l3{min-height:44px;display:flex;align-items:center;padding:8px 0 11px;gap:10px;flex-wrap:wrap}
.l3.hide{display:none}

/* ── WORKSPACE ── */
.ws-body{display:flex;flex:1;overflow:hidden}
.page-rail{
  width:64px;flex-shrink:0;
  border-right:1px solid var(--bord);
  background:rgba(0,0,0,.2);
  padding:10px 6px;display:flex;flex-direction:column;gap:8px;overflow-y:auto;
}
.pg-thumb{
  border-radius:4px;border:1.5px solid rgba(255,255,255,.07);
  background:rgba(255,255,255,.02);
  aspect-ratio:1/1.414;cursor:pointer;
  display:flex;flex-direction:column;padding:5px;transition:border-color .15s;
}
.pg-thumb.active{border-color:var(--tc)}
.pg-lines{display:flex;flex-direction:column;gap:2px;flex:1}
.pg-line{height:1.5px;background:rgba(255,255,255,.14);border-radius:1px}
.pg-line.h{height:2px;background:rgba(255,255,255,.28)}
.pg-num{font-size:8px;text-align:center;color:rgba(255,255,255,.2);font-family:var(--font-mono);transition:color .15s}
.pg-thumb.active .pg-num{color:var(--tc)}
.canvas-area{flex:1;overflow-y:auto;padding:20px 14px;display:flex;justify-content:center}

/* ── PDF DOC ── */
.pdf-doc{
  width:100%;max-width:440px;
  background:#fff;border-radius:2px;
  box-shadow:0 4px 48px rgba(0,0,0,.75);
  padding:40px 38px 60px;
  position:relative;font-family:Georgia,serif;
  color:#1a1a2e;min-height:560px;
}
.pdf-t{font-size:21px;font-weight:700;margin-bottom:8px}
.pdf-meta-line{font-size:11.5px;color:#555;margin-bottom:3px;font-family:system-ui}
.pdf-sec{font-size:13px;font-weight:700;margin-top:20px;margin-bottom:5px}
.pdf-body{font-size:11.5px;line-height:1.7;color:#333}
.pdf-f{
  display:inline;cursor:text;border-radius:2px;
  transition:background .15s,box-shadow .15s;padding:0 2px;
}
.pdf-f:hover{background:rgba(129,140,248,.12);box-shadow:inset 0 -1.5px 0 rgba(129,140,248,.5)}
.pdf-f.edited{color:#312e81;border-bottom:1.5px solid rgba(99,102,241,.5)}
.pdf-f.sel-active{outline:1.5px solid rgba(129,140,248,.6);outline-offset:2px;border-radius:2px}
.pdf-ei{
  font-family:Georgia,serif;font-size:11.5px;
  background:rgba(99,102,241,.07);border:1.5px solid #818cf8;
  border-radius:3px;padding:1px 5px;color:#1a1a2e;outline:none;
}
.sig-zone{border-top:1px solid #e0e0e0;padding-top:8px;flex:1}
.sig-label{font-size:9px;color:#bbb;font-family:system-ui;margin-bottom:5px}
.sig-placed{font-family:'Brush Script MT',cursive;font-size:26px;color:#1a1a2e;padding:2px 0}

/* ── L3 COMPONENTS ── */
.op-badge{display:inline-flex;align-items:center;font-size:11px;font-weight:600;padding:3px 11px;border-radius:20px}

/* ── MODAL ── */
.modal-ov{position:absolute;inset:0;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;z-index:100}
.modal-ov.open{display:flex}
.modal-box{background:#141720;border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:26px;width:300px;max-width:92%}
.modal-hd{display:flex;justify-content:space-between;align-items:center;font-size:15px;font-weight:600;margin-bottom:16px}
.modal-x{background:none;color:var(--tx2);font-size:17px;padding:2px}
.dl-row{display:flex;align-items:center;gap:10px;font-size:12px;padding:7px 10px;background:rgba(255,255,255,.035);border-radius:7px;border:1px solid var(--bord);margin-bottom:7px}
.dl-dot{width:9px;height:9px;border-radius:2px;flex-shrink:0}
.m-confirm-dl{width:100%;background:#6366f1;border:none;border-radius:10px;padding:13px;color:#fff;font-weight:700;font-size:13px;margin-top:14px}

.proto-lbl{position:fixed;bottom:10px;right:10px;font-size:9px;font-family:var(--font-mono);color:rgba(255,255,255,.18);pointer-events:none;letter-spacing:.1em;z-index:200}
</style>
</head>
<body>

<svg style="display:none" xmlns="http://www.w3.org/2000/svg">
  <symbol id="ic-edit" viewBox="0 0 16 16"><path d="M11.5 1.5a1.5 1.5 0 0 1 2.12 2.12l-8.5 8.5-2.83.71.71-2.83 8.5-8.5z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="ic-sign" viewBox="0 0 16 16"><path d="M2 12c2-3 4-5 5-5s1 2 2 2 2-1 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M13 12h1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></symbol>
  <symbol id="ic-annotate" viewBox="0 0 16 16"><rect x="2" y="5" width="8" height="1.5" rx=".75" fill="currentColor" opacity=".5"/><rect x="2" y="8" width="10" height="1.5" rx=".75" fill="currentColor" opacity=".5"/><rect x="2" y="11" width="6" height="1.5" rx=".75" fill="currentColor" opacity=".5"/><rect x="1" y="4" width="3" height="9" rx="1.5" fill="currentColor"/></symbol>
  <symbol id="ic-redact" viewBox="0 0 16 16"><rect x="2" y="5" width="12" height="6" rx="1.5" fill="currentColor"/><line x1="2" y1="13" x2="14" y2="13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></symbol>
  <symbol id="ic-compress" viewBox="0 0 16 16"><path d="M8 2v12M4 6l4-4 4 4M4 10l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</svg>

<!-- L1: Nav -->
<header class="nav">
  <span class="nav-logo">LocalPDF</span>
  <span class="nav-filename">contract_draft.pdf</span>
  <button class="nav-dl" onclick="openDL()">&#8595; Download</button>
</header>

<!-- L2 + L3 -->
<div class="l2">
  <div class="l2-inner">

    <!-- Main tool selector -->
    <div class="sel-rail" id="ws-sel">
      <div class="sel-pill" id="ws-pill"></div>
      <div class="sel-tab active" data-t="edit" onclick="setTool('edit')">
        <svg class="tab-icon" viewBox="0 0 16 16"><use href="#ic-edit"/></svg>Edit
      </div>
      <div class="sel-tab" data-t="sign" onclick="setTool('sign')">
        <svg class="tab-icon" viewBox="0 0 16 16"><use href="#ic-sign"/></svg>Sign
      </div>
      <div class="sel-tab" data-t="annotate" onclick="setTool('annotate')">
        <svg class="tab-icon" viewBox="0 0 16 16"><use href="#ic-annotate"/></svg>Annotate
      </div>
      <div class="sel-tab" data-t="redact" onclick="setTool('redact')">
        <svg class="tab-icon" viewBox="0 0 16 16"><use href="#ic-redact"/></svg>Redact<span class="pro-pip">PRO</span>
      </div>
      <div class="sel-tab" data-t="compress" onclick="setTool('compress')">
        <svg class="tab-icon" viewBox="0 0 16 16"><use href="#ic-compress"/></svg>Compress
      </div>
    </div>

    <!-- L3: Edit toolbar -->
    <div id="l3-edit" class="l3 hide" style="padding:6px 0 10px;transition:opacity .15s,transform .15s">
      <div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(255,255,255,.03);border:1px solid var(--bord);border-radius:9px;flex-wrap:wrap;width:100%">
        <!-- Font family -->
        <select id="fc-family" onchange="applyFont()" style="background:rgba(255,255,255,.07);border:1px solid var(--bord2);border-radius:6px;color:var(--tx);font-size:11px;padding:4px 7px;height:28px;outline:none;cursor:pointer;max-width:96px">
          <option value="Georgia,serif">Georgia</option>
          <option value="'Times New Roman',serif">Times New Roman</option>
          <option value="Arial,sans-serif">Arial</option>
          <option value="Helvetica,sans-serif">Helvetica</option>
          <option value="'Courier New',monospace">Courier</option>
        </select>
        <div style="width:1px;height:20px;background:var(--bord2)"></div>
        <!-- Size -->
        <div style="display:flex;align-items:center;gap:2px">
          <button onclick="adjSize(-1)" style="background:none;border:1px solid var(--bord2);border-radius:5px;width:22px;height:28px;color:var(--tx2);font-size:14px;display:flex;align-items:center;justify-content:center">−</button>
          <input id="fc-size" type="number" value="13" min="6" max="72" onchange="applyFont()" style="width:36px;background:rgba(255,255,255,.07);border:1px solid var(--bord2);border-radius:5px;color:var(--tx);font-size:11px;text-align:center;height:28px;outline:none;padding:0 4px">
          <button onclick="adjSize(1)" style="background:none;border:1px solid var(--bord2);border-radius:5px;width:22px;height:28px;color:var(--tx2);font-size:14px;display:flex;align-items:center;justify-content:center">+</button>
        </div>
        <div style="width:1px;height:20px;background:var(--bord2)"></div>
        <!-- Color -->
        <label title="Text color" style="position:relative;width:24px;height:24px;border-radius:50%;cursor:pointer;border:2px solid rgba(255,255,255,.2);overflow:hidden;flex-shrink:0">
          <div id="fc-color-preview" style="position:absolute;inset:0;background:#1a1a2e;border-radius:50%"></div>
          <input type="color" id="fc-color" value="#1a1a2e" onchange="applyFont()" style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%">
        </label>
        <div style="width:1px;height:20px;background:var(--bord2)"></div>
        <!-- B I U -->
        <button id="fc-bold" onclick="toggleFmt('bold')" title="Bold" style="background:none;border:1px solid var(--bord);border-radius:6px;width:28px;height:28px;color:var(--tx2);font-size:13px;font-weight:700;font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;transition:all .15s">B</button>
        <button id="fc-italic" onclick="toggleFmt('italic')" title="Italic" style="background:none;border:1px solid var(--bord);border-radius:6px;width:28px;height:28px;color:var(--tx2);font-size:13px;font-style:italic;font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;transition:all .15s"><em>I</em></button>
        <button id="fc-under" onclick="toggleFmt('underline')" title="Underline" style="background:none;border:1px solid var(--bord);border-radius:6px;width:28px;height:28px;color:var(--tx2);font-size:13px;font-family:Georgia,serif;text-decoration:underline;display:flex;align-items:center;justify-content:center;transition:all .15s">U</button>
        <div style="width:1px;height:20px;background:var(--bord2)"></div>
        <!-- Resize handles -->
        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;user-select:none">
          <div id="tx-toggle-wrap" onclick="toggleTransform()" style="width:14px;height:14px;border-radius:3px;border:1.5px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0">
            <svg id="tx-check" width="9" height="9" viewBox="0 0 10 10" style="display:none"><polyline points="1.5,5 4,8 8.5,2" fill="none" stroke="#818cf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <span style="font-size:11px;color:var(--tx3);white-space:nowrap">Resize</span>
        </label>
        <!-- Spacer -->
        <div style="flex:1"></div>
        <!-- Edit badge -->
        <span id="edit-badge" style="display:none" class="op-badge"></span>
        <div style="width:1px;height:20px;background:var(--bord2)"></div>
        <!-- Undo / Redo -->
        <button id="undo-btn" onclick="histUndo()" title="Undo (Cmd+Z)"
          style="background:none;border:1px solid var(--bord2);border-radius:6px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:var(--tx3);transition:color .15s,opacity .15s;opacity:.4">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7H10a4 4 0 0 1 0 8H6"/><polyline points="3,4 3,7 6,7"/></svg>
        </button>
        <button id="redo-btn" onclick="histRedo()" title="Redo (Cmd+Shift+Z)"
          style="background:none;border:1px solid var(--bord2);border-radius:6px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:var(--tx3);transition:color .15s,opacity .15s;opacity:.4">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 7H6a4 4 0 0 0 0 8h4"/><polyline points="13,4 13,7 10,7"/></svg>
        </button>
      </div>
    </div>

    <!-- L3: placeholder strips for other tools -->
    <div id="l3-sign" class="l3 hide"><span style="font-size:12px;color:#22d3a0;font-weight:500">Draw and place your signature</span></div>
    <div id="l3-annotate" class="l3 hide"><span style="font-size:12px;color:#fbbf24;font-weight:500">Highlight text · add sticky notes · arrow flags</span></div>
    <div id="l3-redact" class="l3 hide">
      <div style="display:flex;align-items:center;gap:12px;padding:8px 14px;background:rgba(249,112,102,.06);border:1px solid rgba(249,112,102,.2);border-radius:9px;width:100%;box-sizing:border-box">
        <svg width="16" height="16" viewBox="0 0 16 16" style="color:#f97066;flex-shrink:0"><use href="#ic-redact"/></svg>
        <div style="flex:1"><div style="font-size:12px;font-weight:600;color:#f97066">Redact — Pro feature</div><div style="font-size:11px;color:var(--tx2)">Permanent removal · GDPR &amp; HIPAA compliant</div></div>
        <button style="background:#f97066;color:#fff;border:none;border-radius:7px;padding:7px 14px;font-size:11px;font-weight:700;flex-shrink:0">Upgrade &#8594;</button>
      </div>
    </div>
    <div id="l3-compress" class="l3 hide">
      <button class="tog-btn" id="cp-toggle" onclick="toggleCP()" style="width:38px;height:22px;border-radius:11px;background:#60a5fa;position:relative;cursor:pointer;padding:0;border:none;flex-shrink:0">
        <div id="cp-k" style="position:absolute;top:3px;left:19px;width:16px;height:16px;border-radius:8px;background:#fff;transition:left .2s var(--spring);box-shadow:0 1px 2px rgba(0,0,0,.3)"></div>
      </button>
      <span id="cp-lbl" style="font-size:12px;font-weight:600;color:#60a5fa">Compress on download</span>
      <span id="cp-est" style="font-size:11px;color:rgba(96,165,250,.55)">· Est. 30–40% reduction</span>
    </div>

  </div>
</div>

<!-- Body -->
<div class="ws-body">

  <!-- Page rail -->
  <div class="page-rail" id="pg-rail">
    <div class="pg-thumb active" data-p="1" onclick="selPg(1)">
      <div class="pg-lines">
        <div class="pg-line h"></div>
        <div class="pg-line h" style="width:55%"></div>
        <div class="pg-line" style="width:82%"></div>
        <div class="pg-line" style="width:68%"></div>
        <div class="pg-line" style="width:75%"></div>
        <div class="pg-line h" style="margin-top:3px;width:50%"></div>
        <div class="pg-line" style="width:88%"></div>
      </div>
      <div class="pg-num">1</div>
    </div>
    <div class="pg-thumb" data-p="2" onclick="selPg(2)">
      <div class="pg-lines">
        <div class="pg-line h" style="width:45%"></div>
        <div class="pg-line" style="width:90%"></div>
        <div class="pg-line" style="width:76%"></div>
        <div class="pg-line h" style="margin-top:3px;width:48%"></div>
        <div class="pg-line" style="width:80%"></div>
      </div>
      <div class="pg-num">2</div>
    </div>
    <div class="pg-thumb" data-p="3" onclick="selPg(3)">
      <div class="pg-lines">
        <div class="pg-line" style="width:70%"></div>
        <div class="pg-line" style="width:85%"></div>
        <div class="pg-line h" style="margin-top:3px;width:42%"></div>
        <div class="pg-line" style="width:88%"></div>
      </div>
      <div class="pg-num">3</div>
    </div>
  </div>

  <!-- Canvas -->
  <div class="canvas-area" id="canvas-area">
    <div id="drag-sel-rect" style="position:fixed;border:1px solid #818cf8;background:rgba(129,140,248,.1);border-radius:2px;pointer-events:none;display:none;z-index:30"></div>
    <div class="pdf-doc" id="pdf-doc">
      <div class="pdf-t"><span class="pdf-f" data-f="title" onclick="fClick(this)">Service Agreement</span></div>
      <div style="margin-bottom:18px">
        <div class="pdf-meta-line">Dated: <span class="pdf-f" data-f="date" onclick="fClick(this)">March 18, 2026</span></div>
        <div class="pdf-meta-line">Between: <span class="pdf-f" data-f="p1" onclick="fClick(this)">Lounge Labs UG</span> ("Provider")</div>
        <div class="pdf-meta-line">And: <span class="pdf-f" data-f="p2" onclick="fClick(this)">Acme Corporation</span> ("Client")</div>
      </div>
      <div style="height:1px;background:#e5e7eb;margin-bottom:16px"></div>
      <div class="pdf-sec">1. Services</div>
      <div class="pdf-body">Provider agrees to deliver software services as outlined in Schedule A. <span class="pdf-f" data-f="scope" onclick="fClick(this)">The scope includes design, development, and ongoing support.</span></div>
      <div class="pdf-sec">2. Payment Terms</div>
      <div class="pdf-body">Total Contract Value: <span class="pdf-f" data-f="val" onclick="fClick(this)">$12,500.00</span><br>Payments due within <span class="pdf-f" data-f="days" onclick="fClick(this)">30 days</span> of invoice. Late fees apply on overdue amounts.</div>
      <div class="pdf-sec">3. Confidentiality</div>
      <div class="pdf-body">Both parties maintain strict confidentiality for <span class="pdf-f" data-f="conf" onclick="fClick(this)">3 years</span> following termination of this agreement.</div>
      <div class="pdf-sec">4. Governing Law</div>
      <div class="pdf-body">Governed by the laws of <span class="pdf-f" data-f="jur" onclick="fClick(this)">Germany (Berlin)</span>. Disputes resolved by arbitration.</div>
      <div style="position:absolute;bottom:16px;left:38px;right:38px">
        <div style="display:flex;gap:20px">
          <div class="sig-zone"><div class="sig-label">Provider — Lounge Labs UG</div><div style="height:30px"></div></div>
          <div class="sig-zone"><div class="sig-label">Client — Acme Corporation</div><div style="height:30px"></div></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Download modal -->
<div class="modal-ov" id="dl-modal">
  <div class="modal-box">
    <div class="modal-hd">Ready to download <button class="modal-x" onclick="document.getElementById('dl-modal').classList.remove('open')">&#215;</button></div>
    <div id="dl-rows"></div>
    <button class="m-confirm-dl" onclick="document.getElementById('dl-modal').classList.remove('open')">&#8595; Download PDF</button>
  </div>
</div>

<div class="proto-lbl">LocalPDF · Edit Screen · Lounge Labs UG</div>

<script>
const TM={
  edit:    {color:'#818cf8'},
  sign:    {color:'#22d3a0'},
  annotate:{color:'#fbbf24'},
  redact:  {color:'#f97066'},
  compress:{color:'#60a5fa'},
};

const S={tool:'edit',edits:{},activePg:1,editEl:null,cpOn:true};

/* ── PILL ── */
function pill(){
  const r=document.getElementById('ws-sel'),p=document.getElementById('ws-pill');
  if(!r||!p)return;
  const a=r.querySelector('.sel-tab.active');if(!a)return;
  const rr=r.getBoundingClientRect(),ar=a.getBoundingClientRect();
  p.style.transform=`translateX(${ar.left-rr.left-3}px)`;
  p.style.width=ar.width+'px';
}

/* ── TOOL SWITCH ── */
function setTool(t){
  if(t===S.tool)return;
  S.editEl&&cancelEdit();
  S.tool=t;
  document.querySelectorAll('.sel-tab').forEach(tab=>tab.classList.toggle('active',tab.dataset.t===t));
  pill();
  ['edit','sign','annotate','redact','compress'].forEach(id=>{
    const el=document.getElementById('l3-'+id);
    if(!el)return;
    if(id===t){
      el.classList.remove('hide');
      el.style.opacity='0';el.style.transform='translateY(-3px)';
      requestAnimationFrame(()=>{
        el.style.transition='opacity .15s,transform .15s';
        el.style.opacity='1';el.style.transform='translateY(0)';
      });
    } else {
      el.classList.add('hide');
      el.style.opacity='';el.style.transform='';
    }
  });
  document.documentElement.style.setProperty('--tc',TM[t].color);
  updateRail();
  // cursors
  document.querySelectorAll('.pdf-f').forEach(f=>{
    f.style.cursor=t==='edit'?'text':'default';
  });
}

/* ── PAGE RAIL ── */
function updateRail(){
  document.querySelectorAll('.pg-thumb').forEach(th=>{
    th.classList.toggle('active',parseInt(th.dataset.p)===S.activePg);
  });
}
function selPg(n){S.activePg=n;updateRail()}

/* ── EDIT HISTORY ── */
const hist=[];let hIdx=-1;
function hPush(snap){
  hist.splice(hIdx+1);hist.push(snap);hIdx=hist.length-1;updHist();
}
function histUndo(){
  if(hIdx<=0){if(hIdx===0){applySnap({});hIdx=-1;updHist();}return;}
  hIdx--;applySnap(hist[hIdx]);updHist();
}
function histRedo(){
  if(hIdx>=hist.length-1)return;
  hIdx++;applySnap(hist[hIdx]);updHist();
}
function applySnap(snap){
  S.edits=JSON.parse(JSON.stringify(snap));
  document.querySelectorAll('.pdf-f').forEach(f=>{
    const fd=S.edits[f.dataset.f];
    if(fd){
      f.textContent=fd.value||f.dataset.orig||f.textContent;
      f.classList.add('edited');
      f.style.fontFamily=fd.family||'';
      f.style.fontSize=fd.size?fd.size+'px':'';
      f.style.color=fd.color||'';
      f.style.fontWeight=fd.bold?'700':'';
      f.style.fontStyle=fd.italic?'italic':'';
      f.style.textDecoration=fd.under?'underline':'';
    } else {
      f.classList.remove('edited');f.style.cssText='cursor:text';
    }
  });
  updBadge();
}
function updHist(){
  const u=document.getElementById('undo-btn'),r=document.getElementById('redo-btn');
  if(u){u.style.opacity=hIdx>=0?'1':'.4';u.style.color=hIdx>=0?'var(--tx2)':'var(--tx3)';}
  if(r){r.style.opacity=hIdx<hist.length-1?'1':'.4';r.style.color=hIdx<hist.length-1?'var(--tx2)':'var(--tx3)';}
}

/* ── FIELD SELECTION ── */
let selF=new Set();
function selectField(el){
  clearSel();selF.add(el);el.classList.add('sel-active');syncControls(el);
}
function clearSel(){selF.forEach(f=>{f.classList.remove('sel-active');removeHandles(f)});selF.clear();}
function syncControls(el){
  const fd=S.edits[el.dataset.f]||{};
  document.getElementById('fc-family').value=fd.family||'Georgia,serif';
  document.getElementById('fc-size').value=fd.size||parseInt(getComputedStyle(el).fontSize)||13;
  const c=fd.color||'#1a1a2e';
  document.getElementById('fc-color').value=c;
  document.getElementById('fc-color-preview').style.background=c;
  setFBtn('fc-bold',fd.bold);setFBtn('fc-italic',fd.italic);setFBtn('fc-under',fd.under);
}
function setFBtn(id,on){
  const b=document.getElementById(id);if(!b)return;
  b.style.background=on?'rgba(129,140,248,.18)':'none';
  b.style.borderColor=on?'rgba(129,140,248,.5)':'var(--bord)';
  b.style.color=on?'#818cf8':'var(--tx2)';
}

/* ── FONT CONTROLS ── */
function applyFont(){
  selF.forEach(el=>{
    const fd=S.edits[el.dataset.f]||{value:el.textContent};
    fd.family=document.getElementById('fc-family').value;
    fd.size=parseInt(document.getElementById('fc-size').value);
    fd.color=document.getElementById('fc-color').value;
    document.getElementById('fc-color-preview').style.background=fd.color;
    S.edits[el.dataset.f]=fd;
    el.style.fontFamily=fd.family;el.style.fontSize=fd.size+'px';el.style.color=fd.color;
    el.classList.add('edited');
  });
  hPush(JSON.parse(JSON.stringify(S.edits)));updBadge();
}
function adjSize(d){
  const i=document.getElementById('fc-size');
  i.value=Math.max(6,Math.min(72,parseInt(i.value||13)+d));applyFont();
}
function toggleFmt(type){
  selF.forEach(el=>{
    const fd=S.edits[el.dataset.f]||{value:el.textContent};
    fd[type]=!fd[type];S.edits[el.dataset.f]=fd;
    if(type==='bold')el.style.fontWeight=fd.bold?'700':'400';
    if(type==='italic')el.style.fontStyle=fd.italic?'italic':'normal';
    if(type==='under')el.style.textDecoration=fd.under?'underline':'none';
    el.classList.add('edited');
    setFBtn('fc-bold',fd.bold);setFBtn('fc-italic',fd.italic);setFBtn('fc-under',fd.under);
  });
  hPush(JSON.parse(JSON.stringify(S.edits)));updBadge();
}

/* ── TRANSFORM HANDLES ── */
let txOn=false;
function toggleTransform(){
  txOn=!txOn;
  const w=document.getElementById('tx-toggle-wrap'),c=document.getElementById('tx-check');
  w.style.borderColor=txOn?'#818cf8':'rgba(255,255,255,.3)';
  w.style.background=txOn?'rgba(129,140,248,.15)':'transparent';
  c.style.display=txOn?'block':'none';
  selF.forEach(el=>{txOn?addHandles(el):removeHandles(el)});
}
function addHandles(el){
  removeHandles(el);
  ['tl','tc','tr','ml','mr','bl','bc','br'].forEach(pos=>{
    const h=document.createElement('div');
    h.className='tx-handle';h.dataset.pos=pos;h.dataset.field=el.dataset.f;
    h.style.cssText=`position:absolute;width:7px;height:7px;background:#fff;border:1.5px solid #818cf8;border-radius:1.5px;z-index:25;cursor:${{tl:'nw-resize',tc:'n-resize',tr:'ne-resize',ml:'w-resize',mr:'e-resize',bl:'sw-resize',bc:'s-resize',br:'se-resize'}[pos]}`;
    const er=el.getBoundingClientRect(),pr=el.parentElement.getBoundingClientRect();
    const x=er.left-pr.left,y=er.top-pr.top,w=er.width,ht=er.height;
    const mp={tl:[x-4,y-4],tc:[x+w/2-3,y-4],tr:[x+w-3,y-4],ml:[x-4,y+ht/2-3],mr:[x+w-3,y+ht/2-3],bl:[x-4,y+ht-3],bc:[x+w/2-3,y+ht-3],br:[x+w-3,y+ht-3]};
    h.style.left=mp[pos][0]+'px';h.style.top=mp[pos][1]+'px';
    el.parentElement.appendChild(h);
    h.addEventListener('mousedown',e=>{
      e.preventDefault();e.stopPropagation();
      const sy=e.clientY,ss=parseInt(el.style.fontSize)||13;
      const mv=ev=>{
        const ns=Math.max(6,Math.min(72,ss+Math.round((sy-ev.clientY)/2)));
        el.style.fontSize=ns+'px';document.getElementById('fc-size').value=ns;
        const fd=S.edits[el.dataset.f]||{value:el.textContent};fd.size=ns;S.edits[el.dataset.f]=fd;addHandles(el);
      };
      const up=()=>{hPush(JSON.parse(JSON.stringify(S.edits)));updBadge();document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up)};
      document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);
    });
  });
}
function removeHandles(el){document.querySelectorAll(`.tx-handle[data-field="${el.dataset.f}"]`).forEach(h=>h.remove())}

/* ── FIELD CLICK / EDIT ── */
function fClick(el){
  if(S.tool!=='edit')return;
  selectField(el);startEdit(el);
}
function startEdit(el){
  if(S.editEl===el)return;cancelEdit();S.editEl=el;
  const fd=S.edits[el.dataset.f]||{};
  const orig=fd.value||el.textContent;
  const inp=document.createElement('input');
  inp.className='pdf-ei';inp.value=orig;
  inp.style.fontSize=el.style.fontSize||getComputedStyle(el).fontSize;
  inp.style.fontFamily=el.style.fontFamily||getComputedStyle(el).fontFamily;
  inp.style.fontWeight=el.style.fontWeight||'';
  inp.style.color=el.style.color||'';
  inp.style.width=Math.max(orig.length*7.5+20,80)+'px';
  el.style.display='none';el.parentNode.insertBefore(inp,el.nextSibling);
  inp.focus();inp.select();
  inp.onblur=()=>commitEdit(el,inp);
  inp.onkeydown=e=>{if(e.key==='Enter')inp.blur();if(e.key==='Escape')cancelEdit()};
}
function commitEdit(el,inp){
  const fd=S.edits[el.dataset.f]||{};
  fd.value=inp.value||el.textContent;
  el.textContent=fd.value;el.classList.add('edited');S.edits[el.dataset.f]=fd;
  inp.remove();el.style.display='';S.editEl=null;
  if(txOn)addHandles(el);
  hPush(JSON.parse(JSON.stringify(S.edits)));updBadge();
}
function cancelEdit(){
  if(!S.editEl)return;
  const i=S.editEl.parentNode.querySelector('.pdf-ei');if(i)i.remove();
  S.editEl.style.display='';S.editEl=null;
}

/* ── BADGE ── */
function updBadge(){
  const n=Object.keys(S.edits).length;
  const b=document.getElementById('edit-badge');
  if(n){b.style.cssText='display:inline-flex;background:rgba(129,140,248,.12);color:#818cf8;border-radius:20px;padding:3px 11px';b.textContent=n+' edit'+(n>1?'s':'')}
  else b.style.display='none';
}

/* ── DRAG SELECTION ── */
let drag=null;
document.getElementById('canvas-area').addEventListener('mousedown',e=>{
  if(S.tool!=='edit')return;
  if(e.target.classList.contains('pdf-f')||e.target.classList.contains('pdf-ei'))return;
  drag={sx:e.clientX,sy:e.clientY};
  const r=document.getElementById('drag-sel-rect');
  r.style.display='block';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';r.style.width='0';r.style.height='0';
  e.preventDefault();
});
window.addEventListener('mousemove',e=>{
  if(!drag)return;
  const r=document.getElementById('drag-sel-rect');
  r.style.left=Math.min(e.clientX,drag.sx)+'px';r.style.top=Math.min(e.clientY,drag.sy)+'px';
  r.style.width=Math.abs(e.clientX-drag.sx)+'px';r.style.height=Math.abs(e.clientY-drag.sy)+'px';
});
window.addEventListener('mouseup',e=>{
  if(!drag)return;
  const r=document.getElementById('drag-sel-rect');
  const box={left:parseInt(r.style.left),top:parseInt(r.style.top),right:parseInt(r.style.left)+parseInt(r.style.width),bottom:parseInt(r.style.top)+parseInt(r.style.height)};
  r.style.display='none';
  if(box.right-box.left>5&&box.bottom-box.top>5){
    clearSel();
    document.querySelectorAll('.pdf-f').forEach(f=>{
      const fr=f.getBoundingClientRect();
      if(fr.left<box.right&&fr.right>box.left&&fr.top<box.bottom&&fr.bottom>box.top){selF.add(f);f.classList.add('sel-active');}
    });
    if(selF.size===1)syncControls([...selF][0]);
  }
  drag=null;
});

/* ── CLICK OUTSIDE ── */
document.addEventListener('mousedown',e=>{
  if(S.tool!=='edit')return;
  if(!e.target.classList.contains('pdf-f')&&!e.target.classList.contains('pdf-ei')&&!e.target.closest('#l3-edit')&&!e.target.closest('.tx-handle'))clearSel();
});

/* ── COMPRESS ── */
let cpOn=true;
function toggleCP(){
  cpOn=!cpOn;
  document.getElementById('cp-toggle').style.background=cpOn?'#60a5fa':'rgba(255,255,255,.15)';
  document.getElementById('cp-k').style.left=cpOn?'19px':'3px';
  document.getElementById('cp-lbl').style.color=cpOn?'#60a5fa':'var(--tx3)';
  document.getElementById('cp-est').style.display=cpOn?'inline':'none';
}

/* ── DOWNLOAD MODAL ── */
function openDL(){
  const nE=Object.keys(S.edits).length;
  const rows=[];
  if(nE)rows.push({c:'#818cf8',l:'Text edits applied',n:nE});
  if(cpOn)rows.push({c:'#60a5fa',l:'File compressed',n:'~35%'});
  if(!rows.length)rows.push({c:'var(--tx3)',l:'No changes — original file',n:''});
  document.getElementById('dl-rows').innerHTML=rows.map(r=>`<div class="dl-row"><div class="dl-dot" style="background:${r.c}"></div><span style="flex:1">${r.l}</span><span style="font-size:11px;color:var(--tx3)">${r.n}</span></div>`).join('');
  document.getElementById('dl-modal').classList.add('open');
}

/* ── KEYBOARD ── */
document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key==='z'){e.shiftKey?histRedo():histUndo();e.preventDefault();}
});

/* ── INIT ── */
window.addEventListener('load',()=>{
  document.querySelectorAll('.pdf-f').forEach(f=>f.dataset.orig=f.textContent);
  // start on edit tab
  setTool('edit');
  setTimeout(pill,80);
});
window.addEventListener('resize',pill);
</script>
</body>
</html>