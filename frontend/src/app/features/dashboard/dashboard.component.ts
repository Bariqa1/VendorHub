import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DashboardMetrics, Vendor, Contract } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page animate-fade-in">
      <!-- Header Section -->
      <div class="page-header">
        <div>
          <h1 class="page-title">لوحة التحكم والمؤشرات</h1>
          <p class="page-subtitle">نظرة شاملة ودقيقة على منظومة المشتريات والعقود والامتثال المالي</p>
        </div>
        <div class="header-actions">
          <a routerLink="/vendors" class="btn btn-secondary btn-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            <span>إضافة مورد</span>
          </a>
          <a routerLink="/contracts" class="btn btn-primary btn-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            <span>إنشاء عقد جديد</span>
          </a>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="metrics-grid">
        <!-- Metric 1: Total Committed Value -->
        <div class="glass-card metric-card primary-highlight">
          <div class="metric-top">
            <span class="metric-label">إجمالي القيمة التعاقدية النشطة</span>
            <div class="metric-icon-badge blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg>
            </div>
          </div>
          <div class="metric-value">
            {{ (metrics()?.totalCommittedValueSAR || 0) | number:'1.0-0' }}
            <span class="metric-currency">ر.س</span>
          </div>
          <div class="metric-footer">
            <span class="badge badge-approved">ميزانية معتمدة وموثقة</span>
          </div>
        </div>

        <!-- Metric 2: Active Contracts -->
        <div class="glass-card metric-card">
          <div class="metric-top">
            <span class="metric-label">العقود النشطة والمستمرة</span>
            <div class="metric-icon-badge green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </div>
          </div>
          <div class="metric-value">{{ metrics()?.activeContracts || 0 }}</div>
          <div class="metric-footer">
            <span class="sub-text">من إجمالي مراحل التنفيذ</span>
          </div>
        </div>

        <!-- Metric 3: Total & Active Vendors -->
        <div class="glass-card metric-card">
          <div class="metric-top">
            <span class="metric-label">الموردين المؤهلين</span>
            <div class="metric-icon-badge purple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path></svg>
            </div>
          </div>
          <div class="metric-value">
            {{ metrics()?.activeVendors || 0 }}
            <span class="metric-total">/ {{ metrics()?.totalVendors || 0 }}</span>
          </div>
          <div class="metric-footer">
            <span class="badge badge-purple">جاهزون للمشاريع</span>
          </div>
        </div>

        <!-- Metric 4: Pending Approvals & Expiring Soon -->
        <div class="glass-card metric-card">
          <div class="metric-top">
            <span class="metric-label">يتطلب المراجعة والإجراء</span>
            <div class="metric-icon-badge orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
          </div>
          <div class="metric-value-row">
            <div>
              <span class="small-stat-num">{{ metrics()?.pendingApprovals || 0 }}</span>
              <span class="small-stat-lbl">اعتمادات معلقة</span>
            </div>
            <div class="divider-v"></div>
            <div>
              <span class="small-stat-num warn">{{ metrics()?.contractsExpiringSoon || 0 }}</span>
              <span class="small-stat-lbl">تنتهي خلال 30 يوم</span>
            </div>
          </div>
          <div class="metric-footer">
            <span class="badge badge-warning">تنبيهات فورية</span>
          </div>
        </div>
      </div>

      <!-- Quick AI Banner -->
      <div class="glass-panel ai-banner">
        <div class="ai-banner-content">
          <div class="ai-spark-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          </div>
          <div>
            <h3 class="ai-banner-title">مساعد الذكاء الاصطناعي لتحليل البنود والمخاطر</h3>
            <p class="ai-banner-desc">يمكنك استخدام نموذج تحليل العقود الذكي لاستخراج الالتزامات المالية والتواريخ الحساسة والشروط الجزائية فورياً.</p>
          </div>
        </div>
        <a routerLink="/ai-assistant" class="btn btn-secondary">
          <span>تجربة التحليل الذكي</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </a>
      </div>

      <!-- Recent Tables Section -->
      <div class="dashboard-tables-grid">
        <!-- Recent Vendors -->
        <div class="glass-panel table-card">
          <div class="table-card-header">
            <h3 class="card-title">أحدث الموردين المسجلين</h3>
            <a routerLink="/vendors" class="link-more">عرض الكل ←</a>
          </div>
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>اسم المنشأة</th>
                  <th>السجل التجاري</th>
                  <th>المدينة</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                @for (vendor of recentVendors(); track vendor.publicId) {
                  <tr [routerLink]="['/vendors', vendor.publicId]" class="clickable-row">
                    <td>
                      <div class="font-semibold">{{ vendor.companyNameAr }}</div>
                      <div class="text-xs text-tertiary">{{ vendor.companyNameEn }}</div>
                    </td>
                    <td><code class="code-pill">{{ vendor.crNumber }}</code></td>
                    <td>{{ vendor.city }}</td>
                    <td>
                      <span class="badge" [ngClass]="'badge-' + vendor.status.toLowerCase()">
                        {{ getStatusLabel(vendor.status) }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="text-center py-6 text-tertiary">لا يوجد موردين مسجلين بعد</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Contracts -->
        <div class="glass-panel table-card">
          <div class="table-card-header">
            <h3 class="card-title">أحدث العقود</h3>
            <a routerLink="/contracts" class="link-more">عرض الكل ←</a>
          </div>
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>العقد</th>
                  <th>المورد</th>
                  <th>القيمة</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                @for (contract of recentContracts(); track contract.publicId) {
                  <tr [routerLink]="['/contracts', contract.publicId]" class="clickable-row">
                    <td>
                      <div class="font-semibold">{{ contract.title }}</div>
                      <div class="text-xs text-tertiary">{{ contract.contractNumber }}</div>
                    </td>
                    <td>{{ contract.vendorCompanyNameAr }}</td>
                    <td class="font-semibold text-accent">
                      {{ contract.totalAmount | number:'1.0-0' }} {{ contract.currency }}
                    </td>
                    <td>
                      <span class="badge" [ngClass]="'badge-' + contract.status.toLowerCase()">
                        {{ getContractStatusLabel(contract.status) }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="text-center py-6 text-tertiary">لا توجد عقود مسجلة بعد</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 28px;
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.03em;
      margin-bottom: 4px;
    }
    .page-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    .header-actions {
      display: flex;
      gap: 12px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }
    .metric-card {
      padding: 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 150px;
    }
    .primary-highlight {
      border: 1px solid var(--accent-primary);
      background: linear-gradient(145deg, var(--accent-glow) 0%, var(--bg-card) 100%);
    }
    .metric-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .metric-label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-secondary);
    }
    .metric-icon-badge {
      width: 34px;
      height: 34px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .metric-icon-badge.blue { background: var(--accent-glow); color: var(--accent-primary); }
    .metric-icon-badge.green { background: var(--color-success-bg); color: var(--color-success); }
    .metric-icon-badge.purple { background: var(--color-purple-bg); color: var(--color-purple); }
    .metric-icon-badge.orange { background: var(--color-warning-bg); color: var(--color-warning); }

    .metric-value {
      font-size: 1.875rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    .metric-currency {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-right: 4px;
    }
    .metric-total {
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-tertiary);
    }
    .metric-value-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 8px;
    }
    .small-stat-num {
      font-size: 1.35rem;
      font-weight: 700;
      display: block;
      color: var(--text-primary);
    }
    .small-stat-num.warn { color: var(--color-warning); }
    .small-stat-lbl {
      font-size: 0.6875rem;
      color: var(--text-secondary);
    }
    .divider-v {
      width: 1px;
      height: 32px;
      background: var(--border-subtle);
    }
    .metric-footer {
      display: flex;
      align-items: center;
    }
    .sub-text {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }

    .ai-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      margin-bottom: 28px;
      border: 1px solid var(--color-purple);
      background: linear-gradient(135deg, var(--color-purple-bg) 0%, var(--bg-card) 100%);
    }
    .ai-banner-content {
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .ai-spark-badge {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--color-purple), #5e5ce6);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px var(--color-purple-bg);
      flex-shrink: 0;
    }
    .ai-banner-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    .ai-banner-desc {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      max-width: 680px;
    }

    .dashboard-tables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
      gap: 24px;
    }
    .table-card {
      padding: 20px;
    }
    .table-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .card-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .link-more {
      font-size: 0.8125rem;
      color: var(--accent-primary);
      text-decoration: none;
      font-weight: 500;
    }
    .link-more:hover { text-decoration: underline; }
    .clickable-row {
      cursor: pointer;
    }
    .clickable-row:hover td {
      background: var(--bg-input);
    }
    .code-pill {
      font-family: monospace;
      font-size: 0.8125rem;
      background: var(--bg-input);
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--text-secondary);
    }
    .font-semibold { font-weight: 600; }
    .text-xs { font-size: 0.75rem; }
    .text-tertiary { color: var(--text-tertiary); }
    .text-accent { color: var(--accent-primary); }
    .text-center { text-align: center; }
    .py-6 { padding-top: 24px; padding-bottom: 24px; }
  `]
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  metrics = signal<DashboardMetrics | null>(null);
  recentVendors = signal<Vendor[]>([]);
  recentContracts = signal<Contract[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getDashboardMetrics().subscribe({
      next: (data) => this.metrics.set(data),
      error: (err) => console.error('Error fetching dashboard metrics', err)
    });

    this.apiService.getVendors(0, 5).subscribe({
      next: (res) => this.recentVendors.set(res.content),
      error: (err) => console.error('Error fetching vendors', err)
    });

    this.apiService.getContracts(0, 5).subscribe({
      next: (res) => this.recentContracts.set(res.content),
      error: (err) => console.error('Error fetching contracts', err)
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
