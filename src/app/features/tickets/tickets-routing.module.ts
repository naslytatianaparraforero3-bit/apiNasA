import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketListComponent } from './pages/ticket-list/ticket-list.component';
import { TicketFormComponent } from './pages/ticket-form/ticket-form.component';
import { TicketDetailComponent } from './pages/ticket-detail/ticket-detail.component';

const routes: Routes = [
  { path: '', component: TicketListComponent },
  { path: 'create', component: TicketFormComponent },
  { path: ':id', component: TicketDetailComponent } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketsRoutingModule { }