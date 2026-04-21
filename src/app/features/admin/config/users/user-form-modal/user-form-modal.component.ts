import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';

export interface UserForm {
  name: string;
  email: string;
  dni: string;
  role: string | null;
  branch: string | null;
  active: boolean;
  password: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  dni?: string;
  role: 'ADMIN' | 'SELLER' | 'COLLECTOR' | 'CASHIER';
  branch: string;
  active: boolean;
  lastLogin: string;
}

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputSwitchModule,
  ],
  templateUrl: './user-form-modal.component.html',
})
export class UserFormModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() editRecord: UserRecord | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<UserForm>();

  roleOptions = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Vendedor', value: 'SELLER' },
    { label: 'Cobrador', value: 'COLLECTOR' },
    { label: 'Cajero', value: 'CASHIER' },
  ];

  branchOptions = [
    { label: 'Central', value: 'Central' },
    { label: 'Norte', value: 'Norte' },
    { label: 'Sur', value: 'Sur' },
    { label: 'Este', value: 'Este' },
    { label: 'Oeste', value: 'Oeste' },
  ];

  form: UserForm = this.emptyForm();

  get isEdit(): boolean {
    return this.editRecord !== null;
  }

  ngOnChanges(): void {
    if (this.visible && this.editRecord) {
      this.form = {
        name: this.editRecord.name,
        email: this.editRecord.email,
        dni: this.editRecord.dni ?? '',
        role: this.editRecord.role,
        branch: this.editRecord.branch,
        active: this.editRecord.active,
        password: '',
      };
    } else if (this.visible) {
      this.form = this.emptyForm();
    }
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  guardar(): void {
    this.saved.emit({ ...this.form });
    this.close();
  }

  private emptyForm(): UserForm {
    return {
      name: '',
      email: '',
      dni: '',
      role: null,
      branch: null,
      active: true,
      password: '',
    };
  }
}
