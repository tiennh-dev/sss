import { Subscription } from 'rxjs';

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
import { DepositsWorkflowTranslateGraph } from 'src/app/common/config-setting';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@AutoUnsubscribe
@Component({
    selector: 'app-tw-workflow-payment',
    template: `
    <div class="modal-header">
        <h4 class="modal-title">Quy trình xử lý</h4>
        <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('x')">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
    <div class="modal-body">
    <div *ngIf="!check"><tw-dot [dot]="dot"></tw-dot></div>
    <div *ngIf="check"><h5>{{message}}</h5></div>
    </div>`
})

export class WorkflowWaitingDepositsComponent implements OnInit {
    @Input() itemId: any;
    public message: string = null;
    public check = false;

    public workflow: Workflow;
    public dot: DotInfo;
    public history: WorkflowHistory[];
    public variables: WorkflowVariable[];
    constructor(public activeModal: NgbActiveModal,
        private _workflowService: WorkflowService, ) { }

    ngOnInit() {
        this._workflowService.dotWithHistory('DEPOSIT_WORKFLOW', this.itemId).subscribe((dot: string) => {
            if (dot === 'NOT FOUND') {
                this.check = true;
                this.message = 'Quy trình chưa được khởi tạo';
            }
            dot = DepositsWorkflowTranslateGraph.translate(dot);
            this.dot = { dot: dot };
        });
    }
}