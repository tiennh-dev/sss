import { LoginRequest } from '../../../models/request/bankclientinfo.request';
import { HttpClient } from '@angular/common/http';
import { BankClientInfoService } from '../../../services/bankclientinfo.service';
import { Component, OnInit, AfterViewInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { of, merge } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { switchMap, catchError, filter, map, startWith } from 'rxjs/operators';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
// -----------------------
import { ConfigSetting } from 'src/app/common/config-setting';
import * as model from '../../../models/model/bankclientinfo.model';
import { UtilityService } from 'src/app/services/utility.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
const URL = ConfigSetting.IMAGE_UPLOAD;

@Component({
    selector: 'app-capcha',
    templateUrl: './capcha.component.html'
})


export class CapchaComponent implements AfterViewInit, OnInit {
    @BlockUI('blockui-popup') blockUI: NgBlockUI;
    private refresh: EventEmitter<any> = new EventEmitter<any>();

    @Input() apiUrl: any;
    public form: FormGroup;
    get f() { return this.form.controls; }
    submitted = false;
    public image_preview = null;
    public dataModel: string;
    public login: LoginRequest;
    constructor(
        private ctService: BankClientInfoService,
        private utility: UtilityService,
        public activeModal: NgbActiveModal,
        private _formBuilder: FormBuilder) {

        this.login = new LoginRequest();
    }


    ngOnInit() {
        this.form = this.onCreateForm();
        this.loadCapcha();
    }
    ngAfterViewInit(): void {

    }

    loadCapcha() {
        this.utility.showProcessing(this.blockUI);
        this.ctService.getCapcha(this.apiUrl)
            .subscribe(response => {
                this.utility.cancelProcessing(this.blockUI);
                this.dataModel = 'data:image/png;base64,' + response.data;
            }, () => {
                this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR);
            });
    }

    onCreateForm(): FormGroup {
        return this._formBuilder.group({
            capcha: [this.login.capcha, null]
        });
    }

    onSubmit(): void {
        this.submitted = true;
        of(this.form.valid)
            .pipe(
                filter(m => m),
                switchMap(() => {
                    return this.ctService.login(this.login, this.apiUrl);
                }),
                catchError(() => {
                    return of({
                        data: false,
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

                } else {
                    if (response.data) {
                        this.utility.showMessage('Login successful');
                        this.activeModal.close('');
                    } else {
                        this.utility.showError('Invalid Capcha');
                    }
                }



            });
    }
    refreshCapcha(): void {
        this.loadCapcha();
    }
}


