import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderAuctionService } from 'src/app/services/order.auction.service';
import { merge, of } from 'rxjs';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import * as model from '../../../models/model/order.model';
import { OrderList } from '../../../models/model/order.model';
import { UtilityService } from 'src/app/services/utility.service';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { OrderWorkflowManyRequest, OrderMessageGetByOrderIdRequest } from 'src/app/models/request/order.request';
import { PurchaseAuctionService } from 'src/app/services/purchase.auction.service';
import { ApprovalOrderService } from 'src/app/services/approval.order.service';
import { WaitingApprovalOrderService } from 'src/app/services/waitingapprovalorder.service';

@Component({
  selector: 'app-acceptwaiting-approval-multi',
  templateUrl: './acceptwaitingapprovalmulti.component.html'
})

export class AcceptWaitingApprovalMultiComponent implements OnInit {
    @Input() listOrderId;
    public listData: any[] = [];
    public orderWorkflowManyRequest: OrderWorkflowManyRequest = {
        id: null,
        message: ''
      };
  constructor(public activeModal: NgbActiveModal, private utility: UtilityService,
    private orderService: WaitingApprovalOrderService) {

  }
  ngOnInit() {
    merge()
    .pipe(
      startWith({}),
      switchMap(() => {
        const request: OrderList = {
          Id: this.listOrderId.length > 0 ? this.listOrderId : null
        };
        return this.orderService.getListOrder(request);
      }),
      catchError(() => {
        this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);
        return of(this.listData[0]);
      })
    ).subscribe(response => {
      this.listData = response.data;
      console.log(response.data);
      this.listData = this.listData.map((item) => {
        return {
          code: item.code,
          orderDateDisplay: item.orderDateDisplay,
          fullName: item.fullName + '[' + item.accountName + ']',
          shippingFee: item.shippingFee,
          exchangeRate: item.exchangeRate,
          buyFee: item.buyFee,
          total:item.total,
          paid:item.paid,
          status: "Tạm ứng",
          state: item.state == 'DON_MOI' ? "Đơn mới" : item.state == 'CHO_XU_LY_HUY_DON' ? "Chờ hủy đơn" : item.state == 'DA_HUY_DON' ? "Đã hủy đơn" : item.state == 'KET_THUC_DON_HANG' ? "Kết thúc đươn hàng" :item.state == 'CHO_XU_LY_TAM_UNG' ? "Chờ xử lý tạm ứng" : item.state == 'CHO_MUA_HANG' ? "Chờ mua hàng" : item.state == 'DA_MUA_HANG' ? "Đã mua hàng" : item.state == 'CHO_XL_DE_NGHI_TT' ? "Chờ xử lý đề nghị thanh toán" :
              item.state == 'CHO_TT_DON_HANG' ? "Chờ thanh toán" : item.state == 'LUU_KHO' ? "Lưu kho" : item.state == 'DA_THANH_TOAN' ? "Đã thanh toán" : item.state == 'DA_GIAO_HANG' ? "Đã giao hàng" :""
        }
      })
    });
  }

  public collectionIsEmpty(values: any[]): boolean {
    return !values || values.length === 0;
  }

  public formatFrice(input:any){
    return input!=null ?  input.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : '';
  }

  requestApprove(): void {
    merge()
      .pipe(
        startWith({}),
        switchMap(() => {
          this.orderWorkflowManyRequest.id = this.listOrderId
          return this.orderService.RequestApproveMany(this.orderWorkflowManyRequest);
        }),
        catchError(() => {
          this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);
          return of(this.listData[0]);
        })
      ).subscribe(response => {
        if (response.succeeded) {
          this.orderWorkflowManyRequest.message = '';
          this.utility.showMessage('Yêu cầu duyệt tạm ứng thành công!');
          this.activeModal.close('');
        } else {
          this.utility.showErrorMessage('Yêu cầu duyệt tạm ứng không thành công!');
          this.activeModal.close('');
        }
      });
  }
}

