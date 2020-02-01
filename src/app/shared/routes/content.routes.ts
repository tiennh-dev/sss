import { Routes } from '@angular/router';
import { HomeComponent } from '../../pages/home/home.component';
export const content: Routes = [
  {
    path: 'dashboard',
    loadChildren: './pages/dashboard/dashboard.module#DashboardModule'
  },
  {
    path: 'mpay',
    loadChildren: './pages/mpay/mpay.module#MpayModule'
  },
  {
    path: 'home',
    component: HomeComponent
  }
];
