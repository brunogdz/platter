(() => {
  if (customElements.get('platter-best-sellers')) return;

  class PlatterBestSellers extends HTMLElement {
    connectedCallback() {
      if (this._initialized) return;
      this._initialized = true;
      this.viewport = this.querySelector('[data-viewport]');
      this.list = this.querySelector('[data-list]');
      this.cards = [...this.querySelectorAll('[data-card]')];
      this.track = this.querySelector('[data-track]');
      this.thumb = this.querySelector('[data-thumb]');
      this.button = this.querySelector('[data-show-more-button]');
      this.mobile = window.matchMedia('(max-width: 767px)');
      this.expanded = false;
      this.dragging = false;
      this.dragOffset = 0;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

      this.onScroll = () => this.updateScrollbar();
      this.onResize = () => {
        this.updateCards();
        this.updateScrollbar();
      };
      this.onMediaChange = () => this.updateCards();
      this.onButtonClick = () => {
        this.expanded = !this.expanded;
        this.updateCards();
        if (!this.expanded) this.button.focus({ preventScroll: true });
      };
      this.onPointerDown = (event) => {
        this.track.classList.add('is-touching');
        this.dragging = true;
        this.dragOffset = event.clientX - this.thumb.getBoundingClientRect().left;
        this.thumb.setPointerCapture(event.pointerId);
        event.preventDefault();
      };
      this.onPointerMove = (event) => {
        if (this.dragging) this.scrollToPointer(event, this.dragOffset);
      };
      this.onPointerEnd = () => {
        this.dragging = false;
        this.track.classList.remove('is-touching');
      };
      this.onTrackPointerDown = (event) => {
        if (event.target === this.thumb) return;
        this.track.classList.add('is-touching');
        this.track.setPointerCapture(event.pointerId);
        this.scrollToPointer(event);
      };
      this.onKeyDown = (event) => this.handleScrollbarKey(event);

      this.viewport?.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize, { passive: true });
      this.mobile.addEventListener('change', this.onMediaChange);
      this.button?.addEventListener('click', this.onButtonClick);
      this.thumb?.addEventListener('pointerdown', this.onPointerDown);
      this.thumb?.addEventListener('pointermove', this.onPointerMove);
      this.thumb?.addEventListener('pointerup', this.onPointerEnd);
      this.thumb?.addEventListener('pointercancel', this.onPointerEnd);
      this.thumb?.addEventListener('keydown', this.onKeyDown);
      this.track?.addEventListener('pointerdown', this.onTrackPointerDown);
      this.track?.addEventListener('pointerup', this.onPointerEnd);
      this.track?.addEventListener('pointercancel', this.onPointerEnd);
      this.resizeObserver = new ResizeObserver(this.onResize);
      if (this.list) this.resizeObserver.observe(this.list);

      this.updateCards();
      this.updateScrollbar();
    }

    disconnectedCallback() {
      if (!this._initialized) return;
      this.viewport?.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onResize);
      this.mobile.removeEventListener('change', this.onMediaChange);
      this.button?.removeEventListener('click', this.onButtonClick);
      this.thumb?.removeEventListener('pointerdown', this.onPointerDown);
      this.thumb?.removeEventListener('pointermove', this.onPointerMove);
      this.thumb?.removeEventListener('pointerup', this.onPointerEnd);
      this.thumb?.removeEventListener('pointercancel', this.onPointerEnd);
      this.thumb?.removeEventListener('keydown', this.onKeyDown);
      this.track?.removeEventListener('pointerdown', this.onTrackPointerDown);
      this.track?.removeEventListener('pointerup', this.onPointerEnd);
      this.track?.removeEventListener('pointercancel', this.onPointerEnd);
      this.resizeObserver?.disconnect();
      this._initialized = false;
    }

    updateCards() {
      if (!this.viewport || !this.list) return;
      const collapsed = this.mobile.matches && !this.expanded && this.cards.length > 4;
      this.cards.forEach((card, index) => {
        const hidden = collapsed && index >= 4;
        if (hidden) {
          card.setAttribute('aria-hidden', 'true');
          card.inert = true;
        } else {
          card.removeAttribute('aria-hidden');
          card.inert = false;
        }
      });
      if (this.mobile.matches) {
        this.viewport.style.maxHeight = collapsed ? `${this.collapsedHeight()}px` : `${this.list.scrollHeight}px`;
      } else {
        this.viewport.style.maxHeight = '';
      }
      if (this.button) {
        this.button.setAttribute('aria-expanded', String(this.expanded && this.mobile.matches));
        this.button.textContent = this.expanded ? (this.dataset.showLess || 'Show Less') : (this.dataset.showMore || 'Show More');
      }
    }

    collapsedHeight() {
      const fourthCard = this.cards[3];
      if (!fourthCard) return this.list.scrollHeight;
      return fourthCard.getBoundingClientRect().bottom - this.viewport.getBoundingClientRect().top;
    }

    updateScrollbar() {
      if (!this.viewport || !this.track || !this.thumb) return;
      const maxScroll = Math.max(0, this.viewport.scrollWidth - this.viewport.clientWidth);
      const trackWidth = this.track.clientWidth;
      const ratio = this.viewport.scrollWidth ? this.viewport.clientWidth / this.viewport.scrollWidth : 1;
      const thumbWidth = Math.min(trackWidth, Math.max(28, trackWidth * ratio));
      const maxTravel = Math.max(0, trackWidth - thumbWidth);
      const progress = maxScroll ? this.viewport.scrollLeft / maxScroll : 0;
      this.thumb.style.width = `${thumbWidth}px`;
      this.thumb.style.transform = `translateX(${progress * maxTravel}px)`;
      this.thumb.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
      this.thumb.setAttribute('aria-valuemax', '100');
    }

    scrollToPointer(event, offset = this.thumb.offsetWidth / 2) {
      const rect = this.track.getBoundingClientRect();
      const maxTravel = Math.max(0, rect.width - this.thumb.offsetWidth);
      const position = Math.min(maxTravel, Math.max(0, event.clientX - rect.left - offset));
      const maxScroll = Math.max(0, this.viewport.scrollWidth - this.viewport.clientWidth);
      this.viewport.scrollLeft = maxTravel ? (position / maxTravel) * maxScroll : 0;
    }

    handleScrollbarKey(event) {
      const maxScroll = Math.max(0, this.viewport.scrollWidth - this.viewport.clientWidth);
      const step = Math.max(100, this.viewport.clientWidth * 0.8);
      const behavior = this.reducedMotion.matches ? 'instant' : 'smooth';
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') this.viewport.scrollBy({ left: step, behavior });
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') this.viewport.scrollBy({ left: -step, behavior });
      else if (event.key === 'Home') this.viewport.scrollTo({ left: 0, behavior });
      else if (event.key === 'End') this.viewport.scrollTo({ left: maxScroll, behavior });
      else return;
      event.preventDefault();
    }
  }

  customElements.define('platter-best-sellers', PlatterBestSellers);
})();
