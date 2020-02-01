import { Component, OnInit, AfterViewInit, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { merge, of, Subject } from 'rxjs';
import { startWith, switchMap, map, catchError, takeUntil } from 'rxjs/operators';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { ShortcutInput } from 'ng-keyboard-shortcuts';
import { ErrorCodeDefine } from 'src/app/common/error-code-define';
import { UtilityService } from 'src/app/services/utility.service';
import { Customer } from 'src/app/models/model/customer.model';
import { MemberShipLevel } from 'src/app/models/model/MemberShipLevel.model';
import { EmployeeDetail } from 'src/app/models/model/warehouse-emp.model';
import { PurchaseBuyForYouService } from 'src/app/services/purchase.buyforyou.service';
import { PaymentService } from 'src/app/services/payment.service';
import { DepositsService } from 'src/app/services/deposits.service';
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'app-customer-info',
    templateUrl: './customer-info.component.html'
})


export class CustomerInfoComponent implements OnInit, AfterViewInit {
    public shortcuts: ShortcutInput[] = [];
    @BlockUI('blockui') blockUI: NgBlockUI;
    @Input() itemId: any;
    public refreshPaymentEvent: EventEmitter<any> = new EventEmitter<any>();
    public refreshCustomerInfo: EventEmitter<any> = new EventEmitter<any>();
    public refreshWalletInfo: EventEmitter<any> = new EventEmitter<any>();
    public refreshEmpInfo: EventEmitter<any> = new EventEmitter<any>();
    public destroyed = new Subject();
    public customerInfo: Customer;
    public empInfo: EmployeeDetail;
    public levelModel: MemberShipLevel;
    public walletInfo: any[] = [];

    constructor(public activeModal: NgbActiveModal,
        private orderService: DepositsService,
        private utility: UtilityService) {
    }
    ngOnInit() {
        this.loadCustomerInfo();
        this.loadEmpSupport();
        this.loadLevelInfo();
        this.loadWalletInfo();
    }
    ngAfterViewInit() {
    }
    public IsEmpty(values: any[]): boolean {
        return !values || values.length === 0;
    }

    private loadCustomerInfo(): void {
        merge(this.refreshCustomerInfo)
            .pipe(
                takeUntil(this.destroyed),
                startWith({}),
                switchMap(() => {
                    return this.orderService.loadCustomerInfo(this.itemId);
                }),
                map(response => {
                    if (!response.status) {
                        this.utility.showError(response.errorCode, response.parameters);
                    }

                    return response.data;
                }),
                catchError(() => {
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR, null);

                    return of(null);
                })
            )
            .subscribe(data => {
                this.customerInfo = data;
            });
    }

    private loadWalletInfo(): void {
        merge(this.refreshWalletInfo)
            .pipe(
                startWith({}),
                switchMap(() => {
                    return this.orderService.getWalletInfo(this.itemId);
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
                    return of(null);
                })
            ).subscribe(res => {
                this.walletInfo = res.data;
            });
    }
    priceDisplay(p: any): string {
        return p != null ? p.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : ' ';
    }
    private loadEmpSupport(): void {
        merge(this.refreshEmpInfo)
            .pipe(
                startWith({}),
                switchMap(() => {
                    return this.orderService.getEmpInfo(this.itemId);
                }),
                map(response => {
                    if (!response.status) {
                    }
                    return response;
                }),
                catchError(() => {
                    this.utility.showError(ErrorCodeDefine.UNKNOW_ERROR,
                        null);
                    return of(null);
                })
            ).subscribe(res => {
                this.empInfo = res.data;
            });
    }
    private loadLevelInfo(): void {
        this.orderService.getMembershipInfo(this.itemId)
            .subscribe(response => {
                this.levelModel = response;
            });
    }

    onSubmit(): void {
    }

    /**
     * On destroy
     */
    // tslint:disable-next-line: use-life-cycle-interface
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this.destroyed.next();
        this.destroyed.complete();
        this.refreshPaymentEvent.complete();
        this.refreshCustomerInfo.complete();
        this.refreshWalletInfo.complete();
        this.refreshEmpInfo.complete();
    }

    refreshPayment(): void {
        this.refreshPaymentEvent.emit();
    }
}
