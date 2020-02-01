

import { Routes, RouterModule } from '@angular/router';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
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

import { VizModule } from 'src/app/shared/workflow/viz/viz.module';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import {WorkflowService} from '../../../services/workflow.service';
import { IndexComponent } from './index.component';
import { OrderPaidApprovalMultiComponent } from './orderpaidapprovalmulti.component';
import { OrderPaidAddPaymentComponent } from './orderpaidaddpayment.component';
import { OrderPaidProcessComponent } from './orderpaid.process.component';
import { OrderPaidCustomerInfoComponent } from './orderpaidcustomer-info.component';
import { OrderPaidWorkflowComponent } from './orderpaidworkflow.component';
import { OrderPaidService } from 'src/app/services/orderpaid.service';
import { orderpaidFormatCurrencyDirective } from './orderpaidformatcurrency.directive';

const routes: Routes = [
  {
    path: '',
     component: IndexComponent
  }
];
@NgModule({
  declarations: [
     IndexComponent,
     OrderPaidAddPaymentComponent,
     OrderPaidProcessComponent,
     OrderPaidWorkflowComponent,
    OrderPaidCustomerInfoComponent,
    OrderPaidApprovalMultiComponent,
    orderpaidFormatCurrencyDirective
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
    OrderPaidService,
    WorkflowService,
    CurrencyPipe, DecimalPipe,
  ],
  bootstrap: [
    IndexComponent,
    OrderPaidAddPaymentComponent,
    OrderPaidProcessComponent,
    OrderPaidWorkflowComponent,
    OrderPaidCustomerInfoComponent,
    OrderPaidApprovalMultiComponent
  ],
})

export class OrderPaidComponentModule {
}
