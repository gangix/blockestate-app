import { Component, OnInit, OnDestroy } from '@angular/core';
import { EscrowService } from '../transfer-form/escrow.service';
import { Subscription } from 'rxjs';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-agreement-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agreement-list.component.html',
  styleUrls: ['./agreement-list.component.css']
})
export class AgreementListComponent implements OnInit, OnDestroy {
  agreements: any[] = [];  // Store the list of agreements
  loading: boolean = false;  // Show loading state
  private agreementSub: Subscription = new Subscription();  // Subscription to fetch agreements

  constructor(private escrowService: EscrowService) {}

  ngOnInit(): void {
    // Optionally, you can fetch the agreements when the component initializes
    // this.fetchAgreements();
  }

  ngOnDestroy(): void {
    // Unsubscribe from any active subscriptions to avoid memory leaks
    this.agreementSub.unsubscribe();
  }

  fetchAgreements(): void {
    this.loading = true;
    this.agreementSub = this.escrowService.getAgreements().subscribe(
      (data: any[]) => {
        this.agreements = data;  // Update the list of agreements
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching agreements', error);
        this.loading = false;
      }
    );
  }
}
