import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TicketService, Ticket, Comment, TicketStatus } from '../../../../core/services/ticket.service';
import { AuthService, User } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent implements OnInit {
  ticket: Ticket | null = null;
  comments: Comment[] = [];
  currentUser: User | null = null;
  loading = false;
  error = '';
  newComment = '';

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  get userRole(): string {
    return this.currentUser?.role || '';
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });

    const ticketId = this.route.snapshot.paramMap.get('id');
    if (ticketId) {
      this.loadTicketDetails(ticketId);
    }
  }

  loadTicketDetails(id: string): void {
    this.loading = true;
    this.error = '';

    this.ticketService.getTicket(id).subscribe({
      next: (ticket: Ticket) => {
        this.ticket = ticket;
        this.loading = false;
      },
      error: (err: { message?: string }) => {
        this.error = err.message || 'Error al cargar el ticket';
        this.loading = false;
      }
    });

    this.ticketService.getComments(id).subscribe({
      next: (comments: Comment[]) => {
        this.comments = comments;
      },
      error: () => {
      }
    });
  }

  submitComment(): void {
    if (!this.newComment.trim() || !this.ticket) return;

    this.ticketService.addComment(this.ticket.id, this.newComment).subscribe({
      next: (comment: Comment) => {
        this.comments.push(comment);
        this.newComment = '';
      },
      error: (err: { message?: string }) => {
        this.error = err.message || 'Error al agregar comentario';
      }
    });
  }

  updateStatus(newStatus: TicketStatus): void {
    if (!this.ticket) return;

    this.ticketService.updateTicket(this.ticket.id, { status: newStatus }).subscribe({
      next: (updated: Ticket) => {
        this.ticket = updated;
      },
      error: (err: { message?: string }) => {
        this.error = err.message || 'Error al actualizar estado';
      }
    });
  }
}