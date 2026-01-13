import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { AppConfigComponent } from './app.config.component';
import { SharedModule } from '@eleon/angular-sdk.lib';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        DrawerModule,
        RadioButtonModule,
        ButtonModule,
        CheckboxModule,
        ToggleSwitchModule,
        TooltipModule
    ],
    declarations: [
        AppConfigComponent
    ],
    exports: [
        AppConfigComponent
    ]
})
export class AppConfigModule { }
