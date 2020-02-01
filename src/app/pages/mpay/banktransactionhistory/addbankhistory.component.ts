import { Component, OnInit, Input, OnDestroy, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { merge, of } from 'rxjs';
import { startWith, switchMap, filter, map, catchError } from 'rxjs/operators';
import { OrderDetailList } from 'src/app/models/model/order-detail.model';
import { UtilityService } from 'src/app/services/utility.service';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import * as req from '../../../models/request/payment.request';
import * as reqcus from '../../../models/request/customer.request';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import * as model from '../../../models/model/banktransactionhistory.model';
import * as modelwall from '../../../models/model/wallet.model';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { OrderAuctionService } from 'src/app/services/order.auction.service';
import { PaymentForm, PaymentType } from 'src/app/common/config-setting';
import { BankTransactionHistoryList } from 'src/app/models/model/banktransactionhistory.model';
import { BankTransactionHistoryService } from 'src/app/services/banktransactionhistory.service';


@Component({
    selector: 'app-addbankhistory',
    templateUrl: './addbankhistory.component.html'
})

export class AddBankHistoryComponent implements OnInit, OnDestroy {
    @BlockUI('blockui') blockUI: NgBlockUI;
    public accountId: '';
    public dataModel: model.BankTransactionHistoryList;
    public myform: FormGroup;
    public bankInfoList : any[]=[];
    public wallets: modelwall.WalletList[];
    public customerList: any[] = [];
    public submitted = false;
    public bankType='';
    get f() { return this.myform.controls; }
    constructor(private _formBuilder: FormBuilder,
        public activeModal: NgbActiveModal,
        private ctService: BankTransactionHistoryService,
        private utility: UtilityService, ) { }
    ngOnInit() {
        this.dataModel = new model.BankTransactionHistoryList();
        this.myform = this.CreateForm();
        this.onLoadBankInfo();

    }
    CreateForm(): FormGroup {
        return this._formBuilder.group({
            id: [this.dataModel.id, Validators.required],
            accountNumber: [this.dataModel.accountNumber, [Validators.required]],
            debitAmount: [this.dataModel.debitAmount, [Validators.required]],
            creditAmount :[this.dataModel.creditAmount, [Validators.required]],
            transactionDate :[this.dataModel.transactionDate, [Validators.required]],
            description: [this.dataModel.description, [Validators.required]]
        });
    }

    private onLoadBankInfo(){
        merge()
        .pipe(
            startWith({}),
            switchMap(() => {
                return this.ctService.getListBankInfoByBankNumber();
            }),
            map(response => {
                if (!response.status) {
                    this.utility.showError(response.errorCode,
                        response.parameters);
                }
                return response;
            }),
            catchError(() => {
                this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                    null);

                return of(this.bankInfoList[0]);
            })
        ).subscribe(res => {
            if (res.data != null) {
                this.bankInfoList = res.data.map((item, i) => {
                    item.Name = item.accountNumber + '- ' + item.accountName + '-' +item.bankName;
                    return item;
                });
                console.log(this.bankInfoList);
            }
        });
    }

    choonseAccountNumber(item:any):void{
       this.bankType = item.bankName;
    }


    onAddNew(): void {
        this.submitted = true;

        if (this.myform.invalid) {
            return;
        }


        of(this.myform.valid)
            .pipe(
                filter(x => x),
                switchMap(() => {
                    const request: model.BankTransactionHistoryList = this.myform.getRawValue();
                    request.bankType = this.bankType;
                    console.log(request);
                    this.utility.showProcessing(this.blockUI);
                    return this.ctService.AddBankTransactionHistory(request)
                }),
                catchError(() => {
                    this.utility.cancelProcessing(this.blockUI);

                    return of({
                        status: false,
                        errorCode: ErrorCodeDefine.UNKNOW_ERROR,
                        parameters: null
                    });
                })
            ).subscribe(response => {
                this.utility.cancelProcessing(this.blockUI);

                if (!response.status) {
                    this.utility.showError(response.errorCode,
                        response.parameters);
                    return;
                }

                this.utility.showMessage('Thêm mới thành công');
                this.activeModal.close('');
            })
    }

    ngOnDestroy() {

    }
}