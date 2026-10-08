import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar-container">
      <nav class="nav-group">
        <span class="nav-heading">القائمة الرئيسية</span>

        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>لوحة المؤشرات</span>
        </a>

        <a routerLink="/vendors" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>سجل الموردين</span>
        </a>

        <a routerLink="/contracts" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>العقود والمراحل</span>
        </a>

        <a routerLink="/ai-assistant" routerLinkActive="active" class="nav-item special-nav">
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
          </svg>
          <span>تحليل العقود الذكي</span>
        </a>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar-container {
      width: 250px;
      height: calc(100vh - 68px);
      position: sticky;
      top: 68px;
      background: var(--bg-surface);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-left: 1px solid var(--border-subtle);
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: background-color var(--transition-normal);
    }
    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .nav-heading {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
      padding: 8px 14px 4px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }
    .nav-item:hover {
      background: var(--bg-input);
      color: var(--text-primary);
    }
    .nav-item.active {
      background: var(--accent-glow);
      color: var(--accent-primary);
      font-weight: 600;
      border: 1px solid var(--accent-primary-hover);
    }
    .nav-icon {
      flex-shrink: 0;
      transition: transform var(--transition-fast);
    }
    .nav-item:hover .nav-icon {
      transform: scale(1.1);
    }
    .special-nav.active {
      background: var(--color-purple-bg);
      color: var(--color-purple);
      border-color: var(--color-purple);
    }
    .sidebar-footer {
      padding-top: 16px;
      border-top: 1px solid var(--border-subtle);
    }
    .security-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-tertiary);
      font-size: 0.725rem;
      font-weight: 500;
    }
  `]
})
export class SidebarComponent {}
