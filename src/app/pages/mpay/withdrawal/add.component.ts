import { WithdrawalService } from './../../../services/withdrawal.service';
import { Component, OnInit, AfterViewInit, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { of, merge } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { switchMap, catchError, filter, startWith, map } from 'rxjs/operators';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
// -----------------------
import * as model from '../../../models/model/withdrawal.model';
import * as req from '../../../models/request/customer.request';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
    selector: 'app-withdrawal-add',
    templateUrl: './add.component.html'
})

export class AddComponent implements OnInit, OnDestroy {
    ckeConfig: any;
    public form: FormGroup;
    private dataModel: model.WithdrawalAdd;
    public customerList: any[] = [];
    public walletList: any[] = [];

    private refresh: EventEmitter<any> = new EventEmitter<any>();
    private searchCustomer: string = '';

    get f() { return this.form.controls; }
    submitted = false;
    constructor(private _service: WithdrawalService,
        private utility: UtilityService,
        public activeModal: NgbActiveModal,
        private _formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.dataModel = new model.WithdrawalAdd();
        this.form = this.onCreateForm();
        this.getWalletList();

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
            amount: [this.dataModel.amount, [Validators.required, Validators.min(100000)]],
            walletId: [this.dataModel.walletId, Validators.required],
            bankAccountName: [this.dataModel.bankAccountName, null],
            bankName: [this.dataModel.bankName, null],
            bankBranch: [this.dataModel.bankBranch, null],
            bankNumber: [this.dataModel.bankNumber, null],
            bankProvince: [this.dataModel.bankProvince, null],
            note: [this.dataModel.note, null]
        });
    }

    onSubmit(): void {
        this.submitted = true;
        of(this.form.valid)
            .pipe(
                filter(m => m),
                switchMap(() => {
                    const request: model.WithdrawalAdd = this.form.getRawValue();
                    return this._service.add(request);
                }),
                catchError(() => {
                    this.utility.showError("Vui lòng liên hệ để được trợ giúp");
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

                this.utility.showMessage('Hoàn thành');
                this.activeModal.close('');
            });
    }

    searchAutoCompeleteCustomer(e) {
        this.searchCustomer = e.term;
        this.refresh.emit();
    }
}


