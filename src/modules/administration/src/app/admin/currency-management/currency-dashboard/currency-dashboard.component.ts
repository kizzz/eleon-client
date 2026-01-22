import { Component, OnInit } from '@angular/core';
import { CurrencyService, CurrencyDto, CurrencyRateDto } from '@eleon/system-services.lib';
import { switchMap } from 'rxjs/operators';
import { Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-currency-dashboard',
  templateUrl: './currency-dashboard.component.html',
  styleUrls: ['./currency-dashboard.component.scss']
})
export class CurrencyDashboardComponent implements OnInit {
  currencies: CurrencyDto[] = [];
  baseCurrency: CurrencyDto | null = null;
  rates: CurrencyRateDto[] = [];
  date: Date = new Date();
  minDate: Date = new Date(2000, 0, 1);
	maxDate: Date = new Date();
  loading = true;
  filter: string;
  
	@Input()
	showTitle: boolean = true;

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.loading = true;
    this.currencyService.getCurrencies().pipe(
      switchMap(currencies => {
        this.currencies = currencies;
        return this.currencyService.getSystemCurrency();
      })
    ).subscribe(systemCurrency => {
      this.baseCurrency = this.currencies.find(c => c.code === systemCurrency.code) || null;
      this.loadRates();
    });
  }

  onBaseCurrencyChange(): void {
    this.loadRates();
  }

  onDateChange(): void {
    this.loadRates();
  }

  loadRates(): void {
    if (!this.baseCurrency || !this.date) {
      this.rates = [];
      return;
    }
    this.loading = true;
    const dateStr = this.date?.toISOString()?.split('T')[0];
    this.currencyService.getCurrencyRates(this.baseCurrency.code, dateStr).subscribe(rates => {
      this.rates = rates;
      this.loading = false;
    });
  }
}