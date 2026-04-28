import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { OperationFormService } from '../../operation-form.service';

@Component({
  selector: 'app-step-client',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
  ],
  templateUrl: './step-client.component.html',
})
export class StepClientComponent {
  form = inject(OperationFormService);

  initials(name: string): string {
    const parts = name.split(' ');
    return (parts[0]?.charAt(0) ?? '') + (parts[1]?.charAt(0) ?? '');
  }
}
