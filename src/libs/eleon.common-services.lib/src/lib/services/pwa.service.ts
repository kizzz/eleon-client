import { IPwaService } from '@eleon/contracts.lib'

let beforeInstallPromptEvent: any = null;

if (typeof window !== 'undefined') {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    beforeInstallPromptEvent = event;
  });
}

export class PwaService extends IPwaService {
  isPWAInstallPromptAvailable(): boolean {
    return beforeInstallPromptEvent !== null;
  }

  async promptPWAInstall(): Promise<void> {
    if (beforeInstallPromptEvent) {
      const result = await beforeInstallPromptEvent.prompt();
      console.log(`Install prompt was: ${result.outcome}`);
      beforeInstallPromptEvent = null;
    }
  }
}


