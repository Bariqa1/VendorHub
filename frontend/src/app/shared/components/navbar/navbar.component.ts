import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar-container">
      <div class="navbar-content">
        <!-- Brand / Logo -->
        <div class="brand-section" routerLink="/dashboard">
          <div class="logo-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">VendorHub</span>
            <span class="brand-subtitle">إدارة الموردين والعقود</span>
          </div>
        </div>

        <!-- System Status, Theme Toggle & User Profile -->
        <div class="user-actions">
          <!-- Theme Switcher -->
          <button class="theme-icon-btn" (click)="themeService.toggleTheme()" [title]="themeService.currentTheme() === 'dark' ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'">
            @if (themeService.currentTheme() === 'dark') {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            }
          </button>

          @if (authService.currentUser(); as user) {
            <div class="profile-chip">
              <div class="avatar-ring">
                <span class="avatar-initial">{{ user.fullName.charAt(0) }}</span>
              </div>
              <div class="user-info">
                <span class="user-name">{{ user.fullName }}</span>
                <span class="user-role">{{ user.roles[0] || 'مستخدم' }}</span>
              </div>
              <button class="logout-btn" (click)="logout()" title="تسجيل الخروج">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar-container {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--bg-surface);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0 28px;
      height: 68px;
      transition: background-color var(--transition-normal);
    }
    .navbar-content {
      max-width: 1440px;
      margin: 0 auto;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      user-select: none;
    }
    .logo-badge {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px var(--accent-glow);
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-size: 1.125rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
    .brand-subtitle {
      font-size: 0.725rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .user-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .theme-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .theme-icon-btn:hover {
      background: var(--bg-card-hover);
      border-color: var(--border-glass);
      transform: scale(1.05);
    }
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      background: var(--color-success-bg);
      border: 1px solid var(--color-success-border);
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      color: var(--color-success);
      font-weight: 500;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-success);
      box-shadow: 0 0 8px var(--color-success);
    }
    .profile-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 12px 4px 6px;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-full);
    }
    .avatar-ring {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-purple), #5e5ce6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 700;
      font-size: 0.875rem;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      text-align: right;
    }
    .user-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.2;
    }
    .user-role {
      font-size: 0.6875rem;
      color: var(--text-secondary);
    }
    .logout-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      padding: 6px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      margin-right: 4px;
    }
    .logout-btn:hover {
      background: var(--color-danger-bg);
      color: var(--color-danger);
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
