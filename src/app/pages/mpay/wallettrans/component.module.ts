import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FileService } from 'src/app/services/file.service';
import { WalletTransService } from '../../../services/wallettrans.service';
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

const routes: Routes = [
  {
    path: '',
    component: IndexComponent
  }
];
@NgModule({
  declarations: [
    IndexComponent
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
    WalletTransService
  ],
  bootstrap: [
  ],
  //  entryComponents: [AddComponent]

})

export class WalletTransComponentModule {
}
