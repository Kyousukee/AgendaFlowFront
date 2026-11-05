import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';

/**
 * Revela los hijos marcados con `data-reveal` (o el propio host si no hay ninguno)
 * cuando la sección entra en pantalla, con GSAP + ScrollTrigger.
 *
 * - Solo corre en el navegador (`afterNextRender`); en SSR el contenido queda visible.
 * - El estado oculto inicial lo aplica GSAP, nunca el CSS.
 * - Con `prefers-reduced-motion: reduce` no anima: todo queda en su estado final.
 */
@Directive({
  selector: '[appScrollReveal]',
})
export class ScrollRevealDirective {
  /** Desplazamiento vertical inicial en px (16–32). */
  readonly revealY = input<number>(24);
  /** Separación entre elementos en segundos (0.06–0.09). */
  readonly revealStagger = input<number>(0.08);
  /** Punto de disparo de ScrollTrigger. */
  readonly revealStart = input<string>('top 80%');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private revert: (() => void) | null = null;
  private destroyed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.revert?.();
    });

    afterNextRender(() => {
      void this.setup();
    });
  }

  private async setup(): Promise<void> {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    if (this.destroyed) return;
    gsap.registerPlugin(ScrollTrigger);

    const el = this.host.nativeElement;
    const marked = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'));
    const targets = marked.length > 0 ? marked : [el];

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(targets, {
        y: this.revealY(),
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: this.revealStagger(),
        scrollTrigger: {
          trigger: el,
          start: this.revealStart(),
          once: true,
        },
      });
    });

    this.revert = () => mm.revert();
  }
}
