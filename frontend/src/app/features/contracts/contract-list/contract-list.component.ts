import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Contract, ContractCreateRequest, ContractStatus, ContractType, PageResponse, Vendor } from '../../../core/models/models';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="page-container animate-fade-in">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">إدارة العقود والمشاريع</h1>
          <p class="page-subtitle">متابعة مراحل التنفيذ، الدفعات المالية، وحالة الاعتماد والارتباط</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          <span>إنشاء عقد جديد</span>
        </button>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="toolbar glass-panel">
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            class="search-input"
            placeholder="بحث برقم العقد أو اسم المشروع..."
            [value]="searchTerm()"
            (input)="onSearch($event)"
          />
        </div>

        <div class="filter-group">
          <button class="filter-pill" [class.active]="selectedStatus() === undefined" (click)="filterByStatus(undefined)">الكل</button>
          <button class="filter-pill" [class.active]="selectedStatus() === 'ACTIVE'" (click)="filterByStatus('ACTIVE')">ساري</button>
          <button class="filter-pill" [class.active]="selectedStatus() === 'PENDING_APPROVAL'" (click)="filterByStatus('PENDING_APPROVAL')">قيد الاعتماد</button>
          <button class="filter-pill" [class.active]="selectedStatus() === 'DRAFT'" (click)="filterByStatus('DRAFT')">مسودة</button>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-container glass-panel">
        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <span>جاري تحميل بيانات العقود...</span>
          </div>
        } @else {
          <table class="custom-table">
            <thead>
              <tr>
                <th>رقم العقد</th>
                <th>عنوان العقد</th>
                <th>المورد المتعاقد</th>
                <th>نوع العقد</th>
                <th>القيمة الإجمالية</th>
                <th>تاريخ البداية والنهاية</th>
                <th>الحالة</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              @for (contract of pageData()?.content; track contract.publicId) {
                <tr [routerLink]="['/contracts', contract.publicId]" class="clickable-row">
                  <td><code class="code-pill">{{ contract.contractNumber }}</code></td>
                  <td>
                    <div class="font-semibold text-primary">{{ contract.title }}</div>
                    <div class="text-xs text-tertiary">{{ contract.milestones.length }} دفعات / مراحل</div>
                  </td>
                  <td>
                    <div class="text-sm font-semibold">{{ contract.vendorCompanyNameAr }}</div>
                    <div class="text-xs text-tertiary">{{ contract.vendorCompanyNameEn }}</div>
                  </td>
                  <td><span class="type-tag">{{ contract.contractType }}</span></td>
                  <td class="font-semibold text-accent">
                    {{ contract.totalAmount | number:'1.0-0' }} {{ contract.currency }}
                  </td>
                  <td>
                    <div class="text-xs text-secondary">{{ contract.startDate }}</div>
                    <div class="text-xs text-tertiary">إلى {{ contract.endDate }}</div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="'badge-' + contract.status.toLowerCase()">
                      {{ getStatusLabel(contract.status) }}
                    </span>
                  </td>
                  <td>
                    <a [routerLink]="['/contracts', contract.publicId]" class="btn btn-secondary btn-sm" (click)="$event.stopPropagation()">
                      التفاصيل
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
                    <p class="empty-title">لم يتم العثور على عقود</p>
                    <p class="empty-subtitle">يمكنك إنشاء عقد جديد وربطه بأحد الموردين المعتمدين</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Pagination -->
          @if (pageData() && (pageData()?.totalPages || 0) > 1) {
            <div class="pagination-footer">
              <span class="pagination-info">
                عرض {{ pageData()?.content?.length }} من إجمالي {{ pageData()?.totalElements }} عقد
              </span>
              <div class="pagination-controls">
                <button class="btn btn-secondary btn-sm" [disabled]="pageData()?.first" (click)="changePage(currentPage() - 1)">السابق</button>
                <span class="page-indicator">صفحة {{ currentPage() + 1 }} من {{ pageData()?.totalPages }}</span>
                <button class="btn btn-secondary btn-sm" [disabled]="pageData()?.last" (click)="changePage(currentPage() + 1)">التالي</button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Create Contract Modal -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-content glass-panel animate-fade-in" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h2 class="modal-title">إنشاء عقد مشروع جديد</h2>
                <p class="modal-subtitle">ربط العقد مع مورد معتمد وتحديد الميزانية والمراحل التنفيذية</p>
              </div>
              <button class="close-btn" (click)="closeModal()">×</button>
            </div>

            @if (modalError()) {
              <div class="modal-alert-error">
                <span>{{ modalError() }}</span>
              </div>
            }

            <form [formGroup]="contractForm" (ngSubmit)="submitContract()" class="contract-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="vSelect">المورد المتعاقد معه *</label>
                  <select id="vSelect" class="form-select" formControlName="vendorPublicId">
                    <option value="" disabled selected>اختر مورد معتمد من القائمة...</option>
                    @for (v of approvedVendors(); track v.publicId) {
                      <option [value]="v.publicId">{{ v.companyNameAr }} (سجل: {{ v.crNumber }})</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="cNum">رقم العقد المرجعي *</label>
                  <input id="cNum" type="text" class="form-input" formControlName="contractNumber" placeholder="CNT-2026-001" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="cTitle">عنوان العقد / المشروع *</label>
                  <input id="cTitle" type="text" class="form-input" formControlName="title" placeholder="عقد توريد حلول برمجية سحابية" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="cType">نوع العقد *</label>
                  <select id="cType" class="form-select" formControlName="contractType">
                    <option value="SERVICES">خدمات (SERVICES)</option>
                    <option value="SUPPLY">توريد (SUPPLY)</option>
                    <option value="CONSULTING">استشارات (CONSULTING)</option>
                    <option value="MAINTENANCE">صيانة ودعم (MAINTENANCE)</option>
                    <option value="IT_INFRASTRUCTURE">بنية تحتية وتقنية (IT_INFRASTRUCTURE)</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="cAmount">القيمة الإجمالية (ر.س) *</label>
                  <input id="cAmount" type="number" class="form-input" formControlName="totalAmount" placeholder="350000" min="1" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="cTerms">شروط الدفع</label>
                  <input id="cTerms" type="text" class="form-input" formControlName="paymentTerms" placeholder="دفع خلال 30 يوم من تاريخ الفاتورة المعتمدة" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="cStart">تاريخ البدء *</label>
                  <input id="cStart" type="date" class="form-input" formControlName="startDate" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="cEnd">تاريخ الانتهاء *</label>
                  <input id="cEnd" type="date" class="form-input" formControlName="endDate" />
                </div>
              </div>

              <div class="milestones-builder">
                <div class="milestones-header">
                  <span class="form-label">مراحل التنفيذ والدفعات المالية</span>
                  <button type="button" class="btn btn-secondary btn-sm" (click)="addMilestone()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                    <span>إضافة مرحلة</span>
                  </button>
                </div>

                <div formArrayName="milestones" class="milestones-list">
                  @for (m of milestonesArray.controls; track $index) {
                    <div [formGroupName]="$index" class="milestone-row glass-panel">
                      <div class="m-field flex-2">
                        <input type="text" class="form-input" formControlName="title" placeholder="عنوان المرحلة أو الدفعة..." />
                      </div>
                      <div class="m-field flex-1">
                        <input type="number" class="form-input" formControlName="amount" placeholder="المبلغ (ر.س)" />
                      </div>
                      <div class="m-field flex-1">
                        <input type="date" class="form-input" formControlName="dueDate" />
                      </div>
                      <button type="button" class="m-delete-btn" (click)="removeMilestone($index)" [disabled]="milestonesArray.length === 1">×</button>
                    </div>
                  }
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">إلغاء</button>
                <button type="submit" class="btn btn-primary" [disabled]="contractForm.invalid || isSubmitting()">
                  @if (isSubmitting()) {
                    <span>جاري الإنشاء...</span>
                  } @else {
                    <span>حفظ وإنشاء العقد</span>
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
    .filter-group { display: flex; gap: 6px; }
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
    .filter-pill:hover { background: var(--bg-input); color: var(--text-primary); }
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
    .type-tag {
      font-size: 0.75rem;
      color: var(--text-secondary);
      background: var(--bg-input);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
    }
    .font-semibold { font-weight: 600; }
    .text-primary { color: var(--text-primary); }
    .text-secondary { color: var(--text-secondary); }
    .text-tertiary { color: var(--text-tertiary); }
    .text-accent { color: var(--accent-primary); }
    .text-sm { font-size: 0.875rem; }
    .text-xs { font-size: 0.75rem; }
    .loading-state, .empty-state {
      padding: 48px;
      text-align: center;
      color: var(--text-secondary);
    }
    .empty-icon { color: var(--text-tertiary); margin-bottom: 12px; }
    .empty-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
    .empty-subtitle { font-size: 0.8125rem; color: var(--text-tertiary); }
    .pagination-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-top: 1px solid var(--border-subtle);
    }
    .pagination-info { font-size: 0.8125rem; color: var(--text-tertiary); }
    .pagination-controls { display: flex; align-items: center; gap: 12px; }
    .page-indicator { font-size: 0.8125rem; color: var(--text-secondary); }

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
      max-width: 720px;
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
    .modal-title { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
    .modal-subtitle { font-size: 0.8125rem; color: var(--text-secondary); }
    .close-btn { background: transparent; border: none; color: var(--text-tertiary); font-size: 1.5rem; cursor: pointer; line-height: 1; padding: 4px; }
    .close-btn:hover { color: var(--text-primary); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .milestones-builder {
      margin-top: 10px;
      margin-bottom: 20px;
      border-top: 1px solid var(--border-subtle);
      padding-top: 16px;
    }
    .milestones-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .milestones-list { display: flex; flex-direction: column; gap: 8px; }
    .milestone-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
    }
    .m-field.flex-2 { flex: 2; }
    .m-field.flex-1 { flex: 1; }
    .m-delete-btn {
      background: transparent;
      border: none;
      color: var(--color-danger);
      font-size: 1.25rem;
      cursor: pointer;
      padding: 4px 8px;
    }
    .m-delete-btn:disabled { opacity: 0.3; cursor: not-allowed; }
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
export class ContractListComponent implements OnInit {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);

  pageData = signal<PageResponse<Contract> | null>(null);
  approvedVendors = signal<Vendor[]>([]);
  currentPage = signal(0);
  selectedStatus = signal<ContractStatus | undefined>(undefined);
  searchTerm = signal('');
  isLoading = signal(false);

  showModal = signal(false);
  isSubmitting = signal(false);
  modalError = signal('');

  contractForm: FormGroup = this.fb.group({
    vendorPublicId: ['', [Validators.required]],
    contractNumber: ['', [Validators.required]],
    title: ['', [Validators.required]],
    description: [''],
    contractType: ['SERVICES', [Validators.required]],
    totalAmount: ['', [Validators.required, Validators.min(1)]],
    currency: ['SAR'],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    autoRenew: [false],
    paymentTerms: ['دفع خلال 30 يوم من تاريخ الفاتورة'],
    milestones: this.fb.array([])
  });

  get milestonesArray(): FormArray {
    return this.contractForm.get('milestones') as FormArray;
  }

  ngOnInit(): void {
    this.loadContracts();
    this.loadApprovedVendors();
  }

  loadContracts(): void {
    this.isLoading.set(true);
    this.apiService.getContracts(this.currentPage(), 10, this.selectedStatus(), undefined, this.searchTerm()).subscribe({
      next: (data) => {
        this.pageData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading contracts', err);
        this.isLoading.set(false);
      }
    });
  }

  loadApprovedVendors(): void {
    this.apiService.getVendors(0, 100, 'APPROVED').subscribe({
      next: (res) => this.approvedVendors.set(res.content),
      error: (err) => console.error('Error loading approved vendors', err)
    });
  }

  onSearch(event: any): void {
    this.searchTerm.set(event.target.value);
    this.currentPage.set(0);
    this.loadContracts();
  }

  filterByStatus(status?: ContractStatus): void {
    this.selectedStatus.set(status);
    this.currentPage.set(0);
    this.loadContracts();
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    this.loadContracts();
  }

  openCreateModal(): void {
    this.contractForm.reset({
      contractType: 'SERVICES',
      currency: 'SAR',
      autoRenew: false,
      paymentTerms: 'دفع خلال 30 يوم من تاريخ الفاتورة'
    });
    this.milestonesArray.clear();
    this.addMilestone();
    this.modalError.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  addMilestone(): void {
    const milestoneGroup = this.fb.group({
      title: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      dueDate: ['', Validators.required]
    });
    this.milestonesArray.push(milestoneGroup);
  }

  removeMilestone(index: number): void {
    if (this.milestonesArray.length > 1) {
      this.milestonesArray.removeAt(index);
    }
  }

  submitContract(): void {
    if (this.contractForm.invalid) return;

    this.isSubmitting.set(true);
    this.modalError.set('');

    const req: ContractCreateRequest = this.contractForm.value;

    this.apiService.createContract(req).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.loadContracts();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.modalError.set(err.error?.message || 'فشل في إنشاء العقد');
      }
    });
  }

  getStatusLabel(status: string): string {
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
