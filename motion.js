(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', context => {
    const cleanups = [];
    const listen = (el, type, fn) => { el.addEventListener(type, fn); cleanups.push(() => el.removeEventListener(type, fn)); };
    const animate = context.add(null, (target, vars) => gsap.to(target, vars));
    // Content is visible without JS; only reveal elements once they are in view.
    if (window.scrollY < 40 && !location.hash) {
      const intro = gsap.timeline({ defaults: { duration: .8, ease: 'power3.out', clearProps: 'transform,opacity,visibility' } });
      const welcome = document.querySelector('.welcome');
      if (welcome) {
        intro.from('header', { y: -8, autoAlpha: 0, duration: .5 })
          .from('.welcome > *', { y: 20, autoAlpha: 0, stagger: .1 }, .12)
          .from('.hero-name', { y: 30, autoAlpha: 0, duration: 1 }, .2)
          .from('.hero-bottom > .text-link', { y: 12, autoAlpha: 0 }, .4);
      } else {
        intro.from('.project-header > *', { y: 18, autoAlpha: 0, stagger: .1 })
          .from('.project-hero', { y: 22, autoAlpha: 0 }, .16);
      }
    }
    document.querySelectorAll('.section-heading, .work-card, .about-intro, .experience-item, .case-copy, .case-image, .next-work, .footer-title').forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight * .9) return;
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true,
        onEnter: () => context.add(() => gsap.fromTo(el, { y: 22, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: .65, ease: 'power3.out', clearProps: 'transform,opacity,visibility'
        }))
      });
    });
    // Keep native details semantics; animate real height so following rows move naturally.
    document.querySelectorAll('.experience-item').forEach(item => {
      const summary = item.querySelector('summary');
      const icon = item.querySelector('.experience-toggle');
      let desiredOpen = item.open;
      gsap.set(icon, { rotation: desiredOpen ? 45 : 0 });
      let tween;
      listen(summary, 'click', event => {
        event.preventDefault();
        desiredOpen = !desiredOpen;
        const start = item.getBoundingClientRect().height;
        if (tween) tween.kill();
        item.style.height = '';
        item.open = desiredOpen;
        const end = item.getBoundingClientRect().height;
        item.open = true;
        item.style.overflow = 'hidden';
        item.style.height = start + 'px';
        animate(icon, { rotation: desiredOpen ? 45 : 0, duration: .28, overwrite: true });
        tween = animate(item, { height: end, duration: .34, ease: 'power2.inOut', overwrite: true,
          onComplete: () => {
            item.open = desiredOpen;
            item.style.height = '';
            item.style.overflow = '';
            ScrollTrigger.refresh();
          }
        });
      });
      cleanups.push(() => {
        if (tween) tween.kill();
        item.open = desiredOpen;
        item.style.height = ''; item.style.overflow = ''; icon.style.transform = '';
      });
    });
    const refresh = () => ScrollTrigger.refresh();
    document.querySelectorAll('img').forEach(img => { if (!img.complete) listen(img, 'load', refresh); });
    return () => cleanups.forEach(fn => fn());
  });
  mm.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)', context => {
    const cleanup = [];
    document.querySelectorAll('.work-card').forEach(card => {
      const cover = card.querySelector('.cover');
      const cursor = card.querySelector('.view-cursor');
      if (!cursor) return;
      card.classList.add('cursor-enabled');
      gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: .7, autoAlpha: 0 });
      const xTo = gsap.quickTo(cursor, 'x', { duration: .32, ease: 'power3.out' });
      const yTo = gsap.quickTo(cursor, 'y', { duration: .32, ease: 'power3.out' });
      const tl = gsap.timeline({ paused: true }).to(cursor, { scale: 1, autoAlpha: 1, duration: .24, ease: 'power2.out' });
      const position = event => {
        const rect = cover.getBoundingClientRect();
        const pad = cursor.offsetWidth / 2 + 14;
        return { x: gsap.utils.clamp(pad, rect.width - pad, event.clientX - rect.left),
          y: gsap.utils.clamp(pad, rect.height - pad, event.clientY - rect.top) };
      };
      const enter = event => {
        const point = position(event);
        xTo(point.x, point.x); yTo(point.y, point.y); tl.play();
      };
      const move = event => { const point = position(event); xTo(point.x); yTo(point.y); };
      const leave = () => tl.reverse();
      cover.addEventListener('pointerenter', enter);cover.addEventListener('pointermove', move);cover.addEventListener('pointerleave', leave);
      cleanup.push(() => {
        cover.removeEventListener('pointerenter', enter);cover.removeEventListener('pointermove', move);cover.removeEventListener('pointerleave', leave);
        card.classList.remove('cursor-enabled');
      });
    });
    return () => cleanup.forEach(fn => fn());
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
