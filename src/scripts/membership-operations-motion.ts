type MotionMode = 'static' | 'observe' | 'reduce' | 'fallback';

function setMode(root: HTMLElement, mode: MotionMode, ready: boolean | null) {
  root.dataset.motionMode = mode;
  if (ready === null) delete root.dataset.motionReady;
  else root.dataset.motionReady = String(ready);
}

export function initMembershipOperationsMotion(root: HTMLElement) {
  const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-scene]'));
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer: IntersectionObserver | undefined;

  const setActive = (chapter = 'member') => {
    root.dataset.activeMemberNode = chapter;
    document.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]').forEach((link) => {
      const active = link.dataset.chapterLink === chapter;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };
  const visible = () => scenes.forEach((scene) => { scene.dataset.motionState = 'visible'; });
  const fallback = (mode: 'reduce' | 'fallback', ready: boolean) => {
    observer?.disconnect();
    observer = undefined;
    setMode(root, mode, ready);
    visible();
    setActive();
  };
  const setup = () => {
    observer?.disconnect();
    if (media.matches) return fallback('reduce', true);
    if (typeof window.IntersectionObserver !== 'function') return fallback('fallback', false);
    observer = new IntersectionObserver((entries) => {
      const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      active.forEach((entry) => { (entry.target as HTMLElement).dataset.motionState = 'visible'; });
      const scene = active[0]?.target as HTMLElement | undefined;
      if (scene?.dataset.chapter) setActive(scene.dataset.chapter);
    }, { root, rootMargin: '-15% 0px -25% 0px', threshold: [0, .15, .4, .7] });
    scenes.forEach((scene, index) => { scene.dataset.motionState = index === 0 ? 'visible' : 'pending'; observer?.observe(scene); });
    setActive();
    setMode(root, 'observe', true);
  };
  const cleanup = () => {
    observer?.disconnect();
    media.removeEventListener('change', setup);
    document.removeEventListener('astro:before-swap', cleanup);
    scenes.forEach((scene) => delete scene.dataset.motionState);
    delete root.dataset.activeMemberNode;
    setMode(root, 'static', null);
  };
  try { setup(); media.addEventListener('change', setup); document.addEventListener('astro:before-swap', cleanup); }
  catch (error) { fallback('fallback', false); console.error('Membership operations motion initialization failed', error); }
  return cleanup;
}
