import { DepositsService } from '../../../services/deposits.service';
import { Component, OnInit, AfterViewInit, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { of, merge, pipe } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { switchMap, catchError, filter, startWith, map } from 'rxjs/operators';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
// -----------------------
import { ConfigSetting, FreezeAddDefault } from 'src/app/common/config-setting';
import * as model from '../../../models/model/freeze.model';
import * as req from '../../../models/request/customer.request';
import * as reqfree from '../../../models/request/freeze.request';
import { UtilityService } from 'src/app/services/utility.service';
import { TinymceConfig } from 'src/app/common/tinymce-config';
import { FreezeService } from 'src/app/services/freeze.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import * as modelwall from '../../../models/model/wallet.model';

const URL = ConfigSetting.IMAGE_UPLOAD;

@Component({
    selector: 'app-freeze-add',
    templateUrl: './freezeadd.component.html'
})

export class FreeZeAddComponent implements OnInit, OnDestroy {
    @BlockUI('blockui') blockUI: NgBlockUI;
    public form: FormGroup;
    public customerList=[];
    public dataModel: model.FreezeAdd;
    public wallets: modelwall.WalletList[];
    public refType:any[]=[];
    public Type:any[]=[];
    public submitted = false;

    private searchCustomer: string = '';
    private refresh: EventEmitter<any> = new EventEmitter<any>();
    get f() { return this.form.controls; }
    constructor(private service : FreezeService,private _formBuilder: FormBuilder,
        public activeModal: NgbActiveModal,private utility: UtilityService){
            this.refType=[
                {id:'',name:'Thanh toán'},
                {id:'AUC_PRODUCT',name:'AUC_PRODUCT'}
            ]
            this.Type=[
                {id:'BID_VIP',name:'Đấu giá'},
                {id:'PAYMENT',name:'Thanh toán'}
            ]
    }
    ngOnInit(){
        this.dataModel = new model.FreezeAdd();
        this.dataModel.refType = FreezeAddDefault.RefTypeDefault;
        this.dataModel.type = FreezeAddDefault.TypeDefault;
        this.onLoadCustomerList();
        this.onLoadWallets();
        this.form = this.CreateForm();
    }
    CreateForm(): FormGroup {
        return this._formBuilder.group({
            accountId: [this.dataModel.accountId, Validators.required],
            amount: [this.dataModel.amount, [Validators.required, Validators.min(0)]],
            walletId: [this.dataModel.walletId, [Validators.required]],
            type: [this.dataModel.type, [Validators.required]],
            refType: [this.dataModel.refType, null],
            description: [this.dataModel.description, '']
        });
    }
    private onLoadCustomerList():void{
        merge(this.refresh)
        .pipe(
            startWith({}),
            switchMap(() => {
                this.customerList = [];
                const request: req.CustomerListTopRequest = {
                    keyword: this.searchCustomer,
                    limit: 20
                };
                return this.service.getListTopCustomer(request);
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

    onLoadWallets(): void {
        merge()
            .pipe(
                startWith({}),
                switchMap(() => {
                    return this.service.getwallets();
                }),
                map(response => {
                    return response.data;
                })
            ).subscribe(res => {
                this.wallets = res;

                if (this.wallets.length > 0) {
                    this.dataModel.walletId = this.wallets[0].id;
                }
            });
    }

    onSubmit(){
        this.submitted = true;

        if (this.form.invalid) {
            return;
        }

        of(this.form.valid)
        .pipe(
            filter(x => x),
            switchMap(() => {
                const request: reqfree.FreeZeAddNewRequest = this.form.getRawValue();
                const val = this.form.get('amount').value;
                var amount =  Number(val.replace(/[^0-9.-]+/g,""));
                request.amount = amount;
                this.utility.showProcessing(this.blockUI);
                return this.service.AddFreeZe(request)
            }),
            catchError(() => {
                this.utility.cancelProcessing(this.blockUI);

                return of({
                    status: false,
                    errorCode: ErrorCodeDefine.UNKNOW_ERROR,
                    parameters: null
                });
            })
        ).subscribe(response => {
            this.utility.cancelProcessing(this.blockUI);

            if (!response.status) {
                this.utility.showError(response.errorCode,
                    response.parameters);
                return;
            }

            this.utility.showMessage('Add new successfully');
            this.activeModal.close('');
        })
    }
  
    ngOnDestroy(){}
    searchAutoCompeleteCustomer(e) {
        this.searchCustomer = e.term;
        this.refresh.emit();
    }
}