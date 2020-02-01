import { BankInfoService } from './../../../services/bankinfo.service';
import { Component, OnInit, AfterViewInit, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { switchMap, catchError, filter } from 'rxjs/operators';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
// -----------------------
import { ConfigSetting } from 'src/app/common/config-setting';
import * as model from '../../../models/model/bankinfo.model';
import { UtilityService } from 'src/app/services/utility.service';
const URL = ConfigSetting.IMAGE_UPLOAD;

@Component({
    selector: 'app-bankinfo-add',
    templateUrl: './add.component.html'
})

export class AddComponent implements AfterViewInit, OnInit {
    public form: FormGroup;
    private dataModel: model.BankInfoAdd;
    get f() { return this.form.controls; }
    submitted = false;
    uploader: FileUploader;
    public image_preview = null;
    public genderList: any[];

    constructor(private ctService: BankInfoService,
        private utility: UtilityService,
        public activeModal: NgbActiveModal,
        private _formBuilder: FormBuilder,
    ) {
        const token: string = ConfigSetting.GetAuthenToken;
        this.uploader = new FileUploader({
            url: URL, allowedMimeType: ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'],
            autoUpload: true,
            authToken: 'Bearer ' + token
        });
    }

    ngOnInit() {
        this.dataModel = new model.BankInfoAdd();
        this.form = this.onCreateForm();
        this.uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };
        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
            if (status === 200) {
                this.dataModel.picture = JSON.parse(response).path + '/' + JSON.parse(response).name;
                this.image_preview = JSON.parse(response).fullUrl;
            }
        };
    }

    onCreateForm(): FormGroup {
        return this._formBuilder.group({
            id: [this.dataModel.id, null],
            bankName: [this.dataModel.bankName, Validators.required],
            accountName: [this.dataModel.accountName, null],
            accountNumber: [this.dataModel.accountNumber, null],
            branch: [this.dataModel.branch, null],
            province: [this.dataModel.province, null],
            description: [this.dataModel.description, null],
        });
    }

    onSubmit(): void {
        this.submitted = true;
        of(this.form.valid)
            .pipe(
                filter(m => m),
                switchMap(() => {
                    return this.ctService.add(this.dataModel);
                }),
                catchError(() => {
                    return of({
                        status: false,
                        errorCode: ErrorCodeDefine.UNKNOW_ERROR,
                        parameters: null
                    });
                })
            )
            .subscribe((response) => {
                if (!response.status) {
                    this.utility.showError(response.errorCode,
                        response.parameters);
                    return;
                }

                this.utility.showMessage('Bank saved');
                this.activeModal.close('');
            });
    }

    removeImage(): void {
        this.dataModel.picture = null;
        this.image_preview = null;
    }

    ngAfterViewInit(): void {

    }
}


