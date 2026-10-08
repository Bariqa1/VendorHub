import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-wrapper">
      <div class="glow-orb top-orb"></div>
      <div class="glow-orb bottom-orb"></div>

      <!-- Theme Switcher Top Right -->
      <div class="theme-toggle-bar">
        <button class="theme-btn" (click)="themeService.toggleTheme()" [title]="themeService.currentTheme() === 'dark' ? 'تبديل للوضع الفاتح' : 'تبديل للوضع الداكن'">
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
            <span>الوضع الفاتح</span>
          } @else {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            <span>الوضع الداكن</span>
          }
        </button>
      </div>

      <div class="login-card glass-panel animate-fade-in">
        <div class="login-header">
          <div class="brand-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 class="login-title">VendorHub</h1>
          <p class="login-subtitle">منصة إدارة الموردين والعقود الذكية للمنشآت</p>
        </div>

        @if (errorMessage) {
          <div class="alert alert-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label class="form-label" for="username">اسم المستخدم</label>
            <input
              id="username"
              type="text"
              class="form-input"
              formControlName="username"
              placeholder="admin"
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">كلمة المرور</label>
            <input
              id="password"
              type="password"
              class="form-input"
              formControlName="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            [disabled]="loginForm.invalid || isLoading"
          >
            @if (isLoading) {
              <div class="spinner"></div>
              <span>جاري تسجيل الدخول...</span>
            } @else {
              <span>دخول للنظام</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            }
          </button>
        </form>

        <!-- Quick Demo Profiles for instant testing -->
        <div class="demo-section">
          <span class="demo-title">حسابات تجريبية جاهزة (دخول فوري بضغطة زر)</span>
          <div class="demo-buttons">
            <button class="demo-chip" (click)="quickLogin('admin', 'Admin@2026')" [disabled]="isLoading">
              <div class="chip-main">
                <span class="dot dot-admin"></span>
                <div class="demo-text">
                  <div class="demo-row">
                    <span class="demo-name">مدير النظام (Admin)</span>
                    <span class="badge badge-purple" style="font-size: 0.65rem;">صلاحيات كاملة</span>
                  </div>
                  <span class="demo-cred">admin • Admin&#64;2026</span>
                </div>
              </div>
              <span class="quick-action-btn">دخول فوري ←</span>
            </button>

            <button class="demo-chip" (click)="quickLogin('procurement', 'Procure@2026')" [disabled]="isLoading">
              <div class="chip-main">
                <span class="dot dot-procure"></span>
                <div class="demo-text">
                  <div class="demo-row">
                    <span class="demo-name">مسؤول المشتريات (Procurement)</span>
                    <span class="badge badge-approved" style="font-size: 0.65rem;">موردين وعقود</span>
                  </div>
                  <span class="demo-cred">procurement • Procure&#64;2026</span>
                </div>
              </div>
              <span class="quick-action-btn">دخول فوري ←</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      width: 100vw;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      padding: 30px 20px;
      margin: 0 auto;
    }
    .theme-toggle-bar {
      position: absolute;
      top: 24px;
      left: 24px;
      z-index: 20;
    }
    .theme-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--bg-surface);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-full);
      color: var(--text-primary);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-card);
    }
    .theme-btn:hover {
      background: var(--bg-card-hover);
      transform: translateY(-1px);
    }
    .glow-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      pointer-events: none;
      opacity: 0.3;
    }
    .top-orb {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, var(--accent-primary), transparent 70%);
      top: -15%;
      right: 25%;
    }
    .bottom-orb {
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, var(--color-purple), transparent 70%);
      bottom: -15%;
      left: 25%;
    }
    .login-card {
      width: 100%;
      max-width: 460px;
      padding: 40px 36px;
      position: relative;
      z-index: 10;
      margin: 0 auto;
    }
    .login-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .brand-badge {
      width: 56px;
      height: 56px;
      margin: 0 auto 14px;
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 100%);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 8px 24px var(--accent-glow);
    }
    .login-title {
      font-size: 1.625rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.03em;
      margin-bottom: 6px;
    }
    .login-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .login-form {
      margin-bottom: 20px;
    }
    .btn-block {
      width: 100%;
      padding: 13px;
      font-size: 0.9375rem;
      margin-top: 8px;
    }
    .alert-error {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: var(--color-danger-bg);
      border: 1px solid var(--color-danger-border);
      border-radius: var(--radius-sm);
      color: var(--color-danger);
      font-size: 0.8125rem;
      margin-bottom: 18px;
    }
    .demo-section {
      border-top: 1px solid var(--border-subtle);
      padding-top: 18px;
      text-align: center;
    }
    .demo-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: 12px;
    }
    .demo-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .demo-chip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 0.8125rem;
      font-family: inherit;
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: right;
    }
    .demo-chip:hover {
      background: var(--bg-card-hover);
      color: var(--text-primary);
      border-color: var(--accent-primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-card);
    }
    .chip-main {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .demo-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }
    .demo-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .demo-name {
      font-weight: 600;
      color: var(--text-primary);
    }
    .demo-cred {
      font-size: 0.75rem;
      font-family: monospace;
      color: var(--text-tertiary);
    }
    .quick-action-btn {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--accent-primary);
      background: var(--accent-glow);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      white-space: nowrap;
      transition: all var(--transition-fast);
    }
    .demo-chip:hover .quick-action-btn {
      background: var(--accent-primary);
      color: #fff;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .dot-admin {
      background: var(--color-purple);
      box-shadow: 0 0 8px var(--color-purple);
    }
    .dot-procure {
      background: var(--accent-primary);
      box-shadow: 0 0 8px var(--accent-primary);
    }
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    username: ['admin', [Validators.required]],
    password: ['Admin@2026', [Validators.required]]
  });

  isLoading = false;
  errorMessage = '';

  quickLogin(user: string, pass: string): void {
    this.loginForm.patchValue({ username: user, password: pass });
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة';
      }
    });
  }
}
