import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Ticket {
  id: string | number;
  title: string;
  description: string;
  priority: string;
  status: TicketStatus;
  createdAt: string;
}

export interface Comment {
  id: string | number;
  body: string;
  author: { name: string } | string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly apiUrl = `${environment.apiUrl}/api/tickets`;

  constructor(private http: HttpClient) {}

  getTicket(id: string | number): Observable<Ticket> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        const data = res?.data || res?.ticket || res;
        
        return {
          id: data?.id || id,
          title: data?.title || data?.titulo || data?.subject || 'Sin Título',
          description: data?.description || data?.descripcion || data?.details || 'Sin descripción',
          priority: data?.priority || data?.prioridad || 'N/A',
          status: (data?.status || data?.estado || 'open') as TicketStatus,
          createdAt: data?.createdAt || data?.created_at || data?.date || new Date().toISOString()
        };
      })
    );
  }

  getComments(ticketId: string | number): Observable<Comment[]> {
    return this.http.get<any>(`${this.apiUrl}/${ticketId}/comments`).pipe(
      map(res => {
        // Manejar respuestas paginadas o envueltas (ej: res.content, res.data, o Array directo)
        const list = Array.isArray(res) ? res : (res?.data || res?.content || res?.comments || []);
        
        return list.map((c: any) => ({
          id: c.id,
          body: c.body || c.content || c.message || c.text || '',
          author: c.author?.name ? c.author : (c.author || c.user?.name || c.user || 'Usuario'),
          createdAt: c.createdAt || c.created_at || c.date || new Date().toISOString()
        }));
      })
    );
  }

  addComment(ticketId: string | number, text: string): Observable<Comment> {
    const payload = {
      body: text,
      content: text,
      message: text,
      ticketId: ticketId
    };

    return this.http.post<any>(`${this.apiUrl}/${ticketId}/comments`, payload).pipe(
      map(res => {
        const c = res?.data || res;
        return {
          id: c?.id || Date.now(),
          body: c?.body || c?.content || c?.message || text,
          author: c?.author?.name ? c.author : (c?.author || c?.user || 'Tú'),
          createdAt: c?.createdAt || c?.created_at || new Date().toISOString()
        };
      })
    );
  }

  updateTicket(ticketId: string | number, payload: Partial<Ticket>): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${ticketId}`, payload);
  }
}