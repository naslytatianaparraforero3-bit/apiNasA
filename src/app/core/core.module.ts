import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { tokenRefreshInterceptor } from './interceptors/token-refresh.interceptor';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, tokenRefreshInterceptor])
    )
  ]
})
export class CoreModule { }