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
import { WorkflowTranslateGraph } from 'src/app/common/config-setting';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

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
        <div class="workflow">
            <div *ngIf="!check"><tw-dot [dot]="dot"></tw-dot></div>
            <div *ngIf="check"><h5>{{message}}</h5></div>
        </div>
    </div>`
})

export class WaitingApprovalWorkflowComponent implements OnInit {
    @Input() itemId: any;
    private routeParams$: Subscription;
    private workflow$: Subscription;
    private dot$: Subscription;
    private history$: Subscription;
    private variables$: Subscription;
    public message: string = null;
    public check = false;

    public workflow: Workflow;
    public dot: DotInfo;
    public history: WorkflowHistory[];
    public variables: WorkflowVariable[];

    public constructor(
        private _route: ActivatedRoute,
        private _workflowService: WorkflowService,
        private utility: UtilityService,
        public activeModal: NgbActiveModal,
    ) { }

    public ngOnInit(): void {
        this._workflowService.dotWithHistory('OrderWorkflow', this.itemId).subscribe((dot: string) => {
            if (dot === 'NOT FOUND') {
                this.check = true;
                this.message = 'Quy trình chưa được khởi tạo';
            }
            dot = WorkflowTranslateGraph.translate(dot);
            this.dot = { dot: dot };
        });
    }
}
