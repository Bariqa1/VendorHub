import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Contract, ContractAnalysis } from '../../../core/models/models';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container animate-fade-in">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">تحليل العقود الذكي</h1>
          <p class="page-subtitle">استخراج فوري للالتزامات القانونية والمالية وتدقيق البنود الحساسة</p>
        </div>
      </div>

      <!-- Main Interaction Workspace -->
      <div class="ai-workspace-grid">
        <!-- Sidebar Selection & Controls -->
        <div class="glass-panel control-sidebar">
          <h2 class="sidebar-heading">اختر العقد للتحليل</h2>

          <div class="form-group">
            <label class="form-label" for="contractSelect">العقد المستهدف</label>
            <select
              id="contractSelect"
              class="form-select"
              [(ngModel)]="selectedContractPublicId"
              (change)="onContractChange()"
            >
              <option value="" disabled selected>اختر عقد من القائمة...</option>
              @for (c of contracts(); track c.publicId) {
                <option [value]="c.publicId">
                  {{ c.contractNumber }} — {{ c.title }} ({{ c.vendorCompanyNameAr }})
                </option>
              }
            </select>
          </div>

          @if (selectedContract(); as sc) {
            <div class="selected-contract-summary glass-panel">
              <div class="summary-line">
                <span class="label">المورد:</span>
                <span class="val">{{ sc.vendorCompanyNameAr }}</span>
              </div>
              <div class="summary-line">
                <span class="label">القيمة:</span>
                <span class="val font-mono">{{ sc.totalAmount | number:'1.0-0' }} {{ sc.currency }}</span>
              </div>
              <div class="summary-line">
                <span class="label">المدة:</span>
                <span class="val font-mono">{{ sc.startDate }} إلى {{ sc.endDate }}</span>
              </div>
            </div>

            <button
              class="btn btn-primary btn-block"
              (click)="analyzeCurrentContract()"
              [disabled]="isAnalyzing()"
            >
              @if (isAnalyzing()) {
                <div class="spinner-mini"></div>
                <span>جاري معالجة البنود...</span>
              } @else {
                <span>تشغيل الفحص الشامل</span>
              }
            </button>
          }
        </div>

        <!-- Analysis Results Area -->
        <div class="glass-panel results-area">
          @if (!selectedContract()) {
            <div class="empty-ai-state">
              <div class="ai-orb">✦</div>
              <h3>اختر عقدًا للبدء بالتحليل الذكي</h3>
              <p>يقوم النظام بقراءة نصوص وبنود العقد واستخراج التواريخ الحرجة، الشروط الجزائية، ومستوى الثقة.</p>
            </div>
          } @else if (isAnalyzing()) {
            <div class="analyzing-state animate-fade-in">
              <div class="pulse-ring"></div>
              <h3>جاري فحص العقد واستخراج البنود...</h3>
              <p>يرجى الانتظار لحظات لإتمام الفحص</p>
            </div>
          } @else if (analysis(); as a) {
            <div class="analysis-content animate-fade-in">
              <!-- Top Metrics -->
              <div class="analysis-hero-metrics">
                <div class="hero-metric">
                  <span class="m-lbl">مستوى دقة التحليل</span>
                  <span class="m-val text-success">{{ (a.confidenceScore * 100) | number:'1.0-0' }}%</span>
                </div>
                <div class="hero-metric">
                  <span class="m-lbl">حالة المراجعة</span>
                  <span class="badge badge-approved">فحص شامل ومكتمل</span>
                </div>
                <div class="hero-metric">
                  <span class="m-lbl">البنود المكتشفة</span>
                  <span class="m-val">{{ a.clauses.length }} بند قانوني</span>
                </div>
              </div>

              <!-- Executive Summary -->
              <div class="glass-panel section-card">
                <h3 class="card-title">الملخص التنفيذي الذكي</h3>
                <p class="summary-paragraph">{{ a.summary }}</p>
              </div>

              <!-- Detected Clauses Grid -->
              <div class="glass-panel section-card">
                <h3 class="card-title">البنود والشروط النظامية</h3>
                <div class="clauses-grid">
                  @for (clause of a.clauses; track $index) {
                    <div class="clause-box glass-panel">
                      <div class="clause-header">
                        <span class="badge badge-draft">{{ clause.type }}</span>
                      </div>
                      <p class="clause-content">{{ clause.text || clause.description }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Interactive Chat / Q&A Box with RAG and Guardrails -->
              <div class="glass-panel chat-section">
                <div class="chat-header">
                  <div class="chat-header-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <span>محادثة فورية مع العقد (Interactive Q&A)</span>
                  </div>
                  <div class="chat-header-badges">
                    <span class="rag-badge">✦ RAG Grounded</span>
                    <span class="guardrail-badge">🛡️ Guardrails Active</span>
                  </div>
                </div>

                <!-- Suggested Quick Prompts -->
                <div class="quick-prompts-bar">
                  <span class="prompts-label">استفسارات سريعة:</span>
                  <button class="prompt-chip" (click)="askSample('ما هي القيمة الإجمالية وشروط الدفع؟')">المقابل المالي وشروط الدفع</button>
                  <button class="prompt-chip" (click)="askSample('ما هي غرامة التأخير والشروط الجزائية؟')">غرامات التأخير والتعويض</button>
                  <button class="prompt-chip" (click)="askSample('متى يحق لأحد الطرفين فسخ وإنهاء العقد؟')">إنهاء العقد والفسخ</button>
                  <button class="prompt-chip" (click)="askSample('ما هي اشتراطات سرية البيانات؟')">سرية البيانات</button>
                </div>

                <!-- Chat Messages Stream -->
                <div class="chat-stream">
                  @for (msg of chatHistory(); track $index) {
                    <div class="chat-message" [ngClass]="msg.sender">
                      <div class="msg-bubble" [class.msg-guard-blocked]="msg.guardrailsPassed === false">
                        <div class="msg-header-row">
                          <span class="msg-sender">{{ msg.sender === 'user' ? 'سؤالك' : 'مساعد العقود الذكي' }}</span>
                          @if (msg.sender === 'ai') {
                            <div class="msg-tags">
                              @if (msg.guardrailsPassed === false) {
                                <span class="badge badge-rejected" style="font-size: 0.65rem;">⚠️ تم الحظر بالضوابط الأمنية</span>
                              } @else {
                                <span class="badge badge-approved" style="font-size: 0.65rem;">🛡️ Guardrail Verified</span>
                                <span class="badge badge-purple" style="font-size: 0.65rem;">✦ RAG</span>
                              }
                            </div>
                          }
                        </div>
                        <div class="msg-text">{{ msg.text }}</div>
                        
                        @if (msg.relevantClause) {
                          <div class="msg-clause">
                            <strong>المرجع الأساسي:</strong> {{ msg.relevantClause }}
                          </div>
                        }

                        @if (msg.citations && msg.citations.length > 0) {
                          <div class="msg-citations">
                            <span class="citation-lbl">البنود المسترجعة ذات الصلة:</span>
                            <div class="citation-chips">
                              @for (c of msg.citations; track c) {
                                <span class="citation-pill">{{ c }}</span>
                              }
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>

                <div class="chat-input-wrapper">
                  <input
                    type="text"
                    class="form-input"
                    placeholder="اطرح أي سؤال حول التزامات العقد، مواعيد التسليم، أو الشروط الجزائية..."
                    [(ngModel)]="currentQuestion"
                    (keyup.enter)="sendQuestion()"
                    [disabled]="isAsking()"
                  />
                  <button
                    class="btn btn-primary"
                    (click)="sendQuestion()"
                    [disabled]="!currentQuestion.trim() || isAsking()"
                  >
                    @if (isAsking()) {
                      <div class="spinner-mini"></div>
                    } @else {
                      <span>إرسال</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    }
                  </button>
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
      max-width: 1400px;
      margin: 0 auto;
    }
    .page-header { margin-bottom: 24px; }
    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.03em;
      margin-bottom: 4px;
    }
    .page-subtitle { font-size: 0.875rem; color: var(--text-secondary); }

    .ai-workspace-grid {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 24px;
      align-items: start;
    }
    .control-sidebar { padding: 24px; }
    .sidebar-heading {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .selected-contract-summary {
      padding: 14px;
      margin-bottom: 18px;
      background: var(--bg-surface);
    }
    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.8125rem;
      margin-bottom: 8px;
    }
    .summary-line:last-child { margin-bottom: 0; }
    .summary-line .label { color: var(--text-secondary); }
    .summary-line .val { color: var(--text-primary); font-weight: 500; }
    .font-mono { font-family: monospace; }
    .btn-block { width: 100%; padding: 12px; }

    .results-area {
      min-height: 550px;
      padding: 28px;
    }
    .empty-ai-state, .analyzing-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      text-align: center;
    }
    .ai-orb {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-purple), var(--accent-primary));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      color: #fff;
      margin-bottom: 18px;
      box-shadow: 0 0 30px var(--color-purple-bg);
    }
    .empty-ai-state h3, .analyzing-state h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 6px;
    }
    .empty-ai-state p, .analyzing-state p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      max-width: 500px;
    }
    .pulse-ring {
      width: 50px;
      height: 50px;
      border: 3px solid var(--color-purple);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 18px;
    }

    .analysis-hero-metrics {
      display: flex;
      gap: 18px;
      margin-bottom: 24px;
    }
    .hero-metric {
      flex: 1;
      padding: 16px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
    }
    .m-lbl { font-size: 0.75rem; color: var(--text-secondary); display: block; margin-bottom: 4px; }
    .m-val { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
    .text-success { color: var(--color-success); }

    .section-card {
      padding: 20px;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
    }
    .summary-paragraph {
      font-size: 0.875rem;
      color: var(--text-primary);
      line-height: 1.6;
    }
    .clauses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 12px;
    }
    .clause-box {
      padding: 14px;
    }
    .clause-header { margin-bottom: 8px; }
    .clause-content {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    /* Chat Section */
    .chat-section { padding: 22px; }
    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .chat-header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .chat-header-badges {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .rag-badge {
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 3px 8px;
      background: var(--color-purple-bg);
      border: 1px solid var(--color-purple);
      border-radius: var(--radius-full);
      color: var(--color-purple);
    }
    .guardrail-badge {
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 3px 8px;
      background: var(--color-success-bg);
      border: 1px solid var(--color-success-border);
      border-radius: var(--radius-full);
      color: var(--color-success);
    }

    .quick-prompts-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
      padding: 10px 12px;
      background: var(--bg-surface);
      border: 1px dashed var(--border-subtle);
      border-radius: var(--radius-sm);
    }
    .prompts-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-tertiary);
    }
    .prompt-chip {
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-full);
      padding: 4px 10px;
      font-size: 0.75rem;
      color: var(--text-secondary);
      cursor: pointer;
      font-family: inherit;
      transition: all var(--transition-fast);
    }
    .prompt-chip:hover {
      background: var(--accent-glow);
      color: var(--accent-primary);
      border-color: var(--accent-primary);
    }

    .chat-stream {
      display: flex;
      flex-direction: column;
      gap: 14px;
      max-height: 340px;
      overflow-y: auto;
      margin-bottom: 16px;
      padding-right: 4px;
    }
    .chat-message { display: flex; }
    .chat-message.user { justify-content: flex-start; }
    .chat-message.ai { justify-content: flex-end; }
    .msg-bubble {
      max-width: 85%;
      padding: 14px 18px;
      border-radius: var(--radius-md);
    }
    .chat-message.user .msg-bubble {
      background: var(--accent-glow);
      border: 1px solid var(--accent-primary);
    }
    .chat-message.ai .msg-bubble {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-card);
    }
    .msg-guard-blocked {
      border-color: var(--color-danger) !important;
      background: var(--color-danger-bg) !important;
    }
    .msg-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }
    .msg-sender {
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--text-secondary);
    }
    .msg-tags {
      display: flex;
      gap: 6px;
    }
    .msg-text {
      font-size: 0.8125rem;
      color: var(--text-primary);
      line-height: 1.5;
    }
    .msg-clause {
      font-size: 0.725rem;
      color: var(--accent-primary);
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px solid var(--border-subtle);
    }
    .msg-citations {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px dashed var(--border-subtle);
    }
    .citation-lbl {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-tertiary);
      display: block;
      margin-bottom: 4px;
    }
    .citation-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .citation-pill {
      font-size: 0.6875rem;
      background: var(--bg-input);
      color: var(--text-secondary);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
    }
    .chat-input-wrapper {
      display: flex;
      gap: 10px;
    }
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
export class AiAssistantComponent implements OnInit {
  private apiService = inject(ApiService);

  contracts = signal<Contract[]>([]);
  selectedContractPublicId = '';
  selectedContract = signal<Contract | null>(null);
  analysis = signal<ContractAnalysis | null>(null);
  isAnalyzing = signal<boolean>(false);

  currentQuestion = '';
  isAsking = signal<boolean>(false);
  chatHistory = signal<{
    sender: 'user' | 'ai';
    text: string;
    relevantClause?: string;
    citations?: string[];
    grounded?: boolean;
    guardrailsPassed?: boolean;
    guardrailType?: string;
  }[]>([]);

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.apiService.getContracts(0, 100).subscribe({
      next: (res) => {
        this.contracts.set(res.content);
        if (res.content.length > 0) {
          this.selectedContractPublicId = res.content[0].publicId;
          this.onContractChange();
        }
      },
      error: (err) => console.error('Error loading contracts', err)
    });
  }

  onContractChange(): void {
    const found = this.contracts().find(c => c.publicId === this.selectedContractPublicId) || null;
    this.selectedContract.set(found);
    this.analysis.set(null);
    this.chatHistory.set([]);
  }

  analyzeCurrentContract(): void {
    if (!this.selectedContractPublicId) return;

    this.isAnalyzing.set(true);
    this.apiService.analyzeContract(this.selectedContractPublicId).subscribe({
      next: (res) => {
        this.analysis.set(res);
        this.isAnalyzing.set(false);
      },
      error: (err) => {
        console.error('Error analyzing contract', err);
        this.isAnalyzing.set(false);
      }
    });
  }

  askSample(prompt: string): void {
    this.currentQuestion = prompt;
    this.sendQuestion();
  }

  sendQuestion(): void {
    if (!this.selectedContractPublicId || !this.currentQuestion.trim()) return;

    const q = this.currentQuestion.trim();
    this.chatHistory.update(history => [...history, { sender: 'user', text: q }]);
    this.currentQuestion = '';
    this.isAsking.set(true);

    this.apiService.askContractQuestion(this.selectedContractPublicId, q).subscribe({
      next: (res) => {
        this.chatHistory.update(history => [
          ...history,
          {
            sender: 'ai',
            text: res.answer,
            relevantClause: res.relevantClause,
            citations: res.citations || [],
            grounded: res.grounded !== false,
            guardrailsPassed: res.guardrailsPassed !== false,
            guardrailType: res.guardrailType || 'VERIFIED_SAFE'
          }
        ]);
        this.isAsking.set(false);
      },
      error: (err) => {
        this.chatHistory.update(history => [
          ...history,
          {
            sender: 'ai',
            text: 'تعذر الحصول على إجابة حالياً، يرجى المحاولة لاحقاً.',
            guardrailsPassed: false
          }
        ]);
        this.isAsking.set(false);
      }
    });
  }
}
