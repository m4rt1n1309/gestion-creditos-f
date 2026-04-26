import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { HeaderService } from '../../../core/services/header.service';
import { ClientDetail } from '../../models/interface/client';
import { ClientContactarComponent } from './tabs/client-contactar/client-contactar.component';
import { ClientCreditsComponent } from './tabs/client-credits/client-credits.component';
import { ClientDocumentsComponent } from './tabs/client-documents/client-documents.component';
import { ClientHistorialComponent } from './tabs/client-historial/client-historial.component';
import { AppRoutes } from '../../models/enums/routes.enum';

type TabId = 'creditos' | 'historial' | 'documentos' | 'contactar';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ClientCreditsComponent,
    ClientHistorialComponent,
    ClientDocumentsComponent,
    ClientContactarComponent,
  ],
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.scss',
})
export class ClientDetailComponent implements OnInit, OnDestroy {
  client: ClientDetail | null = null;
  private _activeTab: TabId = 'creditos';
  base = '';

  get activeTab(): TabId {
    return this._activeTab;
  }
  set activeTab(tab: TabId) {
    this._activeTab = tab;
    this.updateHeaderActions();
  }

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
      historial: [
        {
          fecha: '01 Abr 2026',
          hora: '10:32 a.m.',
          evento: 'Pago recibido',
          creditoId: 'CR-2024-0341',
          monto: 1250,
          usuario: 'Sistema',
          estado: 'Aplicado',
        },
        {
          fecha: '15 Mar 2026',
          hora: '06:15 a.m.',
          evento: 'Mora aplicada',
          creditoId: 'CR-2023-0187',
          monto: 580,
          usuario: 'Ana Martínez',
          estado: 'Pendiente',
        },
        {
          fecha: '01 Mar 2026',
          hora: '11:09 a.m.',
          evento: 'Pago recibido',
          creditoId: 'CR-2024-0341',
          monto: 1250,
          usuario: 'Sistema',
          estado: 'Aplicado',
        },
        {
          fecha: '01 Mar 2026',
          hora: '10:03 a.m.',
          evento: 'Pago recibido',
          creditoId: 'CR-2023-0187',
          monto: 1080,
          usuario: 'Sistema',
          estado: 'Aplicado',
        },
        {
          fecha: '01 Feb 2026',
          hora: '11:50 a.m.',
          evento: 'Pago recibido',
          creditoId: 'CR-2024-0341',
          monto: 1250,
          usuario: 'Sistema',
          estado: 'Aplicado',
        },
        {
          fecha: '15 Ene 2026',
          hora: '08:20 a.m.',
          evento: 'Notificación enviada',
          creditoId: 'CR-2023-0187',
          monto: null,
          usuario: 'Sistema',
          estado: 'Enviada',
        },
        {
          fecha: '15 Dic 2025',
          hora: '01:33 p.m.',
          evento: 'Crédito creado',
          creditoId: 'CR-2024-0341',
          monto: 25000,
          usuario: 'Carlos Ruiz',
          estado: 'Activo',
        },
      ],
      documents: [
        {
          id: 'doc-1',
          name: 'Cédula de Ciudadanía',
          type: 'PDF',
          sizeKb: 1200,
          date: '12 Ene 2026',
          category: 'Identificación',
          status: 'ok',
        },
        {
          id: 'doc-2',
          name: 'Foto Documento',
          type: 'JPG',
          sizeKb: 850,
          date: '12 Ene 2026',
          category: 'Identificación',
          status: 'ok',
        },
        {
          id: 'doc-3',
          name: 'Contrato CR-2024-0341',
          type: 'PDF',
          sizeKb: 3100,
          date: '15 Dic 2025',
          category: 'Documentos de Crédito',
          status: 'ok',
          creditoId: 'CR-2024-0341',
        },
        {
          id: 'doc-4',
          name: 'Contrato CR-2023-0187',
          type: 'PDF',
          sizeKb: 2800,
          date: '01 Jun 2023',
          category: 'Documentos de Crédito',
          status: 'ok',
          creditoId: 'CR-2023-0187',
        },
        {
          id: 'doc-5',
          name: 'Pagaré CR-2023-0187',
          type: 'PDF',
          sizeKb: 0,
          date: '',
          category: 'Documentos de Crédito',
          status: 'pendiente',
          required: true,
          creditoId: 'CR-2023-0187',
        },
        {
          id: 'doc-6',
          name: 'Certificado Laboral',
          type: 'PDF',
          sizeKb: 540,
          date: '10 Ene 2026',
          category: 'Documentos Laborales',
          status: 'ok',
        },
      ],
      contactHistory: [
        {
          channel: 'WhatsApp',
          descripcion: 'Pago pendiente recordatorio',
          fecha: '15 Mar 2026',
          hora: '09:00 a.m.',
          usuario: 'Ana Martínez',
          estado: 'Entregado',
        },
        {
          channel: 'Correo',
          descripcion: 'Mora aplicada notificación',
          fecha: '15 Mar 2026',
          hora: '09:18 a.m.',
          usuario: 'Sistema',
          estado: 'Entregado',
        },
        {
          channel: 'Llamada',
          descripcion: 'Sin respuesta',
          fecha: '10 Mar 2026',
          hora: '02:30 p.m.',
          usuario: 'Carlos Ruiz',
          estado: 'Sin respuesta',
        },
        {
          channel: 'WhatsApp',
          descripcion: 'Bienvenida nuevo crédito',
          fecha: '15 Dic 2025',
          hora: '03:30 p.m.',
          usuario: 'Sistema',
          estado: 'Entregado',
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
      historial: [
        {
          fecha: '01 Abr 2026',
          hora: '09:00 a.m.',
          evento: 'Pago recibido',
          creditoId: 'CR-2024-0200',
          monto: 2000,
          usuario: 'Sistema',
          estado: 'Aplicado',
        },
      ],
      documents: [],
      contactHistory: [],
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
      historial: [
        {
          fecha: '05 Abr 2026',
          hora: '10:00 a.m.',
          evento: 'Mora aplicada',
          creditoId: 'CR-2024-0150',
          monto: 1800,
          usuario: 'Sistema',
          estado: 'Pendiente',
        },
      ],
      documents: [],
      contactHistory: [],
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

    this.base = this.router.url.split('/clients')[0];
    this.headerService.breadcrumbs.set([
      { label: 'Clientes', route: `${this.base}/clients` },
      { label: this.client?.name ?? 'Cliente' },
      { label: 'Créditos' },
    ]);
    this.updateHeaderActions();
  }

  ngOnDestroy(): void {
    this.headerService.reset();
  }

  get activeCredits(): number {
    return (
      this.client?.credits.filter(
        (c) => c.estado === 'ACTIVO' || c.estado === 'EN MORA',
      ).length ?? 0
    );
  }

  get totalPortfolio(): number {
    return (
      this.client?.credits.reduce((sum, c) => sum + c.montoOriginal, 0) ?? 0
    );
  }

  get totalOutstandingBalance(): number {
    return (
      this.client?.credits
        .filter((c) => c.estado !== 'PAGADO')
        .reduce((sum, c) => sum + c.saldoPendiente, 0) ?? 0
    );
  }

  private updateHeaderActions(): void {
    if (this._activeTab === 'documentos') {
      this.headerService.actions.set([
        {
          label: 'Subir Documento',
          icon: 'pi pi-upload',
          severity: 'primary',
          action: () => {
            /* TODO */
          },
        },
      ]);
    } else if (this._activeTab === 'contactar') {
      this.headerService.actions.set([
        {
          label: 'Enviar Mensaje',
          icon: 'pi pi-send',
          severity: 'primary',
          action: () => {
            /* TODO */
          },
        },
      ]);
    } else if (this._activeTab === 'historial') {
      this.headerService.actions.set([
        {
          label: 'Exportar Excel',
          icon: 'pi pi-download',
          severity: 'success',
          styleClass: '!bg-green-500 !border-green-500 hover:!bg-green-600',
          action: () => {
            /* TODO */
          },
        },
      ]);
    } else {
      this.headerService.actions.set([
        {
          label: 'Nuevo Crédito',
          icon: 'pi pi-plus',
          severity: 'primary',
          action: () => {
            this.router.navigate([`${this.base}/${AppRoutes.OPERATIONS_NEW}`], {
              queryParams: { clientDni: this.client?.dni },
            });
          },
        },
      ]);
    }
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
