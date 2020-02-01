import { WithdrawalService } from './../../../services/withdrawal.service';
import { Component, OnInit, AfterViewInit, EventEmitter, OnDestroy, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
// -----------------------
import * as model from '../../../models/model/withdrawal.model';
import { UtilityService } from 'src/app/services/utility.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ConfigSetting } from 'src/app/common/config-setting';
const URL = ConfigSetting.IMAGE_UPLOAD;

@Component({
    selector: 'app-withdrawal-upload-proofimage',
    templateUrl: './upload-proofimage.component.html',
    styleUrls: ['./upload-proofimage.component.scss'],
})

export class UploadProofImageComponent implements OnInit, OnDestroy {
    @BlockUI('blockui-popup') blockUI: NgBlockUI;
    public dataModel: model.WithdrawalDetail;
    @Input() itemId: any;
    @Input() title: any;

    amountFormat: string;
    uploader: FileUploader;
    public image_preview = null;
    constructor(private _service: WithdrawalService,
        private utility: UtilityService,
        public activeModal: NgbActiveModal) {
        const token: string = ConfigSetting.GetAuthenToken;
        this.uploader = new FileUploader({
            url: URL, allowedMimeType: ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'],
            autoUpload: true,
            authToken: 'Bearer ' + token
        });
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
                this.image_preview = ConfigSetting.buildUrlWithBaseCDN(this.dataModel.proofImage);
            }, () => {
                this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR);
            });
        this.uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };
        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
            if (status === 200) {
                this.dataModel.proofImage = JSON.parse(response).path + "/" + JSON.parse(response).name;
                this.image_preview = JSON.parse(response).fullUrl;
            }
        };
    }

    onSubmit(): void {
        this._service.confirmStatus(this.dataModel)
            .subscribe(response => {
                if (!response.status) {
                    this.utility.showError(response.errorCode,
                        response.parameters);
                    this.activeModal.close('');
                    return;
                }
                this.utility.showMessage('Tải ảnh bằng chứng thành công !');
                this.activeModal.close('');
            }, () => {
                this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR);
            });
    }

    removeImage(): void {
        this.dataModel.proofImage = null;
        this.image_preview = null;
    }

    /**
   * On destroy
   */
    ngOnDestroy(): void {
    }
}


