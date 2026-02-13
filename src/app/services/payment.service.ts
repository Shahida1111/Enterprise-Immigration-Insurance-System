import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  BASE_URL: any;
  constructor(private httpClient: HttpClient) {
    this.BASE_URL = this.determineServerURL();
  }

  private determineServerURL(): string {
    const isLocalhost =
      window.location.hostname === 'localhost' &&
      window.location.port === '4200';
    if (isLocalhost) {
  return 'https://ms.JKHdigital.com';
 
    } else {
      return window.location.origin;
    }
  }

  gatewaySettings = (mode: string) => {
    const apiUrl =
      this.BASE_URL +
      `/product-services-config/external/gatewaySettings?mode=${mode}`;
    return this.httpClient.get(apiUrl);
  };
  gatewaySettingsV2 = (mode: string,tranId:any,amount:any) => {
    const apiUrl = this.BASE_URL + `/product-services-config/external/gatewaySettingsV2?mode=${mode}&option=1&tranId=${tranId}&amount=${amount}`;
    return this.httpClient.get(apiUrl);
  };

  updatePGRef = (id: string, token: string, pgref: number) =>{
    const apiUrl = this.BASE_URL + `/pls-policy-services/external/quote/updatePGRef?id=${id}&token=${token}&pgref=${pgref}`;
    return this.httpClient.get(apiUrl,{ responseType: 'text' });
  };

  getUpdatedPgRef(id: string, token: string, currentPgRef: number) {
    const apiUrl = `https://ms.JKHdigital.com/pls-policy-services/external/quote/updatePGRef?id=${id}&token=${token}&pgref=${currentPgRef}`;
    return this.httpClient.get(apiUrl, { responseType: 'text' });
  };

  generatePayLinkUrl(id: string, accessToken: string): string {
    return `${this.BASE_URL}/JKH-immigration/#/payment?id=${id}&accessToken=${accessToken}`;
  }
  paymentgatewayUrl = (
    quoteData: any,
    paymentGatewaySettings: any,
    txnID: any,
    signature:any
  ) => {
    let productCode = 'JKH-immigration';
    let product = 'immigration';
    let option = 1;
    let _URL = undefined;
    let _BASE_URL;
    let _RETURN_URL =
      this.BASE_URL +
      '/payment-gateway-router/payment-redirect/v1/_dtst/OCBC'
      +
      '/' +
      quoteData.policyNo +
      '/' +
      quoteData.policyAccessToken +
      '/9999/' +
      quoteData.productJSON.risk.immigration_data.payment_method +
      '/' +
      'LS' +
      '/' +
      quoteData.productJSON.risk.premium.payable_premium +
      '/' +
      product +
      '/' +
      productCode;

    let _PYMT_IND = undefined;
    let _MERCHANT_TRANID = undefined;
    let _MERCHANT_ACC_NO = undefined;
    let _AMOUNT = undefined;
    let _PYMT_CRITERIA = undefined;
    let _MERCHANT_TRANS_PASSWORD = undefined;
    let _SIGNATURE_METHOD = undefined;
    let _TXN_DESC = quoteData.quoteNo;
    let _TRANSACTION_TYPE = undefined;
    let _RESPONSE_TYPE = undefined;
    _BASE_URL = paymentGatewaySettings.baseURL;

let settingParam=paymentGatewaySettings;
    _MERCHANT_ACC_NO = settingParam.merchantAccountNo;
  
    _RESPONSE_TYPE = settingParam.responseType;
    _PYMT_IND =
      settingParam.paymentIndicator === null || settingParam.paymentIndicator  === undefined
        ? ''
        : settingParam.paymentIndicator;
    _PYMT_CRITERIA =
      settingParam.paymentCriteria === null || settingParam.paymentCriteria === undefined? '' : settingParam.paymentCriteria;
     _SIGNATURE_METHOD = settingParam.signatureMethod;
    _MERCHANT_TRANID = txnID;
    _AMOUNT = this.formatPremium(quoteData.productJSON.risk.premium.payable_premium);
    _TRANSACTION_TYPE = '2';

    let md5Token =  signature;

   let _URL1 =
      '?MERCHANT_ACC_NO=' +
      _MERCHANT_ACC_NO +
      '&MERCHANT_TRANID=' +
      _MERCHANT_TRANID +
      '&AMOUNT=' +
      _AMOUNT +
      '&TRANSACTION_TYPE=' +
      _TRANSACTION_TYPE;
    let _URL2 =
      '&TXN_SIGNATURE=' +
      md5Token +
      '&SIGNATURE_METHOD=' +
      _SIGNATURE_METHOD+
      '&RESPONSE_TYPE=' +
      _RESPONSE_TYPE +
      '&RETURN_URL=' +
      _RETURN_URL +
      '/' +
      _MERCHANT_ACC_NO +
      '&TXN_DESC=' +
      _TXN_DESC;
  

    _URL = _BASE_URL + _URL1 + _URL2 ;
    return _URL;
  };

  getSettingsParam = (settings: any, option: any) => {
    let params = settings.parameters;
    let foundParam = undefined;
    if (Array.isArray(params)) {
      for (const param of params) {
        if (param.option === option) {
          foundParam = param;
          break;
        }
      }
    }
    return foundParam;
  };

  formatPremium = (premium: any) => {
    let prem;
    if (premium !== 'undefuned') {
      prem = parseFloat(premium).toFixed(2);
    } else {
      prem = 0;
    }
    return prem;
  };
}
