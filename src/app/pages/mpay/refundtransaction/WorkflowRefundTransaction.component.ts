import { Subscription, merge, of } from 'rxjs';

import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { AutoUnsubscribe } from '../../../services/autoUnsubscribe';

import {
  WorkflowService,
  DotInfo,
  Workflow,
  WorkflowHistory,
  WorkflowVariable
} from '../../../shared/workflow/index';
import { UtilityService } from 'src/app/services/utility.service';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { WorkflowTranslateGraph, DepositsWorkflowTranslateGraph } from 'src/app/common/config-setting';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { OrderMessageGetByOrderIdRequest } from 'src/app/models/request/order.request';
import * as model from '../../../models/model/deposits.model';
import { ApprovalOrderService } from 'src/app/services/approval.order.service';
import { DepositsMessageGetByIdRequest } from 'src/app/models/request/DepositsMessageGetById.Request';
import { DepositsService } from 'src/app/services/deposits.service';

@AutoUnsubscribe
@Component({
  selector: 'app-tw-workflow',
  template: `
    <div class="modal-header">
        <h4 class="modal-title">Quy trình xử lý</h4>
        <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('x')">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
    <div class="modal-body">
    <div class="row">
    <div class="col-lg-4">
    <div class="card">
       <div class="card-header">
       <h5 class="card-title mb-0">Thông tin xử lý</h5>
       </div>
       <div class="card-body">
       <table class="table table-bordered">
         <thead>
           <tr>
             <th class="w160">Người tạo</th>
             <th>Nội dung</th>
           </tr>
         </thead>
         <tbody>
         <tr *ngFor="let item of depositsMessages">
                <td>
                    <p class="mb-0">{{item.authorDisplay}}</p>
                    <p class="mb-0">{{item.createdDateDisplay}}</p>
                  </td>
                  <td>
                    <p class="mb-0 wf-action">{{item.action}}</p>
                    <p class="mb-0">{{item.message}}</p>
                  </td>
            </tr>
            <tr *ngIf="collectionIsEmpty(depositsMessages)">
                <td colspan="3" class="text-align-center">Không tồn tại bản ghi nào.</td>
              </tr>
         </tbody>
       </table>
     </div>
     </div>
    </div>
    <div class="col-lg-8">
      <div class="card">
      <div class="card-header">
      <h5 class="card-title mb-0">Quy trình xử lý</h5>
      </div>
        <div class="workflow">
          <div *ngIf="!check"><tw-dot [dot]="dot"></tw-dot></div>
          <div *ngIf="check"><h5>{{message}}</h5></div>
         </div>
      </div>
      </div>
    </div>`
})

export class WorkflowRefundTransactionComponent implements OnInit {
  @Input() itemId: any;
  public message: string = null;
  public check = false;

  public workflow: Workflow;
  public dot: DotInfo;
  public history: WorkflowHistory[];
  public variables: WorkflowVariable[];
  public depositsMessages: model.DepositsMessage[];

  constructor(public activeModal: NgbActiveModal, private utility: UtilityService,
    private _workflowService: WorkflowService, private ctService: DepositsService) { }

  ngOnInit() {
    this.onLoadDepositsMessage();
    this._workflowService.dotWithHistory('DEPOSIT_WORKFLOW', this.itemId).subscribe((dot: string) => {
      if (dot === 'NOT FOUND') {
        this.check = true;
        this.message = 'Quy trình chưa được khởi tạo';
      }
      dot = DepositsWorkflowTranslateGraph.translate(dot);
      this.dot = { dot: dot };
    });
  }


  public collectionIsEmpty(values: any[]): boolean {
    return !values || values.length == 0;
  }

  private onLoadDepositsMessage(): void {
    merge()
      .pipe(
        startWith({}),
        switchMap(() => {
          const request: DepositsMessageGetByIdRequest = {
            Id: this.itemId
          };

          return this.ctService.getMessages(request);
        }),
        map(response => {
          if (!response.status) {
            this.utility.showError(response.errorCode, response.parameters);
          }

          return response.data;
        }),
        catchError(() => {
          this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);

          return of(null);
        })
      )
      .subscribe(data => {
        this.depositsMessages = data;
      });
  }
}
