import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Comment {
  id: string | number;
  content: string;
  author: string;
  createdAt: string;
}

export interface Ticket {
  id: string | number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketListResponse {
  data: Ticket[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'https://sla-api.areasoftccyt.com/api/tickets';

  constructor(private http: HttpClient) {}

  getTickets(status?: any, priority?: any, page?: number, limit?: number): Observable<TicketListResponse> {
    let params = new HttpParams();

    if (typeof status === 'object' && status !== null) {
      Object.keys(status).forEach(key => {
        if (status[key] !== undefined && status[key] !== null) {
          params = params.set(key, status[key]);
        }
      });
    } else {
      if (status) params = params.set('status', status);
      if (priority) params = params.set('priority', priority);
      if (page) params = params.set('page', page.toString());
      if (limit) params = params.set('limit', limit.toString());
    }

    return this.http.get<TicketListResponse>(this.apiUrl, { params });
  }

  getTicket(id: string | number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  createTicket(ticketData: any): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticketData);
  }

  updateTicket(id: string | number, ticketData: any): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, ticketData);
  }

  getComments(ticketId: string | number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${ticketId}/comments`);
  }

  addComment(ticketId: string | number, commentData: any): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.apiUrl}/${ticketId}/comments`,
      typeof commentData === 'string' ? { content: commentData } : commentData
    );
  }
}