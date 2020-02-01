import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, AfterViewInit, Input, EventEmitter } from '@angular/core';
import { of, Subject, merge } from 'rxjs';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
// -----------------------
import * as model from '../../../models/model/deposits.model';
import * as req from '../../../models/request/deposits.request';
import * as modelCus from '../../../models/model/customer.model';
import { DepositsService } from 'src/app/services/deposits.service';
import { UtilityService } from 'src/app/services/utility.service';
import { ConfigSetting, Actions, MenuContextDefine2, PermissionCommon } from 'src/app/common/config-setting';
import { startWith, switchMap, map, catchError, retry } from 'rxjs/operators';
import { CustomerListResponse } from 'src/app/models/response/customer.response';
// import { ConfirmStatusComponent } from './confirm-status.component';
import * as moment from 'moment';
import { ConfirmationDialogService } from 'src/app/services/confirmation-dialog.service';
import { OrderDeposits } from 'src/app/common/config-setting';
import { saveAs } from 'file-saver'; 
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { PermissionService } from 'src/app/services/permission.service';
import { RefundTransactionService } from 'src/app/services/refundtransaction.service';
import { RefundTransactionProcessingComponent } from './refundtransaction.process.component';
import { RefundTransactionCustomerInfoComponent } from './RefundTransactionCustomerInfo.component';
import { WorkflowRefundTransactionComponent } from './WorkflowRefundTransaction.component';
import { RefundTransactionStatusComponent } from './refundtransactionconfirm-status.component';

@Component({
  selector: 'app-deposits',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})
export class IndexComponent implements AfterViewInit, OnDestroy, OnInit {
  @BlockUI('blockui') blockUI: NgBlockUI;
  public dtTrigger: Subject<any> = new Subject();
  private refresh: EventEmitter<any> = new EventEmitter<any>();
  // Public
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: any = {};
  private searchCustomer = '';
  public data: model.DepositsJTable[];
  public stateList: any[] = OrderDeposits.orderDepositsState;
  public search_state = [];
  public pageLength: number;
  public listCustomer: CustomerListResponse;
  public customerList: any[] = [];
  public accountId: any;
  public depositSt: any;
  public bankNumber: any;
  public ftCode:any;
  public bankDescription: any;
  public startTime: Date;
  public endTime: Date;

  constructor(
    private ctService: RefundTransactionService,
    private utility: UtilityService,
    private modalService: NgbModal,
    private confirmService: ConfirmationDialogService,
    private permissionService: PermissionService
  ) {
    this.permissionService.ResourceKey="REFUNDTRANSACTION";
    this.search_state = [];
    this.pageLength = 50;
  }

  ngOnInit() {
    let tblToolbar=[];
    tblToolbar.push({
      extend: 'print', text: '<i class="icofont icofont-print"></i> In', title: 'Hoàn tiền'
    });
    tblToolbar.push({
      extend: 'excel', text: '<span data-action-target="button" data-action='+Actions.EXPORT+'><i class="icofont icofont-file-excel"></i> Xuất Excel</span>',
      action: () => {
        this.exportExcel();
      },
      title: 'Nạp tiền',
    }); 
    tblToolbar.push({
      extend: 'colvis', text: '<i class="icofont icofont-table"></i> Cột hiển thị',
      columnText: function (dt, idx, title) {
        return (idx + 1) + ' : ' + title;
      }
    });
    this.loadListCustomer();
    this.dtOptions = {
      language: {
        'sLengthMenu': '_MENU_',
      },
      pagingType: 'full_numbers',
      pageLength: this.pageLength,
      serverSide: true, order: [0, false],
      processing: true,
      searching: false,
      ajax: (tblSearch: any, callback) => {
        tblSearch.accountId = this.accountId;
        tblSearch.depositSt = this.depositSt;
        tblSearch.state = this.search_state.length > 0 ? this.search_state : null;
        tblSearch.bankDescription = this.bankDescription;
        tblSearch.bankNumber = this.bankNumber;
        tblSearch.startTime = this.startTime;
        tblSearch.endTime = this.endTime;
        tblSearch.ftCode = this.ftCode;
        // tblSearch.order = new [] {tblSearch.order[0].column, tblSearch.order[0].dir};
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
        { data: 'AccountName', title: 'Khách hàng', orderable: false },
        { data: 'WalletId', title: 'Tên ví',className:'w70' },
        {
          data: 'FTCode', title: 'Mã FT',className:'w110',
          render: function (data: any, type: any, item: any) {
              return data;
          }
        },
        {
          data: 'Amount', title: 'Số tiền',
          render: function (data: any, type: any, item: any) {
            return data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
          }
        },
        { data: 'AccountId', title: 'Mã TK Khách', visible: false, orderable: false },
        {
          data: 'BankName', title: 'Tên ngân hàng', visible: false,
          render: function (data: any, type: any, item: any) {
            if (data == null || data === '') {
              return '';
            } else {
              return data;
            }
          }
        },
        { data: 'BankDescription', title: 'Mô tả',className:'w200' },
        {
          data: 'BankNumber', title: 'Số tài khoản',
          render: function (data: any, type: any, item: any) {
            if (data == null || data === '') {
              return '';
            } else {
              return data;
            }
          }
        },
        {
          data: 'PayImage', title: 'Bằng chứng',className:'w100',
          render: function (data: any, type: any, item: any) {
            if (data !== '' && data !== null) {
              const image_preview = ConfigSetting.buildUrlWithBaseCDN(data);
              return `<a href="` + image_preview + `" target="_blank">
              <img alt="u-logo" class="img-list img-fluid" src="` + image_preview + `"/></a>`;
            }
            return ``;
          }
        },
        {
          data:'Note',title:'Ghi chú',className:'mw100',
          render:function(data:any,type:any,item:any){
            if(data!=null){
              return data;
            }else{
              return '';
            }
          }
        },
        {
          data: 'CreateByString', title: 'Người tạo',orderable: false, visible: false,
        },
        {
          data: 'CreatedDate', title: 'Ngày tạo',
          render: function (data: any, type: any, item: any) {
            return moment.utc(data).local().format('DD/MM/YYYYY HH:mm:ss');
          }
        },
        {
          data: 'BankDate', title: 'Ngày nhận tiền',
          render: function (data: any, type: any, item: any) {
            if(data != null && data != ''){
              return moment.utc(data).local().format('DD/MM/YYYYY');
            }
           return "";
          }
        },
        {
          data: 'ModifiedDate', title: 'Ngày sửa',visible: false,
          render: function (data: any, type: any, item: any) {
            if(data != null && data != ''){
              return moment.utc(data).local().format('DD/MM/YYYYY HH:mm:ss');
            }
           return "";
          }
        },
        {
          data: 'PayStatus', title: 'TT thanh toán', orderable: false,
          render: function (data: any, type: any, item: any) {
            if (data === '0') {
              return `<span class="badge badge-warning">Đang xử lý</span>`;
            }
            if (data === '1') {
              return `<span class="badge badge-success">Đã thanh toán</span>`;
            }
            if (data === '2') {
              return `<span class="badge badge-danger">Đã hủy</span>`;
            }
          }
        },
        {
          data: 'ConfirmStatus', title: 'Xác nhận', orderable: false, visible: false,
          render: function (data: any, type: any, item: any) {
            if (data === '0') {
              return `<span class="badge badge-warning">Chưa xác nhận</span>`;
            } else {
              return `<span class="badge badge-info">Đã xác nhận</span>`;
            }
          }
        },
        {
          data: 'DepositStatus', title: 'TT nạp tiền', orderable: false,
          render: function (data: any, type: any, item: any) {
            if (data === '0') {
              return `<span class="badge badge-warning">Chờ xử lý</span>`;
            } else if (data === '1') {
              return `<span class="badge badge-info">Đã nạp tiền</span>`;
            } else if (data === '2') {
              return `<span class="badge badge-danger">Huỷ nạp tiền</span>`;
            }
            return '';
          }
        },
        {
          data: 'State', title: 'TT xử lý', orderable: false,
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
              return `<span class="badge badge-danger">Huỷ nạp tiền</span>`;
            }
            if (data === 'AUTO') {
              return `<span class="badge badge-info">Tự động xử lý</span>`;
            }
            return '';
          }
        },
        {
          data: 'ProcessDate', title: 'Thời gian xử lý', orderable: false, visible: false,
          render: function (data: any, type: any, item: any) {
            if (data != null && data !== '') {
              return moment.utc(data).local().format('DD/MM/YYYYY HH:mm:ss');
            } else {
              return `N/A`;
            }
          }
        },
      ],
      rowCallback: (row: Node, data: model.DepositsJTable, index: number) => {
        const self = this;
        $(row).attr('id', 'deposit_row_' + data.Id);
        this.bindFTCodeEvent(row,data.Id);
        if (data.PayStatus === 0 && data.ConfirmStatus === 0) {
          let menuItemDefines: MenuContextDefine2[] = [
            { key: 'confirm-status',  name: 'Xử lý đơn hàng', icon: 'fa-retweet', permissionAction: Actions.ACCESS },
          ];  
          let menuItems = PermissionCommon.createMenuItems(this.permissionService, menuItemDefines); 
          $.contextMenu({
            selector: '#' + 'deposit_row_' + data.Id,
            build: function ($triggerElement, e) {
              return {
                callback: function (key, options) {
                  if (key === 'confirm-status') {
                    // tslint:disable-next-line: max-line-length
                    // const str = +data.ConfirmStatus === 0 ? 'Xác thực nạp tiền của khách hàng ' + data.AccountName : 'Hủy xác thực nạp tiền của khách hàng ' + data.AccountName;
                    // self.confirmService.confirm('Hành động', str )
                    //   .then(function (confirmed) {
                    //     confirmed ? self.confirmStatusDeposit(data.Id) : self.confirmService.close();
                    //   }).catch(() =>
                    //     self.confirmService.close(),
                    //   );

                    const modalRef = self.modalService.open(RefundTransactionStatusComponent);
                    modalRef.componentInstance.itemId = data.Id;
                    modalRef.componentInstance.title = data.AccountName;
                    modalRef.result.then((result) => {
                      self.rerender(true);
                    }, (reason) => {
                      self.rerender(true);
                    });
                  }
                  // if (key === 'edit') {
                  //   const modalRef = self.modalService.open(TransactionProcessingdepComponent);
                  //   modalRef.result.then((result) => {
                  //     self.rerender();
                  //   }, (reason) => {
                  //     self.rerender();
                  //   });

                  //   return;
                  // }
                },
                items: menuItems
              };
            }
          });
        }
        if (!(data.PayStatus === 2)) {
          let menuItemDefines: MenuContextDefine2[] = [
            { key: 'Process',  name: 'Xử lý đơn hàng', icon: 'fa-retweet', permissionAction: Actions.ACCESS },
            { key: 'customer',   name: 'Thông tin khách hàng', icon: 'fa-user' , permissionAction: Actions.ACCESS },
            { key: 'workflow', name: 'Quy trình xử lý', icon: 'fa-recycle', permissionAction: Actions.ACCESS },
          ];  
          let menuItems = PermissionCommon.createMenuItems(this.permissionService, menuItemDefines); 
          $.contextMenu({
            selector: '#' + 'deposit_row_' + data.Id,
            build: function ($triggerElement, e) {
              return {
                callback: function (key, options) {
                  if (key === 'Process') {
                    const modalRef = self.modalService.open(RefundTransactionProcessingComponent, { size: 'lg' });
                    modalRef.componentInstance.itemId = data.Id;
                    modalRef.componentInstance.AccountId = data.AccountId;
                    modalRef.result.then((result) => {
                      self.rerender(false);
                    }, (reason) => {
                    });

                    return;
                  }
                  if (key === 'workflow') {
                    const modelRef = self.modalService.open(WorkflowRefundTransactionComponent, { size: 'lg' });
                    modelRef.componentInstance.itemId = data.Id;
                    modelRef.result.then((result) => {
                    }, (reason) => {
                    });
                  }
                  if (key === 'customer') {
                    const modelRef = self.modalService.open(RefundTransactionCustomerInfoComponent, { size: 'lg' });
                    modelRef.componentInstance.itemId = data.AccountId;
                    modelRef.result.then((result) => {
                    }, (reason) => {
                    });
                    return;
                  }
                },
                items: menuItems
              };
            }
          });
        }
        return row;
      },
      buttons:tblToolbar
    };
  }

  bindFTCodeEvent(row: Node, id: number) {
    const $element = $('[data-FTCode]', row);
    const _this = this;
    $element.unbind('change').change(function (event) {
      const ftCode = $('[data-FTCode]', row).val();
     _this.saveFTCode(id, ftCode.toString());
    });
  }

  exportExcel():void{
    merge()
    .pipe(
      startWith({}),
      switchMap(()=>{
        var request: any={
          AccountId:this.accountId,
          BankDescription:this.bankDescription,
          BankNumber:this.bankNumber,
          DepositSt:this.depositSt,
          EndTime:this.endTime,
          StartTime:this.startTime,
          state:this.search_state.length > 0 ? this.search_state : null
        }
        this.utility.showProcessing(this.blockUI);
        return this.ctService.exportExcel(request);
      }),
      catchError(() => {
        // TODO: show error.
        this.utility.cancelProcessing(this.blockUI);
        this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
          null);

        return of(model.DepositsList[0]);
      })
    ).subscribe(response=>{  
      this.utility.cancelProcessing(this.blockUI);
      let mediaType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; 
      let blob = new Blob([response], { type: mediaType });
      let filename = 'DepositData.xlsx';
      saveAs(blob, filename);
    })
  }

  saveFTCode(id:number,ftCode:string):void{
    merge()
    .pipe(
      startWith({}),
      switchMap(()=>{
        return this.ctService.updateFTCode(id,ftCode);
      }),
      map(response => {
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

        return of(model.DepositsList[0]);
      })
    ).subscribe(response=>{
        if(!response.status){
          this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
            null);
        }
        this.utility.showMessage("Update succesfully")
    })
  }

  cancelPayment(id: number) {
    if (id == null || id === undefined) {
      return this.utility.showError(ErrorCodeDefine.OBJECT_NULL);
    }
    this.ctService.cancelPayment(id).subscribe(response => {
      if (!response.status) {
        return this.utility.showError(response.errorCode, response.parameters);
      }
      return this.utility.showMessage('Hủy thanh toán thành công');
    });
  }
  loadListCustomer(): void {
    merge(this.refresh)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.customerList = [];
          const request: req.DepositsListTopRequest = {
            keyword: this.searchCustomer,
            limit: 20
          };
          return this.ctService.getListCustomer(request);
        }),
        map(response => {
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

          return of(modelCus.CustomerList[0]);
        })
      ).subscribe(res => {
        if (res !== undefined) {
          this.customerList = res.data.map((i) => {
            if (i.username == null) {
              i.username = '';
            } else {
              i.username = ' ( ' + i.username + ' ) ';
            }
            if (i.idName == null) {
              i.idName = '';
            } else {
              i.idName = ' ( ' + i.idName + ' ) ';
            }

            if (i.idName !== '') {
              i.fName = i.fullname + i.idName;
              return i;
            } else if (i.username !== '') {
              i.fName = i.fullname + i.username;
              return i;
            } else {
              i.fName = i.fullname;
              return i;
            }
          });
        }
      });
  }

  // filterDeposits(): void {
  //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
  //     dtInstance.destroy();
  //     this.dtTrigger.next();
  //   });
  // }

  searchAutoCompeleteCustomer(e: { term: string; }) {
    this.searchCustomer = e.term;
    this.refresh.emit();
  }


  // confirmStatusDeposit(itemId: number): void {
  //   if (itemId === undefined) {
  //     this.utility.showError(ErrorCodeDefine.OBJECT_NULL);
  //   }
  //   if (itemId <= 0) {
  //     this.utility.showError(ErrorCodeDefine.ID_MUST_GT_0);
  //     return;
  //   }
  //   this.ctService.getDetail(itemId)
  //     .subscribe(response => {
  //       if (!response.status) {
  //         this.utility.showMessage('Get info detail failed');
  //         return;
  //       }
  //       const stt = +response.data.confirmStatus;
  //       response.data.confirmStatus = stt === 1 ? 0 : 1;
  //       this.ctService.confirmStatus(response.data)
  //         .subscribe(res => {
  //           if (!res.status) {
  //             return;
  //           }
  //           this.utility.showMessage(response.data.confirmStatus === 1 ? 'Xác thực thành công !' : 'Hủy xác thực thành công !');
  //           this.rerender();
  //         });
  //     }, () => {
  //       this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR);
  //     });
  // }

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

  filterCreateDeposite(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

}


