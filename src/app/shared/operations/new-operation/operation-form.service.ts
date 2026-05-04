import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { CustomersService } from '../../../features/seller/clients/customers.service';
import { ProductsService } from '../../../features/seller/products/products.service';
import { ClientOperation } from '../../models/interface/client';
import { PaymentFrequencyOperation } from '../../models/interface/payment';
import { ProductOperation } from '../../models/interface/product';

@Injectable()
export class OperationFormService {
  private readonly customersService = inject(CustomersService);
  private readonly productsService = inject(ProductsService);

  searchClient = signal('');
  selectedClient = signal<ClientOperation | null>(null);
  clients: ClientOperation[] = [];

  searchProduct = signal('');
  selectedType = signal<'VENTA' | 'PRESTAMO'>('VENTA');
  selectedProducts = signal<ProductOperation[]>([]);
  availableProducts: ProductOperation[] = [];

  /**
   *
   * @returns
   */
  loadData(): Observable<void> {
    return forkJoin({
      customers: this.customersService.list({ status: 'ACTIVE' }),
      products: this.productsService.list({ status: 'ACTIVE' }),
    }).pipe(
      map(({ customers, products }) => {
        this.clients = customers.map((c) => ({
          id: c.id,
          name: c.fullName,
          dni: c.dni,
          phone: c.phone ?? '',
          email: c.email ?? '',
          previousCredits: 0,
          delinquency: 'sin mora',
          paymentCapacity: 0,
        }));
        this.availableProducts = products.map((p) => ({
          id: p.id,
          name: p.title,
          price: p.variants[0]?.currentPrice ?? 0,
          stock: p.availableCount,
        }));
      }),
    );
  }

  operationTypes = [
    { label: 'Venta a Crédito', value: 'VENTA' },
    { label: 'Préstamo Personal', value: 'PRESTAMO' },
  ];

  firstDueDate = signal<Date | undefined>(undefined);
  installmentsOptions = [
    { label: '1 cuota', value: 1 },
    { label: '3 cuotas', value: 3 },
    { label: '6 cuotas', value: 6 },
    { label: '12 cuotas', value: 12 },
  ];
  selectedInstallments = signal(6);
  interestRate = signal(15);
  loanCapital = signal(50000);
  paymentFrequencies: PaymentFrequencyOperation[] = [
    { label: 'Semanal (4 pagos/mes)', value: 'WEEKLY', factor: 4 },
    { label: 'Quincenal (2 pagos/mes)', value: 'BIWEEKLY', factor: 2 },
    { label: 'Mensual (1 pago/mes)', value: 'MONTHLY', factor: 1 },
  ];
  selectedFrequency = signal<PaymentFrequencyOperation>({
    label: 'Mensual (1 pago/mes)',
    value: 'MONTHLY',
    factor: 1,
  });
  loanMonths = signal(6);
  loanInterest = signal(10);

  checks = signal({
    identity: false,
    conditions: false,
    disbursement: false,
    capacity: false,
  });

  capital = computed(() => {
    if (this.selectedType() === 'VENTA') {
      return this.selectedProducts().reduce((acc, p) => acc + p.price, 0);
    }
    return this.loanCapital();
  });

  installmentsCount = computed(() => {
    if (this.selectedType() === 'VENTA') return this.selectedInstallments();
    return this.loanMonths() * this.selectedFrequency().factor;
  });

  totalToPay = computed(() => {
    const capital = this.capital();
    if (this.selectedType() === 'VENTA') {
      return capital + capital * (this.interestRate() / 100);
    }
    return capital + capital * (this.loanInterest() / 100) * this.loanMonths();
  });

  installmentValue = computed(() => {
    const count = this.installmentsCount();
    return count > 0 ? this.totalToPay() / count : 0;
  });

  isConfirmed = computed(() => {
    const c = this.checks();
    return c.identity && c.conditions && c.capacity;
  });

  /**
   * Agrega un producto.
   * @param product
   */
  addProduct(product: ProductOperation) {
    this.selectedProducts.update((list) => [...list, { ...product }]);
  }

  /**
   * Remueve un producto.
   * @param product
   */
  removeProduct(product: ProductOperation) {
    this.selectedProducts.update((list) => list.filter((p) => p !== product));
  }

  updateCheck(key: keyof ReturnType<typeof this.checks>, value: boolean) {
    this.checks.update((c) => ({ ...c, [key]: value }));
  }

  /**
   * Devuelve la fecha actual normalizada al inicio del día local.
   * Se usa como referencia para validar que el primer pago no quede en el pasado.
   * @returns {Date} Fecha de hoy a las 00:00 local.
   */
  getTodayStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  /**
   * Normaliza una fecha al inicio del día local para evitar errores por hora/zona.
   * @param {Date} date - Fecha a normalizar.
   * @returns {Date} Fecha truncada a las 00:00 local.
   */
  normalizeToLocalDayStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * Indica si la fecha de primer pago es válida (hoy o futura).
   * @returns {boolean} true cuando hay fecha y no es anterior a hoy.
   */
  isFirstDueDateValid(): boolean {
    const dueDate = this.firstDueDate();
    if (!dueDate) return false;
    return this.normalizeToLocalDayStart(dueDate) >= this.getTodayStart();
  }
}
