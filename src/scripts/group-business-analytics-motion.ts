import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type MotionMode = 'static' | 'desktop' | 'mobile' | 'reduce' | 'fallback';

const TRIGGER_PREFIX = 'group-analytics-';
const PHASES = ['problem', 'objects', 'query', 'metrics'] as const;

function setMode(root: HTMLElement, mode: MotionMode, ready?: boolean) {
  root.dataset.motionMode = mode;
  if (ready === undefined) delete root.dataset.motionReady;
  else root.dataset.motionReady = String(ready);
}

function ownedTriggers() {
  return ScrollTrigger.getAll().filter((trigger) => String(trigger.vars.id ?? '').startsWith(TRIGGER_PREFIX));
}

function syncDiagnostics(root: HTMLElement) {
  const triggers = ownedTriggers();
  root.dataset.motionTriggerCount = String(triggers.length);
  root.dataset.motionPinCount = String(triggers.filter((trigger) => Boolean(trigger.vars.pin)).length);
}

function revealFinalState(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-motion-scene]').forEach((scene) => { scene.dataset.motionState = 'visible'; });
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-model-phase]'));
  const stageScenes = Array.from(root.querySelectorAll<HTMLElement>('[data-model-stage] > section'));
  gsap.set([...new Set([...panels, ...stageScenes])], { clearProps: 'all' });
  root.dataset.modelPhaseActive = 'all';
}

function restoreStaticState(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-motion-scene]').forEach((scene) => delete scene.dataset.motionState);
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-model-phase]'));
  const stageScenes = Array.from(root.querySelectorAll<HTMLElement>('[data-model-stage] > section'));
  gsap.set([...new Set([...panels, ...stageScenes])], { clearProps: 'all' });
  root.dataset.modelPhaseActive = 'all';
  delete root.dataset.motionReady;
  delete root.dataset.motionTriggerCount;
  delete root.dataset.motionPinCount;
  root.dataset.motionMode = 'static';
}

export function initGroupBusinessAnalyticsMotion(root: HTMLElement) {
  const mm = gsap.matchMedia();
  const eventController = new AbortController();
  let sceneObserver: IntersectionObserver | undefined;
  let chapterObserver: IntersectionObserver | undefined;
  let disposed = false;

  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]'));
  const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-motion-scene]'));
  const phasePanels = Array.from(root.querySelectorAll<HTMLElement>('[data-model-phase]'));
  const modelScenes = Array.from(root.querySelectorAll<HTMLElement>('[data-model-stage] > section'));

  const setActiveChapter = (chapter: string) => {
    links.forEach((link) => {
      const active = link.dataset.chapterLink === chapter;
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  const killOwnedTriggers = () => ownedTriggers().forEach((trigger) => trigger.kill(true));

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    sceneObserver?.disconnect();
    chapterObserver?.disconnect();
    mm.revert();
    killOwnedTriggers();
    eventController.abort();
    restoreStaticState(root);
    document.removeEventListener('astro:before-swap', cleanup);
  };

  document.addEventListener('astro:before-swap', cleanup);

  if (typeof window.IntersectionObserver !== 'function') {
    revealFinalState(root);
    setMode(root, 'fallback', false);
    syncDiagnostics(root);
    return cleanup;
  }

  try {
    scenes.forEach((scene, index) => { scene.dataset.motionState = index === 0 ? 'visible' : 'pending'; });
    sceneObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.motionState = 'visible';
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -18% 0px', threshold: .12 });
    scenes.forEach((scene) => sceneObserver?.observe(scene));

    const chapterTargets = Array.from(root.querySelectorAll<HTMLElement>('section[data-chapter]'));
    chapterObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      const chapter = (visible?.target as HTMLElement | undefined)?.dataset.chapter;
      if (chapter) setActiveChapter(chapter);
    }, { rootMargin: '-32% 0px -58% 0px', threshold: [0, .1, .4] });
    chapterTargets.forEach((target) => chapterObserver?.observe(target));

    links.forEach((link) => link.addEventListener('click', () => {
      if (link.dataset.chapterLink) setActiveChapter(link.dataset.chapterLink);
    }, { signal: eventController.signal }));

    mm.add({
      desktop: '(min-width: 1024px)',
      mobile: '(max-width: 1023px)',
      reduce: '(prefers-reduced-motion: reduce)',
    }, (context) => {
      const { desktop, mobile, reduce } = context.conditions as Record<string, boolean>;

      if (reduce) {
        killOwnedTriggers();
        revealFinalState(root);
        setMode(root, 'reduce', true);
        syncDiagnostics(root);
        return;
      }

      if (mobile) {
        killOwnedTriggers();
        revealFinalState(root);
        setMode(root, 'mobile', true);
        syncDiagnostics(root);
        return;
      }

      if (!desktop || phasePanels.length !== PHASES.length || modelScenes.length !== 2) {
        throw new Error('Model lab requires four semantic phases across S7 and S8');
      }

      const stage = root.querySelector<HTMLElement>('[data-model-stage]');
      if (!stage) throw new Error('Model lab stage is missing');

      setMode(root, 'desktop', false);
      root.dataset.modelPhaseActive = PHASES[0];
      gsap.set(phasePanels, { autoAlpha: 0, y: 24 });
      gsap.set(phasePanels[0], { autoAlpha: 1, y: 0 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          id: 'group-analytics-model-lab',
          trigger: stage,
          start: 'top top',
          end: '+=180%',
          pin: true,
          scrub: .7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const index = Math.min(PHASES.length - 1, Math.floor(self.progress * PHASES.length));
            root.dataset.modelPhaseActive = PHASES[index];
            setActiveChapter('modeling');
          },
        },
      });

      for (let index = 0; index < phasePanels.length - 1; index += 1) {
        timeline
          .to(phasePanels[index], { autoAlpha: 0, y: -20, duration: .35 })
          .to(phasePanels[index + 1], { autoAlpha: 1, y: 0, duration: .45 }, '<.08');
        if (index === phasePanels.length - 2) timeline.to(modelScenes[0], { autoAlpha: 0, duration: .35 }, '<');
      }

      setMode(root, 'desktop', true);
      ScrollTrigger.refresh();
      syncDiagnostics(root);
      Promise.resolve(document.fonts?.ready).then(() => window.setTimeout(() => {
        if (disposed || root.dataset.motionMode !== 'desktop') return;
        ScrollTrigger.refresh();
        syncDiagnostics(root);
      }, 150));

      return () => {
        timeline.scrollTrigger?.kill(true);
        timeline.kill();
        gsap.set([...new Set([...phasePanels, ...modelScenes])], { clearProps: 'all' });
      };
    }, root);
  } catch (error) {
    sceneObserver?.disconnect();
    chapterObserver?.disconnect();
    mm.revert();
    killOwnedTriggers();
    revealFinalState(root);
    setMode(root, 'fallback', false);
    syncDiagnostics(root);
    console.error('Group business analytics motion initialization failed', error);
  }

  return cleanup;
}
