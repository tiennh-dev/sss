import { Component, OnInit, Input, OnDestroy, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { merge, of } from 'rxjs';
import { startWith, switchMap, filter, map, catchError } from 'rxjs/operators';
import { UtilityService } from 'src/app/services/utility.service';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import * as model from '../../../models/model/order-detail.model';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { OrderAuctionService } from 'src/app/services/order.auction.service';
import { PaymentForm, PaymentType, OrderStatus } from 'src/app/common/config-setting';
import { PaymentService } from 'src/app/services/payment.service';
import { OrderApp } from '../../../models/model/order.model';
import { OrderDetailGetByOrderIdRequest } from 'src/app/models/request/order-detail.request';


@Component({
    selector: 'app-order-infomation',
    templateUrl: './orderinfomation.component.html'
})

export class OrderInfomationComponent implements OnInit, OnDestroy {
    @Input() OrderId:string;
    @Input() Id:number;
    @Input() AccountId:string;
    public order: model.OrderDetailList[];
    public orderDetails: model.OrderDetailList[];
    public payments: any;
    constructor(private modalService: NgbModal,
        public activeModal: NgbActiveModal,
        private ctService: PaymentService,
        private utility: UtilityService, ) { }
    ngOnInit() {
        this.onLoadCustomer();
        this.onGetOrderDetail();
        this.onGetPayment();
    }

    onLoadCustomer(): void {
        merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    return this.ctService.getOrderDetail(this.OrderId);
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

                    return of(null);
                })
            ).subscribe(res => {
                this.order = res.data;
            });
    }

    private onGetOrderDetail() {
        merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    return this.ctService.getTableOrderDetail(this.OrderId);
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
            });
    }

    private onGetPayment() {
            merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    return this.ctService.getOrderDetailPayment(this.AccountId,this.OrderId);
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
            .subscribe(res => {
                this.payments=res;
                this.payments = this.payments.map((item) => {
                    return {
                        id: item.id,
                        walletId: item.walletId,
                        amount: item.amount,
                        amountstring: item.amountstring,
                        paymentForm: item.paymentForm,
                        paymentType: item.paymentType, 
                        status: item.status === 0 ? 'Chờ xử lý' : item.status === 1 && item.refund!=true ? 'Đã thanh toán' : 
                        item.status === 1 && item.refund===true ? 'Đã hoàn tiền' : item.status === 2 ? 'Hủy thanh toán' : item.status === 3 ? 'Chờ thanh toán' : '',
                        selected: item.status === 1 ? true : false,
                        note: item.note,
                        description: item.description
                    };
                });
            });
    }
    public collectionIsEmpty(values: any[]): boolean {
        return !values || values.length === 0;
    }
    priceDisplay(p: any): string {
        return p != null ? p.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : ' ';
    }
    buyfreejp(order: OrderApp): number {
        const pricejp = order.total + (order.shippingFee != null ? +order.shippingFee : 0) + (order.surcharge != null ? +order.surcharge : 0);
        return Math.round(pricejp * ((order.buyFee != null ? +order.buyFee : 0) / 100));
    }
    paymentTypeDisp(id: string): string {
        return PaymentType.getDisplay(id);
    }
    paymentFormDisp(id: string): string {
        return PaymentForm.getDisplay(id);
    }
    shipGlobal(order: OrderApp): number {
        const sg1 = ((order.weight != null ? +order.weight : 0) / 1000) * order.shippingUnitGlobal;
        const sg2 = (((order.width != null ? +order.width : 0) *
            (order.hight != null ? +order.hight : 0) * (order.length != null ? +order.length : 0)) / 6000) * order.shippingUnitGlobal;
        return Math.round((sg1 > sg2 ? sg1 : sg2));
    }
    totalPriceVN(order: OrderApp): string {
        const pricejp = order.total + (order.shippingFee != null ? +order.shippingFee : 0) + (order.surcharge != null ? +order.surcharge : 0);
        const buyfreejp = this.buyfreejp(order);
        const shippingGlobal = 0;
        const shipGlobal = this.shipGlobal(order);
        const totalVND = (pricejp + buyfreejp) * order.exchangeRate +
            (order.deliveryFee != null ? +order.deliveryFee : 0) + shippingGlobal + shipGlobal;
        return totalVND.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }
    statusDisplay(s: number): string {
        return OrderStatus.getDisplayState(s);
    }

    ngOnDestroy() { }
}