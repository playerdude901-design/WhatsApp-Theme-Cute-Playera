import {readFile} from 'node:fs/promises';
import {connect} from './cdp.mjs';
import {installEffects, createMessageTracker} from './effects.mjs';

export async function buildSource(lite = false) {
  let css = await readFile(new URL('./effects.css', import.meta.url), 'utf8');
  const sounds={};
  for(const [name,file] of Object.entries({chat:'pop-5.mp3',other:'message-other.mp3'})) sounds[name]='data:audio/mpeg;base64,'+(await readFile(new URL('./assets/'+file,import.meta.url))).toString('base64');
  css += '\n' + await readFile(new URL('./playera.css', import.meta.url), 'utf8');
  const font = await readFile(new URL('./assets/Child Hood.otf', import.meta.url));
  css += `\n@font-face{font-family:"Playera Child Hood";src:url("data:font/otf;base64,${font.toString('base64')}") format("opentype");font-weight:400;font-style:normal;font-display:swap;}`;
  // Large images go directly into the property, avoiding custom-property size limits.
  for (const [file, selector] of [
    ['playera-fullscreen_HD.png', '[data-testid="conversation-panel-body"]'],
    ['wordmark.png', '[data-testid="chatlist-header"] [data-testid="drawer-title-body"]::before'],
    ['sidebar-dude.png', '[data-testid="navbar-footer-section"]::before'],
    ['comic-edge_soft.png', '#main footer:has([data-testid="compose-box"])::after']
  ]) {
    const data = await readFile(new URL('./assets/' + file, import.meta.url));
    css += `\nhtml[data-p5-desktop] ${selector}{background-image:url("data:image/png;base64,${data.toString('base64')}") !important}`;
  }
  return `(() => {
    if (location.origin !== 'https://web.whatsapp.com' || window.top !== window) return;
    function install() {
      document.getElementById('p5-desktop-theme')?.remove();
      const style = document.createElement('style');
      style.id = 'p5-desktop-theme';
      style.textContent = ${JSON.stringify(css)};
      document.head.appendChild(style);
      document.documentElement.setAttribute('data-p5-desktop', '1');
      document.documentElement.toggleAttribute('data-p5-lite', ${JSON.stringify(lite)});
      // Observe only the small header, never the message tree. Reuse its photo.
      window.__p5DesktopCleanup?.();
      const effects = (${installEffects.toString()})(${JSON.stringify(sounds)}, ${createMessageTracker.toString()});
      let photoObserver;
      let structureObserver;
      let observedHeader;
      let lastPortrait;
      function portrait() {
        effects.bind();
        const photo = document.querySelector('[data-testid="conversation-header"] img');
        const src = photo?.getAttribute('src');
        const value = src ? 'url(' + JSON.stringify(src) + ')' : 'none';
        if (value !== lastPortrait) {
          document.documentElement.style.setProperty('--p5-contact-portrait', value);
          lastPortrait = value;
        }
      }
      function loaded(event) {
        if (event.target.matches?.('[data-testid="conversation-header"] img')) bindPortrait();
      }
      function bindPortrait() {
        const header = document.querySelector('[data-testid="conversation-header"]');
        if (header !== observedHeader) {
          photoObserver?.disconnect();
          observedHeader = header;
          if (header) {
            photoObserver = new MutationObserver(portrait);
            photoObserver.observe(header, {subtree:true, childList:true, attributes:true, attributeFilter:['src']});
          }
        }
        // Watch only direct children along the header's ancestor chain.
        // React can replace the entire header without loading a new photo.
        structureObserver?.disconnect();
        let parent = header?.parentElement || document.querySelector('#main') || document.querySelector('#app');
        if (parent) {
          structureObserver ||= new MutationObserver(bindPortrait);
          while (parent) {
            structureObserver.observe(parent, {childList:true});
            parent = parent.parentElement;
          }
        }
        portrait();
      }
      document.addEventListener('load', loaded, true);
      // Discard only our entrance effects when returning to the app.
      // Never replay a backlog, pause native media, or observe message mutations.
      const entrances = new Set(['p5-message-in', 'p5-cut-in', 'p5-title-in']);
      function finishEntrances(target = document) {
        for (const animation of target.getAnimations?.() || []) {
          if (entrances.has(animation.animationName) && animation.playState !== 'finished') animation.cancel();
        }
      }
      function resumed() { finishEntrances(); }
      function backgroundEntrance(event) {
        if (entrances.has(event.animationName) && (document.hidden || !document.hasFocus())) finishEntrances(event.target);
      }
      window.addEventListener('focus', resumed);
      document.addEventListener('visibilitychange', resumed);
      document.addEventListener('animationstart', backgroundEntrance);
      window.__p5DesktopCleanup = () => {
        effects.cleanup();
        document.removeEventListener('load', loaded, true);
        window.removeEventListener('focus', resumed);
        document.removeEventListener('visibilitychange', resumed);
        document.removeEventListener('animationstart', backgroundEntrance);
        photoObserver?.disconnect();
        structureObserver?.disconnect();
      };
      bindPortrait();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
    else install();
  })();`;
}

export async function evaluateWhenReady(client, source, timeoutMs = 15000, retryMs = 250) {
  const deadline = Date.now() + timeoutMs;
  while (true) {
    try {
      const result = await client.send('Runtime.evaluate', {expression:source});
      if (result.exceptionDetails) throw Error('No se pudo insertar el tema');
      return;
    } catch (error) {
      // WebView2 exposes its target before the initial document has a context.
      const transient = /cannot find (?:default execution context|context with specified id)|execution context was destroyed|inspected target navigated/i.test(error.message);
      if (!transient || Date.now() >= deadline) throw error;
      await new Promise(resolve => setTimeout(resolve, retryMs));
    }
  }
}

export async function applyTheme(port, lite = false, startup = false) {
  const source = await buildSource(lite);
  const deadline = Date.now() + (startup ? 90000 : 35000);
  let client;
  let lastError;
  while (Date.now() < deadline) {
    try { client = await connect(port); break; }
    catch (error) { lastError = error; await new Promise(resolve => setTimeout(resolve, 700)); }
  }
  if (!client) throw lastError;
  try {
    await client.send('Page.enable');
    await client.send('Page.addScriptToEvaluateOnNewDocument', {source});
    await evaluateWhenReady(client, source);
    // First activation may expose the page before DOMContentLoaded.
    let installed = false;
    const verifyDeadline = Date.now() + 15000;
    while (Date.now() < verifyDeadline) {
      try {
        const verified = await client.send('Runtime.evaluate', {
          expression: `Boolean(document.getElementById('p5-desktop-theme'))`, returnByValue:true
        });
        if (verified.result?.value) { installed = true; break; }
      } catch (error) {
        if (!/context|navigat/i.test(error.message)) throw error;
      }
      await new Promise(resolve => setTimeout(resolve,250));
    }
    if (!installed) throw Error('No se pudo verificar el tema');
    console.log('Theme_Playera_Whatsapp aplicado a WhatsApp oficial.');
  } finally { client.close(); }
}

if (process.argv[2]) {
  await applyTheme(Number(process.argv[2]), process.argv.includes('--lite'), process.argv.includes('--startup')).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
