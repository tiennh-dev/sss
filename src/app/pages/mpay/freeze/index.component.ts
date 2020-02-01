import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, AfterViewInit, Input, EventEmitter } from '@angular/core';
import { of, Subject, merge, pipe } from 'rxjs';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
// -----------------------
import * as model from '../../../models/model/freeze.model';
import * as modelCus from '../../../models/model/customer.model';
import { FreezeService } from 'src/app/services/freeze.service';
import { UtilityService } from 'src/app/services/utility.service';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { CustomerListResponse } from 'src/app/models/response/customer.response';
import * as moment from 'moment';
import { tranprocessfreezecomponent } from './tranprocessfreeze.component';
import { CustomerInfoComponent } from './customer-info.component';
import { FreeZeAddComponent } from './freezeadd.component';
import { ConfirmationDialogService } from 'src/app/services/confirmation-dialog.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { FreeZeUpdateRequest } from 'src/app/models/request/freeze.request';
import { Actions, MenuContextDefine2, PermissionCommon } from 'src/app/common/config-setting';
import { PermissionService } from 'src/app/services/permission.service';
import { CustomerListTopRequest } from 'src/app/models/request/customer.request';

@Component({
  selector: 'app-freeze',
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
  public data: model.FreezeJTable[];
  public pageLength: number;
  public listCustomer: CustomerListResponse;
  public customerList: any[] = [];
  public accountId: any;
  public type: any;
  public ref: any;
  public description: any;
  private searchCustomer = '';
  constructor(
    private modalService: NgbModal,
    private ctService: FreezeService,
    private utility: UtilityService,
    private confirmService: ConfirmationDialogService,
    private permissionService: PermissionService
  ) {
    this.permissionService.ResourceKey = "FREEZE";
    this.pageLength = 30;
  }

  ngOnInit() {
    this.loadListCustomer();
    let tblToolbar = [];
    tblToolbar.push({
      extend: 'print', text: '<span data-action-target="button" data-action=' + Actions.ACCESS + '><i class="icofont icofont-print"></i> In', title: 'Giao dịch tạm giữ</span>'
    });
    tblToolbar.push({
      extend: 'excel', text: '<span data-action-target="button" data-action=' + Actions.EXPORT + '><i class="icofont icofont-file-excel"></i> Xuất Excel</span>',
      exportOptions: {
        modifier: {
          page: 'current'
        }
      },
      title: 'Freeze',
    });
    tblToolbar.push({
      extend: 'colvis', text: '<i class="icofont icofont-table"></i> Cột hiển thị',
      columnText: function (dt, idx, title) {
        return (idx + 1) + ' : ' + title;
      }
    });
    tblToolbar.push({
      text: '<i  class="icofont icofont-ui-add"></i> Thêm tạm giữ',
      key: 'a', shiftKey: true,
      action: (e, dt, node, config) => {
        const modalRef = this.modalService.open(FreeZeAddComponent);
        modalRef.result.then((result) => {
          this.rerender();
        }, (reason) => {
        });
      }
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: this.pageLength,
      serverSide: true,
      processing: true,
      order: [0, 'desc'],
      ajax: (tblSearch: any, callback) => {
        tblSearch.accountId = this.accountId;
        tblSearch.type = this.type;
        tblSearch.ref = this.ref;
        tblSearch.description = this.description;
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
      dom: 'Bfrtip', select: true,
      columns: [
        { data: 'Id', title: 'Id' },
        { data: 'AccountName', title: 'Khách hàng' },
        { data: 'AccountId', title: 'Mã TK Khách', visible: false },
        { data: 'WalletId', title: 'Tên ví' },
        {
          data: 'Amount', title: 'Số tiền',
          render: function (data: any, type: any, item: any) {
            return data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
          }
        },
        { data: 'Type', title: 'Thể loại' },
        { data: 'Ref', title: 'Tham chiếu' },
        {
          data: 'Status', title: 'TT giữ tiền', orderable: false,
          render: function (data: any, type: any, item: any) {
            if (data !== null && data !== undefined) {
              if (data == 1) {
                return `<span class="badge badge-warning">Đang tạm giữ</span>`;
              } else {
                return `<span class="badge badge-danger">Hủy tạm giữ</span>`;
              }
            }
          }
        },
        { data: 'RefType', title: 'Kiểu tham chiếu' },
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
          data: 'ModifiedDate', title: 'Ngày sửa', visible: false,
          render: function (data: any, type: any, item: any) {
            if (data != null && data != '') {
              return moment.utc(data).local().format('DD/MM/YYYYY HH:mm:ss');
            }
            return "";
          }
        },
      ],
      responsive: true,
      scrollX: true,

      buttons: tblToolbar,
      rowCallback: (row: Node, data: model.FreezeJTable) => {
        const self = this;
        $(row).attr('id', 'action_buy_row_' + data.Id);
        let menuItemDefines: MenuContextDefine2[] = [
          { key: 'edit', name: 'Xử lý giao dịch', icon: 'fa-edit', permissionAction: Actions.ACCESS },
          { key: 'customer', name: 'Thông tin khách hàng', icon: 'fa-user', permissionAction: Actions.ACCESS },
          { key: 'updateStatus', name: 'Hủy tạm giữ', icon: 'fa-recycle', permissionAction: Actions.ACCESS },
        ];
        let menuItems = PermissionCommon.createMenuItems(this.permissionService, menuItemDefines);
        $.contextMenu({
          selector: '#' + 'action_buy_row_' + data.Id,
          build: function ($triggerElement, e) {
            return {
              callback: function (key, options) {
                if (key === 'edit') {
                  const modalRef = self.modalService.open(tranprocessfreezecomponent);
                  modalRef.result.then((result) => {
                    self.rerender();
                  }, (reason) => {
                    self.rerender();
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

                if (key === 'updateStatus') {
                  self.confirmService.confirm('Hủy tạm giữ', 'Bạn có chắc chắn muốn hủy ... ?')
                    .then((confirmed) =>
                      confirmed ? self.onUpdateStatus(data.Id) : self.confirmService.close()
                    ).catch(() =>
                      self.confirmService.close(),
                    );
                }
              },
              items: menuItems,
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
          return this.ctService.getListTopCustomer(request);
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
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();

    });
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

  onUpdateStatus(Id: number): void {
    merge()
      .pipe(
        startWith({}),
        switchMap(() => {
          this.utility.showProcessing(this.blockUI);
          console.log(Id);
          return this.ctService.updatestatus(Id)
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
          this.utility.cancelProcessing(this.blockUI);

          return of({
            status: false,
            errorCode: ErrorCodeDefine.UNKNOW_ERROR,
            parameters: null
          });
        })
      ).subscribe(response => {
        this.utility.cancelProcessing(this.blockUI);
        this.utility.showMessage(`Hủy tạm giữ thành công`);
        this.rerender();

      })
  }



}


