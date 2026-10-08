import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-root-container">
      @if (isAuthenticated() && !isLoginRoute()) {
        <app-navbar></app-navbar>
        <div class="app-body">
          <app-sidebar></app-sidebar>
          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </div>
      } @else {
        <main class="full-page">
          <router-outlet></router-outlet>
        </main>
      }
    </div>
  `,
  styles: [`
    .app-root-container {
      min-height: 100vh;
      width: 100%;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-canvas);
    }
    .app-body {
      display: flex;
      flex: 1;
      min-height: calc(100vh - 68px);
      width: 100%;
    }
    .main-content {
      flex: 1;
      min-width: 0;
      overflow-y: auto;
    }
    .full-page {
      flex: 1;
      width: 100%;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class App {
  authService = inject(AuthService);
  private router = inject(Router);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: any) => e.urlAfterRedirects || e.url)
    ),
    { initialValue: this.router.url }
  );

  isAuthenticated = computed(() => !!this.authService.token());
  isLoginRoute = computed(() => (this.currentUrl() || '').includes('/login'));
}
