import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { VendorListComponent } from './features/vendors/vendor-list/vendor-list.component';
import { VendorDetailComponent } from './features/vendors/vendor-detail/vendor-detail.component';
import { ContractListComponent } from './features/contracts/contract-list/contract-list.component';
import { ContractDetailComponent } from './features/contracts/contract-detail/contract-detail.component';
import { AiAssistantComponent } from './features/ai/ai-assistant/ai-assistant.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'vendors', component: VendorListComponent, canActivate: [authGuard] },
  { path: 'vendors/:id', component: VendorDetailComponent, canActivate: [authGuard] },
  { path: 'contracts', component: ContractListComponent, canActivate: [authGuard] },
  { path: 'contracts/:id', component: ContractDetailComponent, canActivate: [authGuard] },
  { path: 'ai-assistant', component: AiAssistantComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
