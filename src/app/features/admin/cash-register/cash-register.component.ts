import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DateService } from '../../../core/services/date.service';
import {
  CloseRegisterComponent,
  CloseRegisterData,
} from './close-register/close-register.component';
import {
  CashMovementDetail,
  MovementDetailComponent,
} from './movement-detail/movement-detail.component';

interface CashMovement {
  id: string;
  date: string;
  time: string;
  type: 'INGRESO' | 'EGRESO';
  concept: string;
  amount: number;
  paymentMethod: string;
  paymentMethodIcon: string;
  createdBy: string;
  status: 'Aplicado' | 'Pendiente' | 'Anulado';
  creditId?: string;
  clientName?: string;
  installment?: string;
  category?: string;
  authorizedBy?: string;
  receiptNumber?: string;
  observations?: string;
}

interface ClosedRegisterSnapshot {
  closedAt: string;
  closedBy: string;
  initialBalance: number;
  income: number;
  expenses: number;
  incomeTransactions: number;
  expenseTransactions: number;
  movements: CashMovement[];
}

const CLOSED_REGISTERS: Record<string, ClosedRegisterSnapshot> = {
  '19-04-2026': {
    closedAt: '06:00 p.m.',
    closedBy: 'Carlos Ruiz',
    initialBalance: 5000,
    income: 45200,
    expenses: 12300,
    incomeTransactions: 32,
    expenseTransactions: 8,
    movements: [
      {
        id: 'MOV-2026-04190015',
        date: '19 Abr 2026',
        time: '14:30',
        type: 'INGRESO',
        concept: 'Pago cuota CR001 · Juan Pérez',
        amount: 2916670,
        paymentMethod: 'Efectivo',
        paymentMethodIcon: 'pi pi-money-bill',
        createdBy: 'María S.',
        status: 'Aplicado',
        creditId: 'CR001',
        clientName: 'Juan Pérez · CC 1.012.345.678',
        installment: 'Cuota 1 de 12',
      },
      {
        id: 'MOV-2026-04190014',
        date: '19 Abr 2026',
        time: '13:45',
        type: 'EGRESO',
        concept: 'Pago comisiones Vendedores',
        amount: 1200000,
        paymentMethod: 'Efectivo',
        paymentMethodIcon: 'pi pi-money-bill',
        createdBy: 'Admin',
        status: 'Aplicado',
        category: 'Comisiones',
        authorizedBy: 'Carlos Ruiz · Administrador',
      },
      {
        id: 'MOV-2026-04190013',
        date: '19 Abr 2026',
        time: '13:30',
        type: 'INGRESO',
        concept: 'Pago cuota CR002 · María López',
        amount: 3500000,
        paymentMethod: 'Nequi',
        paymentMethodIcon: 'pi pi-mobile',
        createdBy: 'Juan P.',
        status: 'Aplicado',
        creditId: 'CR002',
        clientName: 'María López · CC 1.054.321.987',
        installment: 'Cuota 7 de 12',
      },
    ],
  },
};

@Component({
  selector: 'app-cash-register',
  standalone: true,
  imports: [
    CurrencyPipe,
    FormsModule,
    ButtonModule,
    CalendarModule,
    CardModule,
    TagModule,
    TableModule,
    CloseRegisterComponent,
    MovementDetailComponent,
  ],
  templateUrl: './cash-register.component.html',
  styleUrl: './cash-register.component.scss',
})
export class CashRegisterComponent implements OnInit {
  today = '';
  selectedDate: Date = new Date();
  initialBalance = 5000;
  income = 4850000;
  expenses = 1230000;
  incomeTransactions = 23;
  expenseTransactions = 8;

  closedSnapshot: ClosedRegisterSnapshot | null = null;

  showCloseModal = false;
  closeRegisterData!: CloseRegisterData;

  showMovementDetail = false;
  selectedMovement!: CashMovementDetail;

  private readonly defaultMovements: CashMovement[] = [
    {
      id: 'MOV-2026-04180021',
      date: '18 Abr 2026',
      time: '10:32 a.m.',
      type: 'INGRESO',
      concept: 'Pago cuota crédito',
      amount: 1250000,
      paymentMethod: 'Efectivo',
      paymentMethodIcon: 'pi pi-money-bill',
      createdBy: 'Ana Martínez · Cajero',
      status: 'Aplicado',
      creditId: 'CR-2024-0341',
      clientName: 'Juan Pérez García · CC 1.012.345.678',
      installment: 'Cuota 3 de 12',
    },
    {
      id: 'MOV-2026-04180020',
      date: '18 Abr 2026',
      time: '09:15 a.m.',
      type: 'EGRESO',
      concept: 'Pago proveedor papelería',
      amount: 380000,
      paymentMethod: 'Efectivo',
      paymentMethodIcon: 'pi pi-money-bill',
      createdBy: 'Carlos Ruiz · Administrador',
      status: 'Aplicado',
      category: 'Gastos operativos',
      authorizedBy: 'Ana Martínez · Supervisor',
      receiptNumber: 'COMP-2026-00892',
      observations: 'Proveedor: Papelería El Centro · Factura #8821',
    },
    {
      id: 'MOV-2026-04180019',
      date: '18 Abr 2026',
      time: '08:50 a.m.',
      type: 'INGRESO',
      concept: 'Pago cuota crédito',
      amount: 3500000,
      paymentMethod: 'Nequi',
      paymentMethodIcon: 'pi pi-mobile',
      createdBy: 'Juan P.',
      status: 'Aplicado',
      creditId: 'CR-2024-0290',
      clientName: 'María López · CC 1.054.321.987',
      installment: 'Cuota 7 de 12',
    },
  ];

  movements: CashMovement[] = [...this.defaultMovements];

  constructor(private dateService: DateService) {}

  ngOnInit(): void {
    this.today = this.dateService.display(new Date(), 'dd-MM-yyyy');
    this.closeRegisterData = {
      date: this.today,
      shift: '08:00 - 18:00',
      totalIncome: this.income,
      incomeTransactions: this.incomeTransactions,
      totalExpenses: this.expenses,
      expenseTransactions: this.expenseTransactions,
      expectedBalance: this.finalBalance,
      breakdown: [
        { label: 'Efectivo', icon: 'pi pi-money-bill', amount: 2100000 },
        {
          label: 'Transferencia / Nequi',
          icon: 'pi pi-credit-card',
          amount: 1120000,
        },
        { label: 'Datafono', icon: 'pi pi-mobile', amount: 400000 },
      ],
    };
  }

  onDateChange(): void {
    const key = this.dateService.display(this.selectedDate, 'dd-MM-yyyy');
    const snapshot = CLOSED_REGISTERS[key] ?? null;
    this.closedSnapshot = snapshot;

    if (snapshot) {
      this.initialBalance = snapshot.initialBalance;
      this.income = snapshot.income;
      this.expenses = snapshot.expenses;
      this.incomeTransactions = snapshot.incomeTransactions;
      this.expenseTransactions = snapshot.expenseTransactions;
      this.movements = snapshot.movements;
    } else {
      this.initialBalance = 5000;
      this.income = 4850000;
      this.expenses = 1230000;
      this.incomeTransactions = 23;
      this.expenseTransactions = 8;
      this.movements = [...this.defaultMovements];
    }
  }

  openCloseRegister(): void {
    this.closeRegisterData = {
      ...this.closeRegisterData,
      expectedBalance: this.finalBalance,
    };
    this.showCloseModal = true;
  }

  onRegisterClosed(result: {
    countedCash: number;
    observations: string;
  }): void {
    console.log('Cierre de caja:', result);
  }

  viewMovement(mov: CashMovement): void {
    this.selectedMovement = mov;
    this.showMovementDetail = true;
  }

  get formattedSelectedDate(): string {
    return this.dateService.display(this.selectedDate, 'dd-MM-yyyy');
  }

  get isToday(): boolean {
    return this.formattedSelectedDate === this.today;
  }

  get closedDateLabel(): string {
    if (!this.closedSnapshot) return '';
    const d = this.selectedDate;
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  get finalBalance(): number {
    return this.initialBalance + this.income - this.expenses;
  }
}
