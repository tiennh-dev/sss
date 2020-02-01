import { Component, OnInit, AfterViewInit, Input, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { merge, of } from 'rxjs';
import { startWith, switchMap, filter, map, catchError } from 'rxjs/operators';
import { UtilityService } from 'src/app/services/utility.service';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { PaymentService } from 'src/app/services/payment.service';
import * as req from '../../../models/request/payment.request';
import { PaymentMessageGetByIdRequest } from '../../../models/request/payment.request';
import { OrderDeposits } from 'src/app/common/config-setting';
import * as model from '../../../models/model/payment.model';

@Component({
    selector: 'app-transaction-processing',
    templateUrl: './payment.process.component.html',
})


export class TransactionProcessingComponent implements OnInit {
    get isAllowApprovelv1(): boolean {
        return this.paymentDetail && this.paymentDetail.state === OrderDeposits.KHOI_TAO;
    }
    get isAllowApprovelv2(): boolean {
        const stateAllows = [OrderDeposits.KHOI_TAO, OrderDeposits.DA_DUYET_CAP_1];
        const isAllow = this.paymentDetail && stateAllows.findIndex(item => item === this.paymentDetail.state) >= 0;

        return isAllow;
    }
    get isAllowApprovelv3(): boolean {
        const stateAllows = [
            OrderDeposits.KHOI_TAO, 
            OrderDeposits.DA_DUYET_CAP_1,
            OrderDeposits.DA_DUYET_CAP_2
        ];
        const isAllow = this.paymentDetail && stateAllows.findIndex(item => item === this.paymentDetail.state) >= 0;

        return isAllow;
    }
    get isAllowReject(): boolean {
        const stateAllows = [
            OrderDeposits.DA_DUYET_CAP_1,
            OrderDeposits.DA_DUYET_CAP_2
        ];
        const isAllow = this.paymentDetail && stateAllows.findIndex(item => item === this.paymentDetail.state) >= 0;

        return isAllow;
    }

    get isAllowCancel(): boolean {
        const stateAllows = [
            OrderDeposits.KHOI_TAO, 
            OrderDeposits.DA_DUYET_CAP_1,
            OrderDeposits.DA_DUYET_CAP_2
        ];
        const isAllow = this.paymentDetail && stateAllows.findIndex(item => item === this.paymentDetail.state) >= 0;

        return isAllow;
    }


    @BlockUI('blockui') blockUI: NgBlockUI;
    @Input() itemId:any;
    public desciption='';
    public customer: any[] = [];
    private requestCancelOrderEvent: EventEmitter<any> = new EventEmitter<any>();
    public paymentDetail:model.PaymentList;
    public PaymentMessage: model.PaymentMessage[];
    public PaymentList:any[]=[];
    constructor(private modalService: NgbModal, public activeModal: NgbActiveModal,
        private ctService: PaymentService,
        private utility: UtilityService) {
    }
    ngOnInit() {
    this.onLoadPaymentMessage();
    this.onLoadOrderDeposits();
    }
    public collectionIsEmpty(values: any[]): boolean {
        return !values || values.length === 0;
    }
    private onLoadPaymentMessage(): void {
        merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    const request: PaymentMessageGetByIdRequest = {
                        Id: this.itemId
                    };

                    return this.ctService.getMessages(request);
                }),
                map(response => {
                    if (!response.status) {
                        this.utility.showError(response.errorCode, response.parameters);
                    }

                    return response.data;
                }),
                catchError(() => {
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);

                    return of(null);
                })
            )
            .subscribe(data => {
                this.PaymentMessage = data;
            });
    }

    private onLoadOrderDeposits(): void {
        merge(this.requestCancelOrderEvent)
        .pipe(
            startWith({}),
            switchMap(() => {
                return this.ctService.getStateById(this.itemId);
            }),
            map(response => {
                if (!response.status) {
                    this.utility.showError(response.errorCode, response.parameters);
                }
                return response.data;
            }),
            catchError(() => {
                this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);

                return of(null);
            })
        )
        .subscribe(res => {
            this.paymentDetail = res;
        });
    }

    approveLevel1():void{
        merge()
        .pipe(
            startWith({}),
            switchMap(() => {
                var request: req.PaymentWorkflowRequest={
                    Id : this.itemId,
                    Message:this.desciption
                }
                return this.ctService.approveLevel1(request);
            }),
            catchError(() => {
                this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                    null);

                return of(null);
            })
        ).subscribe(res => {
            if (res.succeeded) {
                this.onLoadPaymentMessage();
                this.desciption='';
                this.requestCancelOrderEvent.emit();
                this.utility.showMessage('Duyệt cấp 1 thành công!');
            }else{
                this.utility.showMessage('Duyệt cấp 1 không thành công!');
            }
        });
    }

    approveLevel2():void{
        merge()
        .pipe(
            startWith({}),
            switchMap(() => {
                var request: req.PaymentWorkflowRequest={
                    Id : this.itemId,
                    Message: this.desciption
                }
                return this.ctService.approveLevel2(request);
            }),
            catchError(() => {
                this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                    null);

                return of(null);
            })
        ).subscribe(res => {
            if (res.succeeded) {
                this.onLoadPaymentMessage();
                this.desciption='';
                this.requestCancelOrderEvent.emit();
                this.utility.showMessage('Duyệt cấp 2 thành công!');
            }else{
                this.utility.showMessage('Duyệt cấp 2 không thành công!');
            }
        });
    }

    approveLevel3():void{
        merge()
        .pipe(
            startWith({}),
            switchMap(() => {
                var request: req.PaymentWorkflowRequest={
                    Id : this.itemId,
                    Message: this.desciption
                }
                return this.ctService.approveLevel3(request);
            }),
           
            catchError(() => {
                this.utility.cancelProcessing(this.blockUI);
                this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                    null);

                return of(null);
            })
        ).subscribe(res => {
            if (res.succeeded) {
                this.onLoadPaymentMessage();
                this.utility.cancelProcessing(this.blockUI);
                this.utility.showMessage('Thanh toán thành công!');
                this.activeModal.close('');
            }else{
                this.utility.showMessage('Thanh toán không thành công!');
            }
        });
    }

    reject():void{
        merge()
        .pipe(
            startWith({}),
            switchMap(() => {
                var request: req.PaymentWorkflowRequest={
                    Id : this.itemId,
                    Message: this.desciption
                }
                return this.ctService.reject(request);
            }),
            catchError(() => {
                this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                    null);

                return of(null);
            })
        ).subscribe(res => {
            if(res.succeeded){
                this.onLoadPaymentMessage();
            }
        });
    }

    cancel():void{
        merge()
        .pipe(
            startWith({}),
            switchMap(() => {
                var request: req.PaymentWorkflowRequest = {
                    Id: this.itemId,
                    Message: this.desciption
                }
                return this.ctService.cancel(request);
            }),
            catchError(() => {
                this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                    null);

                return of(null);
            })
        ).subscribe(res => {
            if (res.succeeded) {
                this.utility.cancelProcessing(this.blockUI);
                this.utility.showMessage('Giao dịch đã hủy!');
                this.activeModal.close('');
                this.onLoadPaymentMessage();
            }
        });
    }

}