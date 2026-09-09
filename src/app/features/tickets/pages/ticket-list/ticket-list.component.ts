import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TicketService, Ticket, TicketStatus, Priority, TicketListResponse } from '../../../../core/services/ticket.service';
import { AuthService, User } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] = [];
  currentUser: User | null = null;
  loading = false;
  error = '';

  filter: {
    status: TicketStatus | '';
    priority: Priority | '';
    page: number;
    limit: number;
  } = {
    status: '',
    priority: '',
    page: 1,
    limit: 10
  };

  totalPages = 1;

  get currentPage(): number {
    return this.filter.page;
  }

  constructor(
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.error = '';

    const { status, priority, page, limit } = this.filter;

    const statusParam = status ? (status as TicketStatus) : undefined;
    const priorityParam = priority ? (priority as Priority) : undefined;

    this.ticketService.getTickets(statusParam, priorityParam, page, limit).subscribe({
      next: (response: TicketListResponse) => {
        this.tickets = response.data || [];
        this.totalPages = response.meta?.totalPages || 1;
        this.loading = false;
      },
      error: (err: { message?: string }) => {
        this.error = err.message || 'Error al cargar los tickets';
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.filter.page = 1;
    this.loadTickets();
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.filter.page = newPage;
      this.loadTickets();
    }
  }
}