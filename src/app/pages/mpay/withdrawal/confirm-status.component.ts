import { WithdrawalService } from './../../../services/withdrawal.service';
import { Component, OnInit, AfterViewInit, EventEmitter, OnDestroy, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
// -----------------------
import * as model from '../../../models/model/withdrawal.model';
import { UtilityService } from 'src/app/services/utility.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
    selector: 'app-withdrawal-confirm-status',
    templateUrl: './confirm-status.component.html'
})

export class ConfirmStatusComponent implements OnInit, OnDestroy {
    @BlockUI('blockui-popup') blockUI: NgBlockUI;
    public dataModel: model.WithdrawalDetail;
    @Input() itemId: any;
    @Input() title: any;

    amountFormat: string;
    constructor(private _service: WithdrawalService,
        private utility: UtilityService,
        public activeModal: NgbActiveModal) {
    }

    ngOnInit() {
        this.dataModel = new model.WithdrawalDetail();
        this.utility.showProcessing(this.blockUI);
        this._service.getDetail(this.itemId)
            .subscribe(response => {
                this.utility.cancelProcessing(this.blockUI);
                if (!response.status) {
                    this.utility.showError(response.errorCode,
                        response.parameters);
                    this.activeModal.close('');
                }
                this.dataModel = response.data;
                this.amountFormat = this.dataModel.amount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            }, () => {
                this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR);
            });
    }

    onSubmit(): void {
        const stt = +this.dataModel.confirmStatus;
        this.dataModel.confirmStatus = stt === 1 ? 0 : 1;
        this._service.confirmStatus(this.dataModel)
            .subscribe(res => {
                if (!res.status) {
                    return;
                }
                this.utility.showMessage(stt === 0 ? 'Xác thực thành công !' : 'Hủy xác thực thành công !');
                this.activeModal.close('');
            }, () => {
                this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR);
            });
    }


    /**
   * On destroy
   */
    ngOnDestroy(): void {
    }
}


