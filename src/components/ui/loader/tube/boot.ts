/**
 * The opening's first frame, painted before any of the app has loaded.
 *
 * On a first visit the tube is the first thing on screen, but the tube needs
 * React, the loader and a worker before it can draw: a few hundred
 * milliseconds of whatever the page was. This inline script runs in <head>,
 * before the body is parsed: it marks <html>, and one CSS rule paints the
 * tube's dark glass with a faint warm glow where the pupil will be (the eye's
 * own framing, framing.ts, repeated in a few lines). The tube clears the mark
 * when it starts painting (clearTubeBoot); if nothing does, it clears itself.
 *
 * A pseudo-element on <html>, not a node, so React's hydration never sees it.
 */

const ATTR = "data-tube-boot";
/**
 * A returning visitor's saved era is applied only once the app has hydrated,
 * and the server paints the default era, so their content waits, unpainted,
 * until then (app-loader.tsx clears this). A first visit's content is painted
 * at once, under the boot frame: the site is there, and the browser counts it
 * as painted, while the visitor sees only the tube.
 */
const WAIT = "data-content-wait";

/**
 * Only where the loader will show (a first visit, not the paper desk): the
 * same rules as app-loader.tsx and LayoutClientShell.tsx. The framing is
 * eyeShot's: a box round the eye 32 mm wide, 12 mm above it to 10 mm below on
 * a wide screen and 16 mm below on a phone, blended by the window's shape; the
 * pupil sits 0.1 mm right of and 0.3 mm above the globe's centre.
 */
export const TUBE_BOOT_SCRIPT = `(function(){try{
if(localStorage.getItem('portfolio-theme-selected')==='true'){document.documentElement.setAttribute('${WAIT}','');return;}
var p=location.pathname;
if(/^\\/(desk|blogism|studio)(\\/|$)/.test(p)&&!/^\\/(desk|blogism|studio)\\/preview$/.test(p))return;
var w=innerWidth,h=innerHeight,a=w/Math.max(h,1);
var t=Math.min(1,Math.max(0,(a-0.75)/0.35)),s=t*t*(3-2*t);
var top=12,bottom=-16+6*s,span=Math.max(top-bottom,32/a),k=h/span;
var d=document.documentElement;
d.style.setProperty('--tube-boot-x',(w/2+0.1*k)+'px');
d.style.setProperty('--tube-boot-y',(h*(0.5+(top+bottom)/2/span)-0.3*k)+'px');
d.setAttribute('${ATTR}','');
setTimeout(function(){d.removeAttribute('${ATTR}')},9000);
}catch(e){}})();`;

// (the page's scrollbar goes too: nothing fixed can paint over it, and it showed as a white strip;
// the loader takes the gutter away itself once it mounts, dropPageGutter)
export const TUBE_BOOT_CSS = `html[${WAIT}] [data-app-content]{visibility:hidden}html[${ATTR}]{overflow:hidden;scrollbar-gutter:auto;background:#040507}html[${ATTR}]::after{content:"";position:fixed;inset:0;z-index:2147483000;pointer-events:none;background:radial-gradient(circle at var(--tube-boot-x,50%) var(--tube-boot-y,50%),rgba(57,255,106,.08) 0,rgba(57,255,106,.02) 46px,rgba(4,5,7,0) 220px),#040507}`;

/** The app has hydrated: a returning visitor's content can be painted. */
export function clearContentWait() {
  if (typeof document !== "undefined") document.documentElement.removeAttribute(WAIT);
}

/** The tube is painting: the boot frame can go. */
export function clearTubeBoot() {
  if (typeof document !== "undefined") document.documentElement.removeAttribute(ATTR);
}
