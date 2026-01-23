
import type { UserSessionDto } from '../../../identity/module/sessions/models';

import { Observable } from 'rxjs/internal/Observable';


export class SessionsService {
  // each service gets its own authFetch helper
  private authFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
    const token = window['getUserToken']();
    const headers = new Headers(init.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(input, { ...init, headers });
  }


  getById(sessionId: string, config?: Partial<any>): Observable<UserSessionDto> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/TenantManagement/Sessions/GetById';

    // build ?a=1&b=2…
    const queryString = (() => {
      const qp = new URLSearchParams();

      {
        const raw = sessionId;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
					!(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('sessionId', String(raw));
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

    return new Observable<UserSessionDto>(subscriber => {
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
							subscriber.next(data as UserSessionDto);
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


  getCurrentSession(config?: Partial<any>): Observable<UserSessionDto> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/TenantManagement/Sessions/GetCurrentSession';

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
      method: 'GET',
      headers,

    };

    return new Observable<UserSessionDto>(subscriber => {
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
							subscriber.next(data as UserSessionDto);
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


  getForCurrentUser(config?: Partial<any>): Observable<UserSessionDto[]> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/TenantManagement/Sessions/GetForCurrentUser';

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
      method: 'GET',
      headers,

    };

    return new Observable<UserSessionDto[]>(subscriber => {
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
							subscriber.next(data as UserSessionDto[]);
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


  getForUser(userId: string, config?: Partial<any>): Observable<UserSessionDto[]> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/TenantManagement/Sessions/GetForUser';

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

    return new Observable<UserSessionDto[]>(subscriber => {
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
							subscriber.next(data as UserSessionDto[]);
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


  revoke(sessionId: string, config?: Partial<any>): Observable<void> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/TenantManagement/Sessions/Revoke';

    // build ?a=1&b=2…
    const queryString = (() => {
      const qp = new URLSearchParams();

      {
        const raw = sessionId;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
					!(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('sessionId', String(raw));
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
      method: 'DELETE',
      headers,

    };

    return new Observable<void>(subscriber => {
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
							subscriber.next(data as void);
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


  revokeAll(config?: Partial<any>): Observable<void> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/TenantManagement/Sessions/RevokeAll';

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

    };

    return new Observable<void>(subscriber => {
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
							subscriber.next(data as void);
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


  revokeCurrent(config?: Partial<any>): Observable<void> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/TenantManagement/Sessions/RevokeCurrent';

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

    };

    return new Observable<void>(subscriber => {
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
							subscriber.next(data as void);
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
