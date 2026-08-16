import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDatePicker } from './form-date-picker';

describe('FormDatePicker', () => {
  let component: FormDatePicker;
  let fixture: ComponentFixture<FormDatePicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormDatePicker],
    }).compileComponents();

    fixture = TestBed.createComponent(FormDatePicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
