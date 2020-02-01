import { Component, OnInit, AfterViewInit, Input, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { merge, of } from 'rxjs';
import { startWith, switchMap, filter, map, catchError } from 'rxjs/operators';
import { UtilityService } from 'src/app/services/utility.service';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { PaymentService } from 'src/app/services/payment.service';
import { WithdrawalMessageGetByIdRequest } from 'src/app/models/request/withdrawal.request';
import { WithdrawalService } from 'src/app/services/withdrawal.service';
import * as req from '../../../models/request/withdrawal.request';
import * as model from '../../../models/model/withdrawal.model';
import { OrderWithdrawal } from 'src/app/common/config-setting';

@Component({
    selector: 'app-transaction-processing',
    templateUrl: './withdrawal.process.component.html',
})

export class transprocesswithdrawalcomponent implements OnInit {
    get isAllowApprovelv1(): boolean {
        return this.withDraWalDetail && this.withDraWalDetail.state === OrderWithdrawal.KHOI_TAO;
    }
    get isAllowApprovelv2(): boolean {
        const stateAllows = [OrderWithdrawal.KHOI_TAO, OrderWithdrawal.DA_DUYET_CAP_1];
        const isAllow = this.withDraWalDetail && stateAllows.findIndex(item => item === this.withDraWalDetail.state) >= 0;

        return isAllow;
    }
    get isAllowApprovelv3(): boolean {
        const stateAllows = [
            OrderWithdrawal.KHOI_TAO,
            OrderWithdrawal.DA_DUYET_CAP_1,
            OrderWithdrawal.DA_DUYET_CAP_2
        ];
        const isAllow = this.withDraWalDetail && stateAllows.findIndex(item => item === this.withDraWalDetail.state) >= 0;

        return isAllow;
    }
    get isAllowReject(): boolean {
        const stateAllows = [
            OrderWithdrawal.DA_DUYET_CAP_1,
            OrderWithdrawal.DA_DUYET_CAP_2
        ];
        const isAllow = this.withDraWalDetail && stateAllows.findIndex(item => item === this.withDraWalDetail.state) >= 0;

        return isAllow;
    }

    get isAllowTransferred(): boolean {
        const stateAllows = [
            OrderWithdrawal.DA_DUYET_CAP_3
        ];
        const isAllow = this.withDraWalDetail && stateAllows.findIndex(item => item === this.withDraWalDetail.state) >= 0;

        return isAllow;
    }

    get isAllowCancel():boolean{
        const stateAllows=[
            OrderWithdrawal.KHOI_TAO,
            OrderWithdrawal.DA_DUYET_CAP_1,
            OrderWithdrawal.DA_DUYET_CAP_2
        ]
        const isAllow = this.withDraWalDetail && stateAllows.findIndex(item => item === this.withDraWalDetail.state) >= 0;
        return isAllow;
    }


    @BlockUI('blockui') blockUI: NgBlockUI;
    @Input() itemId: any;
    public desciption = '';
    public withdrawalMessages: any[] = [];
    public withDraWalDetail: model.WithdrawalList;
    private requestCancelOrderEvent: EventEmitter<any> = new EventEmitter<any>();
    constructor(private _service: WithdrawalService,
        private utility: UtilityService,
        public activeModal: NgbActiveModal,
        private modalService: NgbModal) {
    }
    ngOnInit() {
        this.onLoadWithDrwalMessage();
        this.onLoadOrderDeposits();
    }
    public collectionIsEmpty(values: any[]): boolean {
        return !values || values.length === 0;
    }
    private onLoadWithDrwalMessage(): void {
        merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    const request: WithdrawalMessageGetByIdRequest = {
                        Id: this.itemId
                    };
                    return this._service.getMessages(request);
                }),
                catchError(() => {
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);

                    return of(null);
                })
            )
            .subscribe(res => {
                this.withdrawalMessages = res.data;
            });
    }

    private onLoadOrderDeposits(): void {
        merge(this.requestCancelOrderEvent)
            .pipe(
                startWith({}),
                switchMap(() => {
                    return this._service.getStateById(this.itemId);
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
                this.withDraWalDetail = res;
            });
    }

    approveLevel1(): void {
        merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    var request: req.WithdraWalWorkflowRequest = {
                        Id: this.itemId,
                        Message: this.desciption
                    }
                    this.utility.showProcessing(this.blockUI);
                    return this._service.approveLevel1(request);
                }),
                catchError(() => {
                    this.utility.cancelProcessing(this.blockUI);
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                        null);

                    return of(null);
                })
            ).subscribe(res => {
                this.utility.cancelProcessing(this.blockUI);
                if (res.succeeded) {
                    this.onLoadWithDrwalMessage();
                    this.requestCancelOrderEvent.emit();
                    this.utility.showMessage('Duyệt cấp 1 thành công!');
                } else {
                    this.utility.showMessage('Duyệt cấp 1 không thành công!');
                }
            });
    }

    approveLevel2(): void {
        merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    var request: req.WithdraWalWorkflowRequest = {
                        Id: this.itemId,
                        Message: this.desciption
                    }
                    this.utility.showProcessing(this.blockUI);
                    return this._service.approveLevel2(request);
                }),
                catchError(() => {
                    this.utility.cancelProcessing(this.blockUI);
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                        null);

                    return of(null);
                })
            ).subscribe(res => {
                this.utility.cancelProcessing(this.blockUI);
                if (res.succeeded) {
                    this.onLoadWithDrwalMessage();
                    this.requestCancelOrderEvent.emit();
                    this.utility.showMessage('Duyệt cấp 2 thành công!');
                } else {
                    this.utility.showMessage('Duyệt cấp 2 không thành công!');
                }
            });
    }

    approveLevel3(): void {
        merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    var request: req.WithdraWalWorkflowRequest = {
                        Id: this.itemId,
                        Message: this.desciption
                    }
                    this.utility.showProcessing(this.blockUI);
                    return this._service.approveLevel3(request);
                }),

                catchError(() => {
                    this.utility.cancelProcessing(this.blockUI);
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                        null);

                    return of(null);
                })
            ).subscribe(res => {
                this.utility.cancelProcessing(this.blockUI);
                if (res.succeeded) {
                    this.onLoadWithDrwalMessage();
                    this.requestCancelOrderEvent.emit();
                    this.utility.showMessage('Duyệt cấp 3 thành công!');
                } else {
                    this.utility.showMessage('Duyệt cấp 3 không thành công!');
                }
            });
    }

    reject(): void {
        merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    var request: req.WithdraWalWorkflowRequest = {
                        Id: this.itemId,
                        Message: this.desciption
                    }
                    return this._service.reject(request);
                }),
                catchError(() => {
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                        null);

                    return of(null);
                })
            ).subscribe(res => {
                this.onLoadWithDrwalMessage();
            });
    }

    transferred(): void {
        merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    var request: req.WithdraWalWorkflowRequest = {
                        Id: this.itemId,
                        Message: this.desciption
                    }
                    this.utility.showProcessing(this.blockUI);
                    return this._service.Transferred(request);
                }),
                catchError(() => {
                    this.utility.cancelProcessing(this.blockUI);
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                        null);

                    return of(null);
                })
            ).subscribe(res => {
                this.utility.cancelProcessing(this.blockUI);
                if (res.succeeded) {
                    this.utility.showMessage('Chuyển khoản thành công!');
                    this.activeModal.close('');
                }else{
                    this.utility.showMessage('Chuyển khoản không thành công!');
                    this.activeModal.close('');
                }
            });
    }

    cancel():void{
        merge()
        .pipe(
            startWith({}),
            switchMap(() => {
                var request: req.WithdraWalWorkflowRequest = {
                    Id: this.itemId,
                    Message: this.desciption
                }
                this.utility.showProcessing(this.blockUI);
                return this._service.cancel(request);
            }),
            catchError(() => {
                this.utility.cancelProcessing(this.blockUI);
                this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                    null);

                return of(null);
            })
        ).subscribe(res => {
            this.utility.cancelProcessing(this.blockUI);
            if (res.succeeded) {
                this.utility.showMessage('Giao dịch đã hủy!');
                this.activeModal.close('');
                this.onLoadWithDrwalMessage();
            }
        });
    }


}