import { TestBed } from '@angular/core/testing';

import { OtpFormService } from './otp-form.service';

describe('OtpFormService', () => {
  let service: OtpFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtpFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
