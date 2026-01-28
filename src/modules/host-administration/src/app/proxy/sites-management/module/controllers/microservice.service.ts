import type { InitializeMicroserviceMsg } from '../../../messaging/module/messages/models';

import type { EleoncoreModuleDto } from '../microservices/models';

import { Observable } from 'rxjs/internal/Observable';

export class MicroserviceService {
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

  createByApplicationModuleDto(
    applicationModuleDto: EleoncoreModuleDto,
    config?: Partial<any>
  ): Observable<EleoncoreModuleDto> {
    // baseUrl is already a quoted literal
    const apiBase = window?.['apiBase']?.['eleoncore'] || '';
    const baseUrl =
      apiBase + '/api/SitesManagement/MicroserviceController/Create';

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

      body: JSON.stringify(applicationModuleDto),
    };

    return new Observable<EleoncoreModuleDto>((subscriber) => {
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
              subscriber.next(data as EleoncoreModuleDto);
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

  getMicroserviceList(config?: Partial<any>): Observable<EleoncoreModuleDto[]> {
    // baseUrl is already a quoted literal
    const apiBase = window?.['apiBase']?.['eleoncore'] || '';
    const baseUrl =
      apiBase +
      '/api/SitesManagement/MicroserviceController/GetMicroserviceList';

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

    return new Observable<EleoncoreModuleDto[]>((subscriber) => {
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
              subscriber.next(data as EleoncoreModuleDto[]);
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

  initializeMicroserviceByInitializeMicroserviceMsg(
    initializeMicroserviceMsg: InitializeMicroserviceMsg,
    config?: Partial<any>
  ): Observable<boolean> {
    // baseUrl is already a quoted literal
    const apiBase = window?.['apiBase']?.['eleoncore'] || '';
    const baseUrl =
      apiBase +
      '/api/SitesManagement/MicroserviceController/InitializeMicroservice';

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

      body: JSON.stringify(initializeMicroserviceMsg),
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
}
