import { Routes, RouterModule } from '@angular/router';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { FileService } from 'src/app/services/file.service';
import { DepositsService } from '../../../services/deposits.service';
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
import { RefundTransactionService } from 'src/app/services/refundtransaction.service';
import { RefundTransactionProcessingComponent } from './refundtransaction.process.component';
import { WorkflowRefundTransactionComponent } from './WorkflowRefundTransaction.component';
import { RefundTransactionCustomerInfoComponent } from './RefundTransactionCustomerInfo.component';
import { VizModule } from 'src/app/shared/workflow/viz/viz.module';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { RefundTransactionStatusComponent } from './refundtransactionconfirm-status.component';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent
  }
];
@NgModule({
  declarations: [
    IndexComponent,
     RefundTransactionProcessingComponent,
     WorkflowRefundTransactionComponent,
     RefundTransactionCustomerInfoComponent,
     RefundTransactionStatusComponent
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
    EditorModule,
    VizModule,KeyboardShortcutsModule.forRoot()
  ],
  providers: [
    FileService,
    RefundTransactionService,
    CurrencyPipe, DecimalPipe
  ],
  bootstrap: [
    IndexComponent,
     RefundTransactionProcessingComponent,
     WorkflowRefundTransactionComponent,
     RefundTransactionCustomerInfoComponent,
     RefundTransactionStatusComponent
  ]
})

export class RefundTransctionComponentModule {
}
