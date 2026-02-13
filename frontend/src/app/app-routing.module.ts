import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './pages/about/about.component';
import { AddEmployerComponent } from './pages/add-employer/add-employer.component';
import { InsuredInformationComponent } from './pages/insured-information/insured-information.component';
import { PolicyComponent } from './pages/policy/policy.component';
import { QuotationComponent } from './pages/quotation/quotation.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { SuccessComponent } from './pages/success/success.component';
import { PaymentErrorComponent } from './pages/payment-error/payment-error.component';
import { PaymentLinkComponent } from './pages/payment-link/payment-link.component';
import { CompleteComponent } from './pages/complete/complete.component';
import { HomeComponent } from './pages/home/home.component';
const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'add-employer', component: AddEmployerComponent },
  { path: 'insured-information', component: InsuredInformationComponent },
  { path: 'policy', component: PolicyComponent },
  { path: 'quotation', component: QuotationComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'complete', component: CompleteComponent },
  { path: 'success', component: SuccessComponent },
  { path: 'paymentError', component: PaymentErrorComponent },
  { path: 'paymentLink', component: PaymentLinkComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{ useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
