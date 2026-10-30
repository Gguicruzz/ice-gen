// Animações progressivas: o conteúdo permanece legível sem JS, observer ou movimento.
let initialized = false;

export function initializeSiteMotion() {
  if (initialized) return;
  initialized = true;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.site-header');
  const active = new Set();
  const seen = new Set();
  const registered = new WeakSet();
  const targets = '[data-reveal], .section-heading, .catalog-hero-inner, .catalog-toolbar, .product-layout, .product-details-section, .gift-intro, .gift-step-heading, .gift-summary, .bag-page-heading, .bag-summary, .favorites-intro, .favorites-toolbar, .favorites-editorial, .editorial-card, .combination-card, .product-card, .gift-choice, .favorites-card, .bag-line, .bag-suggestion';
  let frame = 0;
  function updateHeader() {
    frame = 0;
    header?.classList.toggle('is-scrolled', scrollY > 24);
  }
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateHeader); }, { passive: true });
  updateHeader();

  function animate(element, frames, options) {
    if (reduced.matches || typeof element.animate !== 'function' || element.contains(document.activeElement)) return;
    const animation = element.animate(frames, options);
    active.add(animation);
    animation.finished.then(() => active.delete(animation), () => active.delete(animation));
  }
  document.addEventListener('focusin', event => {
    for (const animation of active) {
      if (animation.effect?.target?.contains(event.target)) animation.cancel();
    }
  });
  function identity(element) {
    const kind = [...element.classList].find(name => /card|choice|line|suggestion|heading|intro|summary|layout|section/.test(name)) || element.tagName;
    const value = element.dataset.productId || element.dataset.lineId || element.dataset.suggestionId
      || element.dataset.combination || element.querySelector('input[type="radio"]')?.value
      || element.id || element.querySelector('a')?.getAttribute('href') || element.textContent.trim().slice(0, 110);
    return `${kind}:${value}`;
  }
  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
      observer.unobserve(entry.target);
      const key = identity(entry.target);
      if (seen.has(key)) return;
      seen.add(key);
      animate(entry.target, [{ opacity: 0, translate: '0 22px' }, { opacity: 1, translate: '0 0' }], {
        duration: 680, delay: Math.min(index * 45, 135), easing: 'cubic-bezier(.18,.7,.22,1)'
      });
    });
  }, { threshold: .08, rootMargin: '0px 0px 55px 0px' }) : null;
  function register(root) {
    if (!(root instanceof Element)) return;
    const elements = root.matches(targets) ? [root, ...root.querySelectorAll(targets)] : [...root.querySelectorAll(targets)];
    for (const element of elements) {
      if (registered.has(element)) continue;
      registered.add(element);
      // O mesmo produto não reaparece animado após mudar filtro ou quantidade.
      if (seen.has(identity(element)) || reduced.matches) continue;
      observer?.observe(element);
    }
  }
  register(document.body);
  const pending = new Set();
  let mutationFrame = 0;
  new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => { if (node instanceof Element) pending.add(node); }));
    if (!mutationFrame && pending.size) mutationFrame = requestAnimationFrame(() => {
      mutationFrame = 0;
      pending.forEach(root => { if (root.isConnected) register(root); });
      pending.clear();
    });
  }).observe(document.querySelector('main'), { childList: true, subtree: true });

  for (const counter of document.querySelectorAll('.bag-count, [data-favorites-count]')) {
    let last = counter.textContent;
    new MutationObserver(() => {
      if (counter.textContent === last) return;
      last = counter.textContent;
      animate(counter, [{ scale: '.84' }, { scale: '1.17' }, { scale: '1' }], { duration: 310, easing: 'ease-out' });
    }).observe(counter, { childList: true, characterData: true, subtree: true });
  }
  reduced.addEventListener('change', event => { if (event.matches) active.forEach(animation => animation.cancel()); });
}
