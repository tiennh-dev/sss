import { Component, OnInit, AfterViewInit, Input, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { merge, of, Subject } from 'rxjs';
import { startWith, switchMap, map, catchError, takeUntil } from 'rxjs/operators';
import { UtilityService } from 'src/app/services/utility.service';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { FormGroup } from '@angular/forms';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import * as model from '../../../models/model/order.model';
import { OrderState, OrderStatus, PaymentType, PaymentForm } from 'src/app/common/config-setting';
import { OrderApp } from '../../../models/model/order.model';
import { OrderWorkflowRequest, OrderMessageGetByOrderIdRequest } from 'src/app/models/request/order.request';
import { OrderDetailGetByOrderIdRequest } from 'src/app/models/request/order-detail.request';
import { OrderPaidAddPaymentComponent } from './orderpaidaddpayment.component';
import { ShortcutInput, ShortcutEventOutput, KeyboardShortcutsComponent } from 'ng-keyboard-shortcuts';
import { ApprovalOrderService } from 'src/app/services/approval.order.service';
import { OrderPaidService } from 'src/app/services/orderpaid.service';
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'mpay-orderpaid-process',
    templateUrl: './orderpaid.process.component.html',
    styleUrls: ['./orderpaid.process.component.scss']
})


export class OrderPaidProcessComponent implements OnInit {

    get isWaitForProcessCancelOrder(): boolean {
        return this.order && this.order.state === OrderState.CHO_XU_LY_HUY_DON;
    }

    get isWaitForProcessTempDeposit(): boolean {
        return this.order && this.order.state === OrderState.CHO_XU_LY_TAM_UNG;
    }

    get isWaitForProcessRequestPaymentOrder(): boolean {
        return this.order && this.order.state === OrderState.CHO_XL_DE_NGHI_TT;
    }

    get isWaitForPaymentOrderDone(): boolean {
        return this.order && this.order.state === OrderState.CHO_TT_DON_HANG;
    }
    shortcuts: ShortcutInput[] = [];
    @BlockUI('blockui') blockUI: NgBlockUI;
    // @Input() orderData: model.OrderJTable;
    @Input() id: number;

    private refreshOrderDetailEvent: EventEmitter<any> = new EventEmitter<any>();
    private refreshOrderMessageEvent: EventEmitter<any> = new EventEmitter<any>();
    private refreshPaymentEvent: EventEmitter<any> = new EventEmitter<any>();
    private refreshOrderEvent: EventEmitter<any> = new EventEmitter<any>();

    private approvedCancelOrderEvent: EventEmitter<any> = new EventEmitter<any>();
    private rejectCancelOrderEvent: EventEmitter<any> = new EventEmitter<any>();
    private rejectRequestApproveTempDepositEvent: EventEmitter<any> = new EventEmitter<any>();
    private approveTempDepositEvent: EventEmitter<any> = new EventEmitter<any>();
    private customerRejectPaymentEvent: EventEmitter<any> = new EventEmitter<any>();
    private approvePaymentOrderEvent: EventEmitter<any> = new EventEmitter<any>();
    private rejectPaymentOrderEvent: EventEmitter<any> = new EventEmitter<any>();
    private approvePaymentOrderDoneEvent: EventEmitter<any> = new EventEmitter<any>();

    private destroyed = new Subject();



    public refType = 'AUCTION';
    public order: OrderApp;
    public orderDetails: model.OrderDetailList[];
    public orderMessages: model.OrderMessage[];
    public payments: any;
    public orderWorkflowRequest: OrderWorkflowRequest = {
        id: null,
        message: ''
    };
    constructor(public activeModal: NgbActiveModal,
        private orderService: OrderPaidService, private modalService: NgbModal,
        private utility: UtilityService) {
    }
    ngOnInit() {
        this.onGetOrderDetailListener();
        this.onLoadOrderListener();
        this.onLoadOrderMessage();
        this.onGetPaymentListener();
        this.onApprovedCancelOrderListener();
        this.onRejectCancelOrderListener();
        this.onRejectRequestApproveTempDepositListener();
        this.onApproveTempDepositListener();
        this.onCustomerRejectPaymentListener();
        this.onApprovePaymentOrderListener();
        this.onRejectPaymentOrderListener();
        this.onApprovePaymentOrderDoneListener();

    }
    public collectionIsEmpty(values: any[]): boolean {
        return !values || values.length === 0;
    }
    paymentTypeDisp(id: string): string {
        return PaymentType.getDisplay(id);
    }
    paymentFormDisp(id: string): string {
        return PaymentForm.getDisplay(id);
    }
    buyfreejp(order: OrderApp): number {
        const pricejp = order.total + (order.shippingFee != null ? +order.shippingFee : 0) + (order.surcharge != null ? +order.surcharge : 0);
        return pricejp * ((order.buyFee != null ? +order.buyFee : 0) / 100);
    }
    shipGlobal(order: OrderApp): number {
        const sg1 = ((order.weight != null ? +order.weight : 0) / 1000) * order.shippingUnitGlobal;
        const sg2 = (((order.width != null ? +order.width : 0) *
            (order.hight != null ? +order.hight : 0) * (order.length != null ? +order.length : 0)) / 6000) * order.shippingUnitGlobal;
        return (sg1 > sg2 ? sg1 : sg2);
    }
    totalPriceVN(order: OrderApp): string {
        const pricejp = order.total + (order.shippingFee != null ? +order.shippingFee : 0) + (order.surcharge != null ? +order.surcharge : 0);
        const buyfreejp = this.buyfreejp(order);
        const shippingGlobal = 0;
        const shipGlobal = this.shipGlobal(order);
        const totalVND = Math.round((pricejp + buyfreejp) * order.exchangeRate +
            (order.deliveryFee != null ? +order.deliveryFee : 0) + shippingGlobal + shipGlobal);
        return totalVND.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }

    private onLoadOrderListener(): void {
        merge(this.refreshOrderEvent)
            .pipe(
                takeUntil(this.destroyed),
                startWith({}),
                switchMap(() => {
                    return this.orderService.getDetail(this.id);
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
                this.order = data;

                this.refreshPaymentEvent.emit();
            });
    }

    private onLoadOrderMessage(): void {
        merge(this.refreshOrderMessageEvent)
            .pipe(
                takeUntil(this.destroyed),
                startWith({}),
                switchMap(() => {
                    const request: OrderMessageGetByOrderIdRequest = {
                        orderId: this.id
                    };

                    return this.orderService.getMessages(request);
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
                this.orderMessages = data;
            });
    }

    private onApprovedCancelOrderListener(): void {
        merge(this.approvedCancelOrderEvent)
            .pipe(
                switchMap(() => {
                    this.orderWorkflowRequest.id = this.order.id;

                    return this.orderService.approvedCancelOrder(this.orderWorkflowRequest);
                }),
                catchError(() => {
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);

                    return of(null);
                })
            )
            .subscribe(response => {
                if (response.succeeded) {
                    this.orderWorkflowRequest.message = '';

                    this.refreshOrderEvent.emit();
                    this.refreshOrderMessageEvent.emit();
                    this.utility.showMessage("Duyệt huỷ đơn thành công!");
                } else {
                    this.utility.showErrorMessage("Duyệt huỷ đơn không thành công!");
                }
            });
    }

    private onRejectCancelOrderListener(): void {
        merge(this.rejectCancelOrderEvent)
            .pipe(
                switchMap(() => {
                    this.orderWorkflowRequest.id = this.order.id;

                    return this.orderService.rejectCancelOrder(this.orderWorkflowRequest);
                }),
                catchError(() => {
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);

                    return of(null);
                })
            )
            .subscribe(response => {
                if (response.succeeded) {
                    this.orderWorkflowRequest.message = '';

                    this.refreshOrderEvent.emit();
                    this.refreshOrderMessageEvent.emit();
                    this.utility.showMessage("Từ chối duyệt huỷ đơn thành công!");
                } else {
                    this.utility.showErrorMessage("Từ chối duyệt huỷ đơn thành công!");
                }
            });
    }

    private onRejectRequestApproveTempDepositListener(): void {
        merge(this.rejectRequestApproveTempDepositEvent)
            .pipe(
                switchMap(() => {
                    this.orderWorkflowRequest.id = this.order.id;

                    return this.orderService.rejectRequestApproveTempDeposit(this.orderWorkflowRequest);
                }),
                catchError(() => {
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);

                    return of(null);
                })
            )
            .subscribe(response => {
                if (response.succeeded) {
                    this.orderWorkflowRequest.message = '';

                    this.refreshOrderEvent.emit();
                    this.refreshOrderMessageEvent.emit();
                    this.utility.showMessage("Từ chối duyệt đề nghị thanh toán thành công!");
                } else {
                    this.utility.showErrorMessage("Từ chối duyệt đề nghị thanh toán thành công!");
                }
            });
    }

    private onApproveTempDepositListener(): void {
        merge(this.approveTempDepositEvent)
            .pipe(
                switchMap(() => {
                    this.orderWorkflowRequest.id = this.order.id;

                    return this.orderService.approveTempDeposit(this.orderWorkflowRequest);
                }),
                catchError(() => {
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);

                    return of(null);
                })
            )
            .subscribe(response => {
                if (response.succeeded) {
                    this.orderWorkflowRequest.message = '';

                    this.refreshOrderEvent.emit();
                    this.refreshOrderMessageEvent.emit();
                    this.utility.showMessage("Duyệt đề nghị thanh toán thành công!");
                } else {
                    this.utility.showErrorMessage("Duyệt đề nghị thanh toán thành công!");
                }
            });
    }

    private onCustomerRejectPaymentListener(): void {
        merge(this.customerRejectPaymentEvent)
            .pipe(
                switchMap(() => {
                    this.orderWorkflowRequest.id = this.order.id;

                    return this.orderService.customerRejectPayment(this.orderWorkflowRequest);
                }),
                catchError(() => {
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);

                    return of(null);
                })
            )
            .subscribe(response => {
                if (response.succeeded) {
                    this.orderWorkflowRequest.message = '';

                    this.refreshOrderEvent.emit();
                    this.refreshOrderMessageEvent.emit();
                    this.utility.showMessage("Xác nhận khách từ chối thanh toán thành công!");
                } else {
                    this.utility.showErrorMessage("Xác nhận khách từ chối thanh toán thành công!");
                }
            });
    }

    private onApprovePaymentOrderListener(): void {
        merge(this.approvePaymentOrderEvent)
            .pipe(
                switchMap(() => {
                    this.orderWorkflowRequest.id = this.order.id;

                    return this.orderService.approvePaymentOrder(this.orderWorkflowRequest);
                }),
                catchError(() => {
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);

                    return of(null);
                })
            )
            .subscribe(response => {
                if (response.succeeded) {
                    this.orderWorkflowRequest.message = '';

                    this.refreshOrderEvent.emit();
                    this.refreshOrderMessageEvent.emit();
                    this.utility.showMessage("Duyệt đề nghị thanh toán thành công!");
                } else {
                    this.utility.showErrorMessage("Duyệt đề nghị thanh toán thành công!");
                }
            });
    }

    private onRejectPaymentOrderListener(): void {
        merge(this.rejectPaymentOrderEvent)
            .pipe(
                switchMap(() => {
                    this.orderWorkflowRequest.id = this.order.id;

                    return this.orderService.rejectPaymentOrder(this.orderWorkflowRequest);
                }),
                catchError(() => {
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);

                    return of(null);
                })
            )
            .subscribe(response => {
                if (response.succeeded) {
                    this.orderWorkflowRequest.message = '';

                    this.refreshOrderEvent.emit();
                    this.refreshOrderMessageEvent.emit();
                    this.utility.showMessage("Từ chối duyệt đề nghị thanh toán thành công!");
                } else {
                    this.utility.showErrorMessage("Từ chối duyệt đề nghị thanh toán thành công!");
                }
            });
    }

    private onApprovePaymentOrderDoneListener(): void {
        merge(this.approvePaymentOrderDoneEvent)
            .pipe(
                switchMap(() => {
                    this.orderWorkflowRequest.id = this.order.id;

                    return this.orderService.approvePaymentOrderDone(this.orderWorkflowRequest);
                }),
                catchError(() => {
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);

                    return of(null);
                })
            )
            .subscribe(response => {
                if (response.succeeded) {
                    this.orderWorkflowRequest.message = '';

                    this.refreshOrderEvent.emit();
                    this.refreshOrderMessageEvent.emit();
                    this.utility.showMessage("Duyệt thanh toán toàn bộ đơn hàng thành công!");
                } else {
                    this.utility.showErrorMessage("Duyệt thanh toán toàn bộ đơn hàng thành công!");
                }
            });
    }

    private onGetOrderDetailListener() {
        merge(this.refreshOrderDetailEvent)
            .pipe(
                takeUntil(this.destroyed),
                startWith({}),
                switchMap(() => {
                    const request: OrderDetailGetByOrderIdRequest = {
                        orderId: this.id,
                    };

                    return this.orderService.getOrderDetail(request);
                }),
                map(response => {
                    if (!response.status) {
                        this.utility.showError(response.errorCode, response.parameters);
                    }

                    return response.data;
                }),
                catchError(() => {
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);

                    return of([]);
                })
            )
            .subscribe(data => {
                this.orderDetails = data;
                // this.orderDetails.forEach(x => this.id = x.id);
                // this.orderDetails.forEach(x => this.ref = x.orderId);
            });
    }

    private onGetPaymentListener() {
        merge(this.refreshPaymentEvent)
            .pipe(
                takeUntil(this.destroyed),
                // startWith({}),
                switchMap(() => {
                    return this.orderService.getOrderDetailPayment(this.id, this.order.accountId);
                }),
                map(response => {
                    return response;
                })
            ).subscribe(res => {
                this.payments = res.data.payments.map((item) => {
                    return {
                        id: item.id,
                        walletId: item.walletId,
                        amount: item.amount,
                        amountstring: item.amountstring,
                        paymentForm: item.paymentForm,
                        paymentType: item.paymentType,
                        state: item.state ==='KHOI_TAO' ? 'Khởi tạo' : item.state==='DA_DUYET_CAP_1' ? 'Duyệt cấp 1' : item.state==='DA_DUYET_CAP_2' ? 'Duyệt cấp 2'
                         : item.state==='DA_DUYET_CAP_3' ?'Duyệt cấp 3' :  item.state==='KET_THUC' ? 'Kết thúc' : item.state==='DA_HUY' ? 'Hủy thanh toán' : 'Tự động xử lý',
                         status: item.status === 0 ? 'Chờ xử lý' : item.status === 1 && item.refund!=true ? 'Đã thanh toán' : 
                         item.status === 1 && item.refund===true ? 'Đã hoàn tiền' : item.status === 2 ? 'Hủy thanh toán' : item.status === 3 ? 'Chờ thanh toán' : '',
                        selected: item.status === 1 ? true : false,
                        note: item.note,
                        description: item.description
                    };
                });
            });
    }

    onSubmit(): void {
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this.destroyed.next();
        this.destroyed.complete();
        // this.requestApproveTempDepositEvent.unsubscribe();
        this.refreshOrderDetailEvent.complete();
        this.refreshOrderMessageEvent.complete();
        this.refreshPaymentEvent.complete();
        this.refreshOrderEvent.complete();
    }

    priceDisplay(p: any): string {
        return p != null ? p.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : ' ';
    }

    statusDisplay(s: number): string {
        return OrderStatus.getDisplayState(s);
    }

    public approvedCancelOrder(): void {
        this.approvedCancelOrderEvent.emit();
    }

    public rejectCancelOrder(): void {
        this.rejectCancelOrderEvent.emit();
    }

    public rejectRequestApproveTempDeposit(): void {
        this.rejectRequestApproveTempDepositEvent.emit();
    }

    public approveTempDeposit(): void {
        this.approveTempDepositEvent.emit();
    }

    public customerRejectPayment(): void {
        this.customerRejectPaymentEvent.emit();
    }

    public approvePaymentOrder(): void {
        this.approvePaymentOrderEvent.emit();
    }

    public rejectPaymentOrder(): void {
        this.rejectPaymentOrderEvent.emit();
    }

    public approvePaymentOrderDone(): void {
        this.approvePaymentOrderDoneEvent.emit();
    }

    refreshPayment(): void {
        this.refreshPaymentEvent.emit();
    }

    addPaymentOpenModel(): void {
        const modalRef = this.modalService.open(OrderPaidAddPaymentComponent);
        modalRef.componentInstance.itemId = this.order.id;
        modalRef.componentInstance.accountId = this.order.accountId;
        modalRef.componentInstance.code = this.order.code;
        modalRef.result.then(() => {
            this.refreshPaymentEvent.emit();
        }, () => {
            this.refreshPaymentEvent.emit();
        });
    }
}
