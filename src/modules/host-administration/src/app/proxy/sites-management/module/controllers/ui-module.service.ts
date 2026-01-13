
import type { EleoncoreModuleDto } from '../microservices/models';

import { Observable } from 'rxjs/internal/Observable';


export class UiModuleService {
  // each service gets its own authFetch helper
  private authFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
    const token = window['getUserToken']();
    const headers = new Headers(init.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(input, { ...init, headers });
  }


  create(input: EleoncoreModuleDto, config?: Partial<any>): Observable<EleoncoreModuleDto> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/CoreInfrastructure/UiModules/CreateAsync';

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

      body: JSON.stringify(input),

    };

    return new Observable<EleoncoreModuleDto>(subscriber => {
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
							subscriber.next(data as EleoncoreModuleDto);
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


  delete(id: string, config?: Partial<any>): Observable<void> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + `/api/CoreInfrastructure/UiModules/${id}`;

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


  get(id: string, config?: Partial<any>): Observable<EleoncoreModuleDto> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + `/api/CoreInfrastructure/UiModules/${id}`;

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

    return new Observable<EleoncoreModuleDto>(subscriber => {
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
							subscriber.next(data as EleoncoreModuleDto);
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


  getAll(config?: Partial<any>): Observable<EleoncoreModuleDto[]> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/CoreInfrastructure/UiModules/GetAllAsync';

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

    return new Observable<EleoncoreModuleDto[]>(subscriber => {
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
							subscriber.next(data as EleoncoreModuleDto[]);
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


  getEnabledModules(config?: Partial<any>): Observable<EleoncoreModuleDto[]> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/CoreInfrastructure/UiModules/enabled-modules';

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

    return new Observable<EleoncoreModuleDto[]>(subscriber => {
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
							subscriber.next(data as EleoncoreModuleDto[]);
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


  getModulesByApplication(applicationId: string, config?: Partial<any>): Observable<EleoncoreModuleDto[]> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + `/api/CoreInfrastructure/UiModules/application/${applicationId}`;

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

    return new Observable<EleoncoreModuleDto[]>(subscriber => {
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
							subscriber.next(data as EleoncoreModuleDto[]);
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


  update(id: string, input: EleoncoreModuleDto, config?: Partial<any>): Observable<EleoncoreModuleDto> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + `/api/CoreInfrastructure/UiModules/${id}`;

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
      method: 'PUT',
      headers,

      body: JSON.stringify(input),

    };

    return new Observable<EleoncoreModuleDto>(subscriber => {
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
							subscriber.next(data as EleoncoreModuleDto);
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
