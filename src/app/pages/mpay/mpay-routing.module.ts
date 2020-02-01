import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'src/app/services/auth/permission.guard';

const routes: Routes = [
    {
        path: '',
        children: [ 
            {
                path: 'deposits',
                loadChildren: './deposits/component.module#DepositsComponentModule',
                canActivate: [PermissionGuard],
                data: { 
                    resourceKey: 'DEPOSITS',
                    permissionAction: 'ACCESS'
                } 
            },
            {
                path: 'refundtransaction',
                loadChildren: './refundtransaction/component.module#RefundTransctionComponentModule',
                // canActivate: [PermissionGuard],
                // data: { 
                //     resourceKey: 'DEPOSITS',
                //     permissionAction: 'ACCESS'
                // } 
            },
            {
                path: 'waitingdeposite',
                loadChildren: './waitingdeposite/component.module#WaitingDepositsComponentModule',
                // canActivate: [PermissionGuard],
                // data: { 
                //     resourceKey: 'DEPOSITS',
                //     permissionAction: 'ACCESS'
                // } 
            },
            {
                path: 'processdeposite',
                loadChildren: './processdeposite/component.module#ProcessDepositsComponentModule',
                // canActivate: [PermissionGuard],
                // data: { 
                //     resourceKey: 'DEPOSITS',
                //     permissionAction: 'ACCESS'
                // } 
            },
            {
                path: 'withdrawal',
                loadChildren: './withdrawal/component.module#WithdrawalComponentModule',
                canActivate: [PermissionGuard],
                data: { 
                    resourceKey: 'WITHDRAWAL',
                    permissionAction: 'ACCESS'
                } 
            },
            {
                path: 'freeze',
                loadChildren: './freeze/component.module#FreezeComponentModule',
                canActivate: [PermissionGuard],
                data: { 
                    resourceKey: 'FREEZE',
                    permissionAction: 'ACCESS'
                } 
            }
            ,
            {
                path: 'payment',
                loadChildren: './payment/component.module#PaymentComponentModule',
                canActivate: [PermissionGuard],
                data: { 
                    resourceKey: 'PAYMENT',
                    permissionAction: 'ACCESS'
                } 
            }
            ,
            {
                path: 'wallettrans',
                loadChildren: './wallettrans/component.module#WalletTransComponentModule',
                canActivate: [PermissionGuard],
                data: { 
                    resourceKey: 'WALLETTRANS',
                    permissionAction: 'ACCESS'
                } 
            },
            {
                path: 'bankdeposit',
                loadChildren: './bankinfo/component.module#BankInfoComponentModule',
                canActivate: [PermissionGuard],
                data: { 
                    resourceKey: 'BANKINFO',
                    permissionAction: 'ACCESS'
                } 
            },
            {
                path: 'approval',
                loadChildren: './approval/component.module#ApprovalOrderComponentModule',
                canActivate: [PermissionGuard],
                data: { 
                    resourceKey: 'APPROVALORDER',
                    permissionAction: 'ACCESS'
                } 
            },
            {
                path: 'orderpaymentapproval',
                loadChildren: './orderpaymentapproval/component.module#OrderPaymentApprovalComponentModule',
                canActivate: [PermissionGuard],
                data: { 
                    resourceKey: 'ORDERPAYMENTAPPROVAL',
                    permissionAction: 'ACCESS'
                } 
            },
            {
                path: 'orderpaid',
                loadChildren: './orderpaid/component.module#OrderPaidComponentModule',
                canActivate: [PermissionGuard],
                data: { 
                    resourceKey: 'ORDERPAID',
                    permissionAction: 'ACCESS'
                } 
            },
            {
                path: 'approvaladvancepayment',
                loadChildren: './approvaladvancepayment/component.module#ApprovalAdvancePaymentComponentModule',
                canActivate: [PermissionGuard],
                data: { 
                    resourceKey: 'APPROVALADVANCEPAYMENT',
                    permissionAction: 'ACCESS'
                } 
            },
            {
                path: 'waitingapprovalorder',
                loadChildren: './waitingapprovalorder/component.module#WaitingApprovalOrderComponentModule',
                // canActivate: [PermissionGuard],
                // data: { 
                //     resourceKey: 'APPROVALADVANCEPAYMENT',
                //     permissionAction: 'ACCESS'
                // } 
            },
            {
                path: 'bankhistory',
                loadChildren: './banktransactionhistory/component.module#BankTransactionHistoryComponentModule',
                canActivate: [PermissionGuard],
                data: { 
                    resourceKey: 'BANKTRANSACTIONHISTORY',
                    permissionAction: 'ACCESS'
                } 
            },
            {
                path: 'bankclientinfo',
                loadChildren: './bankclientinfo/component.module#BankClientInfoComponentModule',
                canActivate: [PermissionGuard],
                data: { 
                    resourceKey: 'BANKCLIENTINFO',
                    permissionAction: 'ACCESS'
                }
            }
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]

})


export class MpayRoutingModule { }
