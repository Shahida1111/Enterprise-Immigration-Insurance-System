import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ssic-code-excluded',
  templateUrl: './ssic-code-excluded.component.html',
  styleUrls: ['./ssic-code-excluded.component.scss']
})
export class SsicCodeExcludedComponent {
  
  constructor(public modal: NgbActiveModal) {}

 
  exit() {
   
   this.modal.dismiss('Cross click');;
}
}
