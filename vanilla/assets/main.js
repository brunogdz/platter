(() => {
  const root = document.documentElement;
  const list = document.querySelector('#products');
  const viewport = document.querySelector('#products-window');
  const cards = [...list.querySelectorAll('.product-card')];
  const button = document.querySelector('#show-more');
  const track = document.querySelector('#scroll-track');
  const thumb = document.querySelector('#scroll-thumb');
  const mobile = window.matchMedia('(max-width: 767px)');
  let expanded = false;
  let dragging = false;
  let dragOffset = 0;

  const updateCards = () => {
    const collapsed = mobile.matches && !expanded;
    cards.forEach((card, index) => {
      const hidden = collapsed && index >= 4;
      card.classList.toggle('is-collapsed', hidden);
      card.setAttribute('aria-hidden', String(hidden));
      card.inert = hidden;
    });
    button.setAttribute('aria-expanded', String(expanded && mobile.matches));
    button.textContent = expanded ? 'Show Less' : 'Show More';
    viewport.classList.toggle('is-expanding', expanded && mobile.matches);
  };

  const updateScrollbar = () => {
    if (!track || !thumb) return;
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const maxTravel = Math.max(0, track.clientWidth - thumb.offsetWidth);
    const progress = maxScroll ? viewport.scrollLeft / maxScroll : 0;
    thumb.style.transform = `translateX(${progress * maxTravel}px)`;
    thumb.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
  };

  const scrollToPointer = (event, offset = thumb.offsetWidth / 2) => {
    const rect = track.getBoundingClientRect();
    const maxTravel = Math.max(0, rect.width - thumb.offsetWidth);
    const position = Math.min(maxTravel, Math.max(0, event.clientX - rect.left - offset));
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    viewport.scrollLeft = maxTravel ? (position / maxTravel) * maxScroll : 0;
  };

  button.addEventListener('click', () => {
    expanded = !expanded;
    updateCards();
    if (!expanded) button.focus({ preventScroll: true });
  });

  viewport.addEventListener('scroll', updateScrollbar, { passive: true });
  window.addEventListener('resize', updateScrollbar, { passive: true });
  mobile.addEventListener('change', updateCards);

  thumb.addEventListener('pointerdown', (event) => {
    dragging = true;
    dragOffset = event.clientX - thumb.getBoundingClientRect().left;
    thumb.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  thumb.addEventListener('pointermove', (event) => {
    if (dragging) scrollToPointer(event, dragOffset);
  });
  thumb.addEventListener('pointerup', () => { dragging = false; });
  thumb.addEventListener('pointercancel', () => { dragging = false; });
  track.addEventListener('pointerdown', (event) => {
    if (event.target !== thumb) scrollToPointer(event);
  });
  thumb.addEventListener('keydown', (event) => {
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const step = Math.max(100, viewport.clientWidth * 0.8);
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') viewport.scrollBy({ left: step, behavior: 'smooth' });
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') viewport.scrollBy({ left: -step, behavior: 'smooth' });
    else if (event.key === 'Home') viewport.scrollTo({ left: 0, behavior: 'smooth' });
    else if (event.key === 'End') viewport.scrollTo({ left: maxScroll, behavior: 'smooth' });
    else return;
    event.preventDefault();
  });

  root.classList.add('has-js');
  updateCards();
  updateScrollbar();
})();
