import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  Renderer2,
} from '@angular/core';

/**
 * Uso: <button pButton appPreventDoubleSubmit [loadingLabel]="'Procesando...'">Aprobar</button>
 * Al hacer clic: deshabilita el botón y muestra spinner hasta que se llame reset() desde el componente,
 * o automáticamente tras el timeout (fallback de seguridad).
 */
@Directive({
  selector: '[appPreventDoubleSubmit]',
  standalone: true,
})
export class PreventDoubleSubmitDirective implements OnDestroy {
  @Input() loadingLabel = 'Procesando...';
  @Input() resetAfterMs = 10_000;

  private originalText = '';
  private timeoutRef?: ReturnType<typeof setTimeout>;

  constructor(
    private elementRef: ElementRef<HTMLButtonElement>,
    private renderer: Renderer2,
  ) {}

  /**
   * Previene clicks repetidos en un botón, deshabilitándolo y mostrando un mensaje de carga.
   * Se re-habilita automáticamente después de un tiempo o al destruir el componente.
   * @param event
   * @returns
   */
  @HostListener('click')
  onClick(): void {
    const btn = this.elementRef.nativeElement;
    if (btn.disabled) return;

    this.originalText = btn.innerText;
    this.renderer.setProperty(btn, 'disabled', true);
    this.renderer.setAttribute(btn, 'aria-busy', 'true');
    btn.innerText = this.loadingLabel;

    this.timeoutRef = setTimeout(() => this.reset(), this.resetAfterMs);
  }

  /**
   * Re-habilita el botón y restaura su texto original. Se llama automáticamente después de un tiempo o al destruir el componente.
   */
  reset(): void {
    const btn = this.elementRef.nativeElement;
    this.renderer.setProperty(btn, 'disabled', false);
    this.renderer.removeAttribute(btn, 'aria-busy');
    btn.innerText = this.originalText;
    if (this.timeoutRef) clearTimeout(this.timeoutRef);
  }

  ngOnDestroy(): void {
    if (this.timeoutRef) clearTimeout(this.timeoutRef);
  }
}
