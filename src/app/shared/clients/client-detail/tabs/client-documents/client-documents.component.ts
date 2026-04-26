import { CommonModule, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import {
  ClientDetail,
  DocumentCategory,
  DocumentGroup,
} from '../../../../models/interface/client';

@Component({
  selector: 'app-client-documents',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    FormsModule,
    DropdownModule,
    InputTextModule,
  ],
  templateUrl: './client-documents.component.html',
  styleUrl: './client-documents.component.scss',
})
export class ClientDocumentsComponent {
  @Input({ required: true }) client!: ClientDetail;

  searchTerm = '';
  selectedCategory: DocumentCategory | null = null;

  categoryOptions: { label: string; value: DocumentCategory | null }[] = [
    { label: 'Todas las categorías', value: null },
    { label: 'Identificación', value: 'Identificación' },
    { label: 'Documentos de Crédito', value: 'Documentos de Crédito' },
    { label: 'Documentos Laborales', value: 'Documentos Laborales' },
  ];

  get filteredGroups(): DocumentGroup[] {
    const filtered = this.client.documents.filter((d) => {
      const matchSearch =
        !this.searchTerm ||
        d.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCat =
        !this.selectedCategory || d.category === this.selectedCategory;
      return matchSearch && matchCat;
    });

    const groupDefs: {
      category: DocumentCategory;
      icon: string;
      iconColor: string;
    }[] = [
      {
        category: 'Identificación',
        icon: 'pi pi-user',
        iconColor: 'text-blue-500',
      },
      {
        category: 'Documentos de Crédito',
        icon: 'pi pi-credit-card',
        iconColor: 'text-purple-500',
      },
      {
        category: 'Documentos Laborales',
        icon: 'pi pi-briefcase',
        iconColor: 'text-yellow-600',
      },
    ];

    return groupDefs
      .map((g) => ({
        ...g,
        docs: filtered.filter((d) => d.category === g.category),
      }))
      .filter((g) => g.docs.length > 0);
  }

  formatSize(kb: number): string {
    if (kb >= 1000) return (kb / 1000).toFixed(1) + ' MB';
    return kb + ' KB';
  }

  docIcon(type: string): string {
    return type === 'JPG' || type === 'PNG' ? 'pi pi-image' : 'pi pi-file-pdf';
  }

  docIconBg(type: string): string {
    return type === 'JPG' || type === 'PNG' ? 'doc-icon-img' : 'doc-icon-pdf';
  }
}
