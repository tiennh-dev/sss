// import { ProcessComponent } from './approval.process.component';
import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, AfterViewInit, EventEmitter } from '@angular/core';
import { of, Subject, merge } from 'rxjs';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
// -----------------------
import * as model from '../../../models/model/order.model';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { CustomerService } from 'src/app/services/customer.service';
import { CustomerListResponse } from 'src/app/models/response/customer.response';
import * as modelCus from '../../../models/model/customer.model';
import { PaymentList } from '../../../models/model/order.model';
import { switchMap, startWith, map, catchError } from 'rxjs/operators';
import { UtilityService } from 'src/app/services/utility.service';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { ApprovalOrderService } from 'src/app/services/approval.order.service';
import * as req_cus_model from '../../../models/request/customer.request';
import { OrderState, OrderStatus, OrderRefType, MenuContextDefine2, Actions, PermissionCommon } from 'src/app/common/config-setting';
import { OrderPaidApprovalMultiComponent } from './orderpaidapprovalmulti.component';
import { OrderPaidProcessComponent } from './orderpaid.process.component';
import { OrderPaidCustomerInfoComponent } from './orderpaidcustomer-info.component';
import { OrderPaidWorkflowComponent } from './orderpaidworkflow.component';
import { OrderPaidService } from 'src/app/services/orderpaid.service';
import { PermissionService } from 'src/app/services/permission.service';

@Component({
  selector: 'app-mpay-approval',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal, CustomerService],
})

export class IndexComponent implements AfterViewInit, OnDestroy, OnInit {
  @BlockUI('blockui') blockUI: NgBlockUI;
  public dtTrigger: Subject<any> = new Subject();
  private refresh: EventEmitter<any> = new EventEmitter<any>();
  private searchCustomer = '';
  public yauserName = '';
  public keyWord = '';
  public search_code = null;
  public search_saler = null;
  public search_state = [];
  public search_status = [];
  public shippingId=null;
  public search_refType = null;
  public search_ref = null;
  public auctionId:string=null;
  public search_paid=null;
  public search_accountId = null;
  public startTime: Date;
  public endTime: Date;
  public customerData: CustomerListResponse;
  public paymentData: PaymentList[];
  public statusList: any[] = OrderStatus.orderStateDisplay;
  public stateList: any[] = OrderState.orderStateDisplay;
  public orderBuyList: any[] = OrderRefType.allList;
  public status: number[] = [1, 2, 7];
  public lstOrderId: any[] = [];
  public lstData: any[] = [];
  public statuspaid:any[]=[];
  public pageTotalAmount: string = '';
  public pageTotalAmountVND: string = '';
  // Public
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: any = {};
  public pageLength: number;
  public listCustomer: CustomerListResponse;
  public customerList: any[] = [];
  public employeeBySaler:any[]=[];
  constructor(
    private modalService: NgbModal,
    private utility: UtilityService,
    private orderService: OrderPaidService,
    private permissionService: PermissionService
  ) {
    this.permissionService.ResourceKey="ORDERPAID";
    this.search_status = []; //1, 4, 7
    this.search_state = [OrderState.DA_THANH_TOAN];
    this.search_refType = null;
    this.pageLength = 50;
    this.yauserName = '';
    this.search_accountId = null;
    this.statuspaid=[
      {id:0,name:'Chưa có thanh toán'},
      {id:1,name:'Đã có thanh toán'},
    ]
  }

  ngOnInit() {
    this.onLoadSaler();
    let tblToolbar=[];
    tblToolbar.push({
      extend: 'print', text: '<i class="icofont icofont-print"></i> In', title: 'Approval'
    });
    tblToolbar.push({
      extend: 'excel', text: '<span data-action-target="button" data-action='+Actions.EXPORT+'><i class="icofont icofont-file-excel"></i> Xuất Excel</span>',
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
    merge(this.refresh)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.customerList = [];
          const request: req_cus_model.CustomerListTopRequest = {
            keyword: this.searchCustomer,
            limit: 20
          };
          return this.orderService.getListTopCustomer(request);
        }),
        map(response => {
          if (!response.status) {
            this.utility.showError(response.errorCode,
              response.parameters);
          }
          return response;
        }),
        catchError(() => {
          this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);
          return of(this.customerList[0]);
        })
      ).subscribe(res => {
        if (res !== undefined && res.data != null) {
          this.customerList = res.data.map((e, i) => {
              e.fName = e.fullname + ' [ ' + e.username + ' ]';
              return e;
          });
        }
      });
    this.dtOptions = {
      language: {
        'sLengthMenu':     '_MENU_ ',
        'sSearch':         'Tìm nhanh:',
        'oPaginate': {
            'sFirst':    '<<',
            'sLast':     '>>',
            'sNext':     '>',
            'sPrevious': '<'
        }
    },
      pagingType: 'full_numbers',
      pageLength: this.pageLength,
      serverSide: true, order: [19, 'desc'],
      processing: true, scrollX: true,
      ajax: (tblSearch: any, callback) => {
        tblSearch.accountId = this.search_accountId;
        tblSearch.yauserName = this.yauserName;
        tblSearch.state =   this.search_state.length > 0 ? this.search_state : null;
        tblSearch.code = this.search_code;
        tblSearch.status = this.search_status.length > 0 ? this.search_status : null;
        tblSearch.orderType = this.search_refType;
        tblSearch.auctionId  = this.auctionId;
        tblSearch.shippingFree = this.shippingId;
        tblSearch.saler = this.search_saler;
        tblSearch.paid = this.search_paid;
        let start: any;
        let end: any;
        start = this.startTime;
        end = this.endTime;
        tblSearch.startTime = start !== undefined ? new Date(start.year, (start.month - 1), (start.day + 1), 0, 0) : start;
        tblSearch.endTime = end !== undefined ? new Date(end.year, (end.month - 1), (end.day + 1), 0, 0, 0, 0) : end;
        tblSearch.keyWord = this.keyWord;
        this.orderService.getListJTable(tblSearch)
          .subscribe(response => {
            this.lstData = response.data.filter((m) => {
              return m.State == OrderState.CHO_XU_LY_TAM_UNG;
            }).map((item) => {
              return {
                Id: item.Id,
              }
            });
            let totalAmountVND = response.data.filter(g=> g.AmountVND).reduce((sum , current) => +sum + +current.AmountVND, 0); 
            this.pageTotalAmountVND = totalAmountVND.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + 'đ';
            this.pageLength = response.data.length;
            callback({
              recordsTotal: response.recordsTotal,
              recordsFiltered: response.recordsFiltered,
              draw: response.draw,
              data: response.data,
            });
          }, () => { });
      },
      dom: 'Blfrtip',
      columns: [
        {
          data: 'null', title: `<input type="checkbox" id="select_all" data-all />`, orderable: false, className: 'text-center mw30',
          render: function (data: any, type: any, item: any) {
            if (item.State === OrderState.CHO_XU_LY_TAM_UNG) {
              return `
              <input type="checkbox" class="sub_chk" data-check/>
              `;
            }
            return "";
          }
        },
        {
          className: 'details-control mw30 w30 noVis',
          data: 'Id',
          render: function (data: any, type: any, item: any) {
            return '';
          }, orderable: false
        },
        {
          data: 'Id', title: 'Id', orderable: false, visible: false, className: 'mw100'
        },
        {
          data: 'Code', title: 'Mã đơn hàng', orderable: false, className: 'mw100 w100',
          render: function (data: any, type: any, item: any) {
            return '<a class="p0" href="javascript:void(0)" data-edit>  ' + data + '</a>';
          }
        },
        {
          data: 'Title', title: 'Mô tả', render: function (data: any, type: any, item: any) {
            return data.substring(0, 70) + '...';
          }, orderable: false, className: 'mw250'
        },
        {
          data: 'OrderDate', title: 'Ngày đặt hàng', render: function (data: any, type: any, item: any) {
            return item.OrderDateDisplay;
          }, orderable: false, className: 'mw120'
        },
        {
          data: 'FullName', title: 'Khách hàng', orderable: false, className: 'mw160',
          render: function (data: any, type: any, item: any) {
            return data + '</br>[' + item.AccountName + '] ';
          }
        },
        {
          data: 'Total', title: 'Giá SP + VAT',
          render: function (data: any, type: any, item: any) {
            let total = '';
            let totalVND = '';
            if (data.length > 0) {
              total = data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + ' ¥';
              totalVND = (data * +item.ExchangeRate).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + ' đ';
              return total + ' [' + totalVND + ']';
            } else {
              return '0';
            }
          }, orderable: false, visible: false, className: 'mw100'
        },
        {
          data: 'ShippingFee', title: 'Phí v/c Nhật', visible: false,
          render: function (data: any, type: any, item: any) {
            return data.length > 0 ? (data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '¥') : '';
          }, orderable: false, className: 'mw100'
        },
        {
          data: 'Surcharge', title: 'Phụ phí',
          render: function (data: any, type: any, item: any) {
            return data.length > 0 ? (data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '¥') : '';
          }, orderable: false, className: 'mw90', visible: false
        },
        {
          data: 'ExchangeRate', title: 'Tỉ giá',
          render: function (data: any, type: any, item: any) {
            return data;
          }, orderable: false, className: 'mw80'
        },
        {
          data: 'BuyFee', title: 'Công mua',
          render: function (data: any, type: any, item: any) {
            return data + '%';
          }, orderable: false, className: 'mw80'
        },
        {
          data: 'AmountVND', title: 'Tổng giá trị đơn',  
          render: function (data: any, type: any, item: any) {
            return data.length > 0 ? (data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + 'đ') : '';
          }, orderable: false, className: 'mw120'
        },
        {
          data: 'Paid', title: 'Đã thanh toán',
          render: function (data: any, type: any, item: any) {
            let total = '';
            let percent = '';
            if (data.length > 0) {
              total = data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + ' đ';
              percent = item.PaidPercent + ' %';
              return total + '    [' + percent + ']';
            } else {
              return '0';
            }
            }, orderable: false, className: 'mw130'
        },
        {
          data: 'Weight', title: 'Trọng lượng', orderable: false, visible: false, className: 'mw100'
        },
        {
          data: 'Width', title: 'Kích thước', orderable: false, visible: false, className: 'mw100',
          render: function (data: any, type: any, item: any) {
            return item.Width + 'x' + item.Hight + 'x' + item.Length;
          },
        },
        {
          data: 'ShippingUnitGlobal', title: 'Phí V/C QT', visible: false, 
          render: function (data: any, type: any, item: any) {
            return data.length > 0 ? (data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + 'đ/kg') : '';
          }, orderable: false, className: 'mw100'
        },
        {
          data: 'Status', title: 'TT đơn hàng', render: function (data: any, type: any, item: any) {
            if (data !== null && data !== undefined) {
                return `<span class="badge badge-light">` +  OrderStatus.getDisplayState(Number(data)) + `</span>`;
            }
            return ``;
          }, orderable: false, className: 'mw120'
        },
        {
          data: 'State', title: 'TT Xử lý', render: function (data: any, type: any, item: any) {
            if (data === '') {
              return ` <span class="badge badge-warning">Chờ xử lý</span>`;
            }
            const stateDisplay = OrderState.getDisplayState(data);
            return stateDisplay;
          }, orderable: false, className: 'mw120'
        },
        {
          data:'LastActionDate',title:'Thời gian xử lý',visible:false,className:"w120",
          render: function (data: any, type: any, item: any) {
            return item.LastActionDateDisplay;
          }
        },
        {
          data:'StatusNote',title:'Ghi chú',visible:false,className:"w120"
        },
        {
          data: 'EmpployeeSupport', title: 'Nhân viên hỗ trợ',orderable:false,
        }
      ],
    
      rowCallback: (r: Node, data: model.OrderJTable) => {

        const self = this;
        this.chooseItem(r, data);
        this.chooseAllItem();
        $('[data-edit]', r).unbind('click').bind('click', () => {    this.openProcess(data.Id);    });
        $('td.details-control', r).unbind('click').bind('click', () => {
          const tbrow = self.dtElement.dt.row(r);
          if (tbrow.child.isShown()) {
            tbrow.child.hide();
            $(r).removeClass('shown');
          } else {
            merge()
              .pipe(
                startWith({}),
                switchMap(() => {
                  return this.orderService.getOrderDetailPayment(data.Id, data.AccountId);
                }),
                map(response => {
                  return response;
                })
              ).subscribe(res => {
                tbrow.child(this.subOrder(res.data, data)).show();
              });
            $(r).addClass('shown');
          }
        });

        this.createMenuContext(r, data); 
        return r;
      },
      buttons:tblToolbar
    };
  }
  openProcess(id: any): void {
    const modalRef = this.modalService.open(OrderPaidProcessComponent, { size: 'lg' });
      modalRef.componentInstance.id = id;
      modalRef.result.then((result) => {
      this.rerender(false);
    }, (reason) => {
      this.rerender(false);
    });
  }
  createMenuContext(row: Node, data:  model.OrderJTable): void {
    const self = this;
    const stor = `customer_row_${data.Id}`;
    $(row).attr('id', stor);
    let menuItemDefines: MenuContextDefine2[] = [
      { key: 'edit',  name: 'Xử lý đơn hàng', icon: 'fa-retweet', permissionAction: Actions.ACCESS },
      { key: 'customer',   name: 'Thông tin khách hàng', icon: 'fa-user' , permissionAction: Actions.ACCESS },
      { key: 'workflow', name: 'Quy trình xử lý', icon: 'fa-recycle', permissionAction: Actions.ACCESS },
    ];  
    let menuItems = PermissionCommon.createMenuItems(this.permissionService, menuItemDefines); 
    $.contextMenu({
      selector: '#' + stor,
      build: function ($triggerElement, e) {
        return {
          callback: function (key, options) {
            if (key === 'edit') {
              self.openProcess(data.Id); return;
            }
            if (key === 'customer') {
              const modelRef = self.modalService.open(OrderPaidCustomerInfoComponent, { size: 'lg' });
              modelRef.componentInstance.itemId = data.AccountId;
              modelRef.result.then((result) => {
              }, (reason) => {
              });
              return;
            }
           if (key === 'workflow') {
             const modelRef = self.modalService.open(OrderPaidWorkflowComponent, { size: 'lg' });
             modelRef.componentInstance.itemId = data.Id;
             modelRef.result.then((result) => {
             }, (reason) => {
             });
           }
          },
          items:  menuItems
        };
      }
    });
  }

  rerender(reset: boolean): void {
    this.dtElement.dtInstance.then(x => x.draw(reset));
}

  htmlProductInfo(data: model.OrderDetailPayment, orderData: model.OrderJTable): string {
    let result = '';
    result +=`<div class="card">
              <div class="card-header"  >
                  <h5 class="mb-0">
                      <span class="btn btn-link" data-toggle="collapse"
                                data-target="#orderdetail_products_${orderData.Id}" aria-expanded="true">
                          Thông tin sản phẩm
                      </span>
                  </h5>
              </div>
              <div id="orderdetail_products_${orderData.Id}"  class="collapse show"   data-parent="#acc_orderdetail_${orderData.Id}">
                <div class="card-body">
                  <table class="table">
                  <thead>
                      <tr>
                          <th></th>
                          <th class="mw250" >Sản phẩm</th>
                          <th class="" >Mã sản phẩm</th>
                          <th class="mw100" >Kết thúc</th>
                          <th class="mw100" >Giá</th>
                          <th class="mw70" >Số lượng</th>
                          <th class="mw70" >Thuế</th>
                      </tr>
                  </thead>
                  <tbody>`;
            if (data.orderdetails.length > 0) {
            data.orderdetails.forEach(element => {
              let productLink = orderData.OrderType===OrderRefType.AUCTION ? `https://ichibajp.com/yahoo-auction/${element.productLink}` : element.productLink;
            result += `<tr>
                        <td><a target="_blank" href="${element.previewImage}"><img class="img-list img-fluid" src="${element.previewImage}"/></a></td>
                        <td><a href="${productLink}" target="_blank">${element.productName}</a></td>
                        <td>${element.ref}</td>
                        <td>${element.orderDateStr}</td>
                        <td>${element.price}¥ </td>
                        <td>${element.amount} </td>
                        <td>${element.tax}%</td>
                    </tr>`;
            });
            }
            result +=
                    `</tbody>
                  </table>
                </div>
              </div>
            </div>`
            return result;
   }
   htmlPaymentInfo(data: model.OrderDetailPayment, orderData: model.OrderJTable): string {
    let result = '';
    result +=`<div class="card">
                      <div class="card-header" >
                            <h5 class="mb-0 pull-left">
                                  <span class="btn btn-link" data-toggle="collapse" data-target="#orderdetail_payment_${orderData.Id}" aria-expanded="true"> 
                                  Thông tin thanh toán
                                  </span>
                            </h5>
                      </div>
                      <div id="orderdetail_payment_${orderData.Id}" class="collapse show"   data-parent="#acc_orderdetail_${orderData.Id}">
                           <div class="card-body"> `;
                              if (data.payments.length > 0) {
                                result +=
                                        `<table class="table">
                                        <thead>
                                          <tr>
                                              <th>Hình thức TT</th>
                                              <th>Loại TT</th>
                                              <th>Số tiền</th>
                                              <th>Trạng thái</th>
                                              <th>TT xử lý</th>
                                              <th>Mô tả</th>
                                          </tr>
                                          </thead>
                                          <tbody>`;
                                data.payments.forEach(item => {
                                  result +=
                                          `<tr>
                                                <td>${item.paymentForm + '-' + item.walletId}</td>
                                                <td>${item.paymentType}</td>
                                                <td>${item.amount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}đ</td>
                                                <td>
                                                ${item.status === 1 && (item.refund==null || item.refund==false) ? '<span class="badge badge-success">Đã thanh toán</span>' :
                                                item.status === 1 && item.refund==true ? '<span class="badge badge-danger">Đã hoàn tiền</span>' :
                                                item.status === 0 ? '<span class="badge badge-warning">Chờ xử lý</span>' :
                                                  item.status === 2 ? '<span class="badge badge-danger">Hủy thanh toán</span>' :
                                                  item.status === 3 ? '<span class="badge badge-info">Chờ thanh toán</span>' : ''}
                                                </td>
                                                <td>
                                                ${item.state === 'KHOI_TAO' ? '<span class="badge badge-warning">Khởi tạo</span>' :
                                                  item.state === 'DA_DUYET_CAP_1' ? '<span class="badge badge-warning">Duyệt cấp 1</span>' :
                                                    item.state === 'DA_DUYET_CAP_2' ? '<span class="badge badge-warning">Duyệt cấp 2</span>' :
                                                    item.state === 'DA_DUYET_CAP_3' ? '<span class="badge badge-warning">Duyệt cấp 3</span>' : 
                                                    item.state === 'KET_THUC' ? '<span class="badge badge-warning">Kết thúc</span>' :
                                                    item.state === 'DA_HUY' ? '<span class="badge badge-warning">Hủy thanh toán</span>' :
                                                    item.state === 'AUTO' ? '<span class="badge badge-warning">Tự động xử lý</span>' : ''}
                                                </td>
                                                <td>${item.description}</td>
                                          </tr>`;
                                });
  
                                   result += `</tbody>
                                      </table>`;
                              } else {
                                  result += '<div class="alert alert-info">Chưa có giao dịch thanh toán</div>';
                              }
            result +=
              `</div>
              </div>
              </div>`
            return result;
   }
   htmlCustomerInfo(data: model.OrderDetailPayment, orderData: model.OrderJTable): string {
    let result = '';
    result +=`<div class="card">
                <div class="card-header" >
                        <h5 class="mb-0">
                        <span class="btn btn-link" data-toggle="collapse" data-target="#orderdetail_customer_${orderData.Id}" >
                        Thông tin khách hàng
                        </span>
                        </h5>
                </div>
  
                
                  <div id="orderdetail_customer_${orderData.Id}" class="collapse show"   data-parent="#acc_orderdetail_${orderData.Id}">
                        <div class="row pd10">
                          <div  class="col-sm-12 col-xl-6">
                              <div  class="card">
                                  <div  class="card-header bg-primary"><h5 >Thông tin giao hàng</h5></div>
                                  <div  class="card-body">
                                        <div  class="row">
                                          <div class="col-6">Người nhận:  ${orderData.CustomerName !== undefined ? orderData.CustomerName : ''}</div>
                                          <div class="col-6">Số điện thoại:  ${orderData.CustomerPhone !== undefined ? orderData.CustomerPhone : ''} </div> 
                                          <div class="col-6">Địa chỉ nhận:  
                                              ${orderData.CustomerAddress != null ? orderData.CustomerAddress : ''},
                                              ${orderData.CustomerProvince != null ? orderData.CustomerProvince : ''},
                                              ${orderData.CustomerDistrict != null ? orderData.CustomerDistrict : ''},
                                              ${orderData.CustomerWard != null ? orderData.CustomerWard : ''} 
                                          </div> 
                                        </div>
                                  </div>
                              </div>
                          </div>
  
                          <div  class="col-sm-12 col-xl-6">
                              <div  class="card"> 
                                    <div  class="card-header bg-secondary"><h5 >Thông tin khách hàng</h5></div>
                                    <div  class="card-body">
                                        <div  class="row">
                                            <div class="col-6">Họ và tên:   ${data.customer.fullname !== undefined ? data.customer.fullname :''} </div>
                                            <div class="col-6">Tài khoản:   ${data.customer.username !== undefined ? data.customer.username :''} </div>
                                            <div class="col-6">Số điện thoại:   ${data.customer.phone !== undefined ? data.customer.phone :''} </div>
                                            <div class="col-6">Email:   ${data.customer.email !== undefined ? data.customer.email :''} </div> 
                                        </div> 
                                    </div> 
                              </div> 
                          </div> 
                        </div>
                    </div> 
              </div>`
            return result;
   }

   chooseItem(r: Node, data: model.OrderJTable): void {
    const $element = $('[data-check]', r);
    $element.unbind('click').bind('click', (e) => {
      if ((<HTMLInputElement>e.currentTarget).checked) {
        this.lstOrderId.push(data.Id);
        if(this.lstOrderId.length===this.lstData.length){
          $("#select_all").prop("checked",true);
        }
      } else {
        $("#select_all").prop("checked",false);
        const index: number = this.lstOrderId.indexOf(data.Id);
        if (index !== -1) {
          this.lstOrderId.splice(index, 1);
        }
      }
    });
  }
  chooseAllItem(): void {
    const $element = $('[data-all]');
    $element.unbind('click').bind('click', (e) => {
      if ((<HTMLInputElement>e.currentTarget).checked) {
        $(".sub_chk").prop("checked",true);
        this.lstData.forEach((item,index)=>{
          this.lstOrderId.push(item.Id);
        })
      }else{
        $(".sub_chk").prop("checked",false);
        this.lstOrderId=[];
      }
    });
  }



    subOrder(data: model.OrderDetailPayment, orderData: model.OrderJTable): string {
      let result = '';
      result +=
        `<div id="acc_orderdetail_${orderData.Id}" class="default-according orderdetail">
            ${this.htmlProductInfo(data,orderData)}
            ${this.htmlPaymentInfo(data,orderData)}
            ${this.htmlCustomerInfo(data,orderData)}
        </div>`;
      return result;
    }

 

  filterOrderAuction(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
  searchAutoCompeleteCustomer(e) {
    this.searchCustomer = e.term;
    this.refresh.emit();
  }
  saveChange(): void {
  }

  onLoadSaler():void {
    merge()
    .pipe(
      startWith({}),
      switchMap(() => {
        return this.orderService.getEmployeeBySale();
      }),
      map(response => {
        if (!response.status) {
          this.utility.showError(response.errorCode,
            response.parameters);
        }
        return response;
      }),
      catchError(() => {
        this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);
        return of(null);
      })
    ).subscribe(res => {
      console.log(res);
      this.employeeBySaler=res.data;
    })
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
    // this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //   console.log(dtInstance);
    //   this.pageTotalAmount = dtInstance.column(5, { page: 'current'} )
    //   .data()
    //   .reduce( function (a, b) {
    //     debugger;
    //       return +a + +b;
    //   },0);
    // });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  

}
