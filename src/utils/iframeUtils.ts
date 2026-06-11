export function patchIframe(iframe: HTMLIFrameElement | null): boolean {
  if (!iframe) return false;
  try {
    const win = iframe.contentWindow;
    const doc = iframe.contentDocument || (win && win.document);
    if (!doc || !win) return false;

    // Ensure base target stays inside iframe
    try {
      let base = doc.querySelector('base');
      if (!base) {
        base = doc.createElement('base');
        const head = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement;
        head.insertBefore(base, head.firstChild || null);
      }
      base.setAttribute('target', '_self');
    } catch (e) {
      // ignore
    }

    const patchLinks = () => {
      try {
        const anchors = doc.querySelectorAll('a[target]');
        anchors.forEach(a => {
          const t = a.getAttribute('target');
          if (t === '_top' || t === '_parent' || t === '_blank') {
            a.setAttribute('target', '_self');
            a.setAttribute('rel', 'noopener noreferrer');
          }
        });
      } catch (e) { }
    };

    // initial patch
    patchLinks();

    // intercept click events that would escape the iframe
    try {
      doc.addEventListener('click', function (e: any) {
        try {
          let el = e.target;
          while (el && el.nodeName !== 'A') el = el.parentNode;
          if (el && el.getAttribute) {
            const tgt = el.getAttribute('target');
            if (tgt === '_top' || tgt === '_parent') {
              e.preventDefault();
              el.setAttribute('target', '_self');
              // navigate inside the iframe's window instead of the parent
              try {
                (win as Window).setTimeout(() => { (win as Window).location.href = el.href; }, 0);
              } catch (navErr) {
                try { if (iframe) iframe.src = el.href; } catch (_) { }
              }
            }
          }
        } catch (err) { }
      }, true);
    } catch (e) { }

    // override window.open inside iframe to avoid escapes
    try {
      const overrideScript = doc.createElement('script');
      overrideScript.type = 'text/javascript';
      overrideScript.text = `(function(){
        try{
          const orig = window.open;
          window.open = function(url, target, features){
            if(!url) return null;
            if(target === '_top' || target === '_parent'){
              window.location.href = url;
              return window;
            }
            return orig.call(window, url, target, features);
          };
        }catch(e){}
      })();`;
      doc.documentElement.appendChild(overrideScript);
    } catch (e) { }

    // Observe DOM changes to catch dynamically added anchors
    try {
      const mo = new MutationObserver(() => patchLinks());
      mo.observe(doc.documentElement || doc, { childList: true, subtree: true });
      setTimeout(() => mo.disconnect(), 30000);
    } catch (e) { }

    return true;
  } catch (err) {
    console.error('patchIframe failed', err);
    return false;
  }
}
