import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FileService } from 'src/app/services/file.service';
import { BankTransactionHistoryService } from '../../../services/banktransactionhistory.service';
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
import { EditComponent } from './edit.component';
import { AddBankHistoryComponent } from './addbankhistory.component';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent
  }
];
@NgModule({
  declarations: [
    IndexComponent, EditComponent,AddBankHistoryComponent
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
    EditorModule
  ],
  providers: [
    FileService,
    BankTransactionHistoryService
  ],
  bootstrap: [
    EditComponent
  ],
  entryComponents: [AddBankHistoryComponent]

})

export class BankTransactionHistoryComponentModule {
}
