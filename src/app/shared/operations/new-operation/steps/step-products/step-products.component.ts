import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CurrencyArsPipe } from '../../../../../core/pipes/currency-ars.pipe';
import { ProductOperation } from '../../../../models/interface/product';
import { OperationFormService } from '../../operation-form.service';

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

  addProduct(prod: ProductOperation) {
    this.form.addProduct(prod);
  }
  removeProduct(prod: ProductOperation) {
    this.form.removeProduct(prod);
  }
}
