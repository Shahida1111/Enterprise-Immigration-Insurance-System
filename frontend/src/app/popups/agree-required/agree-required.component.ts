import { Component,  Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-agree-required',
  templateUrl: './agree-required.component.html',
  styleUrls: ['./agree-required.component.scss']
})
export class AgreeRequiredComponent {
  @Input() msg: string = '';
  @Input() modalSize: string = ''; 

  constructor(public modal: NgbActiveModal) {}

 
   exit() {
    
    this.modal.dismiss('Cross click');;
 }
}
