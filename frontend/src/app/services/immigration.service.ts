import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class immigrationService {
  BASE_URL: any;
  constructor(private httpClient: HttpClient) {
    this.BASE_URL = this.determineServerURL();
  }

  private determineServerURL(): string {
    if (typeof window !== 'undefined') {
      const isLocalhost =
        window.location.hostname === 'localhost' &&
        window.location.port === '4200';
      if (isLocalhost) {
       return 'http://localhost:8080/quote';


      } else {
        return window.location.origin;
      }
    }
    else {
      return 'http://localhost:8080/quote';
    }

  }

  getInitialQuote(product: string, intermediary: string): Observable<any> {
    const params = new HttpParams()
      .set('product', product)
      .set('intermediary', intermediary);

    return this.httpClient.get(`${this.BASE_URL}/initiateQuote`, { params });
  }


  requestQuote = (payload: any): Observable<any> => {
    const apiUrl =
      this.BASE_URL + '/pls-policy-services/external/quote/requestQuoteV2';
      const headers = new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8'
      });
      return this.httpClient.post<any>(apiUrl, payload, { headers });
  };

  bindQuote = (payload: any): Observable<any> => {
    const apiUrl =
      this.BASE_URL + '/pls-policy-services/external/quote/bindQuote';
      const headers = new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8'
      });
      return this.httpClient.post<any>(apiUrl, payload, { headers });
  };

  getPostalCode = (postalCode: number): Observable<any> => {
    const apiUrl =
      this.BASE_URL + `/reference-data-services/external/refdata/getPostalCode`;
    return this.httpClient.get(apiUrl, { params: { postalcode: postalCode } });
  };
  getBrokerHierarchy(token: string, intermediaryId: string): Observable<any> {
    const url = `${this.BASE_URL}/broker-services/secure/external/loadHierarchyV2`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = new HttpParams().set('intermediaryId', intermediaryId);

    return this.httpClient.get(url, { headers, params });
  }
  ocbcPaymentGetway = (paymentObject: any, token: string): Observable<any> => {

    let header = new HttpHeaders({
      Authorization: 'Bearer ' + token, // Replace 'yourToken' with the actual token value
    });
    const apiUrl =
      this.BASE_URL +
      '/pls-policy-services/secure/external/quote/getOCBCPaymentGatewayURL';
    return this.httpClient.post(apiUrl, paymentObject, {
      headers: header,
    });
  };

  chargeToAccount = (changeToAccObject: any): Observable<any> => {
    const apiUrl =
      this.BASE_URL + '/pls-policy-services/external/quote/payPolicy';
    return this.httpClient.post(apiUrl, changeToAccObject);
  };

  loadQuote = (id: number, token: any): Observable<any> => {
    const apiUrl =
      this.BASE_URL + '/pls-policy-services/external/quote/loadQuote';
    return this.httpClient.get(apiUrl, { params: { id: id, token: token } });
  };

  printDocument = (
    policyNo: any,
    accessToken: any,
    template: any
  ): Observable<any> => {
    const apiUrl =
      this.BASE_URL +
      '/pls-policy-services/external/quote/getPolicyDocument?policy=' +
      policyNo +
      '&token=' +
      accessToken +
      '&template=' +
      template +
      '';
    return this.httpClient.get(apiUrl);
  };

  forwardEmails = (email: string, policyNo: any, token: any) => {
    const apiUrl =
      this.BASE_URL +
      '/pls-policy-services/external/quote/emailPolicyDocuments';
    return this.httpClient.get(apiUrl, {
      params: { emailAddresses: email, policy: policyNo, token: token },
    });
  };

  sendPolicyDocs = (policyNo: any, token: any) => {
    const apiUrl =
      this.BASE_URL + '/pls-policy-services/external/quote/sendPolicyDocuments';
    return this.httpClient.get(apiUrl, {
      params: { policy: policyNo, token: token },
    });
  };

  notifyReject = (
    quoteNo: any,
    accessToken: any,
    subject: any,
    emailAddress: any,
    template: any,
    meetingDateTime: any
  ): Observable<any> => {
    let payload = {
      quoteNo: quoteNo,
      accessToken: accessToken,
      notifyType: 'EMAIL-HTML',
      notifySubject: subject,
      notifyTo: emailAddress,
      notifyContent: template,
      notifyDate: meetingDateTime,
    };
    const apiUrl = this.BASE_URL + '/pls-policy-services/external/quote/notify';
    return this.httpClient.post<any>(apiUrl, payload);
  };
  genaratePaymentLink = (
    quoteNo: any,
    policyNo: any,
    accessToken: any,
    amount: any,

  ): Observable<any> => {
    const payload = {
      id: quoteNo,
      policyNo: policyNo,
      accessToken: accessToken,
      amount: amount,

    };
    const apiUrl =
      this.BASE_URL + '/payment-gateway-router/PayNow?generateQRCode=true';
    return this.httpClient.post(apiUrl, payload);
  };
  uploadWorkerDocuments = (baseDoc: any, token: string, fileName: string): Observable<any> => {

    let header = new HttpHeaders({
      Authorization: 'Bearer ' + token, // Replace 'yourToken' with the actual token value
    });
    const apiUrl =
      this.BASE_URL + '/insurer-services/secure/external/v2/immigrationstoredoc?filename=' + fileName;
    return this.httpClient.post(apiUrl, baseDoc, {
      headers: header,

    });
  };
  downloadWorkerDocuments = (id: string, token: string): Observable<any> => {
    let header = new HttpHeaders({
      Authorization: 'Bearer ' + token, // Replace 'yourToken' with the actual token value
    });

    const apiUrl =
      this.BASE_URL + '/insurer-services/secure/external/v2/immigrationgetdoc?id=' + id;
    return this.httpClient.get(apiUrl, {
      headers: header,
      responseType: 'text' as 'json'
    });
  }

  getOCR = (token: string, docId: any): Observable<any> => {
    let header = new HttpHeaders({
      Authorization: 'Bearer ' + token, // Replace 'yourToken' with the actual token value
    });

    const apiUrl =
      this.BASE_URL + '/insurer-services/secure/external/v2/immigrationocr?docid=' + docId;
    return this.httpClient.get(apiUrl, {
      headers: header,
    });
  };

  printQuoteDocument = (id: any, accessToken: any): Observable<any> => {
    const apiUrl =
      this.BASE_URL +
      '/pls-policy-services/external/quote/getQuoteDocument?id=' +
      id +
      '&token=' +
      accessToken +
      '';
    return this.httpClient.get(apiUrl);
  };
  sendUrl = (
    quoteNo: any,
    accessToken: any,
    subject: any,
    emailAddress: any,
    template: any,
    date: any
  ): Observable<any> => {
    let payload = {
      quoteNo: quoteNo,
      accessToken: accessToken,
      notifyType: 'EMAIL-HTML',
      notifySubject: subject,
      notifyTo: emailAddress,
      notifyContent: template,
      notifyDate: date
    };
    const apiUrl =
      this.BASE_URL + '/pls-policy-services/external/quote/notify';
    return this.httpClient.post<any>(apiUrl, payload);
  };
  validateNRIC = function (str: any): boolean {
    if (str.length != 9) return false;

    str = str.toUpperCase();

    let i,
      icArray = [];
    for (i = 0; i < 9; i++) {
      icArray[i] = str.charAt(i);
    }

    icArray[1] = parseInt(icArray[1], 10) * 2;
    icArray[2] = parseInt(icArray[2], 10) * 7;
    icArray[3] = parseInt(icArray[3], 10) * 6;
    icArray[4] = parseInt(icArray[4], 10) * 5;
    icArray[5] = parseInt(icArray[5], 10) * 4;
    icArray[6] = parseInt(icArray[6], 10) * 3;
    icArray[7] = parseInt(icArray[7], 10) * 2;

    let weight = 0;
    for (i = 1; i < 8; i++) {
      weight += icArray[i];
    }

    let offset: any = '';
    if (icArray[0] == 'T' || icArray[0] == 'G') {
      offset = 4;
    } else if (icArray[0] == 'M') {
      offset = 3;
    } else if (icArray[0] == 'S' || icArray[0] == 'F') {
      offset = 0;
    }

    let temp = (offset + weight) % 11;

    let st = ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
    let fg = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'];
    let m = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'J', 'L', 'K'];

    let theAlpha;
    if (icArray[0] == 'S' || icArray[0] == 'T') {
      theAlpha = st[temp];
    } else if (icArray[0] == 'F' || icArray[0] == 'G' ) {
      theAlpha = fg[temp];
    }

    else if (icArray[0] == 'M') {
      theAlpha = m[temp];
    }
    else {
      return false; // Invalid prefix
    }
    return icArray[8] === theAlpha;
  };


}
