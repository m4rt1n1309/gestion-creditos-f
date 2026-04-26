import { Injectable, computed, signal } from '@angular/core';

export interface Client {
  id: number;
  name: string;
  dni: string;
  phone: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export interface PaymentFrequency {
  label: string;
  value: string;
  factor: number;
}

@Injectable()
export class OperationFormService {
  // Step 0 — Client
  searchClient = signal('');
  selectedClient = signal<Client | null>(null);
  clients: Client[] = [
    {
      id: 1,
      name: 'Juan Pérez García',
      dni: '27.123.456',
      phone: '381-555-1234',
    },
    { id: 2, name: 'María López', dni: '28.654.321', phone: '381-555-9876' },
    { id: 3, name: 'Carlos Ruiz', dni: '29.321.654', phone: '381-555-0000' },
  ];

  // Step 1 — Products
  searchProduct = signal('');
  selectedType = signal<'VENTA' | 'PRESTAMO'>('VENTA');
  selectedProducts = signal<Product[]>([]);
  availableProducts: Product[] = [
    { id: 101, name: 'Zapatillas Nike Air Max', price: 45000, stock: 12 },
    { id: 102, name: 'Samsung Galaxy A54', price: 185000, stock: 5 },
    { id: 103, name: 'Smart TV 43" Noblex', price: 120000, stock: 8 },
  ];
  operationTypes = [
    { label: 'Venta a Crédito', value: 'VENTA' },
    { label: 'Préstamo Personal', value: 'PRESTAMO' },
  ];

  // Step 2 — Conditions
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
  paymentFrequencies: PaymentFrequency[] = [
    { label: 'Semanal (4 pagos/mes)', value: 'WEEKLY', factor: 4 },
    { label: 'Quincenal (2 pagos/mes)', value: 'BIWEEKLY', factor: 2 },
    { label: 'Mensual (1 pago/mes)', value: 'MONTHLY', factor: 1 },
  ];
  selectedFrequency = signal<PaymentFrequency>({
    label: 'Mensual (1 pago/mes)',
    value: 'MONTHLY',
    factor: 1,
  });
  loanMonths = signal(6);
  loanInterest = signal(10);

  // Step 3 — Confirm
  checks = signal({
    identity: false,
    conditions: false,
    disbursement: false,
    capacity: false,
  });

  // Computed
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

  addProduct(product: Product) {
    this.selectedProducts.update((list) => [...list, { ...product }]);
  }

  removeProduct(product: Product) {
    this.selectedProducts.update((list) => list.filter((p) => p !== product));
  }

  updateCheck(key: keyof ReturnType<typeof this.checks>, value: boolean) {
    this.checks.update((c) => ({ ...c, [key]: value }));
  }
}
