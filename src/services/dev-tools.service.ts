
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DevToolsService {
  testingModeEnabled = signal(false);

  toggleTestingMode() {
    this.testingModeEnabled.update(enabled => !enabled);
  }
}
