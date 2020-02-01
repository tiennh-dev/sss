import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, AfterViewInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { of, Subject, merge } from 'rxjs';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
// -----------------------
import * as model from '../../../models/model/bankclientinfo.model';
import { BankClientInfoService } from 'src/app/services/bankclientinfo.service';
import * as res from '../../../models/response/bankclientinfo.response';

import { UtilityService } from 'src/app/services/utility.service';
import { PagingConfig } from 'src/app/models/model/base.model';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { CapchaComponent } from './capcha.component';
@Component({
  selector: 'app-bankclientinfo',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})
export class IndexComponent implements AfterViewInit, OnDestroy, OnInit {
  @BlockUI('blockui') blockUI: NgBlockUI;
  private refresh: EventEmitter<any> = new EventEmitter<any>();
  public dtTrigger: Subject<any> = new Subject();
  // Public
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: any = {};
  isLoadBanner: boolean;
  public data: res.BankClientInfoListResponse;
  public pageLength: number;
  // public categoryChange: model.BankClientInfoEdit;
  constructor(
    private modalService: NgbModal,
    private ctService: BankClientInfoService,
    private utility: UtilityService,
  ) {
  }

  ngOnInit() {
    this.loadBankClientInfo();
  }
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
  loadBankList(): void {
    this.rerender();
  }
  loadBankClientInfo(): void {
    merge(this.refresh)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.utility.showProcessing(this.blockUI);
          return this.ctService.getList();
        }),
        map(response => {
          // Flip flag to show that loading has finished.
          this.utility.cancelProcessing(this.blockUI);
          if (!response.status) {
            // TODO: show error.
            this.utility.showError(response.errorCode,
              response.parameters);
          }
          return response;
        }),
        catchError(() => {
          this.utility.cancelProcessing(this.blockUI);
          // TODO: show error.
          this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
            null);

          return of(model.BankClientInfoList[0]);
        })
      ).subscribe(res => {
        this.data = res.data;
      });
  }
  Capcha(apiUrl: string) {
    const modalRef = this.modalService.open(CapchaComponent);
    modalRef.componentInstance.apiUrl = apiUrl;
    modalRef.result.then((result) => {
      this.refresh.emit();
    }, (reason) => {
    });
  }
  Login() {
    return;
  }
}


