/**
 * TEMPORARY on-device diagnostics for the packaged app (blank-screen hunt).
 * To remove: set DIAG_OVERLAY = false, or delete this file, its import in
 * __root.tsx and the DIAG_BOOT_SCRIPT entry in the root head().
 * Never active on the website (guarded by window.Capacitor native check).
 */
export const DIAG_OVERLAY = true;

type DiagState = { steps: string[]; start: number; rendered: boolean };

function state(): DiagState | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { __totlandDiag?: DiagState }).__totlandDiag ?? null;
}

/** Record the init step currently in progress. */
export function diagStep(name: string) {
  const s = state();
  if (!s) return;
  s.steps.push(`${Date.now() - s.start}ms ${name}`);
  if (s.steps.length > 40) s.steps.shift();
}

/** Mark that a real screen has rendered (stops the watchdog message). */
export function diagRendered() {
  const s = state();
  if (!s) return;
  diagStep("first screen rendered");
  s.rendered = true;
  const box = document.getElementById("totland-diag");
  if (box && box.dataset["kind"] === "watchdog") box.remove();
}

/**
 * Inline script placed in <head> so it runs before the app bundle loads.
 * Plain ES5, no imports. Native only.
 */
export const DIAG_BOOT_SCRIPT = DIAG_OVERLAY
  ? `(function(){try{
var C=window.Capacitor;if(!C||!C.isNativePlatform||!C.isNativePlatform())return;
var S=window.__totlandDiag={steps:[],start:Date.now(),rendered:false};
function step(n){S.steps.push((Date.now()-S.start)+'ms '+n);}
step('boot script');
function show(kind,text){var b=document.getElementById('totland-diag');
if(!b){b=document.createElement('div');b.id='totland-diag';
b.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;max-height:60vh;overflow:auto;background:#111;color:#fff;font:12px/1.4 monospace;padding:10px;border-radius:10px;white-space:pre-wrap;word-break:break-word';
(document.body||document.documentElement).appendChild(b);}
if(kind==='error'||b.dataset.kind!=='error')b.dataset.kind=kind;
var plugins='';try{plugins=Object.keys((C.Plugins)||{}).join(', ');}catch(e){}
b.textContent=text+'\\n\\nSteps:\\n'+S.steps.slice(-15).join('\\n')+'\\n\\nPlatform: '+(C.getPlatform?C.getPlatform():'?')+'\\nURL: '+location.href+'\\nPlugins: '+plugins;
var x=document.createElement('button');x.textContent='Hide';x.style.cssText='float:right;background:#fff;color:#111;border:0;border-radius:6px;padding:4px 10px';x.onclick=function(){b.remove();};b.insertBefore(x,b.firstChild);}
window.addEventListener('error',function(e){step('error');show('error','ERROR: '+(e.message||'script error')+'\\n'+((e.error&&e.error.stack)||(e.filename?e.filename+':'+e.lineno:'')).slice(0,800));},true);
window.addEventListener('unhandledrejection',function(e){var r=e.reason;step('rejection');show('error','UNHANDLED: '+((r&&r.message)||String(r))+'\\n'+((r&&r.stack)||'').slice(0,800));});
setTimeout(function(){if(!S.rendered){var last=S.steps[S.steps.length-1]||'none';show('watchdog','Still loading... last step: '+last+'\\nElapsed: '+(Date.now()-S.start)+'ms');}},5000);
}catch(e){}})();`
  : "";
