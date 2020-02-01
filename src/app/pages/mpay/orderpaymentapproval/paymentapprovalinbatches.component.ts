import { OrderPaysRequest, OrderWorkflowManyRequest, OrderMessageGetByOrderIdRequest } from './../../../models/request/order.request';
import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { merge, of } from 'rxjs';
import * as model from '../../../models/model/order.model';
import { startWith, switchMap, catchError, map } from 'rxjs/operators';
import { UtilityService } from 'src/app/services/utility.service';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { OrderPaymentsRequest } from 'src/app/models/request/order.request';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { OrderPaymentApprovalService } from 'src/app/services/orderpaymentapproval.service';

@Component({
  selector: 'app-payments-approval-batches',
  templateUrl: './paymentapprovalinbatches.component.html'
})

export class PaymentApprovalBatchesComponent implements OnInit {
  @Input() lstOrderId;
  @BlockUI('blockui') blockUI: NgBlockUI;
  public listData: any[] = [];
  public paymentPercents: any[] = [];
  public paymentPercent: number;
  public orderMessages: model.OrderMessage[];
  public description:'';
  private refresh: EventEmitter<any> = new EventEmitter<any>();
  public orderWorkflowRequest: OrderWorkflowManyRequest = {
    id: null,
    message: ''
};

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
            ids: this.lstOrderId.length > 0 ? this.lstOrderId : null
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
 

 approvePaymentOrderDoneMulti(): void {
    merge()
    .pipe(
        startWith({}),
        switchMap(() => {
            this.orderWorkflowRequest.id = this.lstOrderId;
            this.utility.showProcessing(this.blockUI);
            return this._service.approvePaymentOrderMulti(this.orderWorkflowRequest);
        }),
        catchError(() => {
            this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);

            return of(null);
        })
    )
    .subscribe(response => {
      this.utility.cancelProcessing(this.blockUI);
        if (response.succeeded) {
            this.orderWorkflowRequest.message = '';

            this.utility.showMessage("Duyệt đề nghị thanh toán thành công!");
        } else {
            this.utility.showErrorMessage("Duyệt đề nghị thanh toán không thành công!");
        }
        this.activeModal.close('');
    });
  }
}
