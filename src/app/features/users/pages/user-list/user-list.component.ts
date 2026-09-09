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
  updatingUserId: string | number | null = null;
  loading = false;
  error = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar los usuarios';
        this.loading = false;
      }
    });
  }

  onRoleChange(user: User, newRole: string): void {
    this.updatingUserId = user.id;
    this.userService.changeRole(user.id, newRole).subscribe({
      next: () => {
        user.role = newRole;
        this.updatingUserId = null;
      },
      error: (err) => {
        alert(err.error?.message || 'Error al cambiar el rol');
        this.updatingUserId = null;
      }
    });
  }
}