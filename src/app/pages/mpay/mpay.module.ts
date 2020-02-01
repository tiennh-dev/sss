import { DepositsComponentModule } from './deposits/component.module';
import { WithdrawalComponentModule } from './withdrawal/component.module';
import { PaymentComponentModule } from './payment/component.module';
import { FreezeComponentModule } from './freeze/component.module';
import { WalletTransComponentModule } from './wallettrans/component.module';
import { BankInfoComponentModule } from './bankinfo/component.module';
import { ApprovalOrderComponentModule } from './approval/component.module';
import { BankTransactionHistoryComponentModule } from './banktransactionhistory/component.module';
import { MpayRoutingModule } from './mpay-routing.module';
import { NgModule } from '@angular/core';
import { VizModule } from 'src/app/shared/workflow/viz/viz.module';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { OrderPaymentApprovalComponentModule } from './orderpaymentapproval/component.module';
import { OrderPaidComponentModule } from './orderpaid/component.module';
import { ApprovalAdvancePaymentComponentModule } from './approvaladvancepayment/component.module';
import { WaitingApprovalOrderComponentModule } from './waitingapprovalorder/component.module';
import { WaitingDepositsComponentModule } from './waitingdeposite/component.module';
import { ProcessDepositsComponentModule } from './processdeposite/component.module';
import { RefundTransctionComponentModule } from './refundtransaction/component.module';
import { BankClientInfoComponentModule } from './bankclientinfo/component.module';
 

@NgModule({
    declarations: [

    ],
    imports: [
        MpayRoutingModule,
        DepositsComponentModule,
        WithdrawalComponentModule,
        FreezeComponentModule,
        PaymentComponentModule,
        WalletTransComponentModule,
        BankInfoComponentModule,
        ApprovalOrderComponentModule,
        BankTransactionHistoryComponentModule,
        OrderPaymentApprovalComponentModule,
        OrderPaidComponentModule,
        ApprovalAdvancePaymentComponentModule,
        WaitingApprovalOrderComponentModule,
        WaitingDepositsComponentModule,
        ProcessDepositsComponentModule,
        RefundTransctionComponentModule,
        BankClientInfoComponentModule,
        VizModule, KeyboardShortcutsModule.forRoot()
    ],
    providers: [

    ]
})
export class MpayModule { }
