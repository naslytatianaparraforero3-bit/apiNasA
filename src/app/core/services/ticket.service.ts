import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  createdBy: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketListResponse {
  data: Ticket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTickets(status?: TicketStatus, priority?: Priority, page = 1, limit = 10): Observable<TicketListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);

    return this.http.get<TicketListResponse>(`${this.apiUrl}/api/tickets`, { params });
  }

  getTicket(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/api/tickets/${id}`);
  }

  createTicket(title: string, description: string, priority: Priority = 'medium'): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/api/tickets`, { title, description, priority });
  }

  updateTicket(id: string, data: Partial<Ticket>): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/api/tickets/${id}`, data);
  }

  deleteTicket(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/tickets/${id}`);
  }

  assignTicket(id: string, agentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/tickets/${id}/assign`, { agentId });
  }

  getComments(ticketId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/api/tickets/${ticketId}/comments`);
  }

  addComment(ticketId: string, body: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/api/tickets/${ticketId}/comments`, { body });
  }
}