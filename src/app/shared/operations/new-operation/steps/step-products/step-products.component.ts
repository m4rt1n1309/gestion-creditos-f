import { Component, inject } from '@angular/core';
import { CurrencyArsPipe } from '../../../../../core/pipes/currency-ars.pipe';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { OperationFormService, Product } from '../../operation-form.service';

@Component({
  selector: 'app-step-products',
  standalone: true,
  imports: [
    CurrencyArsPipe,
    FormsModule,
    DecimalPipe,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    DropdownModule,
    TagModule,
  ],
  templateUrl: './step-products.component.html',
})
export class StepProductsComponent {
  form = inject(OperationFormService);

  addProduct(prod: Product) {
    this.form.addProduct(prod);
  }
  removeProduct(prod: Product) {
    this.form.removeProduct(prod);
  }
}
