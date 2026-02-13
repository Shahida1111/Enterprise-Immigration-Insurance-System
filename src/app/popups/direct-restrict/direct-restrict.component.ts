import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { SpinnerComponent } from 'src/app/components/spinner/spinner.component';
import { immigrationService } from 'src/app/services/immigration.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
@Component({
  selector: 'app-direct-restrict',
  templateUrl: './direct-restrict.component.html',
  styleUrls: ['./direct-restrict.component.scss']
})
export class DirectRestrictComponent {
  quoteData: any;
  constructor(
    public modal: NgbActiveModal,
    private router: Router,
    private immigrationService: immigrationService,
    private storageService: SessionStorageService,
    private spinner: NgxSpinnerService,

  ) { }

  initialQuote() {
    this.spinner.show("loadingSpinner");
    this.immigrationService.getInitialQuote("", "").subscribe({
      next: (response: any) => {
        this.quoteData = response;
        this.storageService.setSession('quoteData', this.quoteData);
        this.modal.close();
        this.router.navigate(['about']);
      },
      error: () => {
        this.spinner.hide("loadingSpinner");
      }


    })

  }


}
