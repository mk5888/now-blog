(function () {
  var root = document.documentElement;
  /* 亮暗切換（沿用 localStorage key: theme） */
  var btn = document.getElementById('theme-toggle');
  function isDark() {
    var t = root.getAttribute('data-theme');
    return t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches);
  }
  function icon() { if (btn) btn.textContent = isDark() ? '☀️' : '🌙'; }
  if (btn) btn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    icon();
  });
  icon();

  /* 燈箱 */
  var lb = document.getElementById('lightbox');
  var lbImg = lb && lb.querySelector('img');
  document.addEventListener('click', function (e) {
    var img = e.target.closest && e.target.closest('.card img');
    if (!img || !lb) return;
    var a = img.closest('a');
    var src = img.currentSrc || img.src;
    if (a) {
      if (!/\.(jpe?g|png|gif|webp|avif)(\?|$)/i.test(a.href)) return; /* 連到別處就照常跳轉 */
      src = a.href;
    }
    e.preventDefault();
    lbImg.src = src; lbImg.alt = img.alt || '';
    lb.classList.add('on');
  });
  if (lb) lb.addEventListener('click', function () { lb.classList.remove('on'); lbImg.src = ''; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb) lb.click(); });

  /* 載入更多：把分頁換成按鈕，失敗時退回原分頁 */
  var nav = document.querySelector('nav.pagenav');
  var tl = document.querySelector('main.timeline');
  if (!nav || !tl || !('fetch' in window)) return;
  var nextLink = nav.querySelector('a.next');
  if (!nextLink) return;
  var more = document.createElement('button');
  more.type = 'button'; more.className = 'load-more'; more.textContent = '載入更多';
  var nextUrl = nextLink.href;
  nav.hidden = true;
  nav.parentNode.insertBefore(more, nav);
  function lastYear() {
    var seps = tl.querySelectorAll('.year-sep');
    return seps.length ? seps[seps.length - 1].textContent.trim() : '';
  }
  more.addEventListener('click', function () {
    more.disabled = true; more.textContent = '載入中…';
    fetch(nextUrl, { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var src = doc.querySelector('main.timeline');
      if (!src) throw new Error('no timeline');
      Array.prototype.forEach.call(src.children, function (el) {
        if (el.classList.contains('year-sep') && el.textContent.trim() === lastYear()) return;
        tl.appendChild(document.importNode(el, true));
      });
      var n = doc.querySelector('nav.pagenav a.next');
      if (n) { nextUrl = n.href; more.disabled = false; more.textContent = '載入更多'; }
      else { more.remove(); }
      if (history.replaceState) history.replaceState(null, '', location.href);
    }).catch(function () { more.remove(); nav.hidden = false; });
  });
})();
