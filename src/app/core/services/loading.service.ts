import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _count = 0;
  readonly isLoading = signal(false);

  /** Muestra el indicador de carga. */
  show(): void {
    this._count++;
    this.isLoading.set(true);
  }

  /**
   * Oculta el indicador de carga si el contador es 0.
   */
  hide(): void {
    this._count = Math.max(0, this._count - 1);
    if (this._count === 0) this.isLoading.set(false);
  }
}
