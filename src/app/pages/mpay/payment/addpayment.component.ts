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
import * as model from '../../../models/model/payment.model';
import * as modelwall from '../../../models/model/wallet.model';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { OrderAuctionService } from 'src/app/services/order.auction.service';
import { PaymentForm, PaymentType } from 'src/app/common/config-setting';
import { PaymentService } from 'src/app/services/payment.service';


@Component({
    selector: 'app-addpayment',
    templateUrl: './addpayment.component.html'
})

export class AddPaymentComponent implements OnInit, OnDestroy {
    @BlockUI('blockui') blockUI: NgBlockUI;
    public accountId: '';
    public dataModel: model.PaymentAdd;
    public myform: FormGroup;
    public paymentForm: any[] = PaymentForm.defines;
    private refresh: EventEmitter<any> = new EventEmitter<any>();
    public wallets: modelwall.WalletList[];
    public customerList: any[] = [];
    public submitted = false;
    get f() { return this.myform.controls; }
    private searchCustomer: string = '';
    constructor(private _formBuilder: FormBuilder,
        public activeModal: NgbActiveModal,
        private ctService: PaymentService,
        private utility: UtilityService, ) { }
    ngOnInit() {
        this.dataModel = new model.PaymentAdd();
        this.dataModel.paymentform = PaymentForm.WALLET;
        this.dataModel.payType = PaymentType.PAY_ORDER;
        this.myform = this.CreateForm();

        this.onLoadWallets();
        this.onLoadCustomer();
    }
    CreateForm(): FormGroup {
        return this._formBuilder.group({
            accountId: [this.dataModel.accountId, Validators.required],
            amount: [this.dataModel.amount, [Validators.required, Validators.min(0)]],
            walletId: [this.dataModel.walletId, [Validators.required]],
            paymentform: [this.dataModel.paymentform, [Validators.required]],
            description: [this.dataModel.description, '']
        });
    }

    onLoadCustomer(): void {
        merge(this.refresh)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.customerList = [];
                    const request: reqcus.CustomerListTopRequest = {
                        keyword: this.searchCustomer,
                        limit: 20
                    };
                    return this.ctService.getListTopCustomer(request);
                }),
                map(response => {
                    // Flip flag to show that loading has finished.
                    if (!response.status) {
                        // TODO: show error.
                        this.utility.showError(response.errorCode,
                            response.parameters);
                    }
                    return response;
                }),
                catchError(() => {
                    // TODO: show error.
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                        null);

                    return of(this.customerList[0]);
                })
            ).subscribe(res => {
                if (res !== undefined && res.data != null) {
                    this.customerList = res.data.map((e, i) => {
                        if (e.fullname != null && e.username != null && e.fullname != '' && e.username != '') {
                            e.fName = e.fullname + '- [ ' + e.username + ' ]';
                            return e;
                        }
                        else if (e.username != '' && e.username != null) {
                            e.fName = e.username;
                            return e;
                        }
                        else if (e.fullname != '' && e.fullname != null) {
                            e.fName = e.fullname;
                            return e;
                        }
                    });
                }
            });
    }

    onLoadWallets(): void {
        merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    return this.ctService.getwallets();
                }),
                map(response => {
                    return response.data;
                })
            ).subscribe(res => {
                this.wallets = res;

                if (this.wallets.length > 0) {
                    this.dataModel.walletId = this.wallets[0].id;
                }
            });
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
                    var amount: number;
                    const val = this.myform.get('amount').value;
                    amount = Number(val.replace(/[^0-9.-]+/g, ""));
                    var request: req.PaymentAddRequest = {
                        AccountId: this.dataModel.accountId,
                        Amount: amount,
                        PaymentForm: this.dataModel.paymentform,
                        PaymentTye: this.dataModel.payType,
                        walletId: this.dataModel.walletId != null ? this.dataModel.walletId : null,
                        Ref: 0,
                        refType: '',
                        refCode: '',
                        status: 0,
                        description: this.dataModel.description
                    }
                    this.utility.showProcessing(this.blockUI);
                    return this.ctService.AddPayment(request)
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

    searchAutoCompeleteCustomer(e) {
        this.searchCustomer = e.term;
        this.refresh.emit();
    }

    ngOnDestroy() {

    }
}