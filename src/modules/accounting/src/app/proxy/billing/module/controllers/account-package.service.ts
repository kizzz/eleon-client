
import type { PagedResultDto } from '@eleon/proxy-utils.lib';

import type { AccountPackageDto, AccountPackageListRequestDto, CreateAccountPackageDto } from '../account-packages/models';

import { Observable } from 'rxjs/internal/Observable';


export class AccountPackageService {
  // each service gets its own authFetch helper
  private authFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
    const token = window['getUserToken']();
    const headers = new Headers(init.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(input, { ...init, headers });
  }


  addAccountPackage(accountId: string, input: CreateAccountPackageDto, config?: Partial<any>): Observable<AccountPackageDto> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/account/account-packages/AddAccountPackage';

    // build ?a=1&b=2…
    const queryString = (() => {
      const qp = new URLSearchParams();

      {
        const raw = accountId;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
					!(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('accountId', String(raw));
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
      method: 'POST',
      headers,

      body: JSON.stringify(input),

    };

    return new Observable<AccountPackageDto>(subscriber => {
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
							subscriber.next(data as AccountPackageDto);
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


  deleteAccountPackage(accountPackageId: string, config?: Partial<any>): Observable<void> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/account/account-packages/DeleteAccountPackage';

    // build ?a=1&b=2…
    const queryString = (() => {
      const qp = new URLSearchParams();

      {
        const raw = accountPackageId;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
					!(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('accountPackageId', String(raw));
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


  getAccountPackage(accountPackageId: string, config?: Partial<any>): Observable<AccountPackageDto> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/account/account-packages/GetAccountPackage';

    // build ?a=1&b=2…
    const queryString = (() => {
      const qp = new URLSearchParams();

      {
        const raw = accountPackageId;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
					!(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('accountPackageId', String(raw));
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

    return new Observable<AccountPackageDto>(subscriber => {
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
							subscriber.next(data as AccountPackageDto);
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


  getAccountPackages(input: AccountPackageListRequestDto, config?: Partial<any>): Observable<PagedResultDto<AccountPackageDto>> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/account/account-packages/GetAccountPackages';

    // build ?a=1&b=2…
    const queryString = (() => {
      const qp = new URLSearchParams();

      {
        const raw = input.accountId;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
					!(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('accountId', String(raw));
        }
      }

      {
        const raw = input.sorting;
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
        const raw = input.skipCount;
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
        const raw = input.maxResultCount;
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

    return new Observable<PagedResultDto<AccountPackageDto>>(subscriber => {
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
							subscriber.next(data as PagedResultDto<AccountPackageDto>);
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


  getListByMemberIdByMemberId(memberId: string, config?: Partial<any>): Observable<AccountPackageDto[]> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/account/account-packages/GetListByMemberId';

    // build ?a=1&b=2…
    const queryString = (() => {
      const qp = new URLSearchParams();

      {
        const raw = memberId;
        if (
          raw !== undefined &&
          raw !== null &&
          (typeof raw !== 'string' || raw !== '') &&
					!(Array.isArray(raw) && raw?.length == 0)
        ) {
          qp.append('memberId', String(raw));
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

    return new Observable<AccountPackageDto[]>(subscriber => {
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
							subscriber.next(data as AccountPackageDto[]);
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


  updateAccountPackage(input: AccountPackageDto, config?: Partial<any>): Observable<AccountPackageDto> {
    // baseUrl is already a quoted literal
		const apiBase = window?.['apiBase']?.['eleonsoft'] || '';
    const baseUrl = apiBase + '/api/account/account-packages/UpdateAccountPackage';

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

    return new Observable<AccountPackageDto>(subscriber => {
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
							subscriber.next(data as AccountPackageDto);
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
