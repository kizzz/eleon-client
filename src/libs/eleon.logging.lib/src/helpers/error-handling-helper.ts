import { ErrorHandlingLevel } from "@eleon/contracts.lib";
import { EleoncoreError } from "@eleon/contracts.lib";
import { ClientLogService } from "./client-log.service";
import { initializeClientLogUI } from './client-log.ui'

/**
 * Initializes the Eleoncore error handling system and subscribes a callback.
 * Will create DOM/UI elements only once, but every call will add a new listener.
 * @param {(error: EleoncoreError) => void} onNewErrorCallback
 * @param {ErrorHandlingLevel} initialErrorHandlingLevel - minimum level to report
 */
export function useEleoncoreErrorHandling(
  onNewErrorCallback: (error: EleoncoreError) => void,
  initialErrorHandlingLevel: ErrorHandlingLevel
) {
  let currentLevel = initialErrorHandlingLevel;

  if (typeof window !== "undefined") {
    window['addEleoncoreError'] = () => {
      // Placeholder function - will be replaced below
    };
  }

  if (typeof document === "undefined") {
    return;
  }

  window['__eleoncoreErrorSubscribers'] = window['__eleoncoreErrorSubscribers'] || [];

  if (typeof onNewErrorCallback === "function") {
    window['__eleoncoreErrorSubscribers'].push(onNewErrorCallback);
  }

  if (window['__eleoncoreErrorHandlingInitialized']) return;
  window['__eleoncoreErrorHandlingInitialized'] = true;

  window['environment'] = window['environment'] || { eleoncoreErrors: [] };
  window['environment'].eleoncoreErrors = window['environment'].eleoncoreErrors || [];

  window['addEleoncoreError'] = function (input: string | EleoncoreError) {
    let error: EleoncoreError;

    if (typeof input === "string") {
      error = { message: input, level: ErrorHandlingLevel.Error };
    } else if (typeof input === "object" && input.message) {
      error = { ...input };
    } else {
      console.warn("Invalid error input:", input);
      return;
    }

    error.timestamp = error.timestamp || new Date().toISOString();
    error.level = error.level ?? ErrorHandlingLevel.Error;

    if (error.level < currentLevel) {
      return;
    }

    window['environment']?.eleoncoreErrors?.push(error);

    if (window['__eleoncoreErrorSubscribers']) {
      for (const cb of window['__eleoncoreErrorSubscribers']) {
        try {
          cb(error);
        } catch (err) {
          console.error("Error in Eleoncore subscriber callback:", err);
        }
      }
    }

    ClientLogService.Instance.write(
      error.message,
      error.level,
      null,
      {
        code: error.code,
        timestamp: error.timestamp,
      },
      "EleoncoreErrorHandling"
    );

    // console.error(
    //   `[Eleoncore] ${ErrorHandlingLevel[error.level]}: ${error.message}`,
    //   {
    //     code: error.code,
    //     timestamp: error.timestamp,
    //     trace: error.trace,
    //   }
    // );
  };
  window['setEleoncoreErrorLevel'] = function (newLevel: ErrorHandlingLevel) {
    currentLevel = newLevel;
  };

  initializeClientLogUI();
}
