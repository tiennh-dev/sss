import { PaymentService } from 'src/app/services/payment.service';
import { PaymentJTable } from './../../../models/model/payment.model';
import { DepositsService } from './../../../services/deposits.service';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
// -----------------------
import { ConfigSetting } from 'src/app/common/config-setting';
import { UtilityService } from 'src/app/services/utility.service';
import { RefundRequest, CheckRefundFromPaymentExistingRequest } from 'src/app/models/request/payment.request';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'app-refund',
    templateUrl: './refund.component.html'
})

export class RefundComponent implements OnInit, OnDestroy {
    @Input()
    public payment: PaymentJTable;
    public description: string = 'Hoàn tiền';
    public paymentRefundExisting: boolean = true;

    constructor(private paymentService: PaymentService,
        private utility: UtilityService,
        public activeModal: NgbActiveModal) {
    }

    ngOnInit() {
        this.checkRefundExisting();
    }

    /**
   * On destroy
   */
    ngOnDestroy(): void {
    }

    public formatFrice(input: any) {
        return input != null ? input.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : '';
      }

    public onSubmit(): void {
        const request: RefundRequest = {
            paymentId: this.payment.Id,
            description: this.description
        };

        this.paymentService.refund(request).subscribe(response => {
            if (!response.status) {
                this.utility.showError(response.errorCode, response.parameters);

                return;
            }

            this.utility.showMessage('Hoàn tiền thành công!');
            this.activeModal.close();
        });
    }

    private checkRefundExisting() {
        const request: CheckRefundFromPaymentExistingRequest = {
            paymentId: this.payment.Id
        };

        this.paymentService.checkRefundExisting(request).subscribe(response => {
            this.paymentRefundExisting = response.status;
        });
    }
}
