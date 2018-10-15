import { TestBed } from '@angular/core/testing';

import { FilesystemService } from './filesystem.service';
import {CommonModule} from '@angular/common';

describe('FilesystemService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [CommonModule],
    providers: [FilesystemService]
  }));

  it('should be created', () => {
    const service: FilesystemService = TestBed.get(FilesystemService);
    expect(service).toBeTruthy();
  });
});
