import { PhoneStatusModule } from './phone-status.module';

describe('PhoneStatusModule', () => {
  let phoneStatusModule: PhoneStatusModule;

  beforeEach(() => {
    phoneStatusModule = new PhoneStatusModule();
  });

  it('should create an instance', () => {
    expect(phoneStatusModule).toBeTruthy();
  });
});
