(function () {
  var TOC_SELECTOR = '#post-toc';
  var LIST_SELECTOR = '.post-toc-list';
  var ARTICLE_SELECTOR = '.entry-content';
  var TITLE_SELECTOR = '.hentry header h1';
  var HEADING_SELECTOR = 'h2, h3';
  var MIN_HEADINGS = 2;
  var ACTIVE_CLASS = 'is-active';
  var TITLE_ID = 'post-top';

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function ensureUniqueId(heading, used) {
    if (heading.id) {
      used[heading.id] = true;
      return;
    }
    var base = slugify(heading.textContent) || 'section';
    var slug = base;
    var n = 2;
    while (used[slug] || document.getElementById(slug)) {
      slug = base + '-' + n++;
    }
    used[slug] = true;
    heading.id = slug;
  }

  function buildItem(level, text, href) {
    var li = document.createElement('li');
    li.className = 'post-toc-item post-toc-' + level;
    var a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    li.appendChild(a);
    return { li: li, link: a };
  }

  function scrollToHeading(heading) {
    heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (history.replaceState) {
      history.replaceState(null, '', '#' + heading.id);
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (history.replaceState) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  function bindTocLink(link, state, onNavigate) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      activate(link, state);
      onNavigate();
    });
  }

  function appendTitleEntry(list, pageTitle, state) {
    if (!pageTitle) return null;
    if (!pageTitle.id) pageTitle.id = TITLE_ID;
    var item = buildItem('h1', pageTitle.textContent.trim(), '#');
    bindTocLink(item.link, state, scrollToTop);
    list.appendChild(item.li);
    return item.link;
  }

  function appendHeadingEntries(list, headings, state) {
    var used = {};
    var links = {};
    headings.forEach(function (heading) {
      ensureUniqueId(heading, used);
      var item = buildItem(heading.tagName.toLowerCase(), heading.textContent, '#' + heading.id);
      bindTocLink(item.link, state, function () {
        scrollToHeading(heading);
      });
      list.appendChild(item.li);
      links[heading.id] = item.link;
    });
    return links;
  }

  function activate(link, state) {
    if (!link || state.current === link) return;
    if (state.current) state.current.classList.remove(ACTIVE_CLASS);
    link.classList.add(ACTIVE_CLASS);
    state.current = link;
  }

  function isNearPageBottom() {
    return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  }

  function observeHeadings(targets, linksById, state) {
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var link = linksById[entry.target.id];
            if (link) activate(link, state);
          });
        },
        { rootMargin: '0px 0px -75% 0px', threshold: 0 }
      );
      targets.forEach(function (target) { observer.observe(target); });
    }

    function syncLastHeadingAtPageBottom() {
      if (!targets.length || !isNearPageBottom()) return;
      var lastHeading = targets[targets.length - 1];
      activate(linksById[lastHeading.id], state);
    }

    window.addEventListener('scroll', syncLastHeadingAtPageBottom, { passive: true });
    window.addEventListener('resize', syncLastHeadingAtPageBottom);
    syncLastHeadingAtPageBottom();
  }

  function init() {
    var toc = document.querySelector(TOC_SELECTOR);
    if (!toc) return;
    var list = toc.querySelector(LIST_SELECTOR);
    var article = document.querySelector(ARTICLE_SELECTOR);
    if (!article || !list) {
      toc.style.display = 'none';
      return;
    }
    var headings = article.querySelectorAll(HEADING_SELECTOR);
    if (headings.length < MIN_HEADINGS) {
      toc.style.display = 'none';
      return;
    }
    var state = { current: null };
    var pageTitle = document.querySelector(TITLE_SELECTOR);
    var titleLink = appendTitleEntry(list, pageTitle, state);
    var headingLinks = appendHeadingEntries(list, headings, state);
    var linksById = {};
    if (pageTitle && titleLink) linksById[pageTitle.id] = titleLink;
    Object.keys(headingLinks).forEach(function (id) { linksById[id] = headingLinks[id]; });

    activate(titleLink || headingLinks[headings[0].id], state);

    var observed = Array.prototype.slice.call(headings);
    if (pageTitle) observed.unshift(pageTitle);
    observeHeadings(observed, linksById, state);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
