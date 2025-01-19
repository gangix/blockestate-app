import { provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TransferFormComponent } from './transfer-form/transfer-form.component';
import { AgreementListComponent } from './display-agreement-list/agreement-list.component';


export const appConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(ReactiveFormsModule),
    provideHttpClient(),
    provideRouter([]), // Add routes here if needed
    TransferFormComponent,
    AgreementListComponent,
  ],
};
