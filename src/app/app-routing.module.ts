import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

import { LoginComponent } from './features/auth/pages/login/login.component';
import { TicketListComponent } from './features/tickets/pages/ticket-list/ticket-list.component';
import { TicketDetailComponent } from './features/tickets/pages/ticket-detail/ticket-detail.component';
import { UserListComponent } from './features/users/pages/user-list/user-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'tickets', 
    component: TicketListComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'tickets/:id', 
    component: TicketDetailComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'users', 
    component: UserListComponent, 
    canActivate: [AuthGuard, roleGuard], 
    data: { role: 'admin' } 
  },
  { path: '**', redirectTo: 'tickets' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }