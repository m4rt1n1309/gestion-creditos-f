import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiHttpService } from '../../../core/http/api-http.service';
import {
  ExpenseCategory,
  ExpenseCategoryRaw,
} from '../models/interface/expenses';

function toCategory(r: ExpenseCategoryRaw): ExpenseCategory {
  return { id: r.id, name: r.name, active: r.active, createdAt: r.created_at };
}

@Injectable({ providedIn: 'root' })
export class ExpenseCategoriesService {
  private readonly api = inject(ApiHttpService);

  /**
   * Obtiene todas las categorías de gastos desde la API, mapeando cada objeto recibido (en formato ExpenseCategoryRaw) a un objeto en formato ExpenseCategory utilizando la función toCategory. El resultado es un Observable que emite un arreglo de categorías de gastos en el formato utilizado por la aplicación.
   * @returns
   */
  getAll(): Observable<ExpenseCategory[]> {
    return this.api
      .get<ExpenseCategoryRaw[]>('expense-categories')
      .pipe(map((items) => items.map(toCategory)));
  }

  /**
   * Crea una nueva categoría de gasto.
   * @param name
   * @returns
   */
  create(name: string): Observable<ExpenseCategory> {
    return this.api
      .post<ExpenseCategoryRaw>('expense-categories', { name })
      .pipe(map(toCategory));
  }

  /**
   * Activa una categoría de gasto.
   * @param id
   * @returns
   */
  activate(id: string): Observable<void> {
    return this.api
      .patch<void>(`expense-categories/${id}/activate`)
      .pipe(map(() => undefined));
  }

  /**
   * Desactiva una categoría de gasto.
   * @param id
   * @returns
   */
  deactivate(id: string): Observable<void> {
    return this.api
      .patch<void>(`expense-categories/${id}/deactivate`)
      .pipe(map(() => undefined));
  }
}
