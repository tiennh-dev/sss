import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, AfterViewInit, Input, Renderer, EventEmitter } from '@angular/core';
import { of, Subject, merge } from 'rxjs';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
// -----------------------
import * as model from '../../../models/model/bankinfo.model';
import { BankInfoService } from 'src/app/services/bankinfo.service';
import { UtilityService } from 'src/app/services/utility.service';
import { ConfirmationDialogService } from 'src/app/services/confirmation-dialog.service';
import { AddComponent } from '../bankinfo/add.component';
import { EditComponent } from '../bankinfo/edit.component';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ConfigSetting, Actions, MenuContextDefine2, PermissionCommon } from 'src/app/common/config-setting';
import { PermissionService } from 'src/app/services/permission.service';

@Component({
  selector: 'app-bankinfo',
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
  public data: model.BankInfoListJTable[];
  public bankType:any[];
  public pageLength: number;
  public keyword: string;
  constructor(
    private modalService: NgbModal,
    private ctService: BankInfoService,
    private utility: UtilityService,
    private confirmService: ConfirmationDialogService,
    private permissionService: PermissionService
  ) {
    this.permissionService.ResourceKey = "BANKINFO";
    this.pageLength = 30;
    this.keyword = '';
    this.bankType=[
      {id:'BANKING',name:'BANKING'},
      {id:'WALLET',name:'WALLET'},
    ]
  }

  ngOnInit() {
    let tblToolbar = [];
    tblToolbar.push({
      text: '<span data-action-target="button" data-action=' + Actions.ACCESS + '><i  class="icofont icofont-ui-add"></i> Thêm mới</span>',
      key: 'a', shiftKey: true,
      action: (e, dt, node, config) => {
        const modalRef = this.modalService.open(AddComponent, { size: 'lg' });
        modalRef.result.then((result) => {
          this.rerender();
        }, (reason) => {
        });
      }
    });
    tblToolbar.push({
      extend: 'print', text: '<span data-action-target="button" data-action=' + Actions.ACCESS + '><i class="icofont icofont-print"></i> In', title: 'WalletTrans'
    });
    tblToolbar.push({
      extend: 'excel', text: '<span data-action-target="button" data-action=' + Actions.EXPORT + '><i class="icofont icofont-file-excel"></i> Xuất Excel</span>',
      exportOptions: {
        modifier: {
          page: 'current'
        }
      },
      title: 'Bank Deposit',
    });
    tblToolbar.push({
      extend: 'colvis', text: '<i class="icofont icofont-table"></i> Cột hiển thị',
      columnText: function (dt, idx, title) {
        return (idx + 1) + ' : ' + title;
      }
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: this.pageLength,
      serverSide: true,
      processing: true,
      order: [0, 'desc'],
      ajax: (tblSearch: any, callback) => {
        tblSearch.keyword = this.keyword;
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
        { data: 'Id', title: 'Id', visible: false },
        {
          data: 'BankName', title: 'Tên ngân hàng'
        },
        {
          data: 'Picture', title: 'Hình ảnh',
          render: function (data: any, type: any, item: any) {
            if (data !== '' && data !== null) {
              data = ConfigSetting.buildUrlWithBaseCDN(data);
              return `<a href="` + data + `" target="_blank">
            <img alt="u-logo" class="img-list img-fluid" src="` + data + `"/></a>`;
            }
            return ``;
          }
        },
        { data: 'AccountNumber', title: 'Số tài khoản' },
        { data: 'AccountName', title: 'Tên tài khoản' },
        { data: 'Branch', title: 'Chi nhánh' },
        { data: 'Province', title: 'Tỉnh thành' },
        { data: 'Description', title: 'Mô tả' },
        {
          data: 'Status', title: 'Trạng thái',
          render: function (data: any, type: any, item: any) {
            if (data == 0) {
              return `<span class="badge badge-warning">Chưa kích hoạt</span>`;
            } else {
              return `<span class="badge badge-success">Kích hoạt</span>`;
            }
          }
        },
        {
          data: 'ForDeposit', title: 'Cho phép nạp', render: function (data: any, type: any, item: any) {
            if (item.ForDeposit == "1") {
              return ` <div class="checkbox"><input type="checkbox"  id="checkbox-primary-'${item.Id}'" checked  data-forDeposite /><label for="checkbox-primary-'${item.Id}'" style=" float:right; padding-right: 85px; margin-top: 3px;"></label></div>`
            } else {
              return ` <div class="checkbox"><input type="checkbox"  id="checkbox-primary-'${item.Id}'"  data-forDeposite /><label for="checkbox-primary-'${item.Id}'" style=" float:right; padding-right: 85px; margin-top: 3px;"></label></div>`
            }
          }
        },
        {
          data: 'ForWithDrawal', title: 'Cho phép rút',
          render: function (data: any, type: any, item: any) {
            if (item.ForWithDrawal == "1") {
              return ` <div class="checkbox"><input type="checkbox"  id="checkbox-primary'${item.Id}'" checked  data-forWithDrawal /><label for="checkbox-primary'${item.Id}'" style=" float:right; padding-right: 75px; margin-top: 3px;"></label></div>`
            } else {
              return ` <div class="checkbox"><input type="checkbox"  id="checkbox-primary'${item.Id}'"  data-forWithDrawal /><label for="checkbox-primary'${item.Id}'" style=" float:right; padding-right: 75px; margin-top: 3px;"></label></div>`
            }
          }
        },
        { data: 'BankType', title: 'Kiểu ngân hàng',
          render:function(data:any,type:any,item:any){
            return `<select data-changebankType data-code='${data}'></select>` 
          }
      },
      ],
      rowCallback: (row: Node, data: model.BankInfoListJTable, index: number) => {
        const self = this;
        $(row).attr('id', 'bankinfo_row_item' + data.Id);
        let menuItemDefines: MenuContextDefine2[] = [
          { key: 'edit', name: 'Edit Bank', icon: 'fa-edit', permissionAction: Actions.EDIT },
          { key: 'active', name: 'Active', icon: 'fa-toggle-on', permissionAction: Actions.ACTIVE },
          { key: 'delete', name: 'Delete item', icon: 'fa-recycle', permissionAction: Actions.DELETE },
        ];
        let menuItems = PermissionCommon.createMenuItems(this.permissionService, menuItemDefines);
        $.contextMenu({
          selector: '#' + 'bankinfo_row_item' + data.Id,
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
                if (key === 'active') {
                  self.confirmService.confirm('Are you sure?', 'Do you really want to active it ?')
                    .then((confirmed) =>
                      confirmed ? self.onActive(data.Id) : self.confirmService.close()
                    ).catch(() =>
                      self.confirmService.close(),
                    );
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
        $('[data-changebankType]', row).each((index, item) => {
          const $this = $(item);
          const selectedCode = $this.data('code');
          const html = this.generateBankTypeElement(selectedCode);

          $this.parent().html(html);
        });
        this.ActiveDeposite(row, data);
        this.ActiveWithDrawal(row,data);
        this.bindUpdateBankTypeEvent(row,data.Id);
        return row;
      },
      buttons: tblToolbar
    };
  }

  // #endregion
  onDelete(itemId: number): void {
    if (itemId === undefined) {
      this.utility.showError(ErrorCodeDefine.OBJECT_NULL);
    }
    if (itemId <= 0) {
      this.utility.showError(ErrorCodeDefine.ID_MUST_GT_0);
      return;
    }
    this.utility.showProcessing(this.blockUI);
    this.ctService.delete(itemId)
      .subscribe(response => {
        if (!response.status) {
          this.utility.showError(response.errorCode,
            response.parameters);
          return;
        }
        this.utility.cancelProcessing(this.blockUI);
        this.utility.showMessage(`Bank ${itemId} deleted`);
        this.rerender();
      });
  }
  onActive(itemId: number): void {
    if (itemId === undefined) {
      this.utility.showError(ErrorCodeDefine.OBJECT_NULL);
    }
    if (itemId <= 0) {
      this.utility.showError(ErrorCodeDefine.ID_MUST_GT_0);
      return;
    }
    this.utility.showProcessing(this.blockUI);
    this.ctService.onActive(itemId)
      .subscribe(response => {
        if (!response.status) {
          this.utility.showError(response.errorCode,
            response.parameters);
          return;
        }
        this.utility.cancelProcessing(this.blockUI);
        this.utility.showMessage(`Bank ${itemId} active`);
        this.rerender();
      });
  }



  ActiveDeposite(r: Node, data: model.BankInfoListJTable): void {
    const $element = $('[data-forDeposite]', r);
    $element.unbind('click').bind('click', (e) => {
      if ((<HTMLInputElement>e.currentTarget).checked) {
        this.ctService.forDeposite(data.Id, 1).subscribe(response => {
          if (!response.status) {
            this.utility.showError(response.errorCode,
              response.parameters);
            return;
          }

          this.utility.showMessage('kích hoạt thành công');
        });
      }else{
        this.ctService.forDeposite(data.Id, 0).subscribe(response => {
          if (!response.status) {
            this.utility.showError(response.errorCode,
              response.parameters);
            return;
          }

          this.utility.showMessage('Hủy kích hoạt thành công');
        });
      }
    });
  }



  ActiveWithDrawal(r: Node, data: model.BankInfoListJTable): void {
    const $element = $('[data-forWithDrawal]', r);
    $element.unbind('click').bind('click', (e) => {
      if ((<HTMLInputElement>e.currentTarget).checked) {
        this.ctService.forWithDrawal(data.Id, 1).subscribe(response => {
          if (!response.status) {
            this.utility.showError(response.errorCode,
              response.parameters);
            return;
          }

          this.utility.showMessage('kích hoạt thành công');
        });
      }else{
        this.ctService.forWithDrawal(data.Id, 0).subscribe(response => {
          if (!response.status) {
            this.utility.showError(response.errorCode,
              response.parameters);
            return;
          }

          this.utility.showMessage('Hủy kích hoạt thành công');
        });
      }
    });
  }


  generateBankTypeElement(productoriginCode: string): string {
    const startHtml = '<select data-changebankType class="select-custom"><option>Chọn</option>';
    const endHtml = '</select>';
    const optionHtml = this.bankType.map(item => {
      let code = productoriginCode.toString();
      const selected = item.id === code ? 'selected = "selected"' : '';
      const option = `<option value="${item.id}"  ${selected}>${item.name}</option>`;

      return option;
    });
    const html = [startHtml, ...optionHtml, endHtml].reduce((accumulator: string, currentValue: string, currentIndex, array) => {
      return accumulator + currentValue;
    }, '');

    return html.toString();
  }

  
  bindUpdateBankTypeEvent(row: Node, id: number) {
    const $element = $('[data-changebankType]', row);
    const _this = this;

    $element.unbind('change').change(function (event) {
      const banktype = $('[data-changebankType]', row).val();

      _this.saveBankType(id, banktype.toString());
    });
  }

  private saveBankType(id: number, banktype: string) {
    this.ctService.UpdateBankType(id, banktype).subscribe(response => {
      if (!response.status) {
        this.utility.showError(response.errorCode, response.parameters);

        return;
      }
      this.utility.showMessage('Cập nhật thông tin thành công!');
    });
  }
  


  // #region --Render datatable callback--
  rerender(): void {
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


