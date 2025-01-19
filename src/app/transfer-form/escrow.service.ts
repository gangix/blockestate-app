import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EscrowService {

  private apiUrlSubmitAgreement = 'http://localhost:8080/escrow';
  private apiUrlGetAgreements = 'http://localhost:8080/escrows';

  constructor(private http: HttpClient) {}

  generateEscrowAgreement(
    payerName: string,
    payerEmail: string,
    payerEthAddress: string,
    payeeName: string,
    payeeEmail: string,
    payeeEthAddress: string,
    transactionHash: string,
    amount: string
  ): Observable<any> {
    const body = new URLSearchParams();
    body.set('payerName', payerName);
    body.set('payerEmail', payerEmail);
    body.set('payerEthAddress', payerEthAddress);
    body.set('payeeName', payeeName);
    body.set('payeeEmail', payeeEmail);
    body.set('payeeEthAddress', payeeEthAddress);
    body.set('transactionHash', transactionHash);
    body.set('amount', amount);

    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.post<any>(this.apiUrlSubmitAgreement, body.toString(), { headers });
  }

  getAgreements(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlGetAgreements);
  }
}
