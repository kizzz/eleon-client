import { ErrorHandlingLevel } from "@eleon/contracts.lib";
import { useEleoncoreErrorHandling } from "../helpers";
import { EleoncoreError, IErrorHandlingService } from '@eleon/contracts.lib'


export class EleoncoreErrorHandlingService extends IErrorHandlingService {
  constructor() {
    super();
    useEleoncoreErrorHandling(null, ErrorHandlingLevel.Debug);
  }

  override add(error: string | EleoncoreError): void {
    if (typeof window !== "undefined" && typeof window['addEleoncoreError'] === "function") {
      window['addEleoncoreError'](error);
    } else {
      console.warn("addEleoncoreError is not available on window.");
    }
  }

  override setLevel(level: ErrorHandlingLevel): void {
    if (typeof window !== "undefined" && typeof window['setEleoncoreErrorLevel'] === "function") {
      window['setEleoncoreErrorLevel'](level);
    } else {
      console.warn("setEleoncoreErrorLevel is not available on window.");
    }
  }

  override subscribe(callback: (error: EleoncoreError) => void): void {
    if (typeof window !== "undefined") {
      window['__eleoncoreErrorSubscribers'] = window['__eleoncoreErrorSubscribers'] || [];
      window['__eleoncoreErrorSubscribers'].push(callback);
    }
  }

  override getErrors(): EleoncoreError[] {
    if (typeof window !== "undefined" && window['environment']?.eleoncoreErrors) {
      return window['environment'].eleoncoreErrors;
    }
    return [];
  }
}