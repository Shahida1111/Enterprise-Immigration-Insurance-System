import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStorageService } from 'src/app/services/session-storage.service';
@Component({
  selector: 'app-complete',
  templateUrl: './complete.component.html',
  styleUrls: ['./complete.component.scss']
})
export class CompleteComponent {
  quoteData: any;
  permPolicy: any;

  constructor(private router: Router, 
    private storageService: SessionStorageService,
     private activeRoute: ActivatedRoute) {}
  ngOnInit() {
    
    if (this.storageService.getSession('quoteData') != undefined) {
      this.quoteData = this.storageService.getSession('quoteData');
      this.activeRoute.queryParams.subscribe((params) => {
        this.permPolicy = params['permPolicyNo'];
        

        this.quoteData.policyNo = this.permPolicy;
        this.storageService.setSession('permPolicy', this.permPolicy);

       
       
        this.storageService.setSession('quoteData', this.quoteData);
      });
      this.router.navigate(['success']);
    }
    else{
      this.router.navigate(['success']);
    }
  }
}
