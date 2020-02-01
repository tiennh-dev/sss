import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgbModule, NgbDateNativeUTCAdapter, NgbDateAdapter, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateCustomParserFormatter } from '../../../common/date-parser-formater';
import { FileUploadModule } from 'ng2-file-upload';
import { BlockUIModule } from 'ng-block-ui';
import { NgSelectModule } from '@ng-select/ng-select';
import { EditorModule } from '@tinymce/tinymce-angular';

import { FileService } from 'src/app/services/file.service';
import {BankInfoService} from './../../../services/bankinfo.service';

import { AddComponent } from './add.component';
import { IndexComponent } from './index.component';
import { EditComponent } from './edit.component';
const routes: Routes = [
  {
    path: '',
    component: IndexComponent
  }
];
@NgModule({
  declarations: [
    AddComponent, IndexComponent, EditComponent
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
    BankInfoService,
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }, // formatdate
    { provide: NgbDateAdapter, useClass: NgbDateNativeUTCAdapter }
  ],
  bootstrap: [
    AddComponent, EditComponent
  ],
  //  entryComponents: [AddComponent]

})

export class BankInfoComponentModule {
}
