// Dátum a láblécben
document.getElementById("year").textContent = new Date().getFullYear().toString();

// Betöltő elrejtése, kis késleltetéssel a hatás kedvéért
window.addEventListener("load", () => {
  const pre = document.getElementById("preloader");
  // Minimum 800ms megjelenítés
  setTimeout(() => pre.classList.add("hidden"), 850);
});

// Gépelés-animáció a fő címhez
(function typingEffect(){
  const el = document.querySelector(".title-focus");
  if(!el) return;
  const target = el.getAttribute("data-typing") || el.textContent.trim();
  el.textContent = "";
  let i=0;
  const tick = () => {
    if(i <= target.length){
      el.textContent = target.slice(0, i);
      i++;
      setTimeout(tick, i < 6 ? 120 : 42 + (Math.random()*40));
    }
  };
  tick();
})();

// Scroll-reveal megjelenítés
(function revealOnScroll(){
  const items = Array.from(document.querySelectorAll(".reveal"));
  const io = new IntersectionObserver((entries) => {
    for(const e of entries){
      if(e.isIntersecting){
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    }
  }, { threshold: .12 });
  items.forEach(i => io.observe(i));
})();

// Demó: JSON formázás / tömörítés
const inputEl = document.getElementById("demo-input");
const outputEl = document.getElementById("demo-output");
const formatBtn = document.getElementById("format-btn");
const minifyBtn = document.getElementById("minify-btn");
const warpBtn = document.getElementById("warp-btn");

function safeParse(str){
  try{ return [JSON.parse(str), null] }
  catch(e){ return [null, e] }
}
function highlightJSON(jsonString){
  // minimál színezés
  return jsonString
    .replace(/(&)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (m) => {
      let cls = "num";
      if (/^"/.test(m)) {
        cls = /:$/.test(m) ? "key" : "str";
      } else if (/true|false/.test(m)) {
        cls = "bool";
      } else if (/null/.test(m)) {
        cls = "null";
      }
      return `<span class="${cls}">${m}</span>`;
    });
}
function setOutput(html){
  outputEl.innerHTML = html;
}

formatBtn?.addEventListener("click", () => {
  const [obj, err] = safeParse(inputEl.value || "{}");
  if(err){
    setOutput(`<span style=\"color:#ff6b6b\">Hiba:</span> ${err.message}`);
    outputEl.classList.add("warp");
    setTimeout(() => outputEl.classList.remove("warp"), 920);
    return;
  }
  const pretty = JSON.stringify(obj, null, 2);
  setOutput(highlightJSON(pretty));
  outputEl.classList.add("warp");
  setTimeout(() => outputEl.classList.remove("warp"), 920);
});

minifyBtn?.addEventListener("click", () => {
  const [obj, err] = safeParse(inputEl.value || "{}");
  if(err){
    setOutput(`<span style=\"color:#ff6b6b\">Hiba:</span> ${err.message}`);
    return;
  }
  setOutput(JSON.stringify(obj));
});

warpBtn?.addEventListener("click", () => {
  document.body.classList.add("warp");
  setTimeout(() => document.body.classList.remove("warp"), 950);
});

// Minimális stílus a JSON színezéséhez (shadow-DOM nélkül)
const style = document.createElement("style");
style.textContent = `
  #demo-output .key { color: #7cc1ff }
  #demo-output .str { color: #b0ffea }
  #demo-output .num { color: #ffd37c }
  #demo-output .bool { color: #ff9ac1 }
  #demo-output .null { color: #8ea6b8 }
`;

document.head.appendChild(style);