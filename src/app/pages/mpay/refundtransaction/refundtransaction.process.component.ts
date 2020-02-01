import { Component, OnInit, AfterViewInit, Input, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { merge, of } from 'rxjs';
import { startWith, switchMap, filter, map, catchError } from 'rxjs/operators';
import { UtilityService } from 'src/app/services/utility.service';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { DepositsService } from 'src/app/services/deposits.service';
import * as req from '../../../models/request/deposits.request';
import * as model from '../../../models/model/deposits.model';
import { DepositsMessageGetByIdRequest } from 'src/app/models/request/DepositsMessageGetById.Request';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { OrderDeposits } from 'src/app/common/config-setting';
import { RefundTransactionService } from 'src/app/services/refundtransaction.service';

@Component({
    selector: 'refund-transaction-processing',
    templateUrl: './refundtransaction.process.component.html',
})

export class RefundTransactionProcessingComponent implements OnInit {
    get isAllowApprovelv1(): boolean {
        return this.depositsDetail && this.depositsDetail.state === OrderDeposits.KHOI_TAO;
    }
    get isAllowApprovelv2(): boolean {
        const stateAllows = [OrderDeposits.KHOI_TAO, OrderDeposits.DA_DUYET_CAP_1];
        const isAllow = this.depositsDetail && stateAllows.findIndex(item => item === this.depositsDetail.state) >= 0;

        return isAllow;
    }
    get isAllowApprovelv3(): boolean {
        const stateAllows = [
            OrderDeposits.KHOI_TAO, 
            OrderDeposits.DA_DUYET_CAP_1,
            OrderDeposits.DA_DUYET_CAP_2
        ];
        const isAllow = this.depositsDetail && stateAllows.findIndex(item => item === this.depositsDetail.state) >= 0;

        return isAllow;
    }
    get isAllowReject(): boolean {
        const stateAllows = [
            OrderDeposits.DA_DUYET_CAP_1,
            OrderDeposits.DA_DUYET_CAP_2
        ];
        const isAllow = this.depositsDetail && stateAllows.findIndex(item => item === this.depositsDetail.state) >= 0;

        return isAllow;
    }

    get isAllowCancel(): boolean {
        const stateAllows = [
            OrderDeposits.KHOI_TAO, 
            OrderDeposits.DA_DUYET_CAP_1,
            OrderDeposits.DA_DUYET_CAP_2
        ];
        const isAllow = this.depositsDetail && stateAllows.findIndex(item => item === this.depositsDetail.state) >= 0;

        return isAllow;
    }

    @BlockUI('blockui') blockUI: NgBlockUI;
    @Input() itemId: any;
    @Input() AccountId: any;
    private requestCancelOrderEvent: EventEmitter<any> = new EventEmitter<any>();
    public desciption = '';
    public depositsDetail: model.DepositsDetail;
    public depositsMessages: model.DepositsMessage[];
    
    constructor(private modalService: NgbModal, private ctService: RefundTransactionService, public activeModal: NgbActiveModal,
        private utility: UtilityService) {
    }
    ngOnInit() {
        this.onLoadDepositsMessage();
        this.onLoadOrderDeposits();
    }
    public collectionIsEmpty(values: any[]): boolean {
        return !values || values.length === 0;
    }

    private onLoadDepositsMessage(): void {
        merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    const request: DepositsMessageGetByIdRequest = {
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
                this.depositsMessages = data;
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
            this.depositsDetail = res;
        });
    }



    approveLevel1(): void {
        merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    var request: req.DepositWorkflowRequest = {
                        Id: this.itemId,
                        message: this.desciption
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
                    this.onLoadDepositsMessage();
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
                    var request: req.DepositWorkflowRequest = {
                        Id: this.itemId,
                        message: this.desciption
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
                    this.onLoadDepositsMessage();
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
                    var request: req.DepositWorkflowRequest = {
                        Id: this.itemId,
                        message: this.desciption
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
                    this.onLoadDepositsMessage();
                    this.utility.cancelProcessing(this.blockUI);
                    this.utility.showMessage('Duyệt cấp 3 thành công!');
                    this.activeModal.close('');
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
                    var request: req.DepositWorkflowRequest = {
                        Id: this.itemId,
                        message: this.desciption
                    }
                    return this.ctService.reject(request);
                }),
                catchError(() => {
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                        null);

                    return of(null);
                })
            ).subscribe(res => {
                if (res.succeeded) {
                   this.requestCancelOrderEvent.emit();
                    this.onLoadDepositsMessage();
                }
            });
    }

    cancel():void{
        merge()
        .pipe(
            startWith({}),
            switchMap(() => {
                var request: req.DepositWorkflowRequest = {
                    Id: this.itemId,
                    message: this.desciption
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
                this.onLoadDepositsMessage();
            }
        });
    }

  
    ngOnDestroy(): void {
        this.requestCancelOrderEvent.complete();
    }
}