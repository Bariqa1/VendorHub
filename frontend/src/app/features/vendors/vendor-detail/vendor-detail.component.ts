import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Contract, Vendor, VendorStatus } from '../../../core/models/models';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container animate-fade-in" *ngIf="vendor() as v">
      <!-- Top Navigation Breadcrumb -->
      <div class="breadcrumb-bar">
        <a routerLink="/vendors" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          <span>العودة لقائمة الموردين</span>
        </a>
      </div>

      <!-- Main Header Card -->
      <div class="glass-panel vendor-hero">
        <div class="hero-main">
          <div class="vendor-avatar">
            <span>{{ v.companyNameAr.charAt(0) }}</span>
          </div>
          <div class="vendor-title-block">
            <div class="title-row">
              <h1 class="vendor-title">{{ v.companyNameAr }}</h1>
              <span class="badge" [ngClass]="'badge-' + v.status.toLowerCase()">
                {{ getStatusLabel(v.status) }}
              </span>
            </div>
            <p class="vendor-subtitle">{{ v.companyNameEn }} • {{ v.city }}</p>
          </div>
        </div>

        <!-- Workflow / Approval Actions -->
        <div class="hero-actions" *ngIf="authService.hasRole('ROLE_ADMIN') || authService.hasRole('ROLE_PROCUREMENT_OFFICER')">
          @if (v.status !== 'APPROVED') {
            <button class="btn btn-primary btn-sm" (click)="updateStatus('APPROVED')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>اعتماد المورد</span>
            </button>
          }
          @if (v.status !== 'UNDER_REVIEW') {
            <button class="btn btn-secondary btn-sm" (click)="updateStatus('UNDER_REVIEW')">
              <span>تحويل للمراجعة</span>
            </button>
          }
          @if (v.status !== 'REJECTED') {
            <button class="btn btn-ghost btn-sm text-danger" (click)="updateStatus('REJECTED')">
              <span>رفض</span>
            </button>
          }
        </div>
      </div>

      <!-- Content Grid -->
      <div class="details-grid">
        <!-- Column 1: Legal & Tax Credentials -->
        <div class="glass-panel info-card">
          <h2 class="section-title">بيانات السجل والامتثال النظامي</h2>

          <div class="data-list">
            <div class="data-item">
              <span class="data-label">رقم السجل التجاري</span>
              <span class="data-value font-mono">{{ v.crNumber }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">تاريخ انتهاء السجل</span>
              <span class="data-value" [class.text-danger]="v.crExpired">
                {{ v.crExpiryDate }}
                @if (v.crExpired) { <span class="badge badge-rejected" style="font-size: 0.65rem;">منتهي الصلاحية</span> }
              </span>
            </div>
            <div class="data-item">
              <span class="data-label">الرقم الضريبي (ZATCA VAT)</span>
              <span class="data-value font-mono">{{ v.taxNumber }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">مؤشر الامتثال والجودة</span>
              <div class="score-badge">
                <span class="score-val">{{ v.complianceScore }}%</span>
                <span class="score-status">{{ v.complianceScore >= 80 ? 'ممتاز' : 'جيد' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Column 2: Contact & Location Details -->
        <div class="glass-panel info-card">
          <h2 class="section-title">بيانات التواصل والمقر</h2>

          <div class="data-list">
            <div class="data-item">
              <span class="data-label">البريد الإلكتروني الرسمي</span>
              <span class="data-value">{{ v.contactEmail }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">رقم الهاتف</span>
              <span class="data-value font-mono">{{ v.contactPhone }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">المدينة</span>
              <span class="data-value">{{ v.city }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">العنوان الوطني</span>
              <span class="data-value text-secondary">{{ v.nationalAddress || 'غير محدد' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">الموقع الإلكتروني</span>
              <span class="data-value">
                <a *ngIf="v.websiteUrl" [href]="v.websiteUrl" target="_blank" class="link">{{ v.websiteUrl }}</a>
                <span *ngIf="!v.websiteUrl" class="text-tertiary">غير متوفر</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Associated Contracts Section -->
      <div class="glass-panel contracts-section">
        <div class="section-header">
          <h2 class="section-title">العقود والمشاريع المرتبطة</h2>
          <span class="badge badge-draft">{{ contracts().length }} عقود</span>
        </div>

        @if (contracts().length > 0) {
          <table class="custom-table">
            <thead>
              <tr>
                <th>رقم العقد</th>
                <th>عنوان المشروع</th>
                <th>نوع العقد</th>
                <th>القيمة الإجمالية</th>
                <th>الحالة</th>
                <th>التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              @for (contract of contracts(); track contract.publicId) {
                <tr [routerLink]="['/contracts', contract.publicId]" class="clickable-row">
                  <td><code class="code-pill">{{ contract.contractNumber }}</code></td>
                  <td class="font-semibold">{{ contract.title }}</td>
                  <td><span class="type-tag">{{ contract.contractType }}</span></td>
                  <td class="font-semibold text-accent">{{ contract.totalAmount | number:'1.0-0' }} {{ contract.currency }}</td>
                  <td>
                    <span class="badge" [ngClass]="'badge-' + contract.status.toLowerCase()">
                      {{ getContractStatusLabel(contract.status) }}
                    </span>
                  </td>
                  <td>
                    <a [routerLink]="['/contracts', contract.publicId]" class="btn btn-secondary btn-sm" (click)="$event.stopPropagation()">عرض</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <div class="empty-contracts">
            <p>لا توجد عقود مسجلة لهذا المورد حالياً.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 32px;
      max-width: 1300px;
      margin: 0 auto;
    }
    .breadcrumb-bar {
      margin-bottom: 20px;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color var(--transition-fast);
    }
    .back-link:hover { color: var(--accent-primary); }
    .vendor-hero {
      padding: 28px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .hero-main {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .vendor-avatar {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, #2997ff, #bf5af2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.5rem;
      font-weight: 700;
    }
    .title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 4px;
    }
    .vendor-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }
    .vendor-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    .hero-actions {
      display: flex;
      gap: 10px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    .info-card {
      padding: 24px;
    }
    .section-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .data-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .data-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
    }
    .data-label { color: var(--text-secondary); }
    .data-value { color: var(--text-primary); font-weight: 500; }
    .font-mono { font-family: monospace; }
    .text-danger { color: var(--color-danger); }
    .text-secondary { color: var(--text-secondary); }
    .text-tertiary { color: var(--text-tertiary); }
    .text-accent { color: var(--accent-primary); }
    .font-semibold { font-weight: 600; }
    .score-badge {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .score-val {
      font-weight: 700;
      color: var(--color-success);
    }
    .score-status {
      font-size: 0.75rem;
      padding: 2px 8px;
      background: var(--color-success-bg);
      border-radius: var(--radius-full);
      color: var(--color-success);
    }
    .link { color: var(--accent-primary); text-decoration: none; }
    .link:hover { text-decoration: underline; }
    .contracts-section {
      padding: 24px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .empty-contracts {
      padding: 32px;
      text-align: center;
      color: var(--text-tertiary);
      font-size: 0.875rem;
    }
    .code-pill {
      font-family: monospace;
      font-size: 0.8125rem;
      background: var(--bg-input);
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--text-primary);
    }
    .type-tag {
      font-size: 0.75rem;
      color: var(--text-secondary);
      background: var(--bg-input);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
    }
    .clickable-row { cursor: pointer; }
  `]
})
export class VendorDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  vendor = signal<Vendor | null>(null);
  contracts = signal<Contract[]>([]);

  ngOnInit(): void {
    const publicId = this.route.snapshot.paramMap.get('id');
    if (publicId) {
      this.loadVendor(publicId);
      this.loadContracts(publicId);
    }
  }

  loadVendor(publicId: string): void {
    this.apiService.getVendorByPublicId(publicId).subscribe({
      next: (data) => this.vendor.set(data),
      error: (err) => console.error('Error loading vendor', err)
    });
  }

  loadContracts(vendorPublicId: string): void {
    this.apiService.getContracts(0, 50, undefined, vendorPublicId).subscribe({
      next: (res) => this.contracts.set(res.content),
      error: (err) => console.error('Error loading vendor contracts', err)
    });
  }

  updateStatus(status: VendorStatus): void {
    const current = this.vendor();
    if (!current) return;
    this.apiService.updateVendorStatus(current.publicId, status, 'تحديث الحالة من صفحة المورد').subscribe({
      next: (updated) => this.vendor.set(updated),
      error: (err) => alert(err.error?.message || 'فشل تحديث الحالة')
    });
  }

  getStatusLabel(status: string): string {
    const map: { [key: string]: string } = {
      'DRAFT': 'مسودة',
      'SUBMITTED': 'مقدم',
      'UNDER_REVIEW': 'قيد المراجعة',
      'APPROVED': 'معتمد',
      'REJECTED': 'مرفوض',
      'SUSPENDED': 'موقوف'
    };
    return map[status] || status;
  }

  getContractStatusLabel(status: string): string {
    const map: { [key: string]: string } = {
      'DRAFT': 'مسودة',
      'PENDING_APPROVAL': 'قيد الاعتماد',
      'ACTIVE': 'ساري',
      'AMENDED': 'معدل',
      'COMPLETED': 'مكتمل',
      'TERMINATED': 'منهي',
      'EXPIRED': 'منتهي'
    };
    return map[status] || status;
  }
}
