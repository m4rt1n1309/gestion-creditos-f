import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { CustomersService } from '../../../features/seller/clients/customers.service';
import { ProductUnitsService } from '../../../features/seller/products/product-units.service';
import { ClientOperation } from '../../models/interface/client';
import { PaymentFrequencyOperation } from '../../models/interface/payment';
import { ProductOperation } from '../../models/interface/product';

@Injectable()
export class OperationFormService {
  private readonly customersService = inject(CustomersService);
  private readonly productUnitsService = inject(ProductUnitsService);

  searchClient = signal('');
  selectedClient = signal<ClientOperation | null>(null);
  clients: ClientOperation[] = [];

  searchProduct = signal('');
  selectedType = signal<'VENTA' | 'PRESTAMO'>('VENTA');
  selectedProducts = signal<ProductOperation[]>([]);
  availableProducts: ProductOperation[] = [];

  /**
   * Lista de unidades disponibles filtrada por nombre o código según el texto del buscador.
   * @returns {ProductOperation[]} Unidades cuya etiqueta contiene el término buscado.
   */
  filteredAvailableProducts = computed(() => {
    const searchTerm = this.searchProduct().trim().toLowerCase();
    if (!searchTerm) {
      return this.availableProducts;
    }

    return this.availableProducts.filter((product) => {
      const byName = product.name.toLowerCase().includes(searchTerm);
      const byUnitCode =
        product.unitCode?.toLowerCase().includes(searchTerm) ?? false;
      return byName || byUnitCode;
    });
  });

  /**
   * Carga clientes activos y unidades disponibles para el wizard de nueva operación.
   * Para ventas, el contrato exige enviar IDs reales de `product_units`.
   * @returns {Observable<void>} Flujo completado cuando ambas fuentes están cargadas.
   */
  loadData(): Observable<void> {
    return forkJoin({
      customers: this.customersService.list({ status: 'ACTIVE' }),
      units: this.productUnitsService.getAll({ status: 'AVAILABLE' }),
    }).pipe(
      map(({ customers, units }) => {
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
        this.availableProducts = units.map((u) => ({
          id: u.id,
          name: u.productName,
          price: u.currentPrice,
          stock: 1,
          unitCode: u.unitCode,
        }));
      }),
    );
  }

  operationTypes = [
    { label: 'Venta a Crédito', value: 'VENTA' },
    { label: 'Préstamo Personal', value: 'PRESTAMO' },
  ];

  /**
   * Actualiza el tipo de operación y limpia el estado de productos cuando es préstamo.
   * Evita arrastrar datos residuales de búsqueda o selección al flujo sin productos.
   * @param {'VENTA' | 'PRESTAMO'} type - Tipo elegido en el wizard.
   */
  setOperationType(type: 'VENTA' | 'PRESTAMO') {
    this.selectedType.set(type);

    if (type === 'PRESTAMO') {
      this.searchProduct.set('');
      this.selectedProducts.set([]);
    }
  }

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

  /**
   * Indica si se completaron todas las declaraciones obligatorias del paso final.
   * @returns {boolean} true solo cuando las 4 casillas requeridas están marcadas.
   */
  isConfirmed = computed(() => {
    const c = this.checks();
    return c.identity && c.conditions && c.disbursement && c.capacity;
  });

  /**
   * Indica si una unidad ya fue seleccionada en el flujo de venta.
   * Evita duplicar la misma `product_unit` dentro del payload final.
   * @param {string} productId - ID real de la unidad (`product_unit.id`).
   * @returns {boolean} true cuando la unidad ya está en la selección actual.
   */
  isProductSelected(productId: string): boolean {
    return this.selectedProducts().some((product) => product.id === productId);
  }

  /**
   * Agrega una unidad disponible al listado seleccionado del flujo de venta.
   * Ignora intentos duplicados para no enviar el mismo `product_unit.id` dos veces.
   * @param {ProductOperation} product - Unidad elegida por el usuario.
   */
  addProduct(product: ProductOperation) {
    this.selectedProducts.update((list) => {
      if (list.some((item) => item.id === product.id)) {
        return list;
      }

      return [...list, { ...product }];
    });
  }

  /**
   * Remueve una unidad seleccionada del flujo de venta.
   * @param {ProductOperation} product - Unidad a quitar de la selección.
   */
  removeProduct(product: ProductOperation) {
    this.selectedProducts.update((list) => list.filter((p) => p !== product));
  }

  /**
   * Actualiza el estado de una casilla de confirmación del paso final.
   * @param {keyof ReturnType<typeof this.checks>} key - Clave de la casilla a modificar.
   * @param {boolean} value - Valor booleano seleccionado por el usuario.
   */
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
