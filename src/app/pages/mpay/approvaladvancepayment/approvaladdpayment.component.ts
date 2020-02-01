import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { merge, of } from 'rxjs';
import { startWith, switchMap, filter, map, catchError } from 'rxjs/operators';
import { OrderDetailList } from 'src/app/models/model/order-detail.model';
import { UtilityService } from 'src/app/services/utility.service';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import * as req from '../../../models/request/payment.request';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import * as model from '../../../models/model/payment.model';
import * as modelwall from '../../../models/model/wallet.model';
import { NgBlockUI, BlockUI } from 'ng-block-ui'; 
import { PaymentForm, PaymentType } from 'src/app/common/config-setting';
import { ApprovalOrderService } from 'src/app/services/approval.order.service';
import { ApprovalAdvancePaymentService } from 'src/app/services/approvaladvancepayment.service';


@Component({
    selector: 'app-mpay-approval-addpayment',
    templateUrl: './approvaladdpayment.component.html'
})

export class ApprovalAddPaymentComponent implements OnInit, OnDestroy {
    @BlockUI('blockui') blockUI: NgBlockUI;
    @Input() itemId;
    @Input() accountId;
    @Input() code;
    public dataModel: model.PaymentAdd;
    public wallets: modelwall.WalletList[];
    get f() { return this.myform.controls; }
    public refType = 'ORDER';
    public myform: FormGroup;
    public id: number;
    public AUCFEECANCEL: number;
    public StatusData: any[] = [];
    public statusOrder: any[] = [];
    public deliveryData: any[] = [];
    public orderData: any[] = [];
    public DataUpdate: OrderDetailList[] = [];
    public paymentData: any[] = [];
    public paymentForm: any[] = PaymentForm.defines;
    public submitted = false;
    public orderDetails: OrderDetailList[];
    public buyFees = [8, 7, 6, 5, 4, 3, 2];
    public item: string;
    public paymentType: any[] = PaymentType.defines;

    constructor(public activeModal: NgbActiveModal,
        private orderService: ApprovalAdvancePaymentService,
        private utility: UtilityService,
        private _formBuilder: FormBuilder, ) {
    }

    ngOnInit() {
        this.dataModel = new model.PaymentAdd();
        this.dataModel.paymentform = PaymentForm.WALLET;
        this.dataModel.payType = PaymentType.PAY_ORDER;
        this.myform = this.CreateForm();

        this.onLoadWallets();
    }

    CreateForm(): FormGroup {
        return this._formBuilder.group({
            amount: [this.dataModel.amount, [Validators.required, Validators.min(0)]],
            walletId: [this.dataModel.walletId, [Validators.required]],
            paymentform: [this.dataModel.paymentform, [Validators.required]],
            payType: [this.dataModel.payType, [Validators.required]],
            description: [this.dataModel.description, '']
        });
    }

    isAmountInputDisabled(): boolean {
        return this.dataModel.payType === PaymentType.CANCEL_ORDER;
    }

    onLoadWallets(): void {
        merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    return this.orderService.getwallets();
                }),
                map(response => {
                    return response.data;
                })
            ).subscribe(res => {
                this.wallets = res;

                if(this.wallets.length > 0) {
                    this.dataModel.walletId = this.wallets[0].id;
                }
            });
    }

    loadPaymentProfile(): void {
        merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    return this.orderService.getPaymentProfile(this.accountId);
                }),
                map(response => {
                    return response;
                })
            ).subscribe(res => {
                this.AUCFEECANCEL = res;
                this.dataModel.amount = this.AUCFEECANCEL;
            });
    }

    choosePayType(): void {
        if (this.dataModel.payType == 'CANCEL_ORDER') {
            this.loadPaymentProfile();
        } else {
            this.dataModel.amount = null;
        }
    }

    onAddNew(): void {
        this.submitted = true;
        
        if(this.myform.invalid) {
            return;
        }

        of(this.myform.valid)
            .pipe(
                filter(x => x),
                switchMap(() => {
                    var amount:number;
                    if (this.dataModel.payType === 'CANCEL_ORDER') {
                        amount=  this.dataModel.amount;
                    } else {
                        const val = this.myform.get('amount').value;
                        amount = Number(val.replace(/[^0-9.-]+/g, ""));
                    }
                    var request: req.PaymentAddRequest = {
                        AccountId: this.accountId,
                        Amount: amount,
                        PaymentForm: "",
                        PaymentTye: this.dataModel.payType,
                        walletId: this.dataModel.walletId != null ? this.dataModel.walletId : null,
                        Ref: this.itemId,
                        refType: this.refType,
                        refCode: this.code,
                        status: 0,
                        description: this.dataModel.description
                    }

                    this.utility.showProcessing(this.blockUI);

                    return this.orderService.AddPayment(request)
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

                this.utility.showMessage('Add new successfully');
                this.activeModal.close('');
            })
    }

    ngOnDestroy(): void {
    }
}