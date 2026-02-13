import { Component } from '@angular/core';
import { SessionStorageService } from '../../services/session-storage.service';
import { StmgService } from 'src/app/services/stmg.service';
@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  quoteData: any;
  intermediary:string =''
  constructor(
    private storageService: SessionStorageService,
    private stmgService: StmgService
  ) {}

  ngOnInit() {
    if (this.storageService.getSession('quoteData') != undefined) {
      this.quoteData = this.storageService.getSession('quoteData');
      this.intermediary = this.quoteData.intermediary;
    }
    this.stmgService.isLoadedObs.subscribe((isLoaded: any) => {
      if (isLoaded) {
        if (this.storageService.getSession('quoteData') != undefined) {
          this.quoteData = this.storageService.getSession('quoteData');
          this.intermediary = this.quoteData.intermediary;
        }
      }
    });
  }
}
