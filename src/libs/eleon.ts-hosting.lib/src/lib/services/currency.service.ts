import { CurrencyDto, CurrencyRateDto, ICurrencyService } from '@eleon/contracts.lib'
import { CurrencyService as ServerCurrencyService } from '@eleon/system-services.lib';
import { Observable } from 'rxjs'

export class CurrencyService extends ICurrencyService
{
  private service = new ServerCurrencyService();

  getSystemCurrency() : Observable<CurrencyDto> {
    return this.service.getSystemCurrency();
  }

  getCurrencies() : Observable<CurrencyDto[]> {
    return this.service.getCurrencies();
  }

  getCurrencyRates(fromCurrencyCode: string, date?: string) : Observable<CurrencyRateDto[]> {
    return this.service.getCurrencyRates(fromCurrencyCode, date);
  }

  getCurrencyRate(fromCurrencyCode: string, toCurrencyCode: string, date?: string) : Observable<CurrencyRateDto> {
    return this.service.getCurrencyRate(fromCurrencyCode, toCurrencyCode, date);
  }
}