import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelinquencyComponent } from './delinquency.component';

describe('DelinquencyComponent', () => {
  let component: DelinquencyComponent;
  let fixture: ComponentFixture<DelinquencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DelinquencyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DelinquencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
