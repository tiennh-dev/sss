import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FileService } from 'src/app/services/file.service';
import { WithdrawalService } from '../../../services/withdrawal.service';
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
import { ConfirmStatusComponent } from './confirm-status.component';
import { UploadProofImageComponent } from './upload-proofimage.component';
import { AddComponent } from './add.component';
import { transprocesswithdrawalcomponent } from './withdrawal.process.component';
import { WorkflowWithdrawalComponent } from './workflow-withdrawal.component';
import { VizModule } from 'src/app/shared/workflow/viz/viz.module';
import { CustomerInfoComponent } from './customer-info.component';


const routes: Routes = [
  {
    path: '',
    component: IndexComponent
  }
];
@NgModule({
  declarations: [
    IndexComponent,
    ConfirmStatusComponent,
    UploadProofImageComponent,
    AddComponent,
    transprocesswithdrawalcomponent,
    WorkflowWithdrawalComponent,
    CustomerInfoComponent
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
    EditorModule,VizModule
  ],
  providers: [
    FileService,
    WithdrawalService
  ],
  bootstrap: [
    IndexComponent,
    ConfirmStatusComponent,
    UploadProofImageComponent,
    AddComponent,
    transprocesswithdrawalcomponent,
    WorkflowWithdrawalComponent,
    CustomerInfoComponent
  ],
  //  entryComponents: [AddComponent]

})

export class WithdrawalComponentModule {
}
