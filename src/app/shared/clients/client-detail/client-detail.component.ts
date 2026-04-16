import { CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderService } from '../../../core/services/header.service';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ClientDetail } from '../../models/interface/client';
import { Credit } from '../../models/interface/credit';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    RouterModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    DropdownModule,
    FormsModule,
  ],
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.scss',
})
export class ClientDetailComponent implements OnInit, OnDestroy {
  client: ClientDetail | null = null;
  activeTab: 'creditos' | 'historial' | 'documentos' | 'contactar' = 'creditos';
  searchTerm = '';
  selectedEstado: string | null = null;

  estadoOptions = [
    { label: 'Todos los estados', value: null },
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'En Mora', value: 'EN MORA' },
    { label: 'Pagado', value: 'PAGADO' },
  ];

  private mockClients: ClientDetail[] = [
    {
      dni: '27.123.456',
      initials: 'JP',
      avatarColor: '#3B82F6',
      name: 'Juan Pérez García',
      phone: '+54 9 2865 123456',
      email: 'juan@email.com',
      direccion: 'Calle Principal 123',
      ciudad: 'San Miguel de Tucumán',
      risk: 'Mora leve',
      credits: [
        {
          id: 'CR-2024-0341',
          tipo: 'Préstamo Express Personal',
          producto: 'Préstamo Express Personal',
          montoOriginal: 25000,
          saldoPendiente: 18500,
          cuotaActual: 14,
          totalCuotas: 24,
          cuotaMensual: 1250,
          proximoVencimiento: '30/04/2026',
          tasa: '1.8% mensual',
          estado: 'ACTIVO',
          progreso: 56,
        },
        {
          id: 'CR-2023-0187',
          tipo: 'Credito Plus Personal',
          producto: 'Credito Plus Personal',
          montoOriginal: 10000,
          saldoPendiente: 7200,
          cuotaActual: 6,
          totalCuotas: 18,
          cuotaMensual: 0,
          proximoVencimiento: '',
          tasa: '1.5% mensual',
          estado: 'EN MORA',
          progreso: 33,
          diasMora: 29,
          moraAcumulada: 580,
          vencimientoMora: '15/03/2026',
        },
      ],
    },
    {
      dni: '28.654.321',
      initials: 'ML',
      avatarColor: '#10B981',
      name: 'María López',
      phone: '+54 9 3654 3211',
      email: 'maria@mail.com',
      direccion: 'Av. Libertad 456',
      ciudad: 'San Miguel de Tucumán',
      risk: 'Al dia',
      credits: [
        {
          id: 'CR-2024-0200',
          tipo: 'Préstamo personal',
          producto: 'Préstamo personal',
          montoOriginal: 20000,
          saldoPendiente: 14000,
          cuotaActual: 3,
          totalCuotas: 10,
          cuotaMensual: 2000,
          proximoVencimiento: '20/04/2026',
          tasa: '1.5% mensual',
          estado: 'ACTIVO',
          progreso: 30,
        },
      ],
    },
    {
      dni: '29.321.654',
      initials: 'CR',
      avatarColor: '#EF4444',
      name: 'Carlos Ruiz',
      phone: '+54 9 3214 5693',
      email: 'carlos@mail.com',
      direccion: 'Belgrano 789',
      ciudad: 'San Miguel de Tucumán',
      risk: 'Mora alta',
      credits: [
        {
          id: 'CR-2024-0150',
          tipo: 'TV LG 55"',
          producto: 'TV LG 55"',
          montoOriginal: 45000,
          saldoPendiente: 36000,
          cuotaActual: 5,
          totalCuotas: 18,
          cuotaMensual: 2500,
          proximoVencimiento: '05/04/2026',
          tasa: '2.0% mensual',
          estado: 'EN MORA',
          progreso: 28,
          diasMora: 11,
          moraAcumulada: 1800,
          vencimientoMora: '05/04/2026',
        },
      ],
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private headerService: HeaderService,
  ) {}

  ngOnInit(): void {
    const dni = this.route.snapshot.paramMap.get('dni');
    this.client = this.mockClients.find((c) => c.dni === dni) ?? null;

    const base = this.router.url.split('/clients')[0];
    this.headerService.set(
      [
        { label: 'Clientes', route: `${base}/clients` },
        { label: this.client?.name ?? 'Cliente' },
        { label: 'Créditos' },
      ],
      [
        {
          label: 'Nuevo Crédito',
          icon: 'pi pi-plus',
          severity: 'primary',
          action: () => {
            this.router.navigate([`${base}/operations/new`], {
              queryParams: { clientDni: this.client?.dni },
            });
          },
        },
      ],
    );
  }

  ngOnDestroy(): void {
    this.headerService.reset();
  }

  /**
   * Devuelve el número de créditos activos y en mora del cliente.
   */
  get activeCredits(): number {
    return (
      this.client?.credits.filter(
        (c) => c.estado === 'ACTIVO' || c.estado === 'EN MORA',
      ).length ?? 0
    );
  }

  /**
   * Calcula la cartera total del cliente sumando el monto original de todos sus créditos, independientemente de su estado. Si el cliente no tiene créditos, devuelve 0.
   */
  get totalPortfolio(): number {
    return (
      this.client?.credits.reduce((sum, c) => sum + c.montoOriginal, 0) ?? 0
    );
  }

  /**
   * Calcula el saldo total pendiente de los créditos activos y en mora del cliente, sumando el saldo pendiente de cada crédito que no esté pagado.
   */
  get totalOutstandingBalance(): number {
    return (
      this.client?.credits
        .filter((c) => c.estado !== 'PAGADO')
        .reduce((sum, c) => sum + c.saldoPendiente, 0) ?? 0
    );
  }

  /**
   * Devuelve la lista de créditos filtrados según los criterios de búsqueda y estado.
   */
  get filteredCredits(): Credit[] {
    return (this.client?.credits ?? []).filter((c) => {
      const matchesSearch =
        !this.searchTerm ||
        c.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.producto.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesEstado =
        !this.selectedEstado || c.estado === this.selectedEstado;
      return matchesSearch && matchesEstado;
    });
  }

  /**
   * Navega a la vista de edición del cliente seleccionado, pasando su DNI como parámetro en la URL.
   */
  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
