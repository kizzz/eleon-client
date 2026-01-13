export function setCookie(name: string, value: string | number | boolean, cookieOptions: any): void {
    const options = {
      path: '/',
      // add other defaults here if necessary
      ...cookieOptions,
    }

    if (options.expires instanceof Date) {
      options.expires = options.expires.toUTCString()
    }

    let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value)

    for (let optionKey in options) {
      updatedCookie += '; ' + optionKey
      let optionValue = options[optionKey]
      if (optionValue !== true) {
        updatedCookie += '=' + optionValue
      }
    }

    document.cookie = updatedCookie
  }