import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { LoginComponent } from './login.component';
import { MockAuthService } from '../../../core/auth/mock-auth.service';

const mockAuth = {
  currentUser$: new BehaviorSubject(null).asObservable(),
  login: jasmine.createSpy('login').and.returnValue(new BehaviorSubject(null)),
  hasRole: jasmine.createSpy('hasRole').and.returnValue(false),
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: MockAuthService, useValue: mockAuth },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
