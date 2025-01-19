import { Component } from '@angular/core';
import { TransferFormComponent } from './transfer-form/transfer-form.component';
import { AgreementListComponent } from './display-agreement-list/agreement-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TransferFormComponent, AgreementListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'ethTransferApp';
}
