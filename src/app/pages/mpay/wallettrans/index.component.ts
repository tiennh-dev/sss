import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, AfterViewInit, Input, EventEmitter } from '@angular/core';
import { of, Subject, merge } from 'rxjs';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
// -----------------------
import * as model from '../../../models/model/wallettrans.model';
import * as modelCus from '../../../models/model/customer.model';
import { WalletTransService } from 'src/app/services/wallettrans.service';
import { UtilityService } from 'src/app/services/utility.service';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { CustomerListResponse } from 'src/app/models/response/customer.response';
import * as moment from 'moment';
import { Actions } from 'src/app/common/config-setting';
import { CustomerListTopRequest } from 'src/app/models/request/customer.request';

@Component({
  selector: 'app-wallettrans',
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
  public data: model.WalletTransJTable[];
  public pageLength: number;
  public listCustomer: CustomerListResponse;
  public customerList:any[]=[];
  public accountId: any;
  public type: any;
  public refId: number;
  public description: any;
  public searchCustomer='';
  constructor(
    private ctService: WalletTransService,
    private utility: UtilityService,
  ) {
    this.pageLength = 30;
  }

  ngOnInit() {
    this.loadListCustomer();
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
          title: 'WithDrawal',
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
        tblSearch.accountId = this.accountId;
        tblSearch.type = this.type;
        tblSearch.refId = this.refId;
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
        { data: 'RefId', title: 'Mã tham chiếu' },
        { data: 'Description', title: 'Mô tả' },
        {
          data: 'CreatedDate', title: 'Ngày tạo',
          render: function (data: any, type: any, item: any) {
            return moment.utc(data).local().format('DD/MM/YYYYY HH:mm:ss');
          }
        },
      ],
      buttons: tblToolbar
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



}


