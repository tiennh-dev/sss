import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, AfterViewInit, Input, EventEmitter } from '@angular/core';
import { of, Subject, merge } from 'rxjs';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
// -----------------------
import * as model from '../../../models/model/banktransactionhistory.model';
import * as modelBank from '../../../models/model/bankinfo.model';
import { BankTransactionHistoryService } from 'src/app/services/banktransactionhistory.service';
import { UtilityService } from 'src/app/services/utility.service';
import * as moment from 'moment';
import { BankInfoList } from 'src/app/models/model/bankinfo.model';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { EditComponent } from './edit.component';
import { Actions, MenuContextDefine2, PermissionCommon } from 'src/app/common/config-setting';
import { PermissionService } from 'src/app/services/permission.service';
import { AddBankHistoryComponent } from './addbankhistory.component';
import { ConfirmationDialogService } from 'src/app/services/confirmation-dialog.service';

@Component({
  selector: 'app-banktransactionhistory',
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
  public data: model.BankTransactionHistoryJTable[];
  public pageLength: number;
  public lstBankInfo: BankInfoList[] = [];
  public accountNumber = null;
  public debitAmount: number;
  public creditAmount: number;
  public description: '';
  public startTime: Date;
  public endTime: Date;

  constructor(
    private modalService: NgbModal,
    private ctService: BankTransactionHistoryService,
    private utility: UtilityService,
    private confirmService: ConfirmationDialogService,
    private permissionService: PermissionService
  ) {
    this.permissionService.ResourceKey="BANKTRANSACTIONHISTORY";
    this.pageLength = 30;
  }

  ngOnInit() {
    let tblToolbar =[]; 
    tblToolbar.push({
      extend: 'print', text: '<span data-action-target="button" data-action='+Actions.ACCESS+'><i class="icofont icofont-print"></i> In', title: 'WalletTrans'
    });
    tblToolbar.push({
      extend: 'excel', text: '<span data-action-target="button" data-action='+Actions.EXPORT+'><i class="icofont icofont-file-excel"></i> Xuất Excel</span>',
      exportOptions: {
        modifier: {
          page: 'current'
        }
      },
      title: 'Bank Transaction History',
    }); 
    tblToolbar.push({
      extend: 'colvis', text: '<i class="icofont icofont-table"></i> Cột hiển thị',
      columnText: function (dt, idx, title) {
        return (idx + 1) + ' : ' + title;
      }
    });
    tblToolbar.push({
      text: '<i  class="icofont icofont-ui-add"></i> Thêm mới',
      key: 'a', shiftKey: true,
      action: (e, dt, node, config) => {
        const modalRef = this.modalService.open(AddBankHistoryComponent);
        modalRef.result.then((result) => {
          this.rerender();
        }, (reason) => {
        });
      }
    });
    this.loadListBankInfo();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: this.pageLength,
      serverSide: true,
      processing: true,
      order: [5, 'desc'],
      ajax: (tblSearch: any, callback) => {
        tblSearch.accountNumber = this.accountNumber;
        tblSearch.debitAmount = this.debitAmount;
        tblSearch.creditAmount = this.creditAmount;
        tblSearch.description = this.description;
        tblSearch.startTime = this.startTime;
        tblSearch.endTime = this.endTime;
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
        { data: 'Id', title: 'Id', className: 'mw120', },
        { data: 'AccountNumber', title: 'Mã tài khoản', className: 'mw120', },
        { data: 'BankType', title: 'Tên ngân hàng', className: 'mw120', },
        {
          data: 'DebitAmount', title: 'Ghi nợ', className: 'mw120',
          render: function (data: any, type: any, item: any) {
            return data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
          }
        },
        {
          data: 'CreditAmount', title: 'Ghi có', className: 'mw120',
          render: function (data: any, type: any, item: any) {
            return data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
          }
        },
        {
          data: 'TransactionDate', title: 'Thời gian giao dịch', className: 'mw200',
          render: function (data: any, type: any, item: any) {
            return moment.utc(data).local().format('DD/MM/YYYYY HH:mm:ss');
          }
        },
        { data: 'Description', title: 'Mô tả', className: 'mw120', },
        { data: 'Note', title: 'Ghi chú', className: 'mw250' },
      ],
      rowCallback: (row: Node, data: model.BankTransactionHistoryJTable, index: number) => {
        const self = this;
        // tslint:disable-next-line: prefer-const
        $(row).attr('id', 'banktrans_row_item' + data.Id.replace(/\s/g, ''));
        let menuItemDefines: MenuContextDefine2[] = [
          { key: 'edit',  name: 'Edit Bank', icon: 'fa-edit', permissionAction: Actions.EDIT },
          { key: 'delete', name: 'Xóa Bank', icon: 'fa-recycle', permissionAction: Actions.DELETE },
        ];  
        let menuItems = PermissionCommon.createMenuItems(this.permissionService, menuItemDefines); 
        $.contextMenu({
          selector: '#' + 'banktrans_row_item' + data.Id.replace(/\s/g, ''),
          build: function ($triggerElement, e) {
            return {
              callback: function (key, options) {
                if (key === 'edit') {
                  const modalRef = self.modalService.open(EditComponent, { size: 'lg' });
                  modalRef.componentInstance.itemId = data.Id;
                  modalRef.result.then((result) => {
                    self.rerender();
                  }, (reason) => {
                  });
                }
                if (key === 'delete') {
                  self.confirmService.confirm('Are you sure?', 'Do you really want to delete it ... ?')
                    .then((confirmed) =>
                      confirmed ? self.onDelete(data.Id) : self.confirmService.close()
                    ).catch(() =>
                      self.confirmService.close(),
                    );
                }
              },
              items: 
                menuItems,
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
  }
  loadListBankInfo(): void {
    merge(this.refresh)
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.ctService.getListBankInfo();
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

          return of(modelBank.BankInfoList[0]);
        })
      ).subscribe(res => {
        if (res !== undefined) {
          this.lstBankInfo = res.data.map((i) => {
            if (i.accountName == null) {
              i.accountName = '';
            } else {
              i.accountName = ' - ' + i.accountName;
            }

            if (i.accountName != '') {
              i.fName = i.bankName + i.accountName;
              return i;
            } else {
              i.fName = i.bankName;
              return i;
            }
          });
        }
      });
  }

  onDelete(itemId: string): void {
    if (itemId === undefined) {
      this.utility.showError(ErrorCodeDefine.OBJECT_NULL);
    }
   
    this.ctService.deleteBankTransactionHistory(itemId)
      .subscribe(response => {
        if (!response.status) {
          this.utility.showError(response.errorCode,
            response.parameters);
          return;
        }
        this.utility.showMessage(`Xóa thông tin thành công`);
        this.rerender();
      });
  }
  
  // #region --Render datatable callback--
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();

    });
  }
  // #endregion
  filterBankTranction(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();

    });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}


