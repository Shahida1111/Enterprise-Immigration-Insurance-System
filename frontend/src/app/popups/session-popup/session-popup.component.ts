import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-session-popup',
  templateUrl: './session-popup.component.html',
  styleUrls: ['./session-popup.component.scss']
})
export class SessionPopupComponent {
  constructor(private router: Router) {}
  redirectToLogin() {
    window.close();
  }
 
}
