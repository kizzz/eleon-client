
import type { PagedResultDto } from '@eleon/proxy-utils.lib';

import type { DocumentHistoryRequest } from '../audit-history-records/models';

import type { DocumentVersionEntity } from '../../../infrastructure/module/entities/models';

import { Observable } from 'rxjs/internal/Observable';


export class AuditHistoryRecordService {
  // each service gets its own authFetch helper
  private authFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
    const token = window['getUserToken']();
    const headers = new Headers(init.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(input, { ...init, headers });
  }


  getDocumentHistoryByRequest(request: DocumentHistoryRequest, config?: Partial<any>): Observable<PagedResultDto<DocumentVersionEntity>> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/Auditor/History/GetModuleFieldSets';

    // build ?a=1&b=2…
    const queryString = (() => {
      const qp = new URLSearchParams();

      {
        const raw = request.documentObjectType;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
					!(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('documentObjectType', String(raw));
        }
      }

      {
        const raw = request.documentId;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
					!(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('documentId', String(raw));
        }
      }

      {
        const raw = request.fromDateFilter;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
					!(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('fromDateFilter', String(raw));
        }
      }

      {
        const raw = request.toDateFilter;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
					!(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('toDateFilter', String(raw));
        }
      }

      {
        const raw = request.sorting;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
					!(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('sorting', String(raw));
        }
      }

      {
        const raw = request.skipCount;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
					!(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('skipCount', String(raw));
        }
      }

      {
        const raw = request.maxResultCount;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
					!(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('maxResultCount', String(raw));
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

    return new Observable<PagedResultDto<DocumentVersionEntity>>(subscriber => {
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
							subscriber.next(data as PagedResultDto<DocumentVersionEntity>);
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
