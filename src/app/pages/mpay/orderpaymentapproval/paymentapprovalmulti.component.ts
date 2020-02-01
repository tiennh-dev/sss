import { OrderPaysRequest } from './../../../models/request/order.request';
import { OrderList, OrderJTable } from './../../../models/model/order.model';
import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { merge, of } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';
import { UtilityService } from 'src/app/services/utility.service';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { OrderPaymentsRequest } from 'src/app/models/request/order.request';
import { OrderBuyForYouService } from 'src/app/services/order.buyforyou.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { OrderAuctionService } from 'src/app/services/order.auction.service';
import { WaitingOrderAuctioAucService } from 'src/app/services/waitingorderautionauc.service';
import { OrderPaymentApprovalService } from 'src/app/services/orderpaymentapproval.service';

@Component({
  selector: 'app-payments-approvalmulti',
  templateUrl: './paymentapprovalmulti.component.html'
})

export class PaymentApprovalMultiComponent implements OnInit {
  @Input() orderIds;
  @BlockUI('blockui') blockUI: NgBlockUI;
  public listData: any[] = [];
  public paymentPercents: any[] = [];
  public paymentPercent: number;
  public description:'';
  private refresh: EventEmitter<any> = new EventEmitter<any>();

  public get debtVND(): number {
    return this.listData.reduce((accumulator, item) => accumulator + item.originalItem.orderPaymentDetail.debtVND, 0);
  }

  public get amountVND(): number {
    return this.listData.reduce((accumulator, item) => accumulator + item.originalItem.orderPaymentDetail.amountVND, 0);
  }

  public get totalDepositVND(): number {
    return this.listData.reduce((accumulator, item) => accumulator + item.originalItem.orderPaymentDetail.totalDepositVND, 0);
  }

  public get totalAmountPaymentByPercent(): number {
    return this.listData.reduce((accumulator, item) => {
      const amountPayment = item.originalItem.orderPaymentDetail.percentPayments[this.paymentPercent];

      return accumulator + amountPayment;
    }, 0);
  }

  constructor(public activeModal: NgbActiveModal,
    private _service: OrderPaymentApprovalService,
    private utility: UtilityService, ) {
  }

  ngOnInit() {
    merge(this.refresh)
      .pipe(
        startWith({}),
        switchMap(() => {
          const request: OrderPaymentsRequest = {
            ids: this.orderIds.length > 0 ? this.orderIds : null
          };
          return this._service.getOrderPayments(request);
        }),
        catchError(() => {
          this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);

          return of(this.listData[0]);
        })
      ).subscribe(response => {
        this.listData = response.data;
        this.paymentPercents = this.getPercents(response.data);

        if (this.paymentPercents && this.paymentPercents.length > 0) {
          this.paymentPercent = this.paymentPercents[5];
        }

        this.listData = this.listData.map((item) => {
          return {
            code: item.code,
            orderDateDisplay: item.orderDateDisplay,
            fullName: item.fullName + '[' + item.accountName + ']',
            shippingFee: item.shippingFee,
            exchangeRate: item.exchangeRate,
            buyFee: item.buyFee,
            paid: item.paid,
            total: item.total,
            status: "Tạm ứng",
            state: item.state == 'DON_MOI' ? "Đơn mới" : item.state == 'CHO_XU_LY_HUY_DON' ? "Chờ hủy đơn" : item.state == 'DA_HUY_DON' ? "Đã hủy đơn" : item.state == 'KET_THUC_DON_HANG' ? "Kết thúc đươn hàng" : item.state == 'CHO_XU_LY_TAM_UNG' ? "Chờ xử lý tạm ứng" : item.state == 'CHO_MUA_HANG' ? "Chờ mua hàng" : item.state == 'DA_MUA_HANG' ? "Đã mua hàng" : item.state == 'CHO_XL_DE_NGHI_TT' ? "Chờ xử lý đề nghị thanh toán" :
              item.state == 'CHO_TT_DON_HANG' ? "Chờ thanh toán" : item.state == 'LUU_KHO' ? "Lưu kho" : item.state == 'DA_THANH_TOAN' ? "Đã thanh toán" : item.state == 'DA_GIAO_HANG' ? "Đã giao hàng" : "",
            originalItem: item,
            totalPayByPercent: item.orderPaymentDetail.percentPayments[this.paymentPercent],
            totalPayWait: item.orderPaymentDetail.totalDepositVND - item.paid
          };
        });

      });
  }

  private getPercents(orders: any[]): number[] {
    if (!orders || orders.length === 0) {
      return null;
    }

    const firstItem = orders[0];
    const orderPercentPayments = firstItem.orderPaymentDetail.percentPayments;
    const percentPayments = [];

    for (const item in orderPercentPayments) {
      percentPayments.push(item);
    }

    return percentPayments;
  }

  public formatFrice(input: any) {
    return input != null ? input.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : '';
  }

  public changePaymentPercent(): void {
    this.listData.forEach(item => {
      item.totalPayByPercent = item.originalItem.orderPaymentDetail.percentPayments[this.paymentPercent];
      item.totalPayWait = item.originalItem.orderPaymentDetail.totalDepositVND - item.paid;
    });
  }

  public confirmPaymentOrders(): void {
    const request: OrderPaysRequest = {
      orderIds: this.orderIds,
      minPayment: this.paymentPercent,
      description:this.description
    };
    this.utility.showProcessing(this.blockUI);
    this._service.payOrders(request).subscribe(response => {
      this.utility.cancelProcessing(this.blockUI);
      if (!response.status) {
        this.utility.showError(response.errorCode, response.parameters);

        return;
      }
      this.utility.showMessage('Thanh toán đơn hàng theo lô thành công');
      this.activeModal.close('');
      this.refresh.emit();
    });
  }
}
