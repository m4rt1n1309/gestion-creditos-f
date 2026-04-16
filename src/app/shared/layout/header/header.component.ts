import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MockAuthService } from '../../../core/auth/mock-auth.service';
import { DateService } from '../../../core/services/date.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    AsyncPipe,
    ButtonModule,
    BadgeModule,
    BreadcrumbModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  today: string;

  constructor(
    public auth: MockAuthService,
    private dateService: DateService,
  ) {
    this.today = this.dateService.display(new Date(), "EEEE d 'de' MMMM, yyyy");
  }
}
