import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, AfterViewInit, Input, EventEmitter } from '@angular/core';
import { of, Subject, merge } from 'rxjs';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
// -----------------------
import * as model from '../../../models/model/payment.model';
import { PaymentService } from 'src/app/services/payment.service';
import { UtilityService } from 'src/app/services/utility.service';
import * as moment from 'moment';
import { CustomerListTopRequest } from 'src/app/models/request/customer.request';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { TransactionProcessingComponent } from './payment.process.component';
import { WorkflowPaymentComponent } from './workflowpayment.component';
import { OrderPayment, PaymentRefType, Actions, MenuContextDefine2, PermissionCommon } from 'src/app/common/config-setting';
import { AddPaymentComponent } from '../payment/addpayment.component';
import { OrderInfomationComponent } from './orderinfomation.component';
import { CustomerInfoComponent } from './customer-info.component';
import { RefundComponent } from './refund.component';
import { PermissionService } from 'src/app/services/permission.service';
import { PaymentUpdatePriorityRequest } from 'src/app/models/request/paymentupdatepriority.Request';


@Component({
  selector: 'app-payment',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})
export class IndexComponent implements AfterViewInit, OnDestroy, OnInit {
  public dtTrigger: Subject<any> = new Subject();
  private refresh: EventEmitter<any> = new EventEmitter<any>();
  public searchCustomer = '';
  // Public
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: any = {};
  public data: model.PaymentJTable[];
  public stateList: any[] = OrderPayment.orderPaymentState;
  public search_state = [];
  public search_status = null;
  public pageLength: number;
  public customerList: any[] = [];
  public lstrequest: any[] = [];
  public accountId = '';
  public paymentForm: '';
  public refCode = '';
  public paymentType: '';
  public startTime: Date;
  public endTime: Date;
  public description: '';
  public lstpaymentForm = [
    { value: 'WALLET', name: 'WALLET' },
    { value: 'BANKING', name: 'BANKING' },
    { value: 'ATM', name: 'ATM' },
    { value: 'CASH', name: 'CASH' },
  ];
  public lstpaymentType = [
    { value: 'PAY_ORDER', name: 'PAY_ORDER' },
    { value: 'CANCEL_ORDER', name: 'CANCEL_ORDER' }
  ];
  public statusList = [
    { value: 0, name: 'Chờ xử lý' },
    { value: 1, name: 'Đã thanh toán' },
    { value: 2, name: 'Hủy thanh toán' },
    { value: 3, name: 'Chờ thanh toán' },
  ]


  constructor(
    private modalService: NgbModal,
    private ctService: PaymentService,
    private utility: UtilityService,
    private permissionService: PermissionService
  ) {
    this.permissionService.ResourceKey = "PAYMENT";
    this.pageLength = 50;
    this.search_state = [];
    this.search_status = null;
  }

  ngOnInit() {
    let tblToolbar = [];
    tblToolbar.push({
      extend: 'print', text: '<i class="icofont icofont-print"></i> In', title: 'Approval'
    });
    tblToolbar.push({
      extend: 'excel', text: '<span data-action-target="button" data-action=' + Actions.EXPORT + '><i class="icofont icofont-file-excel"></i> Xuất Excel</span>',
      exportOptions: {
        modifier: {
          page: 'current'
        }
      },
      title: 'Approval',
    });
    tblToolbar.push({
      extend: 'colvis', text: '<i class="icofont icofont-table"></i> Cột hiển thị',
      columnText: function (dt, idx, title) {
        return (idx + 1) + ' : ' + title;
      }
    });
    tblToolbar.push({
      text: '<i  class="icofont icofont-ui-add"></i> Thêm thông tin thanh toán',
      key: 'a', shiftKey: true,
      action: (e, dt, node, config) => {
        const modalRef = this.modalService.open(AddPaymentComponent);
        modalRef.result.then((result) => {
          this.rerender(false);
        }, (reason) => {
        });
      }
    });
    merge(this.refresh)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.customerList = [];
          const request: CustomerListTopRequest = {
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

          return of(model.PaymentList[0]);
        })
      ).subscribe(res => {
        if (res !== undefined && res.data != null) {
          this.customerList = res.data.map((e, i) => {
            if (e.username != null && e.fullname != null) {
              e.fName = e.fullname + '- [ ' + e.username + ' ]';
              return e;
            }
          });
        }
      });
    this.dtOptions = {
      language: {
        'sLengthMenu': 'Xem_MENU_Mục ',
      },
      pagingType: 'full_numbers',
      pageLength: this.pageLength,
      serverSide: true,
      processing: true,
      searching: false,
      order: [17, 'desc'],
      ajax: (tblSearch: any, callback) => {
        tblSearch.paymentForm = this.paymentForm;
        tblSearch.paymentType = this.paymentType;
        tblSearch.description = this.description;
        tblSearch.startTime = this.startTime;
        tblSearch.endTime = this.endTime;
        tblSearch.accountId = this.accountId;
        tblSearch.refCode = this.refCode;
        tblSearch.state = this.search_state.length > 0 ? this.search_state : null;
        tblSearch.status = this.search_status;
        this.ctService.getListJTable(tblSearch)
          .subscribe(response => {
            callback({
              recordsTotal: response.recordsTotal,
              recordsFiltered: response.recordsFiltered,
              draw: response.draw,
              data: response.data
            });
          }, () => { });
      },
      dom: 'Blfrtip',
      columns: [
        { data: 'Id', title: 'Id', visible: false },
        { data: 'FullName', title: 'Tên khách hàng' },
        { data: 'AccountName', title: 'Tài khoản' },
        { data: 'PaymentForm', title: 'Hình thức TT', visible: false },
        {
          data: 'PaymentType', title: 'Loại thanh toán',
          render: function (data: any, type: any, item: any) {
            if (item.RefType == PaymentRefType.ORDER) {
              return '<a class="" href="javascript:void(0)" data-info>  ' + data + '</a>';
            } else {
              return data;
            }

          }
        },
        { data: 'RefCode', title: 'Mã đơn hàng' },
        {
          data: 'Amount', title: 'Số tiền',
          render: function (data: any, type: any, item: any) {
            return data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
          }
        },
        { data: 'Description', title: 'Mô tả' },
        {
          data: 'CreateByString', title: 'Người tạo', orderable: false, visible: false,
        },
        {
          data: 'CreatedDate', title: 'Ngày tạo',
          render: function (data: any, type: any, item: any) {
            return moment.utc(data).local().format('DD/MM/YYYYY HH:mm:ss');
          }
        },
        {
          data: 'Priority', title: 'Ưu tiên', orderable: false,
          render: function (data: any, type: any, item: any) {
            if (item.Status == 3) {
              if (item.Priority == "True") {
                return ` <div class="checkbox" style="float:right;"><input type="checkbox"  id="checkbox-primary-'${item.Id}'" checked  data-items /><label for="checkbox-primary-'${item.Id}'" style=" float:right; padding-right: 15px; margin-top: 3px;"></label></div>`
              } else {
                return ` <div class="checkbox" style="float:right;"><input type="checkbox"  id="checkbox-primary-'${item.Id}'"  data-items /><label for="checkbox-primary-'${item.Id}'" style=" float:right; padding-right: 15px; margin-top: 3px;"></label></div>`
              }
            } else {
              return "";
            }
          }
        },
        {
          data: 'ModifiedDate', title: 'Ngày sửa', visible: false,
          render: function (data: any, type: any, item: any) {
            if (data != null && data != '') {
              return moment.utc(data).local().format('DD/MM/YYYYY HH:mm:ss');
            }
            return "";
          }
        },
        {
          data: 'Status', title: 'Trạng thái',
          render: function (data: any, type: any, item: any) {
            if (data == 0) {
              return `<span class="badge badge-warning">Chờ xử lý</span>`;
            }
            if (data == 1 && item.Refund != 'True') {
              return `<span class="badge badge-success">Đã thanh toán</span>`;
            }
            if (data == 1 && item.Refund === 'True') {
              return `<span class="badge badge-danger">Đã hoàn tiền</span>`;
            }
            if (data == 2) {
              return `<span class="badge badge-danger">Hủy thanh toán</span>`;
            }
            if (data == 3) {
              return `<span class="badge badge-info">Chờ thanh toán</span>`;
            }
          }
        },
        {
          data: 'State', title: 'TT xử lý',
          render: function (data: any, type: any, item: any) {
            if (data === 'KHOI_TAO') {
              return `<span class="badge badge-warning">Khởi tạo</span>`;
            }
            if (data === 'DA_DUYET_CAP_1') {
              return `<span class="badge badge-info">Đã duyệt cấp 1</span>`;
            }
            if (data === 'DA_DUYET_CAP_2') {
              return `<span class="badge badge-info">Đã duyệt cấp 2</span>`;
            }
            if (data === 'DA_DUYET_CAP_3') {
              return `<span class="badge badge-info">Đã duyệt cấp 3</span>`;
            }
            if (data === 'KET_THUC') {
              return `<span class="badge badge-info">Kết thúc</span>`;
            }
            if (data === 'DA_HUY') {
              return `<span class="badge badge-danger">Huỷ thanh toán</span>`;
            }
            if (data === 'AUTO') {
              return `<span class="badge badge-info">Tự động xử lý</span>`;
            }
            return '';
          }
        },
        { data: 'Note', title: 'Ghi chú' },
        { data: 'Ref', title: 'Tham chiếu', visible: false },
        { data: 'RefType', title: 'Kiểu tham chiếu', visible: false },
        {
          data: 'ProcessDate', title: 'Thời gian xử lý', visible: false,
          render: function (data: any, type: any, item: any) {
            if (data != '' && data != null) {
              return moment.utc(data).local().format('DD/MM/YYYYY HH:mm:ss');
            } else {
              return 'N/A';
            }
          }
        },
      ],
      rowCallback: (r: Node, data: model.PaymentJTable, index: number) => {
        const self = this;
        this.chooseItem(r, data);
        $('[data-info]', r).unbind('click').bind('click', () => { this.openorderinfomation(data.Ref, data.AccountId, data.Id); });
        $(r).attr('id', 'Payment_row_' + data.Id);

        // const menuItems = {
        //   'Process': { name: 'Xử lý giao dịch', icon: 'fa-edit' },
        //   'customer': { name: 'Thông tin khách hàng', icon: 'fa-user' },
        //   'workflow': { name: 'Quy trình xử lý', icon: 'fa-recycle' },
        //   // 'refund': { name: 'Hoàn tiền', icon: 'fa-recycle' },
        //   // 'sep1': '---------',
        //   // 'quit': {
        //   //   name: 'Quit', icon: function () {
        //   //     return 'context-menu-icon context-menu-icon-quit';
        //   //   }
        //   // }
        // };

        let menuItemDefines: MenuContextDefine2[] = [
          { key: 'Process', name: 'Xử lý đơn hàng', icon: 'fa-retweet', permissionAction: Actions.ACCESS },
          { key: 'customer', name: 'Thông tin khách hàng', icon: 'fa-user', permissionAction: Actions.ACCESS },
          { key: 'workflow', name: 'Quy trình xử lý', icon: 'fa-recycle', permissionAction: Actions.ACCESS },
        ];
        let menuItems = PermissionCommon.createMenuItems(this.permissionService, menuItemDefines);

        if (data.Status.toString() === '1') {
          menuItems['refund'] = { name: 'Hoàn tiền', icon: 'fa-recycle' };
        }

        $.contextMenu({
          selector: '#' + 'Payment_row_' + data.Id,
          build: function ($triggerElement, e) {
            return {
              callback: function (key, options) {
                if (key === 'Process') {
                  const modelRef = self.modalService.open(TransactionProcessingComponent, { size: 'lg' });
                  modelRef.componentInstance.itemId = data.Id;
                  modelRef.result.then((result) => {
                    self.rerender(false);
                  }, (reason) => {
                    self.rerender(false);
                  });

                  return;
                }
                if (key === 'customer') {
                  const modelRef = self.modalService.open(CustomerInfoComponent, { size: 'lg' });
                  modelRef.componentInstance.itemId = data.AccountId;
                  modelRef.result.then((result) => {
                  }, (reason) => {
                  });
                  return;
                }
                if (key === 'workflow') {
                  const modelRef = self.modalService.open(WorkflowPaymentComponent, { size: 'lg' });
                  modelRef.componentInstance.itemId = data.Id;
                  modelRef.result.then((result) => {
                  }, (reason) => {
                  });
                }
                if (key === 'refund') {
                  const modelRef = self.modalService.open(RefundComponent);
                  modelRef.componentInstance.payment = data;
                  modelRef.result.then((result) => {
                  }, (reason) => {
                  });
                }
              },
              items: menuItems
            };
          }
        });
        return r;
      },
      buttons: tblToolbar
    };
  }
  openorderinfomation(ref: any, accountId: any, id: any): void {
    const modalRef = this.modalService.open(OrderInfomationComponent, { size: 'lg' });
    modalRef.componentInstance.Id = id;
    modalRef.componentInstance.OrderId = ref;
    modalRef.componentInstance.AccountId = accountId;
    modalRef.result.then((result) => {
      this.rerender(false);
    }, (reason) => {
      this.rerender(false);
    });
  }


  chooseItem(r: Node, data: model.PaymentJTable): void {
    const $element = $('[data-items]', r);
    $element.unbind('click').bind('click', (e) => {
      if ((<HTMLInputElement>e.currentTarget).checked) {
        var request: PaymentUpdatePriorityRequest = {
          id: data.Id,
          priority: true
        }
        var request: PaymentUpdatePriorityRequest = {
          id: data.Id,
          priority: true
        }
        this.ctService.UpdatePriority(request).subscribe(response => {
          if (!response.status) {
            this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
              null);
          }
          this.utility.showMessage("Update succesfully")
        });
      } else {
        var request: PaymentUpdatePriorityRequest = {
          id: data.Id,
          priority: false
        }
        this.ctService.UpdatePriority(request).subscribe(response => {
          if (!response.status) {
            this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
              null);
          }
          this.utility.showMessage("Update succesfully")
        });
      }
    });
  }

  searchAutoCompeleteCustomer(e) {
    this.searchCustomer = e.term;
    this.refresh.emit();
  }
  // #region --Render datatable callback--
  // rerender(): void {
  //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
  //     dtInstance.destroy();
  //     this.dtTrigger.next();
  //   });
  // }
  rerender(reset: boolean): void {
    this.dtElement.dtInstance.then(x => x.draw(reset));
  }
  // #endregion

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }


}


