import { Component, OnInit, AfterViewInit, Input, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { merge, of } from 'rxjs';
import { startWith, switchMap, filter, map, catchError } from 'rxjs/operators';
import { UtilityService } from 'src/app/services/utility.service';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
    selector: 'app-transaction-processing',
    templateUrl: './tranprocessfreeze.component.html',
})

export class tranprocessfreezecomponent implements OnInit{
    constructor(public activeModal: NgbActiveModal){

    }
    ngOnInit(){

    }
}