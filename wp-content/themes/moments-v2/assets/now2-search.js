/* now2 站內搜尋（靜態備份用，不連 now.makang.cc） */
(function () {
  var form = document.querySelector('form[role=search]');
  var input = form && form.querySelector('input[name=s]');
  var tl = document.querySelector('main.timeline');
  if (!form || !input || !('fetch' in window)) return;
  var me = document.currentScript || document.querySelector('script[src*="now2-search.js"]');
  var root = me.src.replace(/wp-content\/themes\/moments-v2\/assets\/now2-search\.js.*$/, '');
  form.setAttribute('action', root + 'index.html');
  var data = null, orig = null, hidden = [];
  function load() {
    if (data) return Promise.resolve(data);
    return fetch(root + 'search-index.json').then(function (r) { return r.json(); }).then(function (d) { return (data = d); });
  }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hl(s, terms) {
    var out = esc(s);
    terms.forEach(function (t) {
      var re = new RegExp(esc(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      out = out.replace(re, function (m) { return '<mark>' + m + '</mark>'; });
    });
    return out;
  }
  function restore() {
    if (orig !== null) { tl.innerHTML = orig; orig = null; }
    hidden.forEach(function (el) { el.hidden = false; }); hidden = [];
  }
  function run(q, push) {
    q = q.trim();
    if (push && history.pushState) {
      var u = new URL(location.href); if (q) u.searchParams.set('s', q); else u.searchParams.delete('s');
      history.pushState(null, '', u);
    }
    if (!q) { restore(); return; }
    if (location.pathname.replace(/index\.html$/, '') !== new URL(root).pathname) {
      location.href = root + 'index.html?s=' + encodeURIComponent(q); return;
    }
    load().then(function (d) {
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      var hits = d.filter(function (p) { var t = p.t.toLowerCase(); return terms.every(function (w) { return t.indexOf(w) > -1; }); });
      if (orig === null) {
        orig = tl.innerHTML;
        document.querySelectorAll('nav.pagenav, .load-more').forEach(function (el) { if (!el.hidden) { el.hidden = true; hidden.push(el); } });
      }
      var shown = 0, html = '<p class="search-head">「' + esc(q) + '」共 ' + hits.length + ' 則 · <a href="#" class="search-clear">清除</a></p>';
      tl.innerHTML = html;
      function more() {
        var chunk = hits.slice(shown, shown + 30).map(function (p) {
          return '<article class="moment"><a class="meta" href="' + root + p.i + '/index.html"><time datetime="' + p.d + '">' + esc(p.l) + '</time></a>' +
            '<div class="card"><p>' + (p.t ? hl(p.t, terms) : '（圖片）') + '</p>' + (p.m ? '<p><img loading="lazy" src="' + root + p.m + '" alt=""></p>' : '') + '</div></article>';
        }).join('');
        shown += 30;
        var b = tl.querySelector('.load-more'); if (b) b.remove();
        tl.insertAdjacentHTML('beforeend', chunk);
        if (shown < hits.length) {
          tl.insertAdjacentHTML('beforeend', '<button type="button" class="load-more">再顯示 ' + Math.min(30, hits.length - shown) + ' 則</button>');
          tl.querySelector('.load-more').onclick = more;
        }
      }
      if (!hits.length) tl.insertAdjacentHTML('beforeend', '<p class="search-head">找不到，換個關鍵字試試。</p>'); else more();
      tl.querySelector('.search-clear').onclick = function (e) { e.preventDefault(); input.value = ''; run('', true); };
    }).catch(function () { location.href = 'https://now.makang.cc/?s=' + encodeURIComponent(q); });
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); run(input.value, true); });
  window.addEventListener('popstate', function () { var q = new URL(location.href).searchParams.get('s') || ''; input.value = q; run(q, false); });
  var q0 = new URL(location.href).searchParams.get('s'); if (q0) { input.value = q0; run(q0, false); }
})();
