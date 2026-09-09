import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TicketService, Ticket, Comment, TicketStatus } from '../../../../core/services/ticket.service';
import { AuthService } from '../../../../core/services/auth.service';

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
  loading = false;
  error = '';
  newComment = '';

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    public authService: AuthService
  ) {}

  get userRole(): string {
    return this.authService.getUserRole() || '';
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadTicketDetails(idParam);
    } else {
      this.error = 'ID de ticket no encontrado en la URL.';
    }
  }

  loadTicketDetails(id: string): void {
    this.loading = true;
    this.error = '';

    this.ticketService.getTicket(id).subscribe({
      next: (ticket: Ticket) => {
        console.log('Respuesta del Backend (Ticket):', ticket);
        this.ticket = ticket;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar ticket:', err);
        this.error = 'No se pudo obtener la información del ticket.';
        this.loading = false;
      }
    });

    this.ticketService.getComments(id).subscribe({
      next: (comments: Comment[]) => {
        this.comments = comments || [];
      },
      error: (err) => {
        console.error('Error al cargar comentarios:', err);
      }
    });
  }

  submitComment(): void {
    if (!this.newComment.trim() || !this.ticket) return;

    this.ticketService.addComment(this.ticket.id, this.newComment.trim()).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.newComment = '';
      },
      error: (err) => {
        console.error('Error al agregar comentario:', err);
        alert('Error al enviar el comentario.');
      }
    });
  }

  updateStatus(newStatus: TicketStatus): void {
    if (!this.ticket) return;

    this.ticketService.updateTicket(this.ticket.id, { status: newStatus }).subscribe({
      next: (updated) => {
        this.ticket = { ...this.ticket, ...updated };
      },
      error: (err) => console.error('Error al actualizar estado:', err)
    });
  }
}