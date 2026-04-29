import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiHttpService } from '../../../../core/http/api-http.service';
import { ProductBrand, ProductBrandRaw } from '../models/interfaces/product';

function toBrand(r: ProductBrandRaw): ProductBrand {
  return { id: r.id, name: r.name, active: r.active, createdAt: r.created_at };
}

@Injectable({ providedIn: 'root' })
export class ProductBrandsService {
  // TODO -> agregar documentacion de las funciones

  private readonly api = inject(ApiHttpService);

  getAll(): Observable<ProductBrand[]> {
    return this.api
      .get<ProductBrandRaw[]>('product-brands')
      .pipe(map((items) => items.map(toBrand)));
  }

  getById(id: string): Observable<ProductBrand> {
    return this.api
      .get<ProductBrandRaw>(`product-brands/${id}`)
      .pipe(map(toBrand));
  }

  create(name: string): Observable<ProductBrand> {
    return this.api
      .post<ProductBrandRaw>('product-brands', { name })
      .pipe(map(toBrand));
  }

  activate(id: string): Observable<void> {
    return this.api
      .patch<void>(`product-brands/${id}/activate`)
      .pipe(map(() => undefined));
  }

  deactivate(id: string): Observable<void> {
    return this.api
      .patch<void>(`product-brands/${id}/deactivate`)
      .pipe(map(() => undefined));
  }
}
