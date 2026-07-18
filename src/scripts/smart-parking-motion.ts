type MotionMode = 'static' | 'observe' | 'reduce' | 'fallback';

const sceneSelector = '[data-scene]';
const chapterLinkSelector = '[data-smart-parking-nav] [data-chapter-link]';

function setRootMode(root: HTMLElement, mode: MotionMode, ready: boolean | null) {
  root.dataset.motionMode = mode;
  if (ready === null) delete root.dataset.motionReady;
  else root.dataset.motionReady = String(ready);
}

function setAllScenesVisible(scenes: HTMLElement[]) {
  scenes.forEach((scene) => { scene.dataset.motionState = 'visible'; });
}

function setActiveChapter(chapterId: string) {
  document.querySelectorAll<HTMLAnchorElement>(chapterLinkSelector).forEach((link) => {
    const active = link.dataset.chapterLink === chapterId;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

export function initSmartParkingMotion(root: HTMLElement) {
  const scenes = Array.from(root.querySelectorAll<HTMLElement>(sceneSelector));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer: IntersectionObserver | null = null;
  let listening = false;
  let disposed = false;

  const disconnectObserver = () => {
    observer?.disconnect();
    observer = null;
  };

  const applyStaticMode = (mode: Extract<MotionMode, 'reduce' | 'fallback'>, ready: boolean) => {
    disconnectObserver();
    setRootMode(root, mode, ready);
    setAllScenesVisible(scenes);
  };

  const setup = () => {
    disconnectObserver();
    if (reduceMotion.matches) {
      applyStaticMode('reduce', true);
      return;
    }
    if (typeof window.IntersectionObserver !== 'function') {
      applyStaticMode('fallback', false);
      return;
    }

    observer = new IntersectionObserver((entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      visibleEntries.forEach((entry) => {
        const scene = entry.target as HTMLElement;
        scene.dataset.motionState = 'visible';
      });

      const leadingScene = visibleEntries[0]?.target as HTMLElement | undefined;
      if (leadingScene?.dataset.chapter) setActiveChapter(leadingScene.dataset.chapter);
    }, { root, rootMargin: '-15% 0px -25% 0px', threshold: [0, 0.15, 0.4, 0.7] });

    scenes.forEach((scene, index) => {
      scene.dataset.motionState = index === 0 ? 'visible' : 'pending';
      observer?.observe(scene);
    });
    setActiveChapter(scenes[0]?.dataset.chapter ?? 'background');
    setRootMode(root, 'observe', true);
  };

  const onPreferenceChange = () => {
    if (disposed) return;
    try {
      setup();
    } catch (error) {
      applyStaticMode('fallback', false);
      console.error('Smart parking motion initialization failed', error);
    }
  };

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    disconnectObserver();
    if (listening) reduceMotion.removeEventListener('change', onPreferenceChange);
    document.removeEventListener('astro:before-swap', cleanup);
    scenes.forEach((scene) => { delete scene.dataset.motionState; });
    setRootMode(root, 'static', null);
  };

  try {
    setup();
    reduceMotion.addEventListener('change', onPreferenceChange);
    listening = true;
    document.addEventListener('astro:before-swap', cleanup);
  } catch (error) {
    applyStaticMode('fallback', false);
    console.error('Smart parking motion initialization failed', error);
  }

  return cleanup;
}
