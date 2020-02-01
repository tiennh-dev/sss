
import { Routes, RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FileService } from 'src/app/services/file.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadModule } from 'ng2-file-upload';
import { BlockUIModule } from 'ng-block-ui';
import { NgSelectModule } from '@ng-select/ng-select';
import { EditorModule } from '@tinymce/tinymce-angular';

import { IndexComponent } from './index.component';
import { OrderPaymentProcessComponent } from './orderpaymentapproval.process.component';
import { AcceptOrderPaymentApprovalComponent } from './acceptorderpaymentapproval.component';
import { OrderPaymentCustomerInfoComponent } from './orderpaymentcustomerinfo.component';
import { OrderPaymentWorkflowComponent } from './orderpaymentworkflow.component';
import { VizModule } from 'src/app/shared/workflow/viz/viz.module';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { CreatePaymentComponent } from './createpayment.component';
import { OrderPaymentApprovalService } from 'src/app/services/orderpaymentapproval.service';
import { orderpaymentapprovalFormatCurrencyDirective } from './orderpaymentapprovalformatcurrency.directive';
import { PaymentApprovalMultiComponent } from './paymentapprovalmulti.component';
import { PaymentApprovalBatchesComponent } from './paymentapprovalinbatches.component';
 
const routes: Routes = [
  {
    path: '',
     component: IndexComponent
  }
];
@NgModule({
  declarations: [
     IndexComponent,
     OrderPaymentProcessComponent,
     AcceptOrderPaymentApprovalComponent,
     OrderPaymentCustomerInfoComponent,
     OrderPaymentWorkflowComponent,
     CreatePaymentComponent,
     orderpaymentapprovalFormatCurrencyDirective,
     PaymentApprovalMultiComponent,
     PaymentApprovalBatchesComponent
  ],
  imports: [
    CommonModule,
    FormsModule, FileUploadModule,
    ReactiveFormsModule,
    DataTablesModule,
    NgbModule,
    DragDropModule,
    RouterModule.forChild(routes),
    BlockUIModule.forRoot({
      delayStart: 100,
      delayStop: 500
    }),
    NgSelectModule,
    EditorModule, VizModule, KeyboardShortcutsModule.forRoot()
  ],
  providers: [
    FileService,
    OrderPaymentApprovalService,
    CurrencyPipe, DecimalPipe,
  ],
  bootstrap: [
    IndexComponent,
    OrderPaymentProcessComponent,
    AcceptOrderPaymentApprovalComponent,
    OrderPaymentCustomerInfoComponent,
    OrderPaymentWorkflowComponent,
    CreatePaymentComponent,
    PaymentApprovalMultiComponent,
    PaymentApprovalBatchesComponent
  ],
})

export class OrderPaymentApprovalComponentModule {
}
