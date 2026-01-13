import { Component, ElementRef, Input, OnInit } from '@angular/core';

import { MenuService } from '../app.menu.service';

import { ILayoutService } from '@eleon/angular-sdk.lib';
@Component({
    standalone: false,
    selector: 'app-config',
    templateUrl: './app.config.component.html',
})
export class AppConfigComponent implements OnInit {
    @Input() minimal: boolean = false;

    get visible(): boolean {
        return this.layoutService.config().configSidebarVisible;
    }
    set visible(_val: boolean) {
        this.layoutService.config.update((config) => ({
          ...config,
          configSidebarVisible: _val,
        }));
    }

    get scale(): number {
        return this.layoutService.config().scale;
    }
    set scale(_val: number) {
        this.layoutService.config.update((config) => ({
            ...config,
            scale: _val,
            isSave: true,
        }));
    }

    get menuMode(): string {
        return this.layoutService.config().menuMode;
    }
    set menuMode(_val: string) {
        this.layoutService.config.update((config) => ({
            ...config,
            menuMode: _val,
            isSave: true,
        }));
    }

    get isCustom(): boolean {
        return this.layoutService.config().isCustom;
    }
    set isCustom(_val: boolean) {
        if (_val) {
            this.layoutService.config.update((config) => ({
                ...config,
                isCustom: _val,
                isSave: true,
            }));
        }
        else {
            const defaultConfig = this.layoutService.getDefaultCustomConfig();
            this.layoutService.config.update((config) => ({
                ...config,
                isCustom: _val,
                ...defaultConfig,
                isSave: true,
            }));
        }
    }

    get inputStyle(): string {
        return this.layoutService.config().inputStyle;
    }
    set inputStyle(_val: string) {
        this.layoutService.config().inputStyle = _val;
    }

    get ripple(): boolean {
        return this.layoutService.config().ripple;
    }
    set ripple(_val: boolean) {
        this.layoutService.config.update((config) => ({
            ...config,
            ripple: _val,
            isSave: true,
        }));
    }

    set theme(val: string) {
        this.layoutService.config.update((config) => ({
            ...config,
            theme: val,
            isSave: true,
        }));
    }
    get theme(): string {
        return this.layoutService.config().theme;
    }

    set colorScheme(val: string) {
        this.layoutService.config.update((config) => ({
            ...config,
            colorScheme: val,
            isSave: true,
        }));
    }
    get colorScheme(): string {
        return this.layoutService.config().colorScheme;
    }
    get menuTheme(): string {
        return this.layoutService.config().menuTheme;
    }
    set menuTheme(val: string) {
        this.layoutService.config.update((config) => ({
            ...config,
            menuTheme: val,
            isSave: true,
        }));
    }

    get topbarTheme(): string {
        return this.layoutService.config().topbarTheme;
    }
    set topbarTheme(val: string) {
        this.layoutService.config.update((config) => ({
            ...config,
            topbarTheme: val,
            isSave: true,
        }));
    }

    get componentTheme(): string {
        return this.layoutService.config().componentTheme;
    }
    set componentTheme(val: string) {
        this.layoutService.config.update((config) => ({
            ...config,
            componentTheme: val,
            isSave: true,
        }));
    }

      get isThemeDark() {
        return this.theme.includes("dark");
      }

      set isThemeDark(_val: boolean) {
        const oldMode = !_val ? "dark" : "light";
        const newMode = _val ? "dark" : "light";
        this.layoutService.config.update((config) => ({
          ...config,
          theme: this.theme.replace(oldMode, newMode),
          colorScheme: newMode,
          menuTheme: newMode,
          isSave: true,
        }));
      }
    


    componentThemes: any[] = [];
    topbarThemes: any[] = [];
    menuThemes: any[] = [];

    scales: number[] = [12, 13, 14, 15, 16];

    get position() {
        const element = this.el.nativeElement.closest('[dir="ltr"]');
        if (element) {
            return "right";
        } 
        return "left";
    }

    get menuProfilePosition(): string {
        return this.layoutService.config().menuProfilePosition;
    }
    set menuProfilePosition(_val: string) {
        this.layoutService.config.update((config) => ({
            ...config,
            menuProfilePosition: _val,
        }));
        if (
            this.layoutService.isSlimPlus() ||
            this.layoutService.isSlim() ||
            this.layoutService.isHorizontal()
        ) {
            this.menuService.reset();
        }
    }
    constructor(
        public layoutService: ILayoutService,
        public menuService: MenuService,
        private el: ElementRef
    ) {}
    ngOnInit() {
        const colors = [
          'emerald', 'green', 'lime', 'red', 'orange', 'amber', 'yellow', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'slate', 'gray', 'zinc', 'neutral', 'stone'
        ];

        this.componentThemes = colors.map(color => ({ name: color, color: `var(--p-${color}-500)` }));

        this.menuThemes = [
            { name: 'light', color: '#FDFEFF' },
            { name: 'dark', color: '#434B54' },
            { name: 'indigo', color: '#1A237E' },
            { name: 'bluegrey', color: '#37474F' },
            { name: 'brown', color: '#4E342E' },
            { name: 'cyan', color: '#006064' },
            { name: 'green', color: '#2E7D32' },
            { name: 'deeppurple', color: '#4527A0' },
            { name: 'deeporange', color: '#BF360C' },
            { name: 'pink', color: '#880E4F' },
            { name: 'purple', color: '#6A1B9A' },
            { name: 'teal', color: '#00695C' },
        ];

        this.topbarThemes = [
            { name: 'lightblue', color: '#2E88FF', isDark: false },
            { name: 'dark', color: '#363636', isDark: true },
            { name: 'white', color: '#FDFEFF', isDark: false },
            { name: 'blue', color: '#1565C0', isDark: true },
            { name: 'deeppurple', color: '#4527A0', isDark: true },
            { name: 'purple', color: '#6A1B9A', isDark: true },
            { name: 'pink', color: '#AD1457', isDark: true },
            { name: 'cyan', color: '#0097A7', isDark: true },
            { name: 'teal', color: '#00796B', isDark: true },
            { name: 'green', color: '#43A047', isDark: true },
            { name: 'lightgreen', color: '#689F38', isDark: true },
            { name: 'lime', color: '#AFB42B', isDark: false },
            { name: 'yellow', color: '#FBC02D', isDark: false },
            { name: 'amber', color: '#FFA000', isDark: false },
            { name: 'orange', color: '#FB8C00', isDark: false },
            { name: 'deeporange', color: '#D84315', isDark: true },
            { name: 'brown', color: '#5D4037', isDark: true },
            { name: 'grey', color: '#616161', isDark: true },
            { name: 'bluegrey', color: '#546E7A', isDark: true },
            { name: 'indigo', color: '#3F51B5', isDark: true },
        ];
    }

    onConfigButtonClick() {
        this.layoutService.showConfigSidebar();
    }

    changeComponentTheme(theme) {
        this.componentTheme = theme;
    }
    changeTheme(theme: string, colorScheme: string) {
        this.theme = theme;
        this.colorScheme = colorScheme;
    }
    changeMenuTheme(theme: string) {
        this.menuTheme = theme;
    }

    changeTopbarTheme(theme: string) {
        this.topbarTheme = theme;
    }
    decrementScale() {
        this.scale--;
    }


    incrementScale() {
        this.scale++;
    }

    reset() {
        this.layoutService.resetToDefault();
    }
}
