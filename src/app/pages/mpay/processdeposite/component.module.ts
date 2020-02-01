import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index.component';
import { NgModule } from '@angular/core';
import { FileService } from 'src/app/services/file.service';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { DataTablesModule } from 'angular-datatables';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BlockUIModule } from 'ng-block-ui';
import { NgSelectModule } from '@ng-select/ng-select';
import { EditorModule } from '@tinymce/tinymce-angular';
import { VizModule } from 'src/app/shared/workflow/viz/viz.module';
import { WaitingDepositsService } from 'src/app/services/waitingdeposite.service';
import { ProcessCreateDepositeComponent } from './processcreatedeposite.component';
import { ProcessDepositeConfirmStatusComponent } from './processdeposite-confirm-status.component';
import { ProcessDepositeCustomerInfoComponent } from './processdeposite-customer-info.component';
import { ProcessDepositeFormatCurrencyDirective } from './processdepositeformatcurrency.directive';
import { ProcessDepositeProcessingdepComponent } from './processdeposits.process.component';
import { WorkflowProcessDepositsComponent } from './workflow-processdeposits.component';
import { ProcessDepositsService } from 'src/app/services/processdeposite.service';

export const routes: Routes = [
  {
    path: '',
    component: IndexComponent
  }
];
@NgModule({
    declarations: [
      IndexComponent,
      ProcessCreateDepositeComponent,
      ProcessDepositeConfirmStatusComponent,
      ProcessDepositeCustomerInfoComponent,
      ProcessDepositeFormatCurrencyDirective,
      ProcessDepositeProcessingdepComponent,
      WorkflowProcessDepositsComponent,
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
      ProcessDepositsService,
       CurrencyPipe, DecimalPipe
    ],
    bootstrap: [
      IndexComponent,
      ProcessCreateDepositeComponent,
      ProcessDepositeConfirmStatusComponent,
      ProcessDepositeCustomerInfoComponent,
      ProcessDepositeProcessingdepComponent,
      WorkflowProcessDepositsComponent
    ]
  })
export class ProcessDepositsComponentModule {
}

