import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class StmgService {

  private isEdited = new BehaviorSubject<any>('');
  isEditedObs = this.isEdited.asObservable();

  updateIsEdited(d: any) {
    this.isEdited.next(d);
  }

  private isloaded = new BehaviorSubject<any>('');
  isLoadedObs = this.isloaded.asObservable();

  updateIsloaded(d: any) {
    this.isloaded.next(d);
  }

  private isUenSuccess = new BehaviorSubject<any>('');
  isUenSuccessObs = this.isUenSuccess.asObservable();
  updateisUenSuccess(d: any) {
    this.isUenSuccess.next(d);
  }

  private isDeleted = new BehaviorSubject<any>('');
  isDeletedSuccessObs = this.isDeleted.asObservable();
  
  updateIsDeleted(d: any) {
    this.isDeleted.next(d);
  
}

private isLQSuccess = new BehaviorSubject<any>('');
isLQSuccessObs = this.isLQSuccess.asObservable();

updateisLQSuccess(d: any) {
  this.isLQSuccess.next(d);
}

}
 
