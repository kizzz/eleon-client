
import { Observable } from 'rxjs/internal/Observable';

import type { UserOtpSettingsDto } from '../user-otp-settings/models';


export class UserOtpSettingsService {
  // each service gets its own authFetch helper
  private authFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
    const token = window['getUserToken']();
    const headers = new Headers(init.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(input, { ...init, headers });
  }


  getUserOtpSettingsByUserId(userId: string, config?: Partial<any>): Observable<UserOtpSettingsDto> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/Infrastructure/UserOtpSettings/GetUserOtpSettings';

    // build ?a=1&b=2…
    const queryString = (() => {
      const qp = new URLSearchParams();

      {
        const raw = userId;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
					!(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('userId', String(raw));
        }
      }

      const s = qp.toString();
      return s ? `?${s}` : '';
    })();

    const eleoncoreApiUrl = baseUrl + queryString;

    // headers
    const headers: HeadersInit = {};
    if (!config?.skipAddingHeader) {
      headers['Content-Type'] = 'application/json';
    }

    // options
    const options: RequestInit = {
      method: 'GET',
      headers,

    };

    return new Observable<UserOtpSettingsDto>(subscriber => {
      this.authFetch(eleoncoreApiUrl, options)
        .then(res => {
          if (!res.ok) {
            if (!config?.skipHandleError) {
              // ← you can hook in your global reporter here
            }
            return res.text().then(err => {
              subscriber.error(new Error(err || res.statusText));
            });
          }


          const contentType = res.headers.get("Content-Type") || "";
					if (contentType.includes("application/json")) {
						return res.json().then(data => {
							subscriber.next(data as UserOtpSettingsDto);
							subscriber.complete();
						});
					} else {
						return res.text().then(data => {
							subscriber.next(data as any);
							subscriber.complete();
						});
					}

        })
        .catch(err => subscriber.error(err));
    });
  }


  setUserOtpSettingsByUserOtpSettings(userOtpSettings: UserOtpSettingsDto, config?: Partial<any>): Observable<boolean> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/Infrastructure/UserOtpSettings/SetUserOtpSettings';

    // build ?a=1&b=2…
    const queryString = (() => {
      const qp = new URLSearchParams();

      const s = qp.toString();
      return s ? `?${s}` : '';
    })();

    const eleoncoreApiUrl = baseUrl + queryString;

    // headers
    const headers: HeadersInit = {};
    if (!config?.skipAddingHeader) {
      headers['Content-Type'] = 'application/json';
    }

    // options
    const options: RequestInit = {
      method: 'POST',
      headers,

      body: JSON.stringify(userOtpSettings),

    };

    return new Observable<boolean>(subscriber => {
      this.authFetch(eleoncoreApiUrl, options)
        .then(res => {
          if (!res.ok) {
            if (!config?.skipHandleError) {
              // ← you can hook in your global reporter here
            }
            return res.text().then(err => {
              subscriber.error(new Error(err || res.statusText));
            });
          }


          const contentType = res.headers.get("Content-Type") || "";
					if (contentType.includes("application/json")) {
						return res.json().then(data => {
							subscriber.next(data as boolean);
							subscriber.complete();
						});
					} else {
						return res.text().then(data => {
							subscriber.next(data as any);
							subscriber.complete();
						});
					}

        })
        .catch(err => subscriber.error(err));
    });
  }


}
