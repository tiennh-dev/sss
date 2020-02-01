import { DepositsService } from './../../../services/deposits.service';
import { Component, OnInit, AfterViewInit, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { of, merge } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { switchMap, catchError, filter, startWith, map } from 'rxjs/operators';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
// -----------------------
import { ConfigSetting } from 'src/app/common/config-setting';
import * as model from '../../../models/model/deposits.model';
import * as req from '../../../models/request/customer.request';
import { UtilityService } from 'src/app/services/utility.service';
import { TinymceConfig } from 'src/app/common/tinymce-config';
import { WaitingDepositsService } from 'src/app/services/waitingdeposite.service';
import { BankInfoDetail } from 'src/app/models/model/bankinfo.model';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

const URL = ConfigSetting.IMAGE_UPLOAD;

@Component({
    selector: 'app-createdeposite',
    templateUrl: './createdeposite.component.html'
})

export class CreateDepositeComponent implements OnInit, OnDestroy {
    @BlockUI('blockui') blockUI: NgBlockUI;
    ckeConfig: any;
    public bankInfo:BankInfoDetail;
    public form: FormGroup;
    private dataModel: model.DepositsAdd;
    public customerList: any[] = [];
    public walletList: any[] = [];
    public bankInfoList:any[]=[];
    public showAndHideModel: boolean = false;
    public infomationDetails:boolean=false;
    public disabledDeposite:boolean=false;
    public checkBankingInfo: boolean;
    public image_preview = null;
    public image_request = null;
    public showMessage='';
    private refresh: EventEmitter<any> = new EventEmitter<any>();
    private searchCustomer: string = '';
    get f() { return this.form.controls; }
    submitted = false;
    uploader: FileUploader;
    constructor(private _service: WaitingDepositsService,
        private utility: UtilityService,
        public activeModal: NgbActiveModal,
        private _formBuilder: FormBuilder) {
        const token: string = ConfigSetting.GetAuthenToken;
        this.uploader = new FileUploader({
            url: URL, allowedMimeType: ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'],
            autoUpload: true,
            authToken: 'Bearer ' + token
        });
    }

    ngOnInit() {
        this.ckeConfig = TinymceConfig.Init();
        this.dataModel = new model.DepositsAdd();
        this.form = this.onCreateForm();
        this.uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };
        this.uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };

        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
            if (status === 200) {
                this.image_request = JSON.parse(response).path + '/' + JSON.parse(response).name;
                this.image_preview = JSON.parse(response).fullUrl;
            }
        };

        this.getWalletList();
        this.onLoadBankInfo();
        merge(this.refresh)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.customerList = [];
                    const request: req.CustomerListTopRequest = {
                        keyword: this.searchCustomer,
                        limit: 20
                    };
                    return this._service.getListTopCustomer(request);
                }),
                map(response => {
                    // Flip flag to show that loading has finished.
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

                    return of(this.customerList[0]);
                })
            ).subscribe(res => {
                if (res !== undefined && res.data != null) {
                    this.customerList = res.data.map((e, i) => {
                        if (e.fullname != null && e.username != null && e.fullname != '' && e.username != '') {
                            e.fName = e.fullname + '- [ ' + e.username + ' ]';
                            return e;
                        } 
                        else if (e.username != '' && e.username != null) {
                            e.fName = e.username;
                            return e;
                        }
                        else if (e.fullname != '' && e.fullname != null) {
                            e.fName = e.fullname;
                            return e;
                        }
                    });
                }
            });
    }

    private onLoadBankInfo(){
        merge()
        .pipe(
            startWith({}),
            switchMap(() => {
                return this._service.getListBankInfoByBankNumber();
            }),
            map(response => {
                if (!response.status) {
                    this.utility.showError(response.errorCode,
                        response.parameters);
                }
                return response;
            }),
            catchError(() => {
                this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                    null);

                return of(this.bankInfoList[0]);
            })
        ).subscribe(res => {
            if ( res.data != null) {
                this.bankInfoList = res.data.map((item, i) => {
                    item.Name = item.accountNumber + '- ' + item.accountName + '-' +item.bankName;
                    return item;
                });
                console.log(this.bankInfoList);
            }
        });
    }

    chooseAccountNumber(item:any){
       if(item!=undefined || item!=null){
           this.infomationDetails=true;
       }else{
           this.infomationDetails=false;
       }
    }

    getWalletList(): void {
        merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    return this._service.getListWallet();
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
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                        null);

                    return of(this.walletList[0]);
                })
            ).subscribe(res => {
                if (res !== undefined) {
                    this.walletList = res.data;
                }
            });
    }

    /**
   * On destroy
   */
    ngOnDestroy(): void {
    }

    onCreateForm(): FormGroup {
        return this._formBuilder.group({
            accountId: [this.dataModel.accountId, Validators.required],
            amount: [this.dataModel.amount, [Validators.required]],
            walletId: [this.dataModel.walletId, Validators.required],
            accountNumber: [this.dataModel.accountNumber, null],
            ftCode: [this.dataModel.ftCode, Validators.required],
            note: [this.dataModel.note, null],
            bankDate: [this.dataModel.bankDate, null],
        });
    }

    formatPrice(amount:any):string{
        return amount != null ? (amount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + ' đ') : '';
    }

    nextDetail(): void {
        this.submitted = true;
        if (!this.form.valid) {
            return;
        } else {
            this.showAndHideModel = true;
            let bannkNumber =  this.form.get('accountNumber').value;
            const val = this.form.get('amount').value;
            const AccountId = this.form.get('accountId').value;
            var amount = Number(val.replace(/[^0-9.-]+/g, ""));
            this._service.getBankInfoByBankNumber(bannkNumber).subscribe(response=>{
                if(response.data==null){
                    this.checkBankingInfo = true;
                    this.showMessage="Số tài khoản thụ hưởng chưa được kích hoạt";
                }else{
                    this.checkBankingInfo = false;
                    this.bankInfo = response.data;
                    this.bankInfo.amountDeposite = amount;
                    this.customerList.filter(x=>x.accountId==AccountId).forEach(x=>  {this.bankInfo.customerName = x.fullname, this.bankInfo.customerPhoneNumber = x.phone});
                }
            });
        }
    }

    createDeposite():void{
        of()
        .pipe(
            startWith({}),
            switchMap(() => {
                const request: model.DepositsAdd = this.form.getRawValue();
                const val = this.form.get('amount').value;
                const bankNumber = this.form.get('accountNumber').value;
                var amount =  Number(val.replace(/[^0-9.-]+/g,""));
                request.amount = amount;
                request.bankDescription = this.bankInfo.description;
                request.bankNumber = bankNumber;
                request.bankName = this.bankInfo.bankName;
                request.payImage=this.image_request;
                this.utility.showProcessing(this.blockUI);
                return this._service.add(request);
            }),
            catchError(() => {
                this.utility.cancelProcessing(this.blockUI);
                return of({
                    status: false,
                    errorCode: ErrorCodeDefine.UNKNOW_ERROR,
                    parameters: null
                });
            })
        )
        .subscribe((response) => {
            this.utility.cancelProcessing(this.blockUI);
            if (!response.status) {
                this.utility.showError(response.errorCode,
                    response.parameters);
                return;
            }
 
           this.disabledDeposite=true;
        });
    }

    submit(): void {
        this.submitted = true;
        of(this.form.valid)
            .pipe(
                filter(m => m),
                switchMap(() => {
                    const request: model.DepositsAdd = this.form.getRawValue();
                    const val = this.form.get('amount').value;
                    var amount =  Number(val.replace(/[^0-9.-]+/g,""));
                    request.amount=amount;
                    this.utility.showProcessing(this.blockUI);
                    return this._service.add(request);
                }),
                catchError(() => {
                    this.utility.cancelProcessing(this.blockUI);
                    return of({
                        status: false,
                        errorCode: ErrorCodeDefine.UNKNOW_ERROR,
                        parameters: null
                    });
                })
            )
            .subscribe((response) => {
                this.utility.cancelProcessing(this.blockUI);
                if (!response.status) {
                    this.utility.showError(response.errorCode,
                        response.parameters);
                    return;
                }

                this.utility.showMessage('Nạp tiền thành công');
                this.activeModal.close('');
            });
    }

    cancel():void{
        this.showAndHideModel = false;
    }

    searchAutoCompeleteCustomer(e) {
        this.searchCustomer = e.term;
        this.refresh.emit();
    }

    removeImage(): void {
        this.dataModel.payImage = null;
        this.image_preview = null;
    }
}


