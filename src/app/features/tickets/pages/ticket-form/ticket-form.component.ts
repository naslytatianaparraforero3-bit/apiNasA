import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TicketService, Priority } from '../../../../core/services/ticket.service';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss']
})
export class TicketFormComponent implements OnInit {
  ticketForm!: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.ticketForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      priority: ['medium' as Priority, [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { title, description, priority } = this.ticketForm.value;

    this.ticketService.createTicket(title, description, priority).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/tickets']);
      },
      error: (err: { message?: string }) => {
        this.error = err.message || 'Error al crear el ticket';
        this.loading = false;
      }
    });
  }
}