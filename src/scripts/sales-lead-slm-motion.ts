import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type MotionMode = 'desktop' | 'mobile' | 'reduce' | 'fallback';

function setMode(root: HTMLElement, mode: MotionMode, ready: boolean) {
  root.dataset.motionMode = mode;
  root.dataset.motionReady = String(ready);
}

function syncDiagnostics(root: HTMLElement) {
  const triggers = ScrollTrigger.getAll().filter((trigger) => String(trigger.vars.id ?? '').startsWith('sales-lead-'));
  root.dataset.motionTriggerCount = String(triggers.length);
  root.dataset.motionPinCount = String(triggers.filter((trigger) => Boolean(trigger.vars.pin)).length);
}

function initChapterNav(root: HTMLElement) {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]'));
  const targets = ['s1', 's6', 's9'].map((id) => root.querySelector<HTMLElement>(`#${id}`)).filter((target): target is HTMLElement => Boolean(target));
  const setActive = (chapterId: string) => links.forEach((link) => {
    const active = link.dataset.chapterLink === chapterId;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActive(visible.target.id === 's6' ? 's5' : visible.target.id);
  }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.2, 0.5] });
  targets.forEach((target) => observer.observe(target));
  return { setActive, disconnect: () => observer.disconnect() };
}

export function initSalesLeadMotion(root: HTMLElement) {
  const mm = gsap.matchMedia();
  const chapterNav = initChapterNav(root);
  let disposed = false;
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    mm.revert();
    chapterNav.disconnect();
    delete root.dataset.motionReady;
    delete root.dataset.motionTriggerCount;
    delete root.dataset.motionPinCount;
    root.dataset.motionMode = 'static';
    document.removeEventListener('astro:before-swap', cleanup);
  };

  try {
    mm.add({ isDesktop: '(min-width: 861px)', isMobile: '(max-width: 860px)', reduceMotion: '(prefers-reduced-motion: reduce)' }, (context) => {
      const { isDesktop, isMobile, reduceMotion } = context.conditions as Record<string, boolean>;
      if (reduceMotion) { setMode(root, 'reduce', true); syncDiagnostics(root); return; }
      setMode(root, isDesktop ? 'desktop' : 'mobile', false);
      gsap.timeline({ defaults: { ease: 'power2.out' } })
        .from('#s1 .chapter', { autoAlpha: 0, y: 12, duration: .25 })
        .from('#s1 h1', { autoAlpha: 0, y: 24, duration: .4 }, '<.08')
        .from('#s1 .lead', { autoAlpha: 0, y: 16, duration: .3 }, '<.12')
        .from('#s1 .metric', { autoAlpha: 0, y: 14, duration: .25, stagger: .06 }, '<.05');
      gsap.from('[data-motion="problem-lines"] > *', { autoAlpha: 0, y: 18, duration: .45, stagger: .08, scrollTrigger: { id: 'sales-lead-problem', trigger: '#s2', start: 'top 70%', toggleActions: 'play none none reverse' } });
      gsap.from('[data-motion="result-line"] > *', { autoAlpha: 0, scale: .96, duration: .55, stagger: .1, scrollTrigger: { id: 'sales-lead-result', trigger: '#s6', start: 'top 68%', toggleActions: 'play none none reverse' } });
      gsap.from('[data-motion="responsibility-node"]', { autoAlpha: 0, y: 18, duration: .4, stagger: .07, scrollTrigger: { id: 'sales-lead-responsibility', trigger: '[data-motion="responsibility-stage"]', start: 'top 72%', toggleActions: 'play none none reverse' } });
      if (isDesktop) {
        const panels = gsap.utils.toArray<HTMLElement>('.decision-panel');
        gsap.set(panels.slice(1), { autoAlpha: 0, yPercent: 6 });
        gsap.timeline({ scrollTrigger: { id: 'sales-lead-decision', trigger: '[data-motion="decision-stage"]', start: 'top top', end: '+=260%', pin: true, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: (self) => chapterNav.setActive(self.progress < .58 ? 's3' : 's5') } })
          .from('[data-motion="score-cloud"] > *', { autoAlpha: .35, y: 20, stagger: .05 })
          .to(panels[0], { autoAlpha: 0, yPercent: -6 }).to(panels[1], { autoAlpha: 1, yPercent: 0 }, '<')
          .from('[data-motion="decision-balance"] > *', { x: 24, autoAlpha: 0, stagger: .08 })
          .to(panels[1], { autoAlpha: 0, yPercent: -6 }).to(panels[2], { autoAlpha: 1, yPercent: 0 }, '<')
          .from('[data-motion="pool-rings"] span', { scale: .82, autoAlpha: 0, stagger: .08 });
        const track = root.querySelector<HTMLElement>('[data-motion="industry-track"]');
        const stage = root.querySelector<HTMLElement>('[data-motion="industry-stage"]');
        if (track && stage) {
          const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
          gsap.timeline({ scrollTrigger: { id: 'sales-lead-industry', trigger: stage, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true, onEnter: () => chapterNav.setActive('s7'), onEnterBack: () => chapterNav.setActive('s7') } }).to(track, { x: () => -distance(), ease: 'none' });
        }
      }
      if (isDesktop) {
        document.fonts?.ready.then(() => window.setTimeout(() => {
          if (disposed || root.dataset.motionMode !== 'desktop') return;
          ScrollTrigger.refresh();
          setMode(root, 'desktop', true);
          syncDiagnostics(root);
        }, 250));
      } else {
        setMode(root, isMobile ? 'mobile' : 'fallback', true);
        syncDiagnostics(root);
      }
    }, root);
    document.addEventListener('astro:before-swap', cleanup);
  } catch (error) {
    cleanup();
    setMode(root, 'fallback', false);
    syncDiagnostics(root);
    console.error('Sales lead motion initialization failed', error);
  }
  return cleanup;
}
