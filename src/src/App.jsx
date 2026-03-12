import { useState, useEffect, useRef, useCallback } from "react";
import { CATEGORIES, selectQuestions, bankStats } from "./questions/index.js";

// ─── CSS custom-property token helper ────────────────────────────────────────
// Every v('token') call returns "var(--token)" — resolves to dark or light
// value automatically based on the data-theme attribute on <html>.
const v = (t) => `var(--${t})`;

// ─── Dual-theme CSS (injected once into <head>) ───────────────────────────────
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');

/* ═══ DARK THEME (default) ═══════════════════════════════════════════════════ */
:root {
  /* Backgrounds */
  --bg:             #0d0f1a;
  --surface:        #161829;
  --surface-alt:    #1e2138;
  --surface-hover:  #252945;
  --border:         #2c3058;
  --border-hi:      #3d4275;

  /* Text */
  --text:           #e8eaf6;
  --text-dim:       #b0b5d0;
  --muted:          #7b80a8;

  /* Brand */
  --primary:        #6c63ff;
  --primary-dim:    #4a43c8;
  --primary-faint:  rgba(108,99,255,0.13);
  --primary-glow:   rgba(108,99,255,0.38);
  --accent:         #ff6584;
  --accent-faint:   rgba(255,101,132,0.12);

  /* Semantic */
  --correct:        #43a047;
  --correct-faint:  rgba(67,160,71,0.16);
  --correct-text:   #a5d6a7;
  --wrong:          #e53935;
  --wrong-faint:    rgba(229,57,53,0.15);
  --wrong-text:     #ffcdd2;
  --warn:           #fb8c00;
  --warn-faint:     rgba(251,140,0,0.13);
  --warn-text:      #ffe0b2;
  --gold:           #ffd700;

  /* Shadows & FX */
  --shadow-sm:      0 2px 8px rgba(0,0,0,0.35);
  --shadow-md:      0 4px 24px rgba(0,0,0,0.5);
  --shadow-btn:     0 4px 20px rgba(108,99,255,0.40);
  --blob1:          rgba(108,99,255,0.09);
  --blob2:          rgba(255,101,132,0.07);
  --blob3:          rgba(251,140,0,0.05);
  --option-hover:   #1e2240;

  color-scheme: dark;
}

/* ═══ LIGHT THEME ════════════════════════════════════════════════════════════ */
[data-theme="light"] {
  /* Backgrounds */
  --bg:             #f0f2ff;
  --surface:        #ffffff;
  --surface-alt:    #eaecf8;
  --surface-hover:  #dde0f5;
  --border:         #cdd1eb;
  --border-hi:      #adb3d8;

  /* Text */
  --text:           #12142a;
  --text-dim:       #363a5c;
  --muted:          #666b94;

  /* Brand — slightly deeper for WCAG AA on white */
  --primary:        #5650e8;
  --primary-dim:    #3a34c4;
  --primary-faint:  rgba(86,80,232,0.10);
  --primary-glow:   rgba(86,80,232,0.25);
  --accent:         #e84068;
  --accent-faint:   rgba(232,64,104,0.10);

  /* Semantic */
  --correct:        #2e7d32;
  --correct-faint:  rgba(46,125,50,0.12);
  --correct-text:   #1b5e20;
  --wrong:          #c62828;
  --wrong-faint:    rgba(198,40,40,0.10);
  --wrong-text:     #7f0000;
  --warn:           #e65100;
  --warn-faint:     rgba(230,81,0,0.10);
  --warn-text:      #bf360c;
  --gold:           #b8860b;

  /* Shadows & FX */
  --shadow-sm:      0 2px 8px rgba(0,0,0,0.08);
  --shadow-md:      0 4px 24px rgba(0,0,0,0.14);
  --shadow-btn:     0 4px 20px rgba(86,80,232,0.30);
  --blob1:          rgba(86,80,232,0.06);
  --blob2:          rgba(232,64,104,0.05);
  --blob3:          rgba(230,81,0,0.04);
  --option-hover:   #edf0ff;

  color-scheme: light;
}

/* ═══ SMOOTH THEME TRANSITION ════════════════════════════════════════════════ */
/* Applied briefly on toggle, then removed so hover/active transitions stay snappy */
.theme-transitioning,
.theme-transitioning *,
.theme-transitioning *::before,
.theme-transitioning *::after {
  transition:
    background-color 0.30s ease,
    border-color     0.30s ease,
    color            0.20s ease,
    box-shadow       0.30s ease,
    opacity          0.20s ease !important;
}

/* ═══ BASE ═══════════════════════════════════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Nunito', sans-serif;
  min-height: 100vh;
}

button { cursor: pointer; border: none; font-family: inherit; transition: all 0.18s ease; }
button:disabled { opacity: 0.45; cursor: not-allowed; }

/* ═══ LAYOUT ════════════════════════════════════════════════════════════════ */
.screen {
  min-height: 100vh; width: 100%; max-width: 540px;
  margin: 0 auto; padding: 24px 20px 64px;
  display: flex; flex-direction: column; gap: 18px;
}
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

/* ═══ PRIMARY BUTTON ════════════════════════════════════════════════════════ */
.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-dim));
  color: #fff; border-radius: 50px; font-weight: 800; font-size: 16px;
  padding: 15px 28px; width: 100%; box-shadow: var(--shadow-btn);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px var(--primary-glow);
}
.btn-primary:active:not(:disabled) { transform: translateY(0); }

/* ═══ SECONDARY BUTTON ══════════════════════════════════════════════════════ */
.btn-secondary {
  background: var(--surface-alt);
  color: var(--text-dim);
  border: 1.5px solid var(--border);
  border-radius: 50px; font-weight: 700; font-size: 15px;
  padding: 12px 24px; width: 100%;
}
.btn-secondary:hover:not(:disabled) {
  border-color: var(--primary); color: var(--text);
  background: var(--surface-hover);
}

/* ═══ ANSWER OPTIONS ════════════════════════════════════════════════════════ */
.option-btn {
  background: var(--surface-alt);
  border: 2px solid var(--border);
  border-radius: 16px; color: var(--text);
  font-weight: 700; font-size: 15px; padding: 14px 18px;
  text-align: left; width: 100%;
  display: flex; align-items: center; gap: 12px; line-height: 1.4;
}
.option-btn:hover:not(:disabled) {
  border-color: var(--primary);
  background: var(--option-hover);
  transform: translateX(3px);
}
.option-btn.selected { border-color: var(--primary); background: var(--primary-faint); }
.option-btn.correct  { border-color: var(--correct); background: var(--correct-faint); color: var(--correct-text); }
.option-btn.wrong    { border-color: var(--wrong);   background: var(--wrong-faint);   color: var(--wrong-text);   }
.option-btn.timeout  { border-color: var(--warn);    background: var(--warn-faint);    color: var(--warn-text);    }

.option-letter {
  min-width: 32px; height: 32px; border-radius: 50%;
  background: var(--border); color: var(--muted);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 13px; flex-shrink: 0;
}
.option-btn.correct  .option-letter { background: var(--correct); color: #fff; }
.option-btn.wrong    .option-letter { background: var(--wrong);   color: #fff; }
.option-btn.selected .option-letter { background: var(--primary); color: #fff; }

/* ═══ SEGMENTED CONTROL ═════════════════════════════════════════════════════ */
.seg-btn {
  flex: 1; padding: 9px 4px; border-radius: 12px; font-weight: 700;
  font-size: 13px; color: var(--muted);
  background: transparent; border: 2px solid transparent;
}
.seg-btn.active {
  background: var(--surface); color: var(--text);
  box-shadow: var(--shadow-sm); border-color: var(--primary);
}

/* ═══ DIFFICULTY BADGES ══════════════════════════════════════════════════════ */
.diff-badge {
  display: inline-block; padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 700;
}
.diff-badge.easy   { background: var(--correct-faint); color: var(--correct); }
.diff-badge.medium { background: var(--warn-faint);    color: var(--warn);    }
.diff-badge.hard   { background: var(--wrong-faint);   color: var(--wrong);   }
.diff-badge.mixed  { background: var(--primary-faint); color: var(--primary); }

/* ═══ PROGRESS / TIMER BARS ═════════════════════════════════════════════════ */
.progress-bar-bg { background: var(--border); border-radius: 99px; height: 8px; overflow: hidden; }
.progress-bar    { height: 100%; border-radius: 99px;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  transition: width 0.4s ease; }
.timer-bar-bg    { background: var(--border); border-radius: 99px; height: 10px; overflow: hidden; }
.timer-bar       { height: 100%; border-radius: 99px; transition: width 0.1s linear, background 0.3s; }

/* ═══ CATEGORY CHIP ══════════════════════════════════════════════════════════ */
.category-chip {
  border: 2px solid transparent; border-radius: 16px; padding: 12px 8px;
  cursor: pointer; display: flex; flex-direction: column; align-items: center;
  gap: 5px; font-weight: 700; font-size: 12px; text-align: center;
  transition: all 0.18s ease; background: var(--surface-alt);
  min-height: 82px; justify-content: center; color: var(--text-dim);
}
.category-chip:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.category-chip.active { color: #fff; }

/* ═══ MODE CARD ══════════════════════════════════════════════════════════════ */
.mode-card {
  background: var(--surface-alt); border: 2px solid var(--border);
  border-radius: 18px; padding: 16px 18px; cursor: pointer;
  text-align: left; display: flex; align-items: center;
  gap: 14px; transition: all 0.18s ease; width: 100%;
}
.mode-card:hover  { border-color: var(--primary); background: var(--surface-hover); transform: translateX(3px); }
.mode-card.active { border-color: var(--primary); background: var(--primary-faint); }
.mode-emoji { font-size: 28px; min-width: 40px; text-align: center; }

/* ═══ STREAK / HEARTS ════════════════════════════════════════════════════════ */
.streak-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 12px; border-radius: 99px; font-weight: 800; font-size: 13px;
  background: rgba(255,215,0,0.12); color: var(--gold);
  border: 1px solid rgba(255,215,0,0.25);
}
.streak-badge.hot {
  animation: pulse 0.6s ease infinite;
  background: rgba(255,100,0,0.18); color: #ff6400;
  border-color: rgba(255,100,0,0.35);
}
.life-heart { font-size: 22px; transition: all 0.3s ease; display: inline-block; }
.life-heart.lost { opacity: 0.2; filter: grayscale(1); transform: scale(0.8); }

/* ═══ THEME TOGGLE ═══════════════════════════════════════════════════════════ */
.theme-toggle-btn {
  position: fixed; top: 14px; right: 14px; z-index: 300;
  background: var(--surface); border: 1.5px solid var(--border);
  border-radius: 99px; padding: 6px 12px 6px 8px;
  display: flex; align-items: center; gap: 9px;
  cursor: pointer; box-shadow: var(--shadow-sm); font-family: inherit;
}
.theme-toggle-btn:hover { border-color: var(--primary); box-shadow: var(--shadow-md); }

.toggle-track {
  width: 40px; height: 22px; border-radius: 99px;
  background: var(--border); position: relative;
  flex-shrink: 0; transition: background 0.3s;
}
.toggle-track.on { background: var(--primary); }
.toggle-knob {
  position: absolute; top: 3px; left: 3px;
  width: 16px; height: 16px; border-radius: 50%; background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3); transition: transform 0.3s ease;
}
.toggle-knob.on { transform: translateX(18px); }

/* ═══ ANIMATIONS ═════════════════════════════════════════════════════════════ */
@keyframes pop     { 0%{transform:scale(.78);opacity:0} 62%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
@keyframes fadeUp  { 0%{transform:translateY(18px);opacity:0} 100%{transform:translateY(0);opacity:1} }
@keyframes wiggle  { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
@keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.55} }
@keyframes shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
@keyframes glow    { 0%,100%{box-shadow:var(--shadow-sm)} 50%{box-shadow:0 0 28px var(--primary-glow)} }
@keyframes floatUp { 0%{opacity:0;transform:translateY(8px) scale(.9)} 100%{opacity:1;transform:translateY(0) scale(1)} }

.anim-pop    { animation: pop    0.35s ease forwards; }
.anim-fadeup { animation: fadeUp 0.30s ease forwards; }
.anim-shake  { animation: shake  0.40s ease; }

/* ═══ SCROLLBAR ══════════════════════════════════════════════════════════════ */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const LETTERS       = ["A","B","C","D"];
const DIFF_LABELS   = { easy:"Easy", medium:"Medium", hard:"Hard", mixed:"Mixed" };
const BLITZ_SECS    = 15;
const GAME_MODES    = [
  { id:"classic",   label:"Classic",   emoji:"🎯", desc:"Answer at your own pace — no clock, no pressure." },
  { id:"blitz",     label:"Blitz",     emoji:"⚡", desc:`${BLITZ_SECS}s per question. Speed AND accuracy matter.` },
  { id:"endurance", label:"Endurance", emoji:"❤️", desc:"3 lives. One wrong answer costs a life. Go forever." },
];

// ─── Theme hook ───────────────────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("qb-theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch (_) {}
    return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    // Brief transition class for smooth switch, then remove so hover stays snappy
    root.classList.add("theme-transitioning");
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("qb-theme", theme); } catch (_) {}
    const tid = setTimeout(() => root.classList.remove("theme-transitioning"), 380);
    return () => clearTimeout(tid);
  }, [theme]);

  const toggle = useCallback(() => setTheme(t => t === "dark" ? "light" : "dark"), []);
  return { theme, toggle };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Returns a CSS var reference that resolves to the correct colour in either theme
function scoreColor(pct) {
  if (pct >= 0.8) return v("correct");
  if (pct >= 0.5) return v("warn");
  return v("wrong");
}

function gradeMessage(pct, mode) {
  if (mode === "endurance") {
    if (pct === 1)   return { t:"Flawless run!",    e:"🏆" };
    if (pct >= 0.8)  return { t:"Impressive!",      e:"🌟" };
    return               { t:"Good effort!",      e:"💪" };
  }
  if (pct === 1)   return { t:"Perfect Score!",   e:"🏆" };
  if (pct >= 0.9)  return { t:"Outstanding!",     e:"🌟" };
  if (pct >= 0.8)  return { t:"Brilliant!",       e:"⭐" };
  if (pct >= 0.6)  return { t:"Well done!",       e:"👏" };
  if (pct >= 0.4)  return { t:"Keep going!",      e:"💪" };
  return               { t:"Keep practising!",  e:"📚" };
}

// ─── Theme Toggle component ───────────────────────────────────────────────────
function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button
      className="theme-toggle-btn"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sliding pill track */}
      <span className={`toggle-track${isDark ? "" : " on"}`} aria-hidden="true">
        <span className={`toggle-knob${isDark ? "" : " on"}`}/>
      </span>
      {/* Icon + label */}
      <span style={{fontSize:15}}>{isDark ? "🌙" : "☀️"}</span>
      <span style={{fontSize:12, fontWeight:800, color:v("muted"), letterSpacing:0.4, textTransform:"uppercase"}}>
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}

// ─── Background ambient blobs ─────────────────────────────────────────────────
function BgBlobs() {
  return (
    <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      <div style={{position:"absolute",width:420,height:420,borderRadius:"50%",
        background:"radial-gradient(circle, var(--blob1), transparent 70%)",top:-120,right:-120}}/>
      <div style={{position:"absolute",width:300,height:300,borderRadius:"50%",
        background:"radial-gradient(circle, var(--blob2), transparent 70%)",bottom:60,left:-80}}/>
      <div style={{position:"absolute",width:220,height:220,borderRadius:"50%",
        background:"radial-gradient(circle, var(--blob3), transparent 70%)",top:"42%",left:"50%",transform:"translateX(-50%)"}}/>
    </div>
  );
}

// ─── Animated score ring (SVG) ────────────────────────────────────────────────
function ScoreRing({ score, total, size = 130 }) {
  const pct  = total > 0 ? score / total : 0;
  const r    = (size - 18) / 2;
  const circ = 2 * Math.PI * r;
  // SVG supports CSS var() in fill/stroke on modern browsers
  const arc  = scoreColor(pct);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--border)" strokeWidth={12}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={arc} strokeWidth={12}
        strokeDasharray={`${pct * circ} ${circ}`}
        strokeDashoffset={circ / 4} strokeLinecap="round"
        style={{transition:"stroke-dasharray 1.2s ease"}}/>
      <text x="50%" y="46%" dominantBaseline="middle" textAnchor="middle"
        style={{fontFamily:"Fredoka One", fontSize:size*.22, fill:"var(--text)"}}>
        {score}/{total}
      </text>
      <text x="50%" y="70%" dominantBaseline="middle" textAnchor="middle"
        style={{fontFamily:"Fredoka One", fontSize:size*.14, fill:"var(--muted)"}}>
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOME SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function HomeScreen({ theme, onToggleTheme, onStart }) {
  const stats = bankStats();
  return (
    <div className="screen" style={{justifyContent:"center", alignItems:"center", gap:22, position:"relative"}}>
      <BgBlobs/>
      <ThemeToggle theme={theme} onToggle={onToggleTheme}/>

      {/* Hero */}
      <div style={{position:"relative", zIndex:1, textAlign:"center", width:"100%"}}>
        <div style={{fontSize:76, marginBottom:4, animation:"wiggle 2.8s ease infinite", display:"inline-block"}}>🧠</div>
        <h1 style={{
          fontFamily:"Fredoka One", fontSize:54, lineHeight:1.0, letterSpacing:.5,
          background:`linear-gradient(135deg, ${v("primary")}, ${v("accent")})`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        }}>BrainZap</h1>
        <p style={{color:v("muted"), fontSize:14, marginTop:8, lineHeight:1.6}}>
          {stats.total} questions · {stats.categories} categories · 3 game modes · 100% offline
        </p>
      </div>

      {/* Stats bar */}
      <div className="card" style={{width:"100%", position:"relative", zIndex:1}}>
        <div style={{display:"flex", gap:10}}>
          {[
            {val:stats.total,      lbl:"Questions", col:v("primary")},
            {val:stats.categories, lbl:"Categories",col:v("accent")},
            {val:3,                lbl:"Game Modes", col:v("warn")},
          ].map(({val,lbl,col})=>(
            <div key={lbl} style={{
              background:v("surface-alt"), borderRadius:14, padding:"14px 10px",
              textAlign:"center", flex:1, border:`1px solid ${v("border")}`,
            }}>
              <div style={{fontFamily:"Fredoka One", fontSize:28, color:col}}>{val}</div>
              <div style={{color:v("muted"), fontSize:11, marginTop:2}}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category pills */}
      <div style={{position:"relative", zIndex:1, display:"flex", flexWrap:"wrap",
        gap:7, justifyContent:"center", width:"100%"}}>
        {CATEGORIES.map(c => (
          <div key={c.id} style={{
            background:c.color+"22", border:`1px solid ${c.color}55`,
            borderRadius:10, padding:"5px 10px",
            fontSize:12, fontWeight:700, color:c.color,
          }}>
            {c.emoji} {c.label}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{width:"100%", position:"relative", zIndex:1}}>
        <button className="btn-primary" onClick={onStart}
          style={{fontSize:19, padding:"18px 28px", letterSpacing:.4}}>
          Let's Play! 🎮
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETUP SCREEN  (3-step wizard: Mode → Categories → Options)
// ═══════════════════════════════════════════════════════════════════════════════
function SetupScreen({ theme, onToggleTheme, onPlay, onBack }) {
  const [step,       setStep]       = useState(0);
  const [mode,       setMode]       = useState("classic");
  const [selCats,    setSelCats]    = useState(CATEGORIES.map(c => c.id));
  const [count,      setCount]      = useState(10);
  const [difficulty, setDifficulty] = useState("mixed");

  const toggleCat = id =>
    setSelCats(p => p.includes(id)
      ? p.length > 1 ? p.filter(x => x !== id) : p
      : [...p, id]);

  const stepLabels = ["Mode", "Topics", "Options"];

  return (
    <div className="screen" style={{position:"relative"}}>
      <BgBlobs/>
      <ThemeToggle theme={theme} onToggle={onToggleTheme}/>

      {/* Header + progress */}
      <div style={{position:"relative", zIndex:1, display:"flex", alignItems:"center", gap:10}}>
        <button onClick={step === 0 ? onBack : () => setStep(s => s - 1)}
          style={{background:"none", color:v("muted"), fontSize:24, padding:"2px 6px", borderRadius:8}}>
          ←
        </button>
        <div style={{flex:1}}>
          <h2 style={{fontFamily:"Fredoka One", fontSize:26, color:v("text")}}>Game Setup</h2>
          <div style={{display:"flex", gap:4, marginTop:5}}>
            {stepLabels.map((s, i) => (
              <div key={s} style={{
                height:5, borderRadius:99, flex:1,
                background: i <= step ? v("primary") : v("border"),
                transition:"background .35s",
              }}/>
            ))}
          </div>
        </div>
        <div style={{fontFamily:"Fredoka One", fontSize:14, color:v("muted")}}>{step+1}/{stepLabels.length}</div>
      </div>

      {/* ── Step 0: Game Mode ── */}
      {step === 0 && (
        <div style={{position:"relative", zIndex:1, display:"flex", flexDirection:"column", gap:10}}>
          <h3 style={{fontFamily:"Fredoka One", fontSize:20, color:v("text")}}>Choose your mode</h3>
          {GAME_MODES.map(m => (
            <button key={m.id} className={`mode-card${mode === m.id ? " active" : ""}`}
              onClick={() => setMode(m.id)}>
              <span className="mode-emoji">{m.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:800, fontSize:16, color:mode === m.id ? v("primary") : v("text")}}>
                  {m.label}
                </div>
                <div style={{fontSize:13, color:v("muted"), marginTop:2}}>{m.desc}</div>
              </div>
              {mode === m.id && <span style={{color:v("primary"), fontSize:20}}>✓</span>}
            </button>
          ))}
        </div>
      )}

      {/* ── Step 1: Categories ── */}
      {step === 1 && (
        <div className="card" style={{position:"relative", zIndex:1}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
            <h3 style={{fontFamily:"Fredoka One", fontSize:20, color:v("text")}}>Pick your topics</h3>
            <div style={{display:"flex", gap:8}}>
              <button onClick={() => setSelCats(CATEGORIES.map(c => c.id))}
                style={{background:"none", color:v("primary"), fontSize:12, fontWeight:700,
                  padding:"4px 10px", borderRadius:8, border:`1px solid ${v("primary")}44`}}>
                All
              </button>
              <button onClick={() => setSelCats([CATEGORIES[0].id])}
                style={{background:"none", color:v("muted"), fontSize:12, fontWeight:700,
                  padding:"4px 10px", borderRadius:8, border:`1px solid ${v("border")}`}}>
                Reset
              </button>
            </div>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8}}>
            {CATEGORIES.map(c => {
              const active = selCats.includes(c.id);
              return (
                <button key={c.id}
                  className={`category-chip${active ? " active" : ""}`}
                  onClick={() => toggleCat(c.id)}
                  style={active
                    ? {borderColor:c.color, background:c.color+"28", color:c.color}
                    : {}}>
                  <span style={{fontSize:26}}>{c.emoji}</span>
                  <span style={{fontSize:10, lineHeight:1.25}}>{c.label}</span>
                </button>
              );
            })}
          </div>
          <p style={{color:v("muted"), fontSize:12, marginTop:12, textAlign:"center"}}>
            {selCats.length} of {CATEGORIES.length} selected
          </p>
        </div>
      )}

      {/* ── Step 2: Options ── */}
      {step === 2 && (
        <div style={{position:"relative", zIndex:1, display:"flex", flexDirection:"column", gap:14}}>

          {/* Endurance info banner */}
          {mode === "endurance" ? (
            <div className="card" style={{borderColor:v("warn")+"66",
              background:`${v("warn-faint")}`}}>
              <div style={{display:"flex", alignItems:"center", gap:12}}>
                <span style={{fontSize:28}}>❤️❤️❤️</span>
                <div>
                  <div style={{fontWeight:800, color:v("warn"), fontSize:15}}>Endurance Mode</div>
                  <div style={{color:v("muted"), fontSize:13, marginTop:2}}>
                    Questions continue until you lose all 3 lives. No question limit.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <h3 style={{fontFamily:"Fredoka One", fontSize:18, color:v("text"), marginBottom:12}}>
                Questions per game
              </h3>
              <div style={{display:"flex", gap:8}}>
                {[5, 10, 15, 20].map(n => (
                  <button key={n}
                    className={`seg-btn${count === n ? " active" : ""}`}
                    onClick={() => setCount(n)}
                    style={{padding:"12px 0", fontWeight:800, fontSize:18,
                      border:`2px solid ${count === n ? v("primary") : v("border")}`,
                      background: count === n ? v("surface-alt") : "transparent"}}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty picker */}
          <div className="card">
            <h3 style={{fontFamily:"Fredoka One", fontSize:18, color:v("text"), marginBottom:12}}>
              Difficulty
            </h3>
            <div style={{display:"flex", background:v("bg"), borderRadius:14, padding:4, gap:4}}>
              {["mixed","easy","medium","hard"].map(d => (
                <button key={d}
                  className={`seg-btn${difficulty === d ? " active" : ""}`}
                  onClick={() => setDifficulty(d)}>
                  {DIFF_LABELS[d]}
                </button>
              ))}
            </div>
            <div style={{
              marginTop:10, padding:"9px 14px", background:v("bg"),
              borderRadius:10, display:"flex", alignItems:"center", gap:9,
            }}>
              <span className={`diff-badge ${difficulty}`}>{DIFF_LABELS[difficulty]}</span>
              <span style={{color:v("muted"), fontSize:13}}>
                {difficulty === "mixed" ? "All difficulties blended evenly" : `Only ${difficulty} questions`}
              </span>
            </div>
          </div>

          {/* Summary card */}
          <div className="card" style={{background:v("primary-faint"), borderColor:v("primary")+"55"}}>
            <div style={{fontFamily:"Fredoka One", fontSize:16, color:v("text"), marginBottom:9}}>
              Session summary
            </div>
            <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
              {[
                GAME_MODES.find(m => m.id === mode)?.emoji + " " + GAME_MODES.find(m => m.id === mode)?.label,
                mode === "endurance" ? "♾️ Unlimited" : `${count} Questions`,
                DIFF_LABELS[difficulty],
                `${selCats.length} Topic${selCats.length !== 1 ? "s" : ""}`,
              ].map(lbl => (
                <span key={lbl} style={{
                  background:v("surface-alt"), borderRadius:10, padding:"5px 12px",
                  fontSize:13, fontWeight:700, color:v("text-dim"),
                  border:`1px solid ${v("border")}`,
                }}>
                  {lbl}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{position:"relative", zIndex:1, marginTop:"auto"}}>
        {step < 2 ? (
          <button className="btn-primary" onClick={() => setStep(s => s + 1)}>
            {step === 0 ? "Choose Topics →" : "Set Options →"}
          </button>
        ) : (
          <button className="btn-primary"
            onClick={() => onPlay({ mode, categoryIds:selCats, count:mode === "endurance" ? 999 : count, difficulty })}>
            Start Quiz 🚀
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAME SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function GameScreen({ questions, mode, theme, onToggleTheme, onFinish }) {
  const [idx,       setIdx]       = useState(0);
  const [selected,  setSelected]  = useState(null);
  const [revealed,  setRevealed]  = useState(false);
  const [lives,     setLives]     = useState(3);
  const [streak,    setStreak]    = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft,  setTimeLeft]  = useState(BLITZ_SECS);
  const [timedOut,  setTimedOut]  = useState(false);
  const [shake,     setShake]     = useState(false);

  const scoreRef   = useRef(0);
  const annotated  = useRef(questions.map(q => ({...q, answeredCorrectly:false})));
  const timerRef   = useRef(null);
  const topRef     = useRef(null);

  const q           = questions[idx];
  const isLast      = idx + 1 >= questions.length;
  const pct         = (idx + 1) / questions.length;
  const isEndurance = mode === "endurance";
  const isBlitz     = mode === "blitz";

  // Reset state on question change
  useEffect(() => {
    topRef.current?.scrollIntoView({behavior:"smooth"});
    setSelected(null); setRevealed(false); setTimedOut(false); setShake(false);
    if (isBlitz) setTimeLeft(BLITZ_SECS);
  }, [idx]);

  // Blitz countdown
  useEffect(() => {
    if (!isBlitz || revealed || timedOut) return;
    if (timeLeft <= 0) { handleTimeout(); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [isBlitz, timeLeft, revealed, timedOut]);

  function handleTimeout() {
    clearTimeout(timerRef.current);
    setTimedOut(true); setRevealed(true);
    setStreak(0);
    annotated.current[idx].answeredCorrectly = false;
  }

  function answer(i) {
    if (revealed) return;
    clearTimeout(timerRef.current);
    setSelected(i); setRevealed(true);
    const correct = i === q.correct;
    if (correct) {
      scoreRef.current++;
      const ns = streak + 1;
      setStreak(ns); setMaxStreak(m => Math.max(m, ns));
      annotated.current[idx].answeredCorrectly = true;
    } else {
      setStreak(0);
      if (isEndurance) { setLives(l => l - 1); setShake(true); setTimeout(() => setShake(false), 450); }
    }
  }

  function advance() {
    const livesAfter = isEndurance && selected !== null && selected !== q.correct ? lives - 1 : lives;
    if (isEndurance && livesAfter <= 0) {
      onFinish({ finalScore:scoreRef.current, annotatedQuestions:annotated.current.slice(0, idx+1), maxStreak, mode });
      return;
    }
    if (isLast) {
      onFinish({ finalScore:scoreRef.current, annotatedQuestions:annotated.current, maxStreak, mode });
    } else {
      setIdx(i => i + 1);
    }
  }

  const livesNow   = isEndurance && selected !== null && selected !== q.correct ? lives - 1 : lives;
  const isCorrect  = revealed && !timedOut && selected === q.correct;
  const timerPct   = timeLeft / BLITZ_SECS;
  const timerColor = timerPct > 0.5 ? "var(--correct)" : timerPct > 0.25 ? "var(--warn)" : "var(--wrong)";

  return (
    <div ref={topRef} className={`screen${shake ? " anim-shake" : ""}`} style={{position:"relative"}}>
      <BgBlobs/>
      <ThemeToggle theme={theme} onToggle={onToggleTheme}/>

      {/* ── Top status bar ── */}
      <div style={{position:"relative", zIndex:1, display:"flex", justifyContent:"space-between",
        alignItems:"center", gap:8, flexWrap:"wrap"}}>
        <div style={{
          background:v("surface-alt"), borderRadius:12, padding:"5px 12px",
          fontSize:13, fontWeight:700, color:v("text-dim"),
          border:`1px solid ${v("border")}`,
        }}>
          {q.categoryEmoji} {q.categoryLabel}
        </div>

        <div style={{display:"flex", alignItems:"center", gap:8}}>
          {streak >= 3 && (
            <div className={`streak-badge${streak >= 5 ? " hot" : ""}`}>
              🔥 {streak}x streak
            </div>
          )}
          {isEndurance ? (
            <div style={{display:"flex", gap:3}}>
              {[0,1,2].map(i => (
                <span key={i} className={`life-heart${i >= livesNow ? " lost" : ""}`}>❤️</span>
              ))}
            </div>
          ) : (
            <div style={{
              fontFamily:"Fredoka One", fontSize:15, color:v("muted"),
              background:v("surface-alt"), borderRadius:10, padding:"4px 10px",
              border:`1px solid ${v("border")}`,
            }}>
              {idx+1} / {questions.length}
            </div>
          )}
        </div>

        <span className={`diff-badge ${q.difficulty}`}>{DIFF_LABELS[q.difficulty]}</span>
      </div>

      {/* Progress bar */}
      {!isEndurance && (
        <div className="progress-bar-bg" style={{position:"relative", zIndex:1}}>
          <div className="progress-bar" style={{width:`${pct*100}%`}}/>
        </div>
      )}

      {/* Blitz timer */}
      {isBlitz && !revealed && (
        <div style={{position:"relative", zIndex:1}}>
          <div className="timer-bar-bg">
            <div className="timer-bar" style={{width:`${timerPct*100}%`, background:timerColor}}/>
          </div>
          <div style={{textAlign:"right", fontSize:12, color:timerColor, fontWeight:800, marginTop:3}}>
            {timeLeft}s
          </div>
        </div>
      )}

      {/* Score indicator */}
      <div style={{position:"relative", zIndex:1, display:"flex", justifyContent:"flex-end"}}>
        <div style={{
          background:v("surface-alt"), borderRadius:12, padding:"4px 14px",
          fontSize:13, fontWeight:700, color:v("text-dim"),
          border:`1px solid ${v("border")}`,
        }}>
          ⭐ {scoreRef.current} pts
        </div>
      </div>

      {/* Question card */}
      <div className="card anim-fadeup" key={`q-${idx}`} style={{position:"relative", zIndex:1}}>
        <p style={{fontSize:17, fontWeight:800, lineHeight:1.6, color:v("text")}}>{q.question}</p>
      </div>

      {/* Answer options */}
      <div style={{position:"relative", zIndex:1, display:"flex", flexDirection:"column", gap:9}} key={`opts-${idx}`}>
        {q.options.map((opt, i) => {
          let cls = "option-btn";
          if (revealed) {
            if (i === q.correct) cls += " correct";
            else if (i === selected) cls += " wrong";
            else if (timedOut) cls += " timeout";
          } else if (i === selected) {
            cls += " selected";
          }
          return (
            <button key={i} className={cls} onClick={() => answer(i)} disabled={revealed}>
              <span className="option-letter">{LETTERS[i]}</span>
              <span style={{flex:1}}>{opt}</span>
              {revealed && i === q.correct && <span style={{fontSize:18}}>✓</span>}
              {revealed && i === selected && i !== q.correct && <span style={{fontSize:18}}>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Feedback panel */}
      {revealed && (
        <div className="card anim-pop" key={`fb-${idx}`} style={{
          position:"relative", zIndex:1, borderWidth:2,
          borderColor: timedOut ? v("warn") : isCorrect ? v("correct") : v("wrong"),
        }}>
          <div style={{display:"flex", alignItems:"flex-start", gap:12, marginBottom:q.explanation ? 12 : 0}}>
            <span style={{fontSize:28, marginTop:2}}>
              {timedOut ? "⏰" : isCorrect ? "⭐" : "💡"}
            </span>
            <div style={{flex:1}}>
              <div style={{
                fontWeight:800, fontSize:16,
                color: timedOut ? v("warn") : isCorrect ? v("correct") : v("wrong"),
              }}>
                {timedOut ? "Time's up!"
                  : isCorrect
                    ? (streak >= 5 ? "🔥 On fire!" : streak >= 3 ? "🌟 Streak!" : "Correct!")
                    : "Not quite!"}
              </div>
              {(!isCorrect || timedOut) && (
                <div style={{fontSize:13, color:v("muted"), marginTop:3}}>
                  Correct answer: <strong style={{color:v("text")}}>
                    {LETTERS[q.correct]}. {q.options[q.correct]}
                  </strong>
                </div>
              )}
              {isEndurance && selected !== null && selected !== q.correct && livesNow > 0 && (
                <div style={{fontSize:12, color:v("wrong"), marginTop:4}}>
                  −1 life · {livesNow} remaining
                </div>
              )}
            </div>
          </div>

          {q.explanation && (
            <div style={{background:v("bg"), borderRadius:12, padding:"10px 14px"}}>
              <div style={{fontSize:11, fontWeight:700, color:v("muted"), marginBottom:5,
                textTransform:"uppercase", letterSpacing:.6}}>
                🔍 {isCorrect ? "Did you know?" : "Here's why:"}
              </div>
              <p style={{fontSize:14, color:v("text-dim"), lineHeight:1.65}}>{q.explanation}</p>
            </div>
          )}
        </div>
      )}

      {revealed && (
        <div style={{position:"relative", zIndex:1}}>
          <button className="btn-primary" onClick={advance}>
            {(isLast || (isEndurance && livesNow <= 0))
              ? "See Results 🏆"
              : "Next Question →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function ResultsScreen({ score, total, questions, maxStreak, mode, theme, onToggleTheme, onPlayAgain, onMenu }) {
  const pct     = total > 0 ? score / total : 0;
  const msg     = gradeMessage(pct, mode);
  const [copied, setCopied] = useState(false);

  // Build per-category accuracy map
  const cats = {};
  questions.forEach(q => {
    if (!cats[q.categoryLabel]) cats[q.categoryLabel] = { emoji:q.categoryEmoji, correct:0, total:0 };
    cats[q.categoryLabel].total++;
    if (q.answeredCorrectly) cats[q.categoryLabel].correct++;
  });

  const sortedCats = Object.entries(cats)
    .sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total));

  function copyResult() {
    const modeName = GAME_MODES.find(m => m.id === mode)?.label || mode;
    const catLines = sortedCats.map(([l,{correct:c,total:t}]) => `  ${l}: ${c}/${t}`).join("\n");
    const text = `BrainZap — ${modeName} Mode\n${msg.e} ${msg.t}\n${score}/${total} (${Math.round(pct*100)}%)\nBest streak: 🔥${maxStreak}\n\nBy topic:\n${catLines}`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2600);
    });
  }

  return (
    <div className="screen" style={{position:"relative"}}>
      <BgBlobs/>
      <ThemeToggle theme={theme} onToggle={onToggleTheme}/>

      {/* Hero result */}
      <div style={{position:"relative", zIndex:1, textAlign:"center", paddingTop:8}}>
        <div style={{fontSize:60, animation:"wiggle 1.6s ease infinite", display:"inline-block", marginBottom:6}}>
          {msg.e}
        </div>
        <h2 style={{fontFamily:"Fredoka One", fontSize:38, color:v("text")}}>{msg.t}</h2>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:7, marginTop:8,
          background:v("surface-alt"), borderRadius:99, padding:"5px 14px",
          fontSize:13, color:v("muted"), border:`1px solid ${v("border")}`,
        }}>
          {GAME_MODES.find(m => m.id === mode)?.emoji}
          {" "}{GAME_MODES.find(m => m.id === mode)?.label} Mode
        </div>
      </div>

      {/* Score ring + streak */}
      <div className="card" style={{
        position:"relative", zIndex:1,
        display:"flex", flexDirection:"column", alignItems:"center", gap:16,
      }}>
        <ScoreRing score={score} total={total}/>
        {maxStreak >= 3 && (
          <div style={{
            display:"flex", alignItems:"center", gap:9,
            background:"rgba(255,215,0,0.10)", borderRadius:12, padding:"8px 18px",
            border:`1px solid rgba(255,215,0,0.22)`,
          }}>
            <span style={{fontSize:20}}>🔥</span>
            <div style={{fontSize:13, fontWeight:700, color:v("gold")}}>
              Best streak: {maxStreak} in a row!
            </div>
          </div>
        )}
      </div>

      {/* Per-category breakdown */}
      {sortedCats.length > 0 && (
        <div className="card" style={{position:"relative", zIndex:1}}>
          <h3 style={{fontFamily:"Fredoka One", fontSize:18, color:v("text"), marginBottom:14}}>
            Performance by topic
          </h3>
          <div style={{display:"flex", flexDirection:"column", gap:11}}>
            {sortedCats.map(([label, {emoji, correct:c, total:t}]) => {
              const p = t > 0 ? c / t : 0;
              return (
                <div key={label} style={{display:"flex", alignItems:"center", gap:10}}>
                  <span style={{fontSize:18, minWidth:24, textAlign:"center"}}>{emoji}</span>
                  <span style={{flex:1, fontSize:13, fontWeight:700, color:v("text")}}>{label}</span>
                  <span style={{fontSize:12, color:v("muted"), minWidth:30, textAlign:"right"}}>{c}/{t}</span>
                  <div style={{width:76, background:v("border"), borderRadius:99, height:7,
                    overflow:"hidden", flexShrink:0}}>
                    <div style={{
                      width:`${p*100}%`, height:"100%", borderRadius:99,
                      background:scoreColor(p), transition:"width .9s ease",
                    }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{position:"relative", zIndex:1, display:"flex", flexDirection:"column", gap:10}}>
        <div style={{display:"flex", gap:10}}>
          <button className="btn-primary" style={{flex:1}} onClick={onPlayAgain}>Play Again 🔄</button>
          <button className="btn-secondary" style={{flex:1}} onClick={onMenu}>Menu</button>
        </div>
        <button onClick={copyResult} style={{
          background: copied ? v("correct-faint") : "none",
          border:`1.5px solid ${copied ? v("correct") : v("border")}`,
          borderRadius:50, padding:"12px 20px",
          color: copied ? v("correct") : v("muted"),
          fontWeight:700, fontSize:14, width:"100%", transition:"all .3s",
        }}>
          {copied ? "✓ Copied!" : "📋 Share your score"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT — wires screens together, owns theme state
// ═══════════════════════════════════════════════════════════════════════════════
const SCREENS = { HOME:"home", SETUP:"setup", GAME:"game", RESULTS:"results" };

export default function App() {
  const { theme, toggle } = useTheme();
  const [screen,    setScreen]    = useState(SCREENS.HOME);
  const [questions, setQuestions] = useState([]);
  const [score,     setScore]     = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [mode,      setMode]      = useState("classic");
  const [settings,  setSettings]  = useState(null);

  function startGame(cfg) {
    try {
      const drawCount = cfg.mode === "endurance" ? 300 : cfg.count;
      const qs = selectQuestions(cfg.categoryIds, drawCount, cfg.difficulty);
      setQuestions(qs); setSettings(cfg); setMode(cfg.mode);
      setScore(0); setMaxStreak(0);
      setScreen(SCREENS.GAME);
    } catch (e) {
      alert("Couldn't load questions: " + e.message);
    }
  }

  function handleFinish({ finalScore, annotatedQuestions, maxStreak:ms, mode:m }) {
    setScore(finalScore); setMaxStreak(ms || 0);
    setMode(m || "classic"); setQuestions(annotatedQuestions);
    setScreen(SCREENS.RESULTS);
  }

  const themeProps = { theme, onToggleTheme:toggle };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:THEME_CSS}}/>
      {screen === SCREENS.HOME    && <HomeScreen    {...themeProps} onStart={() => setScreen(SCREENS.SETUP)}/>}
      {screen === SCREENS.SETUP   && <SetupScreen   {...themeProps} onPlay={startGame} onBack={() => setScreen(SCREENS.HOME)}/>}
      {screen === SCREENS.GAME    && (
        <GameScreen
          key={settings ? JSON.stringify(settings) + questions[0]?.id : "game"}
          questions={questions} mode={mode}
          {...themeProps} onFinish={handleFinish}
        />
      )}
      {screen === SCREENS.RESULTS && (
        <ResultsScreen
          score={score} total={questions.length}
          questions={questions} maxStreak={maxStreak} mode={mode}
          {...themeProps} onPlayAgain={() => setScreen(SCREENS.SETUP)} onMenu={() => setScreen(SCREENS.HOME)}
        />
      )}
    </>
  );
}
