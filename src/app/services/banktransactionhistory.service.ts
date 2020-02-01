import * as model from './../models/model/banktransactionhistory.model';
import * as resbank from './../models/response/bankinfo.response';
import * as res from './../models/response/banktransactionhistory.response';
import { DataTableResponse, BaseResponse, BaseEntityResponse } from '../models/response/base.response';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import { ConfigSetting } from '../common/config-setting';
import { BankTransactionHistoryList } from './../models/model/banktransactionhistory.model';


@Injectable()
export class BankTransactionHistoryService {
    constructor(private http: HttpClientService) { }

    getListJTable(request: any): Observable<DataTableResponse<model.BankTransactionHistoryJTable>> {
        const url = ConfigSetting.BANK_TRANS_HISTORY_LIST_JTABLE;
        return this.http.postAuthorize<DataTableResponse<model.BankTransactionHistoryJTable>>(url, request);
    }

    getListBankInfo(): Observable<resbank.BankInfoListResponse> {
        const url = ConfigSetting.BANK_INFO_LIST;
        return this.http.postAuthorize<resbank.BankInfoListResponse>(url, null);
    }
    getDetail(id: string): Observable<res.BankTransactionDetailResponse> {
        const url = ConfigSetting.BANK_TRANS_GET_DETAIL;
        return this.http.postAuthorize<res.BankTransactionDetailResponse>(url + '/' + id, null);
    }
    update(request: any): Observable<BaseResponse> {
        const url = ConfigSetting.BANK_TRANS_UPDATE;
        return this.http.postAuthorize<BaseResponse>(url, request);
    }

    getListBankInfoByBankNumber(): Observable<BaseEntityResponse<BankTransactionHistoryList[]>> {
        const url = ConfigSetting.DEPOSITS_GET_LIST_BANKINFO;
        return this.http.postAuthorize<BaseEntityResponse<BankTransactionHistoryList[]>>(url, null);
    }

    AddBankTransactionHistory(request:BankTransactionHistoryList):Observable<BaseResponse>{
        const url = ConfigSetting.ADD_NEW_BANKTRANSACTIONHISTORY;
        return this.http.postAuthorize<BaseResponse>(url, request);
    }

    deleteBankTransactionHistory(Id:string): Observable<BaseResponse> {
        const url = ConfigSetting.DELETE_BANKTRANSACTIONHISTORY;
        return this.http.postAuthorize<BaseResponse>(url + '/' + Id, null);
    }

}
