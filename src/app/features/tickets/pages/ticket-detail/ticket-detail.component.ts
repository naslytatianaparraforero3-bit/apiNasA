import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TicketService, Ticket, Comment, TicketStatus } from '../../../../core/services/ticket.service';
import { AuthService, User } from '../../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  ticket: Ticket | null = null;
  comments: Comment[] = [];
  currentUser: User | null = null;
  loading = false;
  error = '';
  newComment = '';
  ticketId: string | number | null = null;

  private userSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  get userRole(): string {
    return this.currentUser?.role || '';
  }

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.ticketId = isNaN(Number(idParam)) ? idParam : Number(idParam);
        this.loadTicketDetails(this.ticketId);
      }
    });
  }

  loadTicketDetails(id: string | number): void {
    this.loading = true;
    this.error = '';

    this.ticketService.getTicket(id as any).subscribe({
      next: (ticket: Ticket) => {
        console.log('Ticket cargado exitosamente:', ticket);
        this.ticket = ticket;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al obtener el ticket:', err);
        this.error = 'No se pudo cargar la información del ticket.';
        this.loading = false;
      }
    });

    this.loadComments(id);
  }

  loadComments(id: string | number): void {
    this.ticketService.getComments(id as any).subscribe({
      next: (comments: Comment[]) => {
        console.log('Comentarios cargados:', comments);
        this.comments = comments || [];
      },
      error: (err: any) => {
        console.error('Error al obtener comentarios:', err);
      }
    });
  }

  submitComment(): void {
    if (!this.newComment.trim() || !this.ticket) return;

    const commentText = this.newComment.trim();

    this.ticketService.addComment(this.ticket.id, commentText).subscribe({
      next: (comment: Comment) => {
        console.log('Comentario enviado:', comment);
        if (comment) {
          this.comments.push(comment);
        } else if (this.ticketId) {
          this.loadComments(this.ticketId);
        }
        this.newComment = '';
      },
      error: (err: any) => {
        console.error('Error al agregar comentario:', err);
        alert('No se pudo enviar el comentario. Revisa la consola.');
      }
    });
  }

  updateStatus(newStatus: TicketStatus): void {
    if (!this.ticket) return;

    this.ticketService.updateTicket(this.ticket.id, { status: newStatus }).subscribe({
      next: (updated: Ticket) => {
        this.ticket = updated;
      },
      error: (err: any) => {
        console.error('Error al actualizar estado:', err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}