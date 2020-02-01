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
import { CreateDepositeComponent } from './createdeposite.component';
import { WaitingDepositeConfirmStatusComponent } from './waitingdeposite-confirm-status.component';
import { WaitingDepositeCustomerInfoComponent } from './waitingdeposite-customer-info.component';
import { WaitingDepositeProcessingdepComponent } from './waitingdeposits.process.component';
import { WaitingDepositeFormatCurrencyDirective } from './waitingdepositeformatcurrency.directive';
import { WorkflowWaitingDepositsComponent } from './workflow-waitingdeposits.component';
import { VizModule } from 'src/app/shared/workflow/viz/viz.module';
import { WaitingDepositsService } from 'src/app/services/waitingdeposite.service';

export const routes: Routes = [
  {
    path: '',
    component: IndexComponent
  }
];
@NgModule({
    declarations: [
      IndexComponent,
      CreateDepositeComponent,
      WaitingDepositeConfirmStatusComponent,
      WaitingDepositeCustomerInfoComponent,
      WaitingDepositeProcessingdepComponent,
      WaitingDepositeFormatCurrencyDirective,
      WorkflowWaitingDepositsComponent
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
      WaitingDepositsService,
       CurrencyPipe, DecimalPipe
    ],
    bootstrap: [
      IndexComponent,
      CreateDepositeComponent,
      WaitingDepositeConfirmStatusComponent,
      WaitingDepositeCustomerInfoComponent,
      WaitingDepositeProcessingdepComponent,
      WorkflowWaitingDepositsComponent
    ]
  })
export class WaitingDepositsComponentModule {
}

