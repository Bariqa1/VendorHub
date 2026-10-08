import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { PageResponse, Vendor, VendorCreateRequest, VendorStatus } from '../../../core/models/models';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="page-container animate-fade-in">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">سجل الموردين المعتمدين</h1>
          <p class="page-subtitle">إدارة ومتابعة سجلات الموردين، الامتثال النظامي، والسجلات التجارية</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          <span>تسجيل مورد جديد</span>
        </button>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="toolbar glass-panel">
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            class="search-input"
            placeholder="بحث بالاسم أو رقم السجل التجاري أو المدينة..."
            [value]="searchTerm()"
            (input)="onSearch($event)"
          />
        </div>

        <div class="filter-group">
          <button
            class="filter-pill"
            [class.active]="selectedStatus() === undefined"
            (click)="filterByStatus(undefined)"
          >
            الكل
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedStatus() === 'APPROVED'"
            (click)="filterByStatus('APPROVED')"
          >
            معتمد
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedStatus() === 'UNDER_REVIEW'"
            (click)="filterByStatus('UNDER_REVIEW')"
          >
            قيد المراجعة
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedStatus() === 'DRAFT'"
            (click)="filterByStatus('DRAFT')"
          >
            مسودة
          </button>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-container glass-panel">
        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <span>جاري تحميل بيانات الموردين...</span>
          </div>
        } @else {
          <table class="custom-table">
            <thead>
              <tr>
                <th>اسم المنشأة</th>
                <th>رقم السجل التجاري</th>
                <th>انتهاء السجل</th>
                <th>الرقم الضريبي (ZATCA)</th>
                <th>المدينة</th>
                <th>نسبة الامتثال</th>
                <th>الحالة</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              @for (vendor of pageData()?.content; track vendor.publicId) {
                <tr [routerLink]="['/vendors', vendor.publicId]" class="clickable-row">
                  <td>
                    <div class="font-semibold text-primary">{{ vendor.companyNameAr }}</div>
                    <div class="text-xs text-tertiary">{{ vendor.companyNameEn }}</div>
                  </td>
                  <td><code class="code-pill">{{ vendor.crNumber }}</code></td>
                  <td>
                    <span [class.text-danger]="vendor.crExpired" [class.text-secondary]="!vendor.crExpired">
                      {{ vendor.crExpiryDate }}
                      @if (vendor.crExpired) {
                        <span class="badge badge-rejected" style="font-size: 0.65rem; margin-right: 4px;">منتهي</span>
                      }
                    </span>
                  </td>
                  <td><span class="font-mono text-xs text-secondary">{{ vendor.taxNumber }}</span></td>
                  <td>{{ vendor.city }}</td>
                  <td>
                    <div class="score-container">
                      <div class="score-bar-bg">
                        <div
                          class="score-bar-fill"
                          [style.width.%]="vendor.complianceScore"
                          [ngClass]="{
                            'score-high': vendor.complianceScore >= 80,
                            'score-med': vendor.complianceScore >= 50 && vendor.complianceScore < 80,
                            'score-low': vendor.complianceScore < 50
                          }"
                        ></div>
                      </div>
                      <span class="score-text">{{ vendor.complianceScore }}%</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="'badge-' + vendor.status.toLowerCase()">
                      {{ getStatusLabel(vendor.status) }}
                    </span>
                  </td>
                  <td>
                    <a [routerLink]="['/vendors', vendor.publicId]" class="btn btn-secondary btn-sm" (click)="$event.stopPropagation()">
                      التفاصيل
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <p class="empty-title">لم يتم العثور على موردين</p>
                    <p class="empty-subtitle">جرب تغيير معايير البحث أو تصفية الحالة</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Pagination -->
          @if (pageData() && (pageData()?.totalPages || 0) > 1) {
            <div class="pagination-footer">
              <span class="pagination-info">
                عرض {{ pageData()?.content?.length }} من إجمالي {{ pageData()?.totalElements }} مورد
              </span>
              <div class="pagination-controls">
                <button
                  class="btn btn-secondary btn-sm"
                  [disabled]="pageData()?.first"
                  (click)="changePage(currentPage() - 1)"
                >
                  السابق
                </button>
                <span class="page-indicator">صفحة {{ currentPage() + 1 }} من {{ pageData()?.totalPages }}</span>
                <button
                  class="btn btn-secondary btn-sm"
                  [disabled]="pageData()?.last"
                  (click)="changePage(currentPage() + 1)"
                >
                  التالي
                </button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Create Vendor Modal -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-content glass-panel animate-fade-in" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h2 class="modal-title">تسجيل منشأة مورد جديدة</h2>
                <p class="modal-subtitle">إدخال بيانات المورد النظامية وفق متطلبات وزارة التجارة وهيئة الزكاة والضريبة</p>
              </div>
              <button class="close-btn" (click)="closeModal()">×</button>
            </div>

            @if (modalError()) {
              <div class="modal-alert-error">
                <span>{{ modalError() }}</span>
              </div>
            }

            <form [formGroup]="vendorForm" (ngSubmit)="submitVendor()" class="vendor-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="compAr">اسم الشركة (عربي) *</label>
                  <input id="compAr" type="text" class="form-input" formControlName="companyNameAr" placeholder="شركة الحلول المتقدمة" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="compEn">اسم الشركة (إنجليزي) *</label>
                  <input id="compEn" type="text" class="form-input" formControlName="companyNameEn" placeholder="Advanced Solutions Co." />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="crNum">رقم السجل التجاري (10 أرقام) *</label>
                  <input id="crNum" type="text" class="form-input" formControlName="crNumber" placeholder="1010123456" maxlength="10" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="crExp">تاريخ انتهاء السجل *</label>
                  <input id="crExp" type="date" class="form-input" formControlName="crExpiryDate" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="taxNum">الرقم الضريبي (15 رقم يبدأ وينتهي بـ 3) *</label>
                  <input id="taxNum" type="text" class="form-input" formControlName="taxNumber" placeholder="300123456700003" maxlength="15" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="city">المدينة *</label>
                  <input id="city" type="text" class="form-input" formControlName="city" placeholder="الرياض / جدة / الدمام" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="email">البريد الإلكتروني الرسمي *</label>
                  <input id="email" type="email" class="form-input" formControlName="contactEmail" placeholder="vendor@domain.sa" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="phone">رقم الهاتف *</label>
                  <input id="phone" type="tel" class="form-input" formControlName="contactPhone" placeholder="+966500000000" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="natAddr">العنوان الوطني</label>
                  <input id="natAddr" type="text" class="form-input" formControlName="nationalAddress" placeholder="الرياض، حي العليا، مبنى 1234" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="website">الموقع الإلكتروني</label>
                  <input id="website" type="url" class="form-input" formControlName="websiteUrl" placeholder="https://example.sa" />
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">إلغاء</button>
                <button type="submit" class="btn btn-primary" [disabled]="vendorForm.invalid || isSubmitting()">
                  @if (isSubmitting()) {
                    <span>جاري الحفظ...</span>
                  } @else {
                    <span>تسجيل واعتماد المورد</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 24px;
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
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 18px;
      margin-bottom: 20px;
      gap: 16px;
      flex-wrap: wrap;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 280px;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 6px 12px;
    }
    .search-icon { color: var(--text-tertiary); }
    .search-input {
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary);
      font-size: 0.875rem;
      width: 100%;
      font-family: inherit;
    }
    .filter-group {
      display: flex;
      gap: 6px;
    }
    .filter-pill {
      padding: 6px 14px;
      background: transparent;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-full);
      color: var(--text-secondary);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      font-family: inherit;
    }
    .filter-pill:hover {
      background: var(--bg-input);
      color: var(--text-primary);
    }
    .filter-pill.active {
      background: var(--accent-primary);
      color: #fff;
      border-color: var(--accent-primary);
      box-shadow: 0 2px 8px var(--accent-glow);
    }
    .clickable-row { cursor: pointer; }
    .code-pill {
      font-family: monospace;
      font-size: 0.8125rem;
      background: var(--bg-input);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .font-mono { font-family: monospace; }
    .score-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .score-bar-bg {
      width: 70px;
      height: 6px;
      background: var(--border-subtle);
      border-radius: 99px;
      overflow: hidden;
    }
    .score-bar-fill {
      height: 100%;
      border-radius: 99px;
      transition: width 0.4s ease;
    }
    .score-high { background: var(--color-success); }
    .score-med { background: var(--color-warning); }
    .score-low { background: var(--color-danger); }
    .score-text {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      width: 32px;
    }
    .loading-state, .empty-state {
      padding: 48px;
      text-align: center;
      color: var(--text-secondary);
    }
    .empty-icon {
      color: var(--text-tertiary);
      margin-bottom: 12px;
    }
    .empty-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    .empty-subtitle {
      font-size: 0.8125rem;
      color: var(--text-tertiary);
    }
    .pagination-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-top: 1px solid var(--border-subtle);
    }
    .pagination-info {
      font-size: 0.8125rem;
      color: var(--text-tertiary);
    }
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .page-indicator {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal-content {
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 32px;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-glass);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    .modal-subtitle {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }
    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-tertiary);
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
      padding: 4px;
    }
    .close-btn:hover { color: var(--text-primary); }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--border-subtle);
    }
    .modal-alert-error {
      padding: 10px 14px;
      background: var(--color-danger-bg);
      border: 1px solid var(--color-danger-border);
      border-radius: var(--radius-sm);
      color: var(--color-danger);
      font-size: 0.8125rem;
      margin-bottom: 16px;
    }
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(150, 150, 150, 0.2);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin: 0 auto 12px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class VendorListComponent implements OnInit {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);

  pageData = signal<PageResponse<Vendor> | null>(null);
  currentPage = signal(0);
  selectedStatus = signal<VendorStatus | undefined>(undefined);
  searchTerm = signal('');
  isLoading = signal(false);

  showModal = signal(false);
  isSubmitting = signal(false);
  modalError = signal('');

  vendorForm: FormGroup = this.fb.group({
    companyNameAr: ['', [Validators.required]],
    companyNameEn: ['', [Validators.required]],
    crNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    crExpiryDate: ['', [Validators.required]],
    taxNumber: ['', [Validators.required, Validators.pattern('^3[0-9]{13}3$')]],
    city: ['', [Validators.required]],
    contactEmail: ['', [Validators.required, Validators.email]],
    contactPhone: ['', [Validators.required]],
    nationalAddress: [''],
    websiteUrl: ['']
  });

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors(): void {
    this.isLoading.set(true);
    this.apiService.getVendors(this.currentPage(), 10, this.selectedStatus(), this.searchTerm()).subscribe({
      next: (data) => {
        this.pageData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading vendors', err);
        this.isLoading.set(false);
      }
    });
  }

  onSearch(event: any): void {
    this.searchTerm.set(event.target.value);
    this.currentPage.set(0);
    this.loadVendors();
  }

  filterByStatus(status?: VendorStatus): void {
    this.selectedStatus.set(status);
    this.currentPage.set(0);
    this.loadVendors();
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    this.loadVendors();
  }

  openCreateModal(): void {
    this.vendorForm.reset();
    this.modalError.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitVendor(): void {
    if (this.vendorForm.invalid) return;

    this.isSubmitting.set(true);
    this.modalError.set('');

    const req: VendorCreateRequest = this.vendorForm.value;

    this.apiService.createVendor(req).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.loadVendors();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.modalError.set(err.error?.message || 'فشل في حفظ بيانات المورد');
      }
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
}
