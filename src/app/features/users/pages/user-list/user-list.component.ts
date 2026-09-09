import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';
  updatingUserId: string | number | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    this.userService.getUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.message || 'Error al obtener la lista de usuarios';
        this.loading = false;
      }
    });
  }

  onRoleChange(user: User, newRole: 'admin' | 'agent' | 'client'): void {
    if (user.role === newRole) return;

    this.updatingUserId = user.id;

    this.userService.changeRole(user.id, newRole).subscribe({
      next: (updatedUser: User) => {
        user.role = updatedUser.role;
        this.updatingUserId = null;
      },
      error: (err: any) => {
        this.error = err.message || 'No se pudo actualizar el rol del usuario';
        this.updatingUserId = null;
        this.loadUsers();
      }
    });
  }
}