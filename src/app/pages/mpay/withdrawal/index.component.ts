import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, AfterViewInit, Input, EventEmitter } from '@angular/core';
import { of, Subject, merge } from 'rxjs';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
// -----------------------
import * as model from '../../../models/model/withdrawal.model';
import * as modelCus from '../../../models/model/customer.model';
import { WithdrawalService } from 'src/app/services/withdrawal.service';
import { UtilityService } from 'src/app/services/utility.service';
import { CustomerListResponse } from 'src/app/models/response/customer.response';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { ConfigSetting, Actions, MenuContextDefine2, PermissionCommon } from 'src/app/common/config-setting';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import * as moment from 'moment';
const URL = ConfigSetting.IMAGE_UPLOAD;
import { ConfirmStatusComponent } from './confirm-status.component';
import { UploadProofImageComponent } from './upload-proofimage.component';
import { AddComponent } from './add.component';
import { transprocesswithdrawalcomponent } from './withdrawal.process.component';
import { WorkflowWithdrawalComponent } from './workflow-withdrawal.component';
import { OrderWithdrawal } from 'src/app/common/config-setting';
import { CustomerInfoComponent } from './customer-info.component';
import { PermissionService } from 'src/app/services/permission.service';
import { CustomerListTopRequest } from 'src/app/models/request/customer.request';

@Component({
  selector: 'app-withdrawal',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})
export class IndexComponent implements AfterViewInit, OnDestroy, OnInit {
  public dtTrigger: Subject<any> = new Subject();
  private refresh: EventEmitter<any> = new EventEmitter<any>();
  // Public
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: any = {};
  public data: model.WithdrawalJTable[];
  public stateList: any[] = OrderWithdrawal.OrderWithdrawalStateDisplay;
  public search_state = [];
  public pageLength: number;
  public listCustomer: CustomerListResponse;
  public customerList:any[]=[];
  public accountId: any;
  public withDrawalStatus: any;
  public bankNumber: any;
  public bankAccountName: any;
  private searchCustomer = '';
  uploader: FileUploader;
  public image_preview = null;
  constructor(
    private _service: WithdrawalService,
    private utility: UtilityService,
    private modalService: NgbModal,
    private permissionService: PermissionService
  ) {
    this.permissionService.ResourceKey="WITHDRAWAL";
    this.pageLength = 50;
    this.search_state = [];
    const token: string = ConfigSetting.GetAuthenToken;
    this.uploader = new FileUploader({
      url: URL, allowedMimeType: ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'],
      autoUpload: true,
      authToken: 'Bearer ' + token
    });
  }

  ngOnInit() {
    this.loadListCustomer();
    let tblToolbar =[]; 
    tblToolbar.push({
      extend: 'print', text: '<i class="icofont icofont-print"></i> In', title: 'Nạp tiền'
    });
    tblToolbar.push({
      extend: 'excel', text: '<span data-action-target="button" data-action='+Actions.EXPORT+'><i class="icofont icofont-file-excel"></i> Xuất Excel</span>',
          exportOptions: {
            modifier: {
              page: 'current'
            }
          },
          title: 'WithDrawal',
    }); 
    tblToolbar.push({
      extend: 'colvis', text: '<i class="icofont icofont-table"></i> Cột hiển thị',
      columnText: function (dt, idx, title) {
        return (idx + 1) + ' : ' + title;
      }
    });
    tblToolbar.push({
      text: '<span data-action-target="button" data-action='+Actions.ACCESS+'><i  class="icofont icofont-ui-add"></i> Rút tiền</span>',
      key: 'a', shiftKey: true,
      action: (e, dt, node, config) => {
        const modalRef = this.modalService.open(AddComponent, { size: 'lg' });
        modalRef.result.then((result) => {
          this.rerender(false);
        }, (reason) => {
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
      order: [0, 'desc'],
      ajax: (tblSearch: any, callback) => {
        tblSearch.withDrawalStatus = this.withDrawalStatus;
        tblSearch.accountId = this.accountId;
        tblSearch.bankNumber = this.bankNumber;
        tblSearch.bankAccountName = this.bankAccountName;
        tblSearch.state = this.search_state.length > 0 ? this.search_state : null;
        this._service.getListJTable(tblSearch)
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
        { data: 'AccountName', title: 'Khách hàng',orderable: false },
        {
          data: 'Amount', title: 'Số tiền rút',orderable: false,
          render: function (data: any, type: any, item: any) {
            return data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
          }
        },
        { data: 'AccountId', title: 'Mã TK', visible: false, orderable: false },
        { data: 'BankNumber', title: 'Số tài khoản' },
        { data: 'BankAccountName', title: 'Tên tài khoản',orderable: false },
        { data: 'BankName', title: 'Tên ngân hàng',orderable: false },
        { data: 'BankProvince', title: 'Tỉnh thành',orderable: false },
        { data: 'BankBranch', title: 'Chi nhánh',orderable: false },
        {
          data: 'ProofImage', title: 'Bằng chứng', orderable: false,
          render: function (data: any, type: any, item: any) {
            if (data !== '' && data !== null) {
              const image_preview = ConfigSetting.buildUrlWithBaseCDN(data);
              return `<a href="` + image_preview + `" target="_blank">
              <img alt="u-logo" class="img-list img-fluid" src="` + image_preview + `"/></a>`;
            }
            return ``;
          }
        },
        { data: 'WalletId', title: 'Tên ví' },
        { data: 'Note', title: 'Ghi chú', visible: false },
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
          data: 'ModifiedDate', title: 'Ngày sửa',visible: false,
          render: function (data: any, type: any, item: any) {
            if(data != null && data != ''){
              return moment.utc(data).local().format('DD/MM/YYYYY HH:mm:ss');
            }
           return "";
          }
        },
        {
          data: 'ProcessDate', title: 'Ngày xử lý',visible:false,
          render: function (data: any, type: any, item: any) {
            if (data != null && data != '') {
              return moment.utc(data).local().format('DD/MM/YYYYY HH:mm:ss');
            } else {
              return `N/A`
            }
          }
        },
        {
          data: 'WithDrawalStatus', title: 'TT trừ tiền',
          render: function (data: any, type: any, item: any) {
            if (data == 0) {
              return `<span class="badge badge-warning">Đang xử lý</span>`;
            }
            if (data == 1) {
              return `<span class="badge badge-success">Đã trừ tiền</span>`;
            }
            if (data == 2) {
              return `<span class="badge badge-danger">Đã hủy</span>`;
            }
          }
        },
        {
          data: 'ConfirmStatus', title: 'Xác nhận', orderable: false,visible:false,
          render: function (data: any, type: any, item: any) {
            if (data == 0) {
              return `<span class="badge badge-warning">Chưa xác nhận</span>`;
            } else
              return `<span class="badge badge-info">Đã xác nhận</span>`;
          }
        }, {
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
              return `<span class="badge badge-success">Đã duyệt cấp 3</span>`;
            }
            if (data === 'DA_CHUYEN_KHOAN') {
              return `<span class="badge badge-success">Đã chuyển khoản</span>`;
            }
            if (data === 'KET_THUC') {
              return `<span class="badge badge-info">Kết thúc</span>`;
            }
            if (data === 'DA_HUY') {
              return `<span class="badge badge-danger">Đã hủy</span>`;
            }
            if (data === 'AUTO') {
              return `<span class="badge badge-danger">Tự động</span>`;
            }
            return '';
          }
        },
      ],
      rowCallback: (row: Node, data: model.WithdrawalJTable, index: number) => {
        const self = this;
        $(row).attr('id', 'Withdrawal_row_' + data.Id);
        let menuItemDefines: MenuContextDefine2[] = [
          { key: 'upload-proofimage',  name: 'Tải ảnh bằng chứng', icon: 'fa-upload', permissionAction: Actions.ACCESS },
          { key: 'Process',   name: 'Xử lý giao dịch', icon: 'fa-edit', permissionAction: Actions.ACCESS },
          { key: 'customer',   name: 'Thông tin khách hàng', icon: 'fa-user' , permissionAction: Actions.ACCESS },
          { key: 'workflow', name: 'Quy trình xử lý', icon: 'fa-recycle', permissionAction: Actions.ACCESS },
        ];  
        let menuItems = PermissionCommon.createMenuItems(this.permissionService, menuItemDefines); 
        $.contextMenu({
          selector: '#' + 'Withdrawal_row_' + data.Id,
          build: function ($triggerElement, e) {
            return {
              callback: function (key, options) {
                if (data.WithDrawalStatus == 0 && data.ConfirmStatus == 0) {
                  // if (key === 'confirm-status') {
                  //   const modalRef = self.modalService.open(ConfirmStatusComponent, { size: 'lg' });
                  //   modalRef.componentInstance.itemId = data.Id;
                  //   modalRef.componentInstance.title = data.AccountName;
                  //   modalRef.result.then((result) => {
                  //     self.rerender(false);
                  //   }, (reason) => {
                  //   });
                  // }
                }
                if (key === 'upload-proofimage') {
                  const modalRef = self.modalService.open(UploadProofImageComponent);
                  modalRef.componentInstance.itemId = data.Id;
                  modalRef.componentInstance.title = data.AccountName;
                  modalRef.result.then((result) => {
                    self.rerender(false);
                  }, (reason) => {
                  });
                }
                if (key === 'Process') {
                  const modalRef = self.modalService.open(transprocesswithdrawalcomponent, { size: 'lg' });
                  modalRef.componentInstance.itemId = data.Id;
                  modalRef.result.then((result) => {
                    self.rerender(false);
                  }, (reason) => {
                    self.rerender(false);
                  });

                  return;
                }
                if (key === 'workflow') {
                  const modelRef = self.modalService.open(WorkflowWithdrawalComponent, { size: 'lg' });
                  modelRef.componentInstance.itemId = data.Id;
                  modelRef.result.then((result) => {
                  }, (reason) => {
                  });
                }
                if (key === 'customer') {
                  const modelRef = self.modalService.open(CustomerInfoComponent, { size: 'lg' });
                  modelRef.componentInstance.itemId = data.AccountId;
                  modelRef.result.then((result) => {
                  }, (reason) => {
                  });
                  return;
                }
              },
              items:  menuItems,
              'sep1': '---------',
                'quit': {
                  name: 'Quit', icon: function () {
                    return 'context-menu-icon context-menu-icon-quit';
                  }
                }
            };
          }
        });
        return row;
      },
      buttons:  tblToolbar
    };

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if (status === 200) {
        const img = JSON.parse(response).path + "/" + JSON.parse(response).name;
        this.image_preview = JSON.parse(response).fullUrl;
      }
    };
  }

  loadListCustomer(): void {
    merge(this.refresh)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.customerList = [];
          const request: CustomerListTopRequest = {
            keyword: this.searchCustomer,
            limit: 20
          };
          return this._service.getListTopCustomer(request);
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
        if (res !== undefined && res.data != null) {
          this.customerList = res.data.map((e, i) => {
              e.fName = e.fullname + ' [ ' + e.username + ' ]';
              return e;
          });
        }
      });
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
  searchAutoCompeleteCustomer(e: { term: string; }) {
    this.searchCustomer = e.term;
    this.refresh.emit();
  }
  // #endregion

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}


