import {Component, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ethers, formatEther } from 'ethers';
import {EscrowService} from './escrow.service';
import {catchError, of, tap} from 'rxjs';
import {AgreementListComponent} from '../display-agreement-list/agreement-list.component';

@Component({
  selector: 'app-transfer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transfer-form.component.html',
  styleUrls: ['./transfer-form.component.css'],
})
export class TransferFormComponent {
  private factoryContractAddress = '0x42C758898101963D631c36ace3ef00f6bFb05D98';
  transferForm: FormGroup;
  @ViewChild(AgreementListComponent) agreementListComponent!: AgreementListComponent;
  walletConnected: boolean = false;
  ethereumAddress: string = '';
  isSubmitting: boolean = false;

  provider: ethers.BrowserProvider | null = null;
  signer: ethers.Signer | null = null;
  factoryContractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "escrowAddress",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "EscrowCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_buyer",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_seller",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "createEscrow",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "escrowContracts",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_buyer",
          "type": "address"
        }
      ],
      "name": "getEscrowContracts",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  constructor(private fb: FormBuilder,  private escrowService: EscrowService) {
    this.transferForm = this.fb.group({
      payerName: ['', Validators.required],
      payerEmail: ['', [Validators.required, Validators.email]],
      payeeName: ['', Validators.required],
      payeeEmail: ['', [Validators.required, Validators.email]],
      payeeEthereumAddress: ['', [Validators.required, this.ethereumAddressValidator]],
      ethAmount: [null, [Validators.required, Validators.min(0.0001)]],
    });
  }

  // Connect to MetaMask and setup event listeners
  async connectMetamask() {
    const ethereumProvider = this.getEthereumProvider();
    if (!ethereumProvider) return;

    try {
      // Use Web3Provider instead of BrowserProvider to interact with MetaMask
      this.provider = new ethers.BrowserProvider(ethereumProvider);

      // Use send method for requesting accounts
      const accounts = await this.provider.send('eth_requestAccounts', []);
      if (accounts.length === 0) {
        alert('No accounts found!');
        return;
      }

      this.ethereumAddress = accounts[0];
      this.signer = await this.provider.getSigner() as ethers.Signer;
      this.walletConnected = true;

      // Populate the form with the connected account
      this.transferForm.patchValue({ payerEthereumAddress: this.ethereumAddress });

      // Listen for account changes using MetaMask's event
      ethereumProvider.on('accountsChanged', (accounts: string[]) => {
        this.handleAccountsChanged(accounts);
      });

      alert(`Connected with MetaMask account: ${this.ethereumAddress}`);
    } catch (error) {
      console.error('Failed to connect to MetaMask:', error);
      alert('Failed to connect to MetaMask. Please try again.');
    }
  }

  private getEthereumProvider(): any {
    if (typeof window.ethereum !== 'undefined' && window.ethereum['isMetaMask']) {
      return window.ethereum; // MetaMask provider
    } else {
      alert('MetaMask is not installed!');
      return null;
    }
  }

  // Handle account changes triggered by MetaMask
  handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      alert('MetaMask is locked or no account is selected.');
      this.disconnectMetamask();
    } else if (accounts[0] !== this.ethereumAddress) {
      // Update the connected account if it changes
      this.ethereumAddress = accounts[0];
      this.transferForm.patchValue({ payerEthereumAddress: this.ethereumAddress });
      alert(`Account changed to ${this.ethereumAddress}`);
    }
  }

  async lockMetamask() {
    const ethereumProvider = this.getEthereumProvider();
    if (ethereumProvider) {
      try {
        // MetaMask doesn't expose a direct lock method via API, prompt the user to lock manually
        ethereumProvider.disconnect(); // This clears the connection state
        alert('MetaMask has been disconnected. Please lock your wallet manually for security.');
      } catch (error) {
        console.error('Error locking MetaMask:', error);
      }
    }
  }

  // Handle disconnection and cleanup
  async disconnectMetamask() {
    const ethereumProvider = this.getEthereumProvider();
    if (ethereumProvider) {
      ethereumProvider.removeListener('accountsChanged', this.handleAccountsChanged);
    }

    this.walletConnected = false;
    this.ethereumAddress = '';
    this.provider = null;
    this.signer = null;

    // Clear form fields
    this.transferForm.patchValue({ payerEthereumAddress: '' });
    this.lockMetamask();
  }

  // Handle form submission
  onSubmit() {
    if (this.transferForm.valid || this.walletConnected || !this.ethereumAddress) {

    const payerName = this.transferForm.get('payerName')?.value;
    const payerEmail = this.transferForm.get('payerEmail')?.value;
    const payeeName = this.transferForm.get('payeeName')?.value;
    const payeeEmail = this.transferForm.get('payeeEmail')?.value;
    const payeeEthereumAddress = this.transferForm.get('payeeEthereumAddress')?.value;
    const ethAmount = ethers.parseEther(this.transferForm.get('ethAmount')?.value.toString());
    const ethAmountEther = formatEther(ethAmount.toString());

    if (!this.signer) {
        alert('Please connect MetaMask!');
        return;
    }

    const factoryContract = new ethers.Contract(
        this.factoryContractAddress,
        this.factoryContractABI,
        this.signer
      );

      // const escrowTx = await factoryContract["createEscrow"](
      //   this.ethereumAddress,
      //   payeeEthereumAddress,
      //   ethAmount,
      //   { value: ethAmount }
      // );
      // await escrowTx.wait();  // Wait for transaction to be mined

    console.log("Escrow Contract Deployed");
    this.escrowService.generateEscrowAgreement(
        payerName,
        payerEmail,
        this.ethereumAddress,
        payeeName,
        payeeEmail,
        payeeEthereumAddress,
        "transactionHash",
        ethAmountEther
      ).pipe(
        // Use tap to do side effects like logging
        tap(response => {
          alert('Escrow Agreement Sent to Parties successfully!');
          if (this.agreementListComponent) {
            this.agreementListComponent.fetchAgreements();
          }

        }),
        // Handle errors with catchError
        catchError((error) => {
          console.error('Error creating escrow agreement:', error);
          alert('Failed to create escrow agreement.');
          return of(null);  // Return a safe value when an error occurs
        }))
    .subscribe();  // Continue to subscribe to the Observable
    } else {
      alert('Please fill in all the required fields correctly.');
    }

  }

  notifyBackend(data: any) {
    console.log('Sending data to backend:', data);
  }

  // Ethereum address validator
  ethereumAddressValidator(control: any) {
    try {
      ethers.getAddress(control.value); // Validates checksum and format
      return null;
    } catch {
      return { invalidAddress: true };
    }
  }
}
