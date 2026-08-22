// ============================================================
// ISL — shared site chrome behaviour: logo injection, desktop
// dropdown panels, one hamburger/mobile-menu pattern built from
// the SAME markup as the desktop nav (no hand-duplicated link
// lists per page), and an auth-aware "Sign In" / "My Courses" slot.
//
// Include AFTER assets/js/supabase-client.js (if the page has it)
// and this file, at the end of <body>. Every page's header should
// contain:
//   <span data-isl-logo></span>                     — anywhere a logo mark should render
//   <nav class="primary-links desktop-only" id="primaryNav">...</nav>
//   <span class="nav-auth-slot" id="navAuthSlot"></span>   — inside primaryNav, before the CTA
//   <button class="hamburger" id="hamburgerBtn" aria-controls="mobileMenu" aria-expanded="false">
//     <span></span><span></span><span></span>
//   </button>
//   <nav class="mobile-menu" id="mobileMenu" aria-label="Mobile navigation"></nav>
//
// Pages that don't live at the site root (e.g. anything under
// /courses/) should set `window.ISL_ROOT = "../";` in a small
// inline <script> BEFORE this file loads, so the auth-slot and
// sign-out links point at the real index/signin/account pages
// instead of a relative path inside the subfolder.
// ============================================================

(function () {
  var LOGO_TPL = '<svg class="isl-icon"{EXTRA} viewBox="0 0 903 907" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<defs>' +
    '<mask id="{MID}O"><rect width="903" height="907" fill="black"/>' +
    '<circle cx="459.4" cy="451.7" r="433.5" fill="white"/>' +
    '<circle cx="454.0" cy="491.4" r="312.8" fill="black"/>' +
    '<circle cx="122.3" cy="492.2" r="177.3" fill="black"/></mask>' +
    '<mask id="{MID}I"><rect width="903" height="907" fill="black"/>' +
    '<circle cx="494.6" cy="475.7" r="215.8" fill="white"/>' +
    '<circle cx="498.3" cy="463.5" r="164.9" fill="black"/>' +
    '<circle cx="652.8" cy="482.8" r="110.6" fill="black"/></mask>' +
    '</defs>' +
    '<rect width="903" height="907" fill="currentColor" class="isl-icon-ring" mask="url(#{MID}O)"/>' +
    '<rect width="903" height="907" fill="currentColor" class="isl-icon-ring" mask="url(#{MID}I)"/>' +
    '<circle cx="122.3" cy="492.2" r="112.1" class="isl-icon-dot"/>' +
    '<circle cx="652.8" cy="482.8" r="63.8" class="isl-icon-dot"/>' +
    '</svg>';

  function injectLogos() {
    var slots = document.querySelectorAll('[data-isl-logo]');
    slots.forEach(function (el, i) {
      var mid = 'islLogo' + i + '_';
      var heightAttr = el.getAttribute('data-height');
      var extra = heightAttr ? ' style="height:' + heightAttr + ';width:auto;"' : '';
      var svg = LOGO_TPL.replace(/{MID}/g, mid).replace('{EXTRA}', extra);
      var wrapper = document.createElement('span');
      wrapper.innerHTML = svg;
      var svgEl = wrapper.firstElementChild;
      if (el.className) { svgEl.setAttribute('class', svgEl.getAttribute('class') + ' ' + el.className); }
      el.replaceWith(svgEl);
    });
  }

  function initDropdowns(root) {
    root.querySelectorAll('.nav-item[data-panel]').forEach(function (item) {
      var btn = item.querySelector(':scope > button');
      if (!btn || btn.dataset.wired) return;
      btn.dataset.wired = '1';
      btn.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        var isOpen = item.classList.contains('open');
        root.querySelectorAll('.nav-item.open').forEach(function (o) {
          o.classList.remove('open');
          var b = o.querySelector(':scope > button');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
      });
    });
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-item[data-panel]')) {
      document.querySelectorAll('.nav-item.open').forEach(function (o) {
        o.classList.remove('open');
        var b = o.querySelector(':scope > button');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-item.open').forEach(function (o) { o.classList.remove('open'); });
    }
  });

  function initHamburger() {
    var btn = document.getElementById('hamburgerBtn');
    var menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  // Build the mobile menu FROM the desktop nav markup, so every page
  // only ever authors its link list once. Dropdown groups become
  // expandable sub-panels instead of a separate flat link list.
  function buildMobileMenu() {
    var source = document.getElementById('primaryNav');
    var target = document.getElementById('mobileMenu');
    if (!source || !target) return;
    target.innerHTML = '';
    Array.prototype.forEach.call(source.children, function (child) {
      if (child.classList.contains('nav-item') && child.dataset.panel) {
        var label = child.querySelector(':scope > button');
        var labelText = label ? label.textContent.trim() : '';
        var links = child.querySelectorAll('.nav-panel-inner a');
        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'mobile-panel-toggle';
        toggle.innerHTML = '<span>' + labelText + '</span><span aria-hidden="true">&#9662;</span>';
        var panel = document.createElement('div');
        panel.className = 'mobile-panel';
        links.forEach(function (a) { panel.appendChild(a.cloneNode(true)); });
        toggle.addEventListener('click', function () { panel.classList.toggle('open'); });
        target.appendChild(toggle);
        target.appendChild(panel);
      } else if (child.classList.contains('nav-auth-slot')) {
        Array.prototype.forEach.call(child.children, function (a) { target.appendChild(a.cloneNode(true)); });
      } else if (child.tagName === 'A' || (child.tagName === 'BUTTON' && !child.closest('.nav-item'))) {
        target.appendChild(child.cloneNode(true));
      }
    });
    // Re-wire the cloned sign-out button, if present, since cloneNode drops listeners.
    var signOut = target.querySelector('.nav-signout-btn');
    if (signOut) signOut.addEventListener('click', doSignOut);
  }

  async function doSignOut() {
    if (typeof sb === 'undefined' || !sb) return;
    await sb.auth.signOut();
    window.location.href = (window.ISL_ROOT || '') + 'index.html';
  }

  async function initAuthSlot() {
    var slot = document.getElementById('navAuthSlot');
    if (!slot) return;
    if (typeof sb === 'undefined' || !sb || typeof getCurrentUser !== 'function') {
      slot.innerHTML = '<a href="' + (window.ISL_ROOT || '') + 'signin.html">Sign In</a>';
      return;
    }
    try {
      var user = await getCurrentUser();
      if (user) {
        slot.innerHTML = '<a href="' + (window.ISL_ROOT || '') + 'account.html">My Courses</a>' +
          '<button type="button" class="nav-signout-btn">Sign Out</button>';
        slot.querySelector('.nav-signout-btn').addEventListener('click', doSignOut);
      } else {
        var returnTo = encodeURIComponent(window.location.pathname + window.location.search);
        slot.innerHTML = '<a href="' + (window.ISL_ROOT || '') + 'signin.html?returnTo=' + returnTo + '">Sign In</a>';
      }
    } catch (e) {
      slot.innerHTML = '<a href="' + (window.ISL_ROOT || '') + 'signin.html">Sign In</a>';
    }
  }

  document.addEventListener('DOMContentLoaded', async function () {
    injectLogos();
    var primaryNav = document.getElementById('primaryNav');
    if (primaryNav) initDropdowns(primaryNav);
    initHamburger();
    await initAuthSlot();
    buildMobileMenu();
  });
})();
