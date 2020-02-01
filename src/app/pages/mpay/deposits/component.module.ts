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
import { AddComponent } from './add.component';
import { ConfirmStatusComponent } from './confirm-status.component';
import { TransactionProcessingdepComponent } from './deposits.process.component';
import { WorkflowDepositsComponent } from './workflow-deposits.component';
import { VizModule } from 'src/app/shared/workflow/viz/viz.module';
import { CustomerInfoComponent } from './customer-info.component';
import { FormatCurrencyDirective } from './formatcurrency.directive';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent
  }
];
@NgModule({
  declarations: [
    IndexComponent,
    AddComponent,
    ConfirmStatusComponent,
    TransactionProcessingdepComponent,
    WorkflowDepositsComponent,
    CustomerInfoComponent,
    FormatCurrencyDirective,
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
    VizModule
  ],
  providers: [
    FileService,
    DepositsService,
    CurrencyPipe, DecimalPipe
  ],
  bootstrap: [
    IndexComponent,
    AddComponent,
    ConfirmStatusComponent,
    TransactionProcessingdepComponent,
    WorkflowDepositsComponent,
    CustomerInfoComponent,
  ]
})

export class DepositsComponentModule {
}
