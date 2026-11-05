import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly drift = viewChild<ElementRef<HTMLImageElement>>('drift');
  private revert: (() => void) | null = null;
  private destroyed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.revert?.();
    });

    afterNextRender(() => {
      void this.animate();
    });
  }

  /**
   * Gesto principal: titular enmascarado. Cada línea sube desde su línea base
   * (900 ms, la segunda 110 ms después) y luego aparecen el texto y las acciones.
   * La foto ancha del mosaico se acerca lento al hacer scroll.
   * Con movimiento reducido no se anima nada.
   */
  private async animate(): Promise<void> {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    if (this.destroyed) return;
    gsap.registerPlugin(ScrollTrigger);

    const root = this.host.nativeElement;
    const lines = root.querySelectorAll<HTMLElement>('.hero__line-inner');
    const fades = root.querySelectorAll<HTMLElement>('[data-hero-fade]');
    const cells = root.querySelectorAll<HTMLElement>('.hero__cell');
    const drift = this.drift()?.nativeElement;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.from(cells, { opacity: 0, duration: 0.6, stagger: 0.04, ease: 'power2.out' }, 0)
        .from(lines, { yPercent: 110, duration: 0.9, stagger: 0.11 }, 0.15)
        .from(fades, { y: 20, opacity: 0, duration: 0.7, stagger: 0.07 }, 0.75);

      if (drift) {
        gsap.fromTo(
          drift,
          { scale: 1.04 },
          {
            scale: 1.16,
            ease: 'none',
            scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
          },
        );
      }
    });

    this.revert = () => mm.revert();
  }
}
