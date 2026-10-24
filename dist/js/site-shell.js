// Identidade, navegação, rodapé e diálogo compartilhados pelas páginas.
const sprite = `<svg class="icon-defs" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
    <symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 4.5 4.5"/></symbol>
    <symbol id="i-heart" viewBox="0 0 24 24"><path d="M20.5 5.4a5.3 5.3 0 0 0-7.5 0L12 6.5l-1.1-1.1a5.3 5.3 0 0 0-7.5 7.5L12 21l8.5-8.1a5.3 5.3 0 0 0 0-7.5Z"/></symbol>
    <symbol id="i-bag" viewBox="0 0 24 24"><path d="M5 7.5h14l1 14H4l1-14Z"/><path d="M8.5 9V6a3.5 3.5 0 0 1 7 0v3"/></symbol>
    <symbol id="i-person" viewBox="0 0 24 24"><circle cx="12" cy="7" r="3.5"/><path d="M4.5 21v-2.5a7.5 7.5 0 0 1 15 0V21Z"/></symbol>
    <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15m-6-6 6 6-6 6"/></symbol>
    <symbol id="i-close" viewBox="0 0 24 24"><path d="m5 5 14 14M5 19 19 5"/></symbol>
    <symbol id="i-menu" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></symbol>
    <symbol id="i-spark" viewBox="0 0 24 24"><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/></symbol>
    <symbol id="i-chevron" viewBox="0 0 24 24"><path d="m7 10 5 5 5-5"/></symbol>
    <symbol id="i-instagram" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></symbol>
  </defs></svg>`;
const header = `<header class="site-header" id="inicio">
    <div class="header-inner wrap">
      <a class="brand" href="#inicio" aria-label="ICE GEN — início">
        <img src="/assets/ice-gen-logo-transparent.png" alt="" width="31" height="50">
        <span class="brand-type">ICE GEN<small>PRATA 925</small></span>
      </a>
      <nav class="desktop-nav" aria-label="Navegação principal">
        <a class="nav-active" href="#inicio" aria-current="location">Início</a>
        <a href="#joias">Joias</a>
        <a href="#presentes">Presentes</a>
        <a href="#contato">Contato</a>
      </nav>
      <div class="header-actions">
        <button class="icon-button search-toggle" type="button" data-dialog="search" aria-label="Buscar joias"><svg class="icon" aria-hidden="true"><use href="#i-search"/></svg></button>
        <button class="icon-button favorites-toggle" type="button" data-dialog="favorites" aria-label="Favoritos"><svg class="icon" aria-hidden="true"><use href="#i-heart"/></svg></button>
        <button class="bag-button" type="button" data-dialog="bag" aria-label="Abrir sacola, 0 itens"><svg class="icon" aria-hidden="true"><use href="#i-bag"/></svg><span>Sacola</span><span class="bag-count" aria-label="0 itens">0</span></button>
        <button class="icon-button menu-toggle" type="button" aria-label="Abrir menu" aria-controls="mobile-menu" aria-expanded="false"><svg class="icon" aria-hidden="true"><use href="#i-menu"/></svg></button>
      </div>
    </div>
    <nav class="mobile-menu" id="mobile-menu" aria-label="Navegação no celular" hidden>
      <a href="#inicio">Início <span>01</span></a><a href="#joias">Explorar joias <span>02</span></a><a href="#presentes">Presentes <span>03</span></a><a href="#contato">Contato <span>04</span></a>
      <button type="button" data-dialog="favorites">Meus favoritos <svg class="icon" aria-hidden="true"><use href="#i-heart"/></svg></button>
    </nav>
  </header>`;
const footer = `<footer class="site-footer" id="contato">
    <div class="wrap footer-grid">
      <div class="footer-brand"><a class="brand" href="#inicio"><img src="/assets/ice-gen-logo-transparent.png" alt="" width="31" height="50"><span class="brand-type">ICE GEN<small>PRATA 925</small></span></a><p>Atitude em cada detalhe.</p></div>
      <div><h3>Explore</h3><a href="#joias">Nossas joias</a><a href="#combinacoes">Combinações</a><a href="#presentes">Montagem de presentes</a><a href="/favoritos.html">Meus favoritos</a><a href="/sacola.html">Minha sacola</a></div>
      <div><h3>ICE GEN</h3><a href="#essencia">Nossa essência</a><button type="button" data-dialog="care">Cuidados com a prata</button><button type="button" data-dialog="contact">Fale com a ICE GEN</button></div>
      <div class="footer-contact"><h3>Vamos conversar</h3><p>Uma dúvida sobre as peças?<br>Confira as informações de atendimento.</p><button class="footer-contact-link" type="button" data-dialog="contact">Informações de contato <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button></div>
    </div>
    <div class="footer-bottom wrap"><p>© <span id="year">2026</span> ICE GEN</p><p class="preview-label">Prévia da Home · Imagens e catálogo demonstrativos</p><p>Frio no tom. Forte no gesto.</p></div>
  </footer>`;
const dialog = `<dialog class="site-dialog" id="site-dialog" aria-labelledby="dialog-title"><div class="dialog-top"><span class="eyebrow">ICE GEN</span><button class="icon-button dialog-close" type="button" aria-label="Fechar janela"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button></div><div id="dialog-content"></div></dialog>`;

export function mountSiteShell({ page = 'home' } = {}) {
  const headerHost = document.querySelector('[data-site-header]');
  const footerHost = document.querySelector('[data-site-footer]');
  if (!headerHost || !footerHost) throw Error('Os pontos de montagem da navegação não foram encontrados.');
  headerHost.innerHTML = sprite + header;
  footerHost.innerHTML = footer + dialog + '<div class="site-feedback" id="site-feedback" role="status" aria-live="polite"></div>';
  headerHost.querySelector('defs').insertAdjacentHTML('beforeend', '<symbol id="i-filter" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/><path d="M7 3v6M16 9v6M9 15v6"/></symbol>');
  const catalog = page === 'catalog' || page === 'product';
  const away = page !== 'home';
  headerHost.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === '#joias') link.href = '/catalogo.html';
    else if (href === '#presentes') link.href = '/presentes.html';
    else if (away && href?.startsWith('#')) link.href = href === '#inicio' ? '/' : '/' + href;
  });
  if (away) {
    headerHost.querySelectorAll('.nav-active, [aria-current]').forEach(link => {
      link.classList.remove('nav-active');
      link.removeAttribute('aria-current');
    });
    const activeHref = catalog ? '/catalogo.html' : page === 'gift' ? '/presentes.html' : null;
    if (activeHref) headerHost.querySelectorAll(`a[href="${activeHref}"]`).forEach(link => {
      link.classList.add('nav-active');
      link.setAttribute('aria-current', page === 'product' ? 'location' : 'page');
    });
  }
  footerHost.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === '#joias') link.href = '/catalogo.html';
    else if (href === '#presentes') link.href = '/presentes.html';
    else if (away && href?.startsWith('#')) link.href = href === '#inicio' ? '/' : '/' + href;
  });
  const favoriteButton = headerHost.querySelector('.favorites-toggle');
  favoriteButton.setAttribute('aria-label', 'Favoritos');
  const counter = document.createElement('span');
  counter.className = 'favorites-count';
  counter.dataset.favoritesCount = '';
  counter.hidden = true;
  favoriteButton.append(counter);
  if (page === 'favorites') favoriteButton.setAttribute('aria-current', 'page');
  if (page === 'bag') headerHost.querySelector('.bag-button').setAttribute('aria-current', 'page');
  footerHost.querySelector('.preview-label').textContent = 'Prévia da coleção · Imagens e preços demonstrativos';
}
