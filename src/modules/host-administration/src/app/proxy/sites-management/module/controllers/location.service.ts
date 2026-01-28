import type { LocationDto } from '../locations/models';

import type { ApplicationModuleDto } from '../microservices/models';

import { Observable } from 'rxjs/internal/Observable';

export class LocationService {
  // each service gets its own authFetch helper
  private authFetch(
    input: RequestInfo,
    init: RequestInit = {}
  ): Promise<Response> {
    const token = window['getUserToken']();
    const headers = new Headers(init.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(input, { ...init, headers });
  }

  addBulkModulesToApplicationByModulesAndCancellationToken(
    modules: ApplicationModuleDto[],
    cancellationToken?: any,
    config?: Partial<any>
  ): Observable<boolean> {
    // baseUrl is already a quoted literal
    const apiBase = window?.['apiBase']?.['eleoncore'] || '';
    const baseUrl =
      apiBase + '/api/CoreInfrastructure/Locations/AddBulkModulesToApplication';

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

      body: JSON.stringify(modules),
    };

    return new Observable<boolean>((subscriber) => {
      this.authFetch(eleoncoreApiUrl, options)
        .then((res) => {
          if (!res.ok) {
            if (!config?.skipHandleError) {
              // ← you can hook in your global reporter here
            }
            return res.text().then((err) => {
              subscriber.error(new Error(err || res.statusText));
            });
          }

          const contentType = res.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            return res.json().then((data) => {
              subscriber.next(data as boolean);
              subscriber.complete();
            });
          } else {
            return res.text().then((data) => {
              subscriber.next(data as any);
              subscriber.complete();
            });
          }
        })
        .catch((err) => subscriber.error(err));
    });
  }

  addModuleToApplicationByAddApplicationModuleDtoAndCancellationToken(
    addApplicationModuleDto: ApplicationModuleDto,
    cancellationToken?: any,
    config?: Partial<any>
  ): Observable<boolean> {
    // baseUrl is already a quoted literal
    const apiBase = window?.['apiBase']?.['eleoncore'] || '';
    const baseUrl =
      apiBase + '/api/CoreInfrastructure/Locations/AddModuleToApplication';

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

      body: JSON.stringify(addApplicationModuleDto),
    };

    return new Observable<boolean>((subscriber) => {
      this.authFetch(eleoncoreApiUrl, options)
        .then((res) => {
          if (!res.ok) {
            if (!config?.skipHandleError) {
              // ← you can hook in your global reporter here
            }
            return res.text().then((err) => {
              subscriber.error(new Error(err || res.statusText));
            });
          }

          const contentType = res.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            return res.json().then((data) => {
              subscriber.next(data as boolean);
              subscriber.complete();
            });
          } else {
            return res.text().then((data) => {
              subscriber.next(data as any);
              subscriber.complete();
            });
          }
        })
        .catch((err) => subscriber.error(err));
    });
  }

  create(
    input: LocationDto,
    cancellationToken?: any,
    config?: Partial<any>
  ): Observable<LocationDto> {
    // baseUrl is already a quoted literal
    const apiBase = window?.['apiBase']?.['eleoncore'] || '';
    const baseUrl = apiBase + '/api/CoreInfrastructure/Locations/CreateAsync';

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

    return new Observable<LocationDto>((subscriber) => {
      this.authFetch(eleoncoreApiUrl, options)
        .then((res) => {
          if (!res.ok) {
            if (!config?.skipHandleError) {
              // ← you can hook in your global reporter here
            }
            return res.text().then((err) => {
              subscriber.error(new Error(err || res.statusText));
            });
          }

          const contentType = res.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            return res.json().then((data) => {
              subscriber.next(data as LocationDto);
              subscriber.complete();
            });
          } else {
            return res.text().then((data) => {
              subscriber.next(data as any);
              subscriber.complete();
            });
          }
        })
        .catch((err) => subscriber.error(err));
    });
  }

  delete(
    id: string,
    cancellationToken?: any,
    config?: Partial<any>
  ): Observable<void> {
    // baseUrl is already a quoted literal
    const apiBase = window?.['apiBase']?.['eleoncore'] || '';
    const baseUrl = apiBase + '/api/CoreInfrastructure/Locations/Delete';

    // build ?a=1&b=2…
    const queryString = (() => {
      const qp = new URLSearchParams();

      {
        const raw = id;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
          !(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('id', String(raw));
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

    return new Observable<void>((subscriber) => {
      this.authFetch(eleoncoreApiUrl, options)
        .then((res) => {
          if (!res.ok) {
            if (!config?.skipHandleError) {
              // ← you can hook in your global reporter here
            }
            return res.text().then((err) => {
              subscriber.error(new Error(err || res.statusText));
            });
          }

          const contentType = res.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            return res.json().then((data) => {
              subscriber.next(data as void);
              subscriber.complete();
            });
          } else {
            return res.text().then((data) => {
              subscriber.next(data as any);
              subscriber.complete();
            });
          }
        })
        .catch((err) => subscriber.error(err));
    });
  }

  get(
    id: string,
    cancellationToken?: any,
    config?: Partial<any>
  ): Observable<LocationDto> {
    // baseUrl is already a quoted literal
    const apiBase = window?.['apiBase']?.['eleoncore'] || '';
    const baseUrl = apiBase + '/api/CoreInfrastructure/Locations/Get';

    // build ?a=1&b=2…
    const queryString = (() => {
      const qp = new URLSearchParams();

      {
        const raw = id;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
          !(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('id', String(raw));
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

    return new Observable<LocationDto>((subscriber) => {
      this.authFetch(eleoncoreApiUrl, options)
        .then((res) => {
          if (!res.ok) {
            if (!config?.skipHandleError) {
              // ← you can hook in your global reporter here
            }
            return res.text().then((err) => {
              subscriber.error(new Error(err || res.statusText));
            });
          }

          const contentType = res.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            return res.json().then((data) => {
              subscriber.next(data as LocationDto);
              subscriber.complete();
            });
          } else {
            return res.text().then((data) => {
              subscriber.next(data as any);
              subscriber.complete();
            });
          }
        })
        .catch((err) => subscriber.error(err));
    });
  }

  getByTenantId(
    tenantId: string,
    cancellationToken?: any,
    config?: Partial<any>
  ): Observable<LocationDto[]> {
    // baseUrl is already a quoted literal
    const apiBase = window?.['apiBase']?.['eleoncore'] || '';
    const baseUrl =
      apiBase + '/api/CoreInfrastructure/Locations/GetByTenantIdAsync';

    // build ?a=1&b=2…
    const queryString = (() => {
      const qp = new URLSearchParams();

      {
        const raw = tenantId;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
          !(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('tenantId', String(raw));
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

    return new Observable<LocationDto[]>((subscriber) => {
      this.authFetch(eleoncoreApiUrl, options)
        .then((res) => {
          if (!res.ok) {
            if (!config?.skipHandleError) {
              // ← you can hook in your global reporter here
            }
            return res.text().then((err) => {
              subscriber.error(new Error(err || res.statusText));
            });
          }

          const contentType = res.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            return res.json().then((data) => {
              subscriber.next(data as LocationDto[]);
              subscriber.complete();
            });
          } else {
            return res.text().then((data) => {
              subscriber.next(data as any);
              subscriber.complete();
            });
          }
        })
        .catch((err) => subscriber.error(err));
    });
  }

  getChildren(
    parentId: string,
    cancellationToken?: any,
    config?: Partial<any>
  ): Observable<LocationDto[]> {
    // baseUrl is already a quoted literal
    const apiBase = window?.['apiBase']?.['eleoncore'] || '';
    const baseUrl = apiBase + '/api/CoreInfrastructure/Locations/children';

    // build ?a=1&b=2…
    const queryString = (() => {
      const qp = new URLSearchParams();

      {
        const raw = parentId;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
          !(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('parentId', String(raw));
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

    return new Observable<LocationDto[]>((subscriber) => {
      this.authFetch(eleoncoreApiUrl, options)
        .then((res) => {
          if (!res.ok) {
            if (!config?.skipHandleError) {
              // ← you can hook in your global reporter here
            }
            return res.text().then((err) => {
              subscriber.error(new Error(err || res.statusText));
            });
          }

          const contentType = res.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            return res.json().then((data) => {
              subscriber.next(data as LocationDto[]);
              subscriber.complete();
            });
          } else {
            return res.text().then((data) => {
              subscriber.next(data as any);
              subscriber.complete();
            });
          }
        })
        .catch((err) => subscriber.error(err));
    });
  }

  getDefaultApplication(
    cancellationToken?: any,
    config?: Partial<any>
  ): Observable<LocationDto> {
    // baseUrl is already a quoted literal
    const apiBase = window?.['apiBase']?.['eleoncore'] || '';
    const baseUrl =
      apiBase + '/api/CoreInfrastructure/Locations/GetDefaultApplication';

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

    return new Observable<LocationDto>((subscriber) => {
      this.authFetch(eleoncoreApiUrl, options)
        .then((res) => {
          if (!res.ok) {
            if (!config?.skipHandleError) {
              // ← you can hook in your global reporter here
            }
            return res.text().then((err) => {
              subscriber.error(new Error(err || res.statusText));
            });
          }

          const contentType = res.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            return res.json().then((data) => {
              subscriber.next(data as LocationDto);
              subscriber.complete();
            });
          } else {
            return res.text().then((data) => {
              subscriber.next(data as any);
              subscriber.complete();
            });
          }
        })
        .catch((err) => subscriber.error(err));
    });
  }

  getEnabledApplications(
    cancellationToken?: any,
    config?: Partial<any>
  ): Observable<LocationDto[]> {
    // baseUrl is already a quoted literal
    const apiBase = window?.['apiBase']?.['eleoncore'] || '';
    const baseUrl =
      apiBase + '/api/CoreInfrastructure/Locations/enabled-applications';

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

    return new Observable<LocationDto[]>((subscriber) => {
      this.authFetch(eleoncoreApiUrl, options)
        .then((res) => {
          if (!res.ok) {
            if (!config?.skipHandleError) {
              // ← you can hook in your global reporter here
            }
            return res.text().then((err) => {
              subscriber.error(new Error(err || res.statusText));
            });
          }

          const contentType = res.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            return res.json().then((data) => {
              subscriber.next(data as LocationDto[]);
              subscriber.complete();
            });
          } else {
            return res.text().then((data) => {
              subscriber.next(data as any);
              subscriber.complete();
            });
          }
        })
        .catch((err) => subscriber.error(err));
    });
  }

  getList(
    cancellationToken?: any,
    config?: Partial<any>
  ): Observable<LocationDto[]> {
    // baseUrl is already a quoted literal
    const apiBase = window?.['apiBase']?.['eleoncore'] || '';
    const baseUrl = apiBase + '/api/CoreInfrastructure/Locations/GetAllAsync';

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

    return new Observable<LocationDto[]>((subscriber) => {
      this.authFetch(eleoncoreApiUrl, options)
        .then((res) => {
          if (!res.ok) {
            if (!config?.skipHandleError) {
              // ← you can hook in your global reporter here
            }
            return res.text().then((err) => {
              subscriber.error(new Error(err || res.statusText));
            });
          }

          const contentType = res.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            return res.json().then((data) => {
              subscriber.next(data as LocationDto[]);
              subscriber.complete();
            });
          } else {
            return res.text().then((data) => {
              subscriber.next(data as any);
              subscriber.complete();
            });
          }
        })
        .catch((err) => subscriber.error(err));
    });
  }

  getRoots(
    cancellationToken?: any,
    config?: Partial<any>
  ): Observable<LocationDto[]> {
    // baseUrl is already a quoted literal
    const apiBase = window?.['apiBase']?.['eleoncore'] || '';
    const baseUrl = apiBase + '/api/CoreInfrastructure/Locations/roots';

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

    return new Observable<LocationDto[]>((subscriber) => {
      this.authFetch(eleoncoreApiUrl, options)
        .then((res) => {
          if (!res.ok) {
            if (!config?.skipHandleError) {
              // ← you can hook in your global reporter here
            }
            return res.text().then((err) => {
              subscriber.error(new Error(err || res.statusText));
            });
          }

          const contentType = res.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            return res.json().then((data) => {
              subscriber.next(data as LocationDto[]);
              subscriber.complete();
            });
          } else {
            return res.text().then((data) => {
              subscriber.next(data as any);
              subscriber.complete();
            });
          }
        })
        .catch((err) => subscriber.error(err));
    });
  }

  removeModuleFromApplicationByApplicationIdAndModuleIdAndCancellationToken(
    applicationId: string,
    moduleId: string,
    cancellationToken?: any,
    config?: Partial<any>
  ): Observable<boolean> {
    // baseUrl is already a quoted literal
    const apiBase = window?.['apiBase']?.['eleoncore'] || '';
    const baseUrl =
      apiBase + '/api/CoreInfrastructure/Locations/RemoveModuleToApplication';

    // build ?a=1&b=2…
    const queryString = (() => {
      const qp = new URLSearchParams();

      {
        const raw = applicationId;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
          !(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('applicationId', String(raw));
        }
      }

      {
        const raw = moduleId;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
          !(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('moduleId', String(raw));
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

    return new Observable<boolean>((subscriber) => {
      this.authFetch(eleoncoreApiUrl, options)
        .then((res) => {
          if (!res.ok) {
            if (!config?.skipHandleError) {
              // ← you can hook in your global reporter here
            }
            return res.text().then((err) => {
              subscriber.error(new Error(err || res.statusText));
            });
          }

          const contentType = res.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            return res.json().then((data) => {
              subscriber.next(data as boolean);
              subscriber.complete();
            });
          } else {
            return res.text().then((data) => {
              subscriber.next(data as any);
              subscriber.complete();
            });
          }
        })
        .catch((err) => subscriber.error(err));
    });
  }

  update(
    input: LocationDto,
    cancellationToken?: any,
    config?: Partial<any>
  ): Observable<LocationDto> {
    // baseUrl is already a quoted literal
    const apiBase = window?.['apiBase']?.['eleoncore'] || '';
    const baseUrl = apiBase + '/api/CoreInfrastructure/Locations/Update';

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

    return new Observable<LocationDto>((subscriber) => {
      this.authFetch(eleoncoreApiUrl, options)
        .then((res) => {
          if (!res.ok) {
            if (!config?.skipHandleError) {
              // ← you can hook in your global reporter here
            }
            return res.text().then((err) => {
              subscriber.error(new Error(err || res.statusText));
            });
          }

          const contentType = res.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            return res.json().then((data) => {
              subscriber.next(data as LocationDto);
              subscriber.complete();
            });
          } else {
            return res.text().then((data) => {
              subscriber.next(data as any);
              subscriber.complete();
            });
          }
        })
        .catch((err) => subscriber.error(err));
    });
  }
}
