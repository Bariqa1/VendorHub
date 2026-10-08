import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Contract, ContractAnalysis, ContractQuestionResponse, ContractStatus } from '../../../core/models/models';

@Component({
  selector: 'app-contract-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container animate-fade-in" *ngIf="contract() as c">
      <!-- Breadcrumb -->
      <div class="breadcrumb-bar">
        <a routerLink="/contracts" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          <span>العودة لقائمة العقود</span>
        </a>
      </div>

      <!-- Main Contract Header -->
      <div class="glass-panel contract-hero">
        <div class="hero-info">
          <div class="code-and-badge">
            <code class="code-pill">{{ c.contractNumber }}</code>
            <span class="badge" [ngClass]="'badge-' + c.status.toLowerCase()">
              {{ getStatusLabel(c.status) }}
            </span>
          </div>
          <h1 class="contract-title">{{ c.title }}</h1>
          <p class="contract-vendor-link">
            المورد المتعاقد:
            <a [routerLink]="['/vendors', c.vendorPublicId]" class="link">
              {{ c.vendorCompanyNameAr }} ({{ c.vendorCompanyNameEn }})
            </a>
          </p>
        </div>

        <div class="hero-actions" *ngIf="authService.hasRole('ROLE_ADMIN') || authService.hasRole('ROLE_PROCUREMENT_OFFICER')">
          @if (c.status === 'PENDING_APPROVAL' || c.status === 'DRAFT') {
            <button class="btn btn-primary btn-sm" (click)="updateStatus('ACTIVE')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>اعتماد وتفعيل العقد</span>
            </button>
          }
          @if (c.status === 'ACTIVE') {
            <button class="btn btn-secondary btn-sm" (click)="updateStatus('COMPLETED')">
              <span>إتمام العقد</span>
            </button>
            <button class="btn btn-ghost btn-sm text-danger" (click)="updateStatus('TERMINATED')">
              <span>إنهاء مبكر</span>
            </button>
          }
        </div>
      </div>

      <!-- Financial & Overview Grid -->
      <div class="overview-grid">
        <!-- Card 1: Value & Terms -->
        <div class="glass-panel info-card">
          <h2 class="card-heading">البيانات المالية والتعاقدية</h2>
          <div class="data-list">
            <div class="data-item">
              <span class="label">القيمة الإجمالية</span>
              <span class="val-highlight font-mono">{{ c.totalAmount | number:'1.0-0' }} {{ c.currency }}</span>
            </div>
            <div class="data-item">
              <span class="label">نوع العقد</span>
              <span class="val">{{ c.contractType }}</span>
            </div>
            <div class="data-item">
              <span class="label">تاريخ السريان</span>
              <span class="val font-mono">{{ c.startDate }}</span>
            </div>
            <div class="data-item">
              <span class="label">تاريخ الانتهاء</span>
              <span class="val font-mono">{{ c.endDate }}</span>
            </div>
            <div class="data-item">
              <span class="label">شروط الدفع</span>
              <span class="val text-secondary">{{ c.paymentTerms || 'حسب الاستحقاق' }}</span>
            </div>
            <div class="data-item">
              <span class="label">التجديد التلقائي</span>
              <span class="val">{{ c.autoRenew ? 'مفعل' : 'غير مفعل' }}</span>
            </div>
          </div>
        </div>

        <!-- Card 2: AI Contract Intelligence Panel -->
        <div class="glass-panel ai-card">
          <div class="ai-header">
            <div class="ai-title-row">
              <div class="ai-icon-mini">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              </div>
              <div>
                <h3 class="ai-title">تحليل الذكاء الاصطناعي للعقد</h3>
                <span class="ai-sub">مراجعة البنود والمخاطر والالتزامات</span>
              </div>
            </div>

            <button class="btn btn-secondary btn-sm" (click)="runAiAnalysis()" [disabled]="isAnalyzing()">
              @if (isAnalyzing()) {
                <div class="spinner-mini"></div>
                <span>جاري التحليل...</span>
              } @else {
                <span>تشغيل التحليل الفوري</span>
              }
            </button>
          </div>

          @if (analysis(); as a) {
            <div class="ai-results animate-fade-in">
              <div class="ai-summary-box">
                <span class="summary-tag">الملخص التنفيذي</span>
                <p class="summary-text">{{ a.summary }}</p>
              </div>

              <!-- Confidence & Origin -->
              <div class="ai-meta-row">
                <span class="confidence-badge">
                  دقة النموذج: <strong>{{ (a.confidenceScore * 100) | number:'1.0-0' }}%</strong>
                </span>
                <span class="badge badge-approved">
                  فحص مكتمل
                </span>
              </div>

              <!-- Extracted Clauses -->
              @if (a.clauses && a.clauses.length > 0) {
                <div class="clauses-list">
                  <span class="clauses-heading">البنود والشروط المكتشفة:</span>
                  @for (clause of a.clauses; track $index) {
                    <div class="clause-item">
                      <span class="clause-type">{{ clause.type }}</span>
                      <span class="clause-desc">{{ clause.text || clause.description }}</span>
                    </div>
                  }
                </div>
              }

              <!-- Interactive Contract Q&A with RAG & Guardrails -->
              <div class="ai-qa-box">
                <div class="qa-header-row">
                  <span class="qa-title">اسأل عن هذا العقد (محادثة مدعومة بالـ RAG والضوابط الأمنية):</span>
                  <div class="qa-badges">
                    <span class="badge badge-purple" style="font-size: 0.65rem;">✦ RAG</span>
                    <span class="badge badge-approved" style="font-size: 0.65rem;">🛡️ Guardrails</span>
                  </div>
                </div>

                <div class="qa-quick-chips">
                  <button type="button" class="mini-chip" (click)="askSample('ما هي القيمة الإجمالية وشروط السداد؟')">شروط الدفع</button>
                  <button type="button" class="mini-chip" (click)="askSample('ما هي غرامات التأخير في هذا العقد؟')">غرامات التأخير</button>
                  <button type="button" class="mini-chip" (click)="askSample('متى يحق للطرف الأول فسخ العقد؟')">شروط الفسخ</button>
                  <button type="button" class="mini-chip" (click)="askSample('ما هي التزامات سرية المعلومات؟')">سرية البيانات</button>
                </div>

                <div class="qa-input-row">
                  <input
                    type="text"
                    class="form-input"
                    placeholder="مثال: متى يحق للطرف الأول فسخ العقد؟"
                    [(ngModel)]="customQuestion"
                    (keyup.enter)="askAi()"
                  />
                  <button class="btn btn-primary btn-sm" (click)="askAi()" [disabled]="!customQuestion || isAsking()">
                    @if (isAsking()) {
                      <div class="spinner-mini"></div>
                    } @else {
                      <span>إرسال</span>
                    }
                  </button>
                </div>

                @if (qaAnswer(); as ans) {
                  <div class="qa-answer-box animate-fade-in" [class.guard-block]="ans.guardrailsPassed === false">
                    <div class="qa-answer-header">
                      <div class="qa-answer-title">
                        {{ ans.guardrailsPassed === false ? '⚠️ تنبيه أمني' : 'الإجابة المستخرجة:' }}
                      </div>
                      <div class="qa-tags">
                        @if (ans.guardrailsPassed !== false) {
                          <span class="badge badge-approved" style="font-size: 0.65rem;">🛡️ Guardrail Verified</span>
                          <span class="badge badge-purple" style="font-size: 0.65rem;">✦ Grounded ({{ ans.confidenceScore }}%)</span>
                        } @else {
                          <span class="badge badge-rejected" style="font-size: 0.65rem;">تم الحظر بالسياسة الأمنية</span>
                        }
                      </div>
                    </div>
                    <p class="qa-answer-text">{{ ans.answer }}</p>
                    @if (ans.relevantClause) {
                      <div class="qa-clause">البند المرجعي: {{ ans.relevantClause }}</div>
                    }
                    @if (ans.citations && ans.citations.length > 0) {
                      <div class="qa-citations-row">
                        <span class="citation-label">السياق المسترجع:</span>
                        @for (c of ans.citations; track c) {
                          <span class="citation-tag">{{ c }}</span>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          } @else {
            <div class="ai-placeholder">
              <p>اضغط على "تشغيل التحليل الفوري" لاستخراج ملخص الشروط والالتزامات ومؤشرات المخاطر.</p>
            </div>
          }
        </div>
      </div>

      <!-- Milestones & Deliverables Section -->
      <div class="glass-panel milestones-section">
        <div class="milestones-top">
          <div>
            <h2 class="section-title">مراحل التنفيذ والدفعات المالية ({{ c.milestones.length }})</h2>
            <p class="section-sub">تتبع نسب الإنجاز واعتماد الدفعات المرحلية</p>
          </div>
        </div>

        <div class="milestones-grid">
          @for (m of c.milestones; track m.id || $index) {
            <div class="milestone-card glass-panel">
              <div class="m-card-top">
                <span class="m-number">مرحلة {{ $index + 1 }}</span>
                <span class="badge" [ngClass]="getMilestoneBadgeClass(m.status)">
                  {{ getMilestoneStatusLabel(m.status) }}
                </span>
              </div>
              <h3 class="m-title">{{ m.title }}</h3>
              <div class="m-footer">
                <div>
                  <span class="m-lbl">المبلغ المستحق:</span>
                  <span class="m-amount">{{ m.amount | number:'1.0-0' }} {{ c.currency }}</span>
                </div>
                <div>
                  <span class="m-lbl">تاريخ الاستحقاق:</span>
                  <span class="m-date font-mono">{{ m.dueDate }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 32px;
      max-width: 1300px;
      margin: 0 auto;
    }
    .breadcrumb-bar { margin-bottom: 20px; }
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

    .contract-hero {
      padding: 28px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .code-and-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }
    .code-pill {
      font-family: monospace;
      font-size: 0.8125rem;
      background: var(--bg-input);
      padding: 3px 8px;
      border-radius: 4px;
      color: var(--accent-primary);
    }
    .contract-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
      letter-spacing: -0.02em;
    }
    .contract-vendor-link {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    .link { color: var(--accent-primary); text-decoration: none; font-weight: 500; }
    .link:hover { text-decoration: underline; }
    .hero-actions { display: flex; gap: 10px; }

    .overview-grid {
      display: grid;
      grid-template-columns: 1fr 1.3fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    .info-card, .ai-card {
      padding: 24px;
    }
    .card-heading {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .data-list { display: flex; flex-direction: column; gap: 14px; }
    .data-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
    }
    .label { color: var(--text-secondary); }
    .val { color: var(--text-primary); font-weight: 500; }
    .val-highlight { color: var(--accent-primary); font-weight: 700; font-size: 1.125rem; }
    .font-mono { font-family: monospace; }
    .text-secondary { color: var(--text-secondary); }
    .text-danger { color: var(--color-danger); }

    /* AI Card Styles */
    .ai-card {
      background: linear-gradient(145deg, var(--color-purple-bg) 0%, var(--bg-card) 100%);
      border: 1px solid var(--color-purple);
    }
    .ai-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .ai-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .ai-icon-mini {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      background: linear-gradient(135deg, var(--color-purple), #5e5ce6);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ai-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2px;
    }
    .ai-sub { font-size: 0.725rem; color: var(--text-secondary); }
    .ai-placeholder {
      padding: 36px 20px;
      text-align: center;
      color: var(--text-tertiary);
      font-size: 0.875rem;
    }
    .ai-summary-box {
      background: var(--bg-surface);
      padding: 14px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
      margin-bottom: 14px;
    }
    .summary-tag {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-purple);
      display: block;
      margin-bottom: 4px;
    }
    .summary-text {
      font-size: 0.8125rem;
      color: var(--text-primary);
      line-height: 1.5;
    }
    .ai-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .confidence-badge {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    .clauses-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }
    .clauses-heading {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .clause-item {
      display: flex;
      gap: 8px;
      padding: 8px 10px;
      background: var(--bg-input);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
    }
    .clause-type {
      font-weight: 600;
      color: var(--accent-primary);
      min-width: 80px;
    }
    .clause-desc { color: var(--text-secondary); }

    .ai-qa-box {
      border-top: 1px solid var(--border-subtle);
      padding-top: 14px;
    }
    .qa-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      display: block;
      margin-bottom: 8px;
    }
    .qa-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .qa-badges {
      display: flex;
      gap: 6px;
    }
    .qa-quick-chips {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }
    .mini-chip {
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-full);
      padding: 3px 8px;
      font-size: 0.7rem;
      color: var(--text-secondary);
      cursor: pointer;
      font-family: inherit;
      transition: all var(--transition-fast);
    }
    .mini-chip:hover {
      background: var(--accent-glow);
      color: var(--accent-primary);
      border-color: var(--accent-primary);
    }
    .qa-input-row {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
    }
    .qa-answer-box {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      box-shadow: var(--shadow-card);
    }
    .qa-answer-box.guard-block {
      border-color: var(--color-danger);
      background: var(--color-danger-bg);
    }
    .qa-answer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .qa-answer-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--accent-primary);
    }
    .qa-tags {
      display: flex;
      gap: 6px;
    }
    .qa-answer-text {
      font-size: 0.8125rem;
      color: var(--text-primary);
      line-height: 1.5;
    }
    .qa-clause {
      font-size: 0.7rem;
      color: var(--accent-primary);
      margin-top: 6px;
      font-weight: 500;
    }
    .qa-citations-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px dashed var(--border-subtle);
    }
    .citation-label {
      font-size: 0.65rem;
      color: var(--text-tertiary);
    }
    .citation-tag {
      font-size: 0.65rem;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--text-secondary);
    }

    /* Milestones */
    .milestones-section { padding: 24px; }
    .milestones-top { margin-bottom: 18px; }
    .section-title { font-size: 1.05rem; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
    .section-sub { font-size: 0.8125rem; color: var(--text-secondary); }
    .milestones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .milestone-card {
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
    }
    .m-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .m-number { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); }
    .m-title { font-size: 0.9375rem; font-weight: 600; color: var(--text-primary); }
    .m-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid var(--border-subtle);
      padding-top: 10px;
    }
    .m-lbl { font-size: 0.6875rem; color: var(--text-tertiary); display: block; }
    .m-amount { font-size: 0.875rem; font-weight: 700; color: var(--accent-primary); }
    .m-date { font-size: 0.75rem; color: var(--text-secondary); }

    .spinner-mini {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ContractDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  contract = signal<Contract | null>(null);
  analysis = signal<ContractAnalysis | null>(null);
  isAnalyzing = signal<boolean>(false);

  customQuestion = '';
  isAsking = signal<boolean>(false);
  qaAnswer = signal<ContractQuestionResponse | null>(null);

  ngOnInit(): void {
    const publicId = this.route.snapshot.paramMap.get('id');
    if (publicId) {
      this.loadContract(publicId);
    }
  }

  loadContract(publicId: string): void {
    this.apiService.getContractByPublicId(publicId).subscribe({
      next: (data) => this.contract.set(data),
      error: (err) => console.error('Error loading contract', err)
    });
  }

  updateStatus(status: ContractStatus): void {
    const current = this.contract();
    if (!current) return;
    this.apiService.updateContractStatus(current.publicId, status, 'تحديث الحالة من صفحة العقد').subscribe({
      next: (updated) => this.contract.set(updated),
      error: (err) => alert(err.error?.message || 'فشل تحديث الحالة')
    });
  }

  runAiAnalysis(): void {
    const current = this.contract();
    if (!current) return;
    this.isAnalyzing.set(true);
    this.apiService.analyzeContract(current.publicId).subscribe({
      next: (res) => {
        this.analysis.set(res);
        this.isAnalyzing.set(false);
      },
      error: (err) => {
        console.error('Error in AI analysis', err);
        this.isAnalyzing.set(false);
      }
    });
  }

  askSample(prompt: string): void {
    this.customQuestion = prompt;
    this.askAi();
  }

  askAi(): void {
    const current = this.contract();
    if (!current || !this.customQuestion.trim()) return;
    this.isAsking.set(true);
    this.apiService.askContractQuestion(current.publicId, this.customQuestion).subscribe({
      next: (res) => {
        this.qaAnswer.set(res);
        this.isAsking.set(false);
      },
      error: (err) => {
        console.error('Error in AI Q&A', err);
        this.isAsking.set(false);
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

  getMilestoneStatusLabel(status: string): string {
    const map: { [key: string]: string } = {
      'PENDING': 'معلق',
      'IN_PROGRESS': 'قيد التنفيذ',
      'DELIVERED': 'تم التسليم',
      'APPROVED': 'معتمد',
      'PAID': 'مدفوع'
    };
    return map[status] || status;
  }

  getMilestoneBadgeClass(status: string): string {
    switch (status) {
      case 'PAID':
      case 'APPROVED': return 'badge-approved';
      case 'IN_PROGRESS': return 'badge-draft';
      case 'DELIVERED': return 'badge-purple';
      default: return 'badge-warning';
    }
  }
}
