import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NewOperationComponent } from './new-operation.component';

describe('NewOperationComponent', () => {
  let component: NewOperationComponent;
  let fixture: ComponentFixture<NewOperationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewOperationComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NewOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
