
export interface CurrencyDto {
  code?: string;
  symbol?: string;
}

export interface CurrencyRateDto {
  fromCurrencyCode?: string;
  toCurrencyCode?: string;
  rate: number;
  rateDate?: string;
}
