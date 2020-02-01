import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FileService } from 'src/app/services/file.service';
import { PaymentService } from '../../../services/payment.service';
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
import { TransactionProcessingComponent } from './payment.process.component';
import { WorkflowPaymentComponent } from './workflowpayment.component';
import { VizModule } from 'src/app/shared/workflow/viz/viz.module';
import { AddPaymentComponent } from './addpayment.component';
import { OrderInfomationComponent } from './orderinfomation.component';
import { CustomerInfoComponent } from './customer-info.component';
import { RefundComponent } from './refund.component';
import { PaymentFormatCurrencyDirective } from './paymentformatcurrency.directive';


const routes: Routes = [
  {
    path: '',
    component: IndexComponent
  }
];
@NgModule({
  declarations: [
    IndexComponent,
    TransactionProcessingComponent,
    WorkflowPaymentComponent,
    AddPaymentComponent,
    OrderInfomationComponent,
    CustomerInfoComponent,
    RefundComponent,
    PaymentFormatCurrencyDirective
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
    EditorModule, VizModule
  ],
  providers: [
    FileService,
    PaymentService
  ],
  bootstrap: [
    TransactionProcessingComponent,
    WorkflowPaymentComponent,
    AddPaymentComponent,
    OrderInfomationComponent,
    CustomerInfoComponent,
    RefundComponent
  ],
  //  entryComponents: [AddComponent]

})

export class PaymentComponentModule {
}
