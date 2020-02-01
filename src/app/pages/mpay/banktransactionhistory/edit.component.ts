import { BankTransactionHistoryService } from './../../../services/banktransactionhistory.service';
import { Component, OnInit, AfterViewInit, Input, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { of, merge } from 'rxjs';
import { NgbActiveModal, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { switchMap, catchError, filter, startWith, map } from 'rxjs/operators';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import * as model from '../../../models/model/banktransactionhistory.model';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
    selector: 'app-banktransactionhistory-edit',
    templateUrl: './edit.component.html',
})


export class EditComponent implements AfterViewInit, OnInit {
    @Input() itemId: any;
    public form: FormGroup;
    public dataModel: model.BankTransactionHistoryUpdate;
    get f() { return this.form.controls; }
    submitted = false;
    constructor(private ctService: BankTransactionHistoryService,
        private utility: UtilityService,
        public activeModal: NgbActiveModal,
        private _formBuilder: FormBuilder) {

    }


    ngOnInit() {
        this.dataModel = new model.BankTransactionHistoryUpdate();

        this.ctService.getDetail(this.itemId)
            .subscribe(response => {
                if (!response.status) {
                    this.utility.showError(response.errorCode,
                        response.parameters);
                }
                this.dataModel = response.data;
                console.log(this.dataModel);

                this.form = this.onCreateForm();
            });
    }

    onCreateForm(): FormGroup {
        return this._formBuilder.group({
            id: [this.dataModel.id, null],
            note: [this.dataModel.note, null],
        });
    }

    onSubmit(): void {
        this.submitted = true;
        of(this.form.valid)
            .pipe(
                filter(m => m),
                switchMap(() => {
                    return this.ctService.update(this.dataModel);
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

                this.utility.showMessage('Bank Transaction History saved');
                this.activeModal.close('');
            });
    }

    ngAfterViewInit(): void {

    }
}


