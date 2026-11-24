/**
 * VeriTest - Online Examination & Assessment System
 * Application Controller & Heuristics Engine
 * Includes "Exam Leader / Exam Maker" Academic Distribution Architecture
 */

class AppController {
    constructor() {
        this.data = window.VERITEST_DATA || window.EDUDATA;
        this.currentView = 'view-landing';
        this.currentRole = null;
        this.currentExam = null;
        this.currentQuestionIdx = 0;
        this.examAnswers = {}; // { questionIndex: selectedOptionIndex }
        this.examFlags = {};   // { questionIndex: boolean }
        this.examTimer = null;
        this.examSecondsRemaining = 45 * 60 + 23; // 45:23 like in draft
        this.tabSwitchCount = 0;
        this.maxTabSwitches = (this.data && this.data.systemPolicies && this.data.systemPolicies.tabSwitchLimit) || 3;
        this.isExamActive = false;
        this.darkMode = false;

        this.init();
    }

    init() {
        this.initTheme();
        this.setupEventListeners();
        this.setupProctoringListener();
        this.setupClipboardRestrictions();
        this.renderAllViews();
        this.showView('view-landing');
    }

    // --- THEME MANAGEMENT ---
    initTheme() {
        const savedTheme = localStorage.getItem('veritest_theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            this.setDarkMode(true);
        } else {
            this.setDarkMode(false);
        }
    }

    toggleTheme() {
        this.setDarkMode(!this.darkMode);
    }

    setDarkMode(enabled) {
        this.darkMode = enabled;
        if (enabled) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('veritest_theme', 'dark');
            document.querySelectorAll('.theme-toggle-icon').forEach(el => {
                el.className = 'fas fa-sun theme-toggle-icon text-amber-400';
            });
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('veritest_theme', 'light');
            document.querySelectorAll('.theme-toggle-icon').forEach(el => {
                el.className = 'fas fa-moon theme-toggle-icon text-slate-600';
            });
        }
    }

    // --- NAVIGATION & ROUTING ---
    showView(viewId, subviewId = null) {
        const views = document.querySelectorAll('.app-view');
        views.forEach(v => v.classList.add('hidden'));

        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
            this.currentView = viewId;
        }

        if (subviewId) {
            this.showSubview(subviewId);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.updateNavState();
    }

    showSubview(subviewId) {
        const subviews = document.querySelectorAll('.subview-pane');
        subviews.forEach(s => s.classList.add('hidden'));

        const target = document.getElementById(subviewId);
        if (target) {
            target.classList.remove('hidden');
        }

        document.querySelectorAll('.sidebar-link').forEach(link => {
            if (link.dataset.target === subviewId) {
                link.classList.add('bg-blue-50', 'text-blue-700', 'dark:bg-slate-800', 'dark:text-blue-400', 'font-semibold');
                link.classList.remove('text-slate-600', 'dark:text-slate-400');
            } else {
                link.classList.remove('bg-blue-50', 'text-blue-700', 'dark:bg-slate-800', 'dark:text-blue-400', 'font-semibold');
                link.classList.add('text-slate-600', 'dark:text-slate-400');
            }
        });
    }

    updateNavState() {
        const portalNav = document.getElementById('mainPortalNav');
        const landingNav = document.getElementById('landingNav');

        if (this.currentView === 'view-landing' || this.currentView === 'view-login') {
            if (portalNav) portalNav.classList.add('hidden');
            if (landingNav) landingNav.classList.remove('hidden');
        } else if (this.currentView === 'view-student-live-exam') {
            if (portalNav) portalNav.classList.add('hidden');
            if (landingNav) landingNav.classList.add('hidden');
        } else {
            if (landingNav) landingNav.classList.add('hidden');
            if (portalNav) portalNav.classList.remove('hidden');
            this.renderPortalHeader();
        }
    }

    renderPortalHeader() {
        const roleBadge = document.getElementById('currentRoleBadge');
        const userName = document.getElementById('currentUserName');

        if (!this.currentRole) return;

        const roleConfig = {
            student: { title: 'STUDENT', bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400', user: this.data.demoAccounts.student },
            teacher: { title: 'PROFESSOR', bg: 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400', user: this.data.demoAccounts.teacher },
            admin: { title: 'ADMIN', bg: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400', user: this.data.demoAccounts.admin }
        };

        const config = roleConfig[this.currentRole];
        if (config) {
            if (roleBadge) {
                roleBadge.textContent = config.title;
                roleBadge.className = `px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider ${config.bg}`;
            }
            if (userName) userName.textContent = config.user.name;
        }
    }

    // --- AUTHENTICATION & ROLE SWITCHING ---
    openLoginModal(targetRole = 'student') {
        this.selectLoginRoleTab(targetRole);
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            const err = document.getElementById('loginErrorBanner');
            if (err) err.classList.add('hidden');
        }
    }

    closeLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    selectLoginRoleTab(role) {
        this.selectedLoginRole = role;
        document.querySelectorAll('.login-role-tab').forEach(tab => {
            if (tab.dataset.role === role) {
                tab.classList.add('border-blue-600', 'text-blue-600', 'dark:text-blue-400', 'dark:border-blue-400', 'font-semibold');
                tab.classList.remove('border-transparent', 'text-slate-500');
            } else {
                tab.classList.remove('border-blue-600', 'text-blue-600', 'dark:text-blue-400', 'dark:border-blue-400', 'font-semibold');
                tab.classList.add('border-transparent', 'text-slate-500');
            }
        });

        const user = this.data.demoAccounts[role];
        const idInput = document.getElementById('loginIdentifier');
        const passInput = document.getElementById('loginPassword');
        if (idInput && user) idInput.value = user.email;
        if (passInput) passInput.value = "••••••••••••";
    }

    handleLoginSubmit() {
        const role = this.selectedLoginRole || 'student';
        this.loginAs(role);
    }

    loginAs(role) {
        this.currentRole = role;
        this.closeLoginModal();

        this.showToast(`Logged in successfully as ${role.toUpperCase()}!`, 'success');
        this.logAuditEvent(this.data.demoAccounts[role].name, 'LOGIN_SUCCESS', 'Auth', `Successful login session (${role})`);

        if (role === 'student') {
            this.showView('view-student', 'student-dashboard');
        } else if (role === 'teacher') {
            this.showView('view-teacher', 'teacher-dashboard');
        } else if (role === 'admin') {
            this.showView('view-admin', 'admin-dashboard');
        }
    }

    logout() {
        this.currentRole = null;
        this.isExamActive = false;
        clearInterval(this.examTimer);
        this.showToast('Logged out of system.', 'info');
        this.showView('view-landing');
    }

    // --- PROCTORING SECURITY SIMULATION (HCI Requirement) ---
    setupProctoringListener() {
        document.addEventListener('visibilitychange', () => {
            if (this.isExamActive && document.hidden) {
                this.tabSwitchCount++;
                const remaining = this.maxTabSwitches - this.tabSwitchCount;

                this.showToast(
                    `⚠️ Security Warning: Tab switch #${this.tabSwitchCount} detected! (${Math.max(0, remaining)} remaining before lockout)`,
                    'danger'
                );

                this.logAuditEvent(
                    this.data.demoAccounts.student.name,
                    'TAB_SWITCH_ALERT',
                    'Proctor',
                    `Candidate switched active tab/window during exam. Count: ${this.tabSwitchCount}/${this.maxTabSwitches}`
                );

                if (this.tabSwitchCount >= this.maxTabSwitches) {
                    alert('🚨 MAXIMUM SECURITY VIOLATIONS REACHED:\nYou have switched tabs 3 times. Your exam is now locked and submitted for administrative review.');
                    this.submitExam(true);
                }
            }
        });
    }

    logAuditEvent(user, action, module, details) {
        const now = new Date();
        const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
        this.data.auditLogs.unshift({
            timestamp,
            user,
            action,
            module,
            details
        });
        this.renderAdminAuditLogs();
        this.renderAdminDashboardStats();
    }

    // --- EXAM INTEGRITY & CLIPBOARD RESTRICTIONS ---
    setupClipboardRestrictions() {
        if (this._clipboardListenerAttached) return;
        this._clipboardListenerAttached = true;

        const blockHandler = (e) => {
            if (this.isExamActive) {
                e.preventDefault();
                this.showToast("Restriction Enforced: Copy, paste, and context menus are disabled during proctored examinations.", "danger");
            }
        };

        document.addEventListener('copy', blockHandler);
        document.addEventListener('cut', blockHandler);
        document.addEventListener('paste', blockHandler);
        document.addEventListener('contextmenu', blockHandler);
    }

    // --- EXAM ACCESS CODE & PROCTOR RESTRICTION MODAL ---
    promptExamAccessCode(examCode) {
        const exam = this.data.exams.find(e => e.code === examCode);
        if (!exam) return;

        this.pendingUnlockExam = exam;
        const modal = document.getElementById('examAccessCodeModal');
        const titleEl = document.getElementById('unlockExamTitle');
        const hintEl = document.getElementById('demoPasscodeHint');
        const inputEl = document.getElementById('inputExamAccessCode');
        const errorEl = document.getElementById('accessCodeError');

        if (titleEl) titleEl.textContent = exam.title;
        if (hintEl) hintEl.textContent = exam.restrictions?.accessCode || 'CS202-QUIZ';
        if (inputEl) {
            inputEl.value = '';
            if (typeof inputEl.focus === 'function') inputEl.focus();
        }
        if (errorEl) errorEl.classList.add('hidden');

        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    closeAccessCodeModal() {
        const modal = document.getElementById('examAccessCodeModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        this.pendingUnlockExam = null;
    }

    validateExamAccessCode() {
        const inputEl = document.getElementById('inputExamAccessCode');
        const errorEl = document.getElementById('accessCodeError');
        const entered = (inputEl?.value || '').trim().toUpperCase();

        const targetCode = (this.pendingUnlockExam?.restrictions?.accessCode || 'CS202-QUIZ').toUpperCase();

        if (entered === targetCode) {
            const examCode = this.pendingUnlockExam.code;
            this.closeAccessCodeModal();
            this.showToast('Proctor Access Code verified! Examination unlocked.', 'success');
            this.startExamInstruction(examCode);
        } else {
            if (errorEl) errorEl.classList.remove('hidden');
            this.showToast('Invalid access code. Please check with your proctor.', 'danger');
        }
    }

    // --- STUDENT EXAM WORKFLOW ---
    startExamInstruction(examCode = 'CS-101') {
        const exam = this.data.exams.find(e => e.code === examCode) || this.data.exams[1];
        this.currentExam = exam;

        document.getElementById('preExamTitle').textContent = exam.title;
        document.getElementById('preExamDomain').textContent = exam.domain;
        document.getElementById('preExamDuration').textContent = `${exam.durationMins} minutes`;
        document.getElementById('preExamVolume').textContent = `${exam.totalItems} Multiple-Choice Items`;

        // Render dynamically active academic restrictions
        const restrictionsContainer = document.getElementById('preExamRestrictionsList');
        if (restrictionsContainer) {
            restrictionsContainer.innerHTML = '';
            const res = exam.restrictions || {};

            const items = [
                {
                    icon: res.navigationMode === 'SEQUENTIAL' ? 'fa-arrow-right' : 'fa-arrows-rotate',
                    label: res.navigationMode === 'SEQUENTIAL' ? 'Sequential Navigation (No Backtracking)' : 'Free Question Navigation Allowed',
                    desc: res.navigationMode === 'SEQUENTIAL' ? 'Restricted: Cannot return to past questions once answered' : 'Jump freely between all questions'
                },
                {
                    icon: 'fa-lock',
                    label: `Attempt Restriction: ${res.maxAttempts || 1} Attempt Maximum`,
                    desc: 'Your first completed submission is final'
                },
                {
                    icon: 'fa-ban',
                    label: 'Clipboard & Context Restrictions Active',
                    desc: 'Text copy, paste, cut and right-click inspection are blocked'
                },
                {
                    icon: 'fa-window-restore',
                    label: 'Browser Tab Lockout Guard',
                    desc: `Maximum ${this.maxTabSwitches || 3} window switches before auto-lockout`
                }
            ];

            items.forEach(it => {
                const li = document.createElement('div');
                li.className = 'p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2.5';
                li.innerHTML = `
                    <i class="fas ${it.icon} text-amber-600 dark:text-amber-400 mt-0.5 text-xs"></i>
                    <div>
                        <div class="font-bold text-[11px] text-slate-800 dark:text-slate-200">${it.label}</div>
                        <div class="text-[10px] text-slate-500">${it.desc}</div>
                    </div>
                `;
                restrictionsContainer.appendChild(li);
            });
        }

        const honorCheck = document.getElementById('honorCodeCheckbox');
        const beginBtn = document.getElementById('btnBeginExam');
        if (honorCheck) honorCheck.checked = false;
        if (beginBtn) {
            beginBtn.disabled = true;
            beginBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }

        this.showView('view-student', 'student-pre-exam');
    }

    beginLiveExam() {
        if (!this.currentExam) {
            this.currentExam = this.data.exams[1]; // default CS101
        }

        this.isExamActive = true;
        this.tabSwitchCount = 0;
        this.currentQuestionIdx = 0;
        this.examAnswers = {};
        this.examFlags = {};

        this.examSecondsRemaining = 45 * 60 + 23;

        // Update live restrictions badge
        const restLabel = document.getElementById('liveRestrictionsLabel');
        const isSequential = this.currentExam?.restrictions?.navigationMode === 'SEQUENTIAL';
        if (restLabel) {
            restLabel.textContent = isSequential ? 'Restrictions Active: Sequential Mode • No Copy' : 'Restrictions Active: Proctored Guard';
        }

        this.startTimer();
        this.renderQuestionLedger();
        this.loadQuestion(0);
        this.showView('view-student-live-exam');

        this.showToast('Exam started. Security proctoring active.', 'info');
    }

    startTimer() {
        clearInterval(this.examTimer);
        const timerEl = document.getElementById('liveExamTimer');

        const updateDisplay = () => {
            const minutes = Math.floor(this.examSecondsRemaining / 60);
            const seconds = this.examSecondsRemaining % 60;
            const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            if (timerEl) {
                timerEl.textContent = formatted;
                if (this.examSecondsRemaining < 300) {
                    timerEl.classList.add('text-amber-500');
                }
                if (this.examSecondsRemaining < 60) {
                    timerEl.classList.remove('text-amber-500');
                    timerEl.classList.add('text-red-500', 'animate-pulse');
                }
            }

            if (this.examSecondsRemaining <= 0) {
                clearInterval(this.examTimer);
                alert('Time has expired! Submitting exam automatically.');
                this.submitExam(true);
            } else {
                this.examSecondsRemaining--;
            }
        };

        updateDisplay();
        this.examTimer = setInterval(updateDisplay, 1000);
    }

    loadQuestion(idx) {
        const questions = this.data.questionBank;
        if (idx < 0 || idx >= questions.length) return;

        // Restriction check: Sequential navigation prevents returning to past questions
        const isSequential = this.currentExam?.restrictions?.navigationMode === 'SEQUENTIAL';
        if (isSequential && idx < this.currentQuestionIdx) {
            this.showToast('Sequential Navigation Restriction: You cannot revisit past questions.', 'warning');
            return;
        }

        this.currentQuestionIdx = idx;
        const q = questions[idx];

        const qNumEl = document.getElementById('currentQuestionNumber');
        const qTotalEl = document.getElementById('totalQuestionsCount');
        const progPercentEl = document.getElementById('examProgressPercent');
        const progBarEl = document.getElementById('examProgressBar');

        if (qNumEl) qNumEl.textContent = idx + 1;
        if (qTotalEl) qTotalEl.textContent = questions.length;

        const percent = Math.round(((idx + 1) / questions.length) * 100);
        if (progPercentEl) progPercentEl.textContent = `${percent}% Complete`;
        if (progBarEl) progBarEl.style.width = `${percent}%`;

        const qTextEl = document.getElementById('liveQuestionText');
        if (qTextEl) qTextEl.textContent = q.text;

        const optionsContainer = document.getElementById('liveOptionsContainer');
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            const letters = ['A', 'B', 'C', 'D'];

            q.options.forEach((optText, optIdx) => {
                const isSelected = this.examAnswers[idx] === optIdx;
                const optCard = document.createElement('div');
                optCard.className = `exam-option-card flex items-start gap-3 p-4 rounded-xl border ${isSelected ? 'selected' : 'bg-white dark:bg-slate-800'}`;
                optCard.innerHTML = `
                    <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}">
                        ${isSelected ? '<i class="fas fa-check text-xs"></i>' : `<span class="text-xs font-semibold">${letters[optIdx]}</span>`}
                    </div>
                    <div class="flex-1 text-sm md:text-base font-medium text-slate-800 dark:text-slate-100">
                        <span class="font-bold mr-1">${letters[optIdx]}.</span> ${optText}
                    </div>
                `;

                optCard.addEventListener('click', () => {
                    this.selectAnswer(idx, optIdx);
                });

                optionsContainer.appendChild(optCard);
            });
        }

        const flagBtn = document.getElementById('btnFlagQuestion');
        if (flagBtn) {
            if (this.examFlags[idx]) {
                flagBtn.classList.add('bg-amber-100', 'text-amber-800', 'border-amber-400');
                flagBtn.innerHTML = '<i class="fas fa-flag text-amber-500 mr-2"></i> Flagged';
            } else {
                flagBtn.classList.remove('bg-amber-100', 'text-amber-800', 'border-amber-400');
                flagBtn.innerHTML = '<i class="far fa-flag mr-2"></i> Flag for Review';
            }
        }

        const prevBtn = document.getElementById('btnPrevQuestion');
        if (prevBtn) {
            if (isSequential) {
                prevBtn.disabled = true;
                prevBtn.classList.add('opacity-40', 'cursor-not-allowed');
                prevBtn.title = "Sequential Restriction: Cannot go back to previous questions.";
            } else {
                prevBtn.disabled = idx === 0;
                prevBtn.classList.toggle('opacity-50', idx === 0);
                prevBtn.classList.remove('opacity-40', 'cursor-not-allowed');
                prevBtn.title = "";
            }
        }

        this.renderQuestionLedger();
    }

    selectAnswer(qIdx, optIdx) {
        this.examAnswers[qIdx] = optIdx;

        const autoSaveBadge = document.getElementById('autoSaveBadge');
        if (autoSaveBadge) {
            autoSaveBadge.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Saving...';
            setTimeout(() => {
                autoSaveBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 pulse-indicator mr-2"></span> Auto-saved';
            }, 300);
        }

        this.loadQuestion(qIdx);
    }

    toggleFlagQuestion() {
        const idx = this.currentQuestionIdx;
        this.examFlags[idx] = !this.examFlags[idx];
        this.loadQuestion(idx);
    }

    renderQuestionLedger() {
        const ledgerGrid = document.getElementById('questionLedgerGrid');
        if (!ledgerGrid) return;

        ledgerGrid.innerHTML = '';
        const total = this.data.questionBank.length;
        const isSequential = this.currentExam?.restrictions?.navigationMode === 'SEQUENTIAL';

        for (let i = 0; i < total; i++) {
            const isAnswered = this.examAnswers[i] !== undefined;
            const isFlagged = !!this.examFlags[i];
            const isActive = i === this.currentQuestionIdx;
            const isLockedPast = isSequential && i < this.currentQuestionIdx;

            const bubble = document.createElement('button');
            bubble.className = `ledger-bubble ${isAnswered ? 'answered' : 'unanswered'} ${isFlagged ? 'flagged' : ''} ${isActive ? 'active-q' : ''} ${isLockedPast ? 'opacity-40 cursor-not-allowed' : ''}`;
            bubble.textContent = i + 1;
            bubble.title = isLockedPast 
                ? `Question ${i + 1} (Locked: Cannot reopen past items in Sequential Mode)`
                : `Question ${i + 1} (${isAnswered ? 'Answered' : 'Unanswered'}${isFlagged ? ', Flagged' : ''})`;

            bubble.addEventListener('click', () => {
                if (isLockedPast) {
                    this.showToast('Sequential Restriction: Answered past questions cannot be modified.', 'warning');
                    return;
                }
                this.loadQuestion(i);
            });

            ledgerGrid.appendChild(bubble);
        }
    }

    promptSubmitExam() {
        const total = this.data.questionBank.length;
        const answeredCount = Object.keys(this.examAnswers).length;
        const unansweredCount = total - answeredCount;

        if (unansweredCount > 0) {
            const countEl = document.getElementById('unansweredQuestionsCount');
            if (countEl) countEl.textContent = unansweredCount;
            const modal = document.getElementById('unfinishedModal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        } else {
            if (confirm('Are you sure you want to finalize and submit your examination?')) {
                this.submitExam();
            }
        }
    }

    closeUnfinishedModal() {
        const modal = document.getElementById('unfinishedModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    submitExam(force = false) {
        this.closeUnfinishedModal();
        clearInterval(this.examTimer);
        this.isExamActive = false;

        let score = 0;
        const questions = this.data.questionBank;
        questions.forEach((q, idx) => {
            if (this.examAnswers[idx] === q.correctIndex) {
                score++;
            }
        });

        const percent = Math.round((score / questions.length) * 100);
        const passed = percent >= (this.currentExam?.passingScore || 60);

        let equivGrade = "5.00 (F)";
        if (percent >= 96) equivGrade = "1.00 (Excellent / A+)";
        else if (percent >= 90) equivGrade = "1.25 (Superior / A)";
        else if (percent >= 84) equivGrade = "1.75 (Very Good / B+)";
        else if (percent >= 75) equivGrade = "2.25 (Good / B)";
        else if (percent >= 60) equivGrade = "3.00 (Passing / C)";

        // Generate student review items for newly taken exam
        const reviewQuestions = questions.map((q, idx) => {
            const studentAns = this.examAnswers[idx] !== undefined ? this.examAnswers[idx] : null;
            const isCorrect = studentAns === q.correctIndex;
            return {
                id: q.id,
                text: q.text,
                topic: q.topic || "Core Concept",
                difficulty: q.difficulty || "Medium",
                options: q.options || [],
                studentAnswer: studentAns,
                correctIndex: q.correctIndex,
                isCorrect: isCorrect,
                explanation: q.explanation || "Review curriculum reference for this question."
            };
        });

        const newRecord = {
            id: `HIST-${Date.now()}`,
            title: this.currentExam?.title || "CS101 - Midterm Examination",
            subjectCode: this.currentExam?.code || "CS-101",
            domain: this.currentExam?.domain || "Computer Science Basics",
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            score: `${score} / ${questions.length}`,
            percentage: percent,
            equivalentGrade: equivGrade,
            status: "GRADED",
            breakdown: [
                { section: "Section 1 (Multiple Choice Questions)", score: `${score} / ${questions.length} correct` }
            ],
            certificateAvailable: passed,
            reviewQuestions: reviewQuestions
        };

        this.data.studentHistory.unshift(newRecord);
        this.showToast(`Exam submitted! Score: ${score}/${questions.length} (${percent}%) - ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'danger');

        this.renderStudentHistory();
        this.showView('view-student', 'student-results');
    }

    // --- STUDENT EXAM QUESTION REVIEW MODAL (WHAT WENT WRONG) ---
    openStudentExamReview(historyId) {
        const history = this.data.studentHistory.find(h => h.id === historyId);
        if (!history || !history.reviewQuestions || history.reviewQuestions.length === 0) {
            this.showToast('No question review available for this submission.', 'info');
            return;
        }

        this.currentReviewHistory = history;
        this.currentReviewFilter = 'all';

        const titleEl = document.getElementById('reviewExamTitle');
        const scoreEl = document.getElementById('reviewExamScore');
        const dateEl = document.getElementById('reviewExamDate');
        const wrongBadge = document.getElementById('reviewWrongBadge');
        const correctBadge = document.getElementById('reviewCorrectBadge');

        const wrongCount = history.reviewQuestions.filter(q => !q.isCorrect).length;
        const correctCount = history.reviewQuestions.filter(q => q.isCorrect).length;

        if (titleEl) titleEl.textContent = `${history.subjectCode} — ${history.title}`;
        if (scoreEl) scoreEl.textContent = `${history.score} (${history.percentage}%)`;
        if (dateEl) dateEl.textContent = history.date;
        if (wrongBadge) wrongBadge.textContent = `${wrongCount} Incorrect`;
        if (correctBadge) correctBadge.textContent = `${correctCount} Correct`;

        this.renderStudentReviewQuestions('all');

        const modal = document.getElementById('studentExamReviewModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    closeStudentExamReview() {
        const modal = document.getElementById('studentExamReviewModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    setReviewFilter(filter) {
        this.currentReviewFilter = filter;
        document.querySelectorAll('.review-filter-btn').forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.className = 'review-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs transition';
            } else {
                btn.className = 'review-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition';
            }
        });
        this.renderStudentReviewQuestions(filter);
    }

    renderStudentReviewQuestions(filter = 'all') {
        const container = document.getElementById('studentReviewQuestionsContainer');
        if (!container || !this.currentReviewHistory) return;

        container.innerHTML = '';
        let list = this.currentReviewHistory.reviewQuestions || [];

        if (filter === 'wrong') {
            list = list.filter(q => !q.isCorrect);
        } else if (filter === 'correct') {
            list = list.filter(q => q.isCorrect);
        }

        if (list.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <i class="fas fa-circle-check text-emerald-500 text-3xl mb-2"></i>
                    <h4 class="font-bold text-slate-800 dark:text-slate-200">No Questions Match This Filter</h4>
                    <p class="text-xs text-slate-500 mt-1">You got 0 questions wrong in this category! Outstanding performance.</p>
                </div>
            `;
            return;
        }

        const optionLetters = ['A', 'B', 'C', 'D'];
        list.forEach((q, idx) => {
            const card = document.createElement('div');
            card.className = `p-5 rounded-2xl border ${q.isCorrect ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10' : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'} space-y-3 transition`;

            let optionsHtml = '';
            if (q.options && q.options.length > 0) {
                optionsHtml = q.options.map((opt, optIdx) => {
                    const isStudentPick = q.studentAnswer === optIdx;
                    const isCorrectAnswer = q.correctIndex === optIdx;

                    let optStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300';
                    let badgeHtml = '';

                    if (isCorrectAnswer) {
                        optStyle = 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
                        badgeHtml = `<span class="ml-auto text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white flex items-center gap-1 whitespace-nowrap"><i class="fas fa-check"></i> Correct Answer</span>`;
                    }
                    if (isStudentPick && !isCorrectAnswer) {
                        optStyle = 'border-rose-300 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-semibold';
                        badgeHtml = `<span class="ml-auto text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-600 text-white flex items-center gap-1 whitespace-nowrap"><i class="fas fa-xmark"></i> Your Answer</span>`;
                    } else if (isStudentPick && isCorrectAnswer) {
                        badgeHtml = `<span class="ml-auto text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white flex items-center gap-1 whitespace-nowrap"><i class="fas fa-check-double"></i> Your Answer (Correct)</span>`;
                    }

                    return `
                        <div class="p-3 rounded-xl border ${optStyle} flex items-center gap-3 text-xs">
                            <span class="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[11px] text-slate-600 dark:text-slate-300 flex-shrink-0">${optionLetters[optIdx]}</span>
                            <span class="flex-1">${opt}</span>
                            ${badgeHtml}
                        </div>
                    `;
                }).join('');
            }

            card.innerHTML = `
                <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${q.id}</span>
                        <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">${q.topic}</span>
                        <span class="text-[11px] text-slate-400 font-medium">Difficulty: ${q.difficulty}</span>
                    </div>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${q.isCorrect ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}">
                        <i class="fas ${q.isCorrect ? 'fa-circle-check text-emerald-600' : 'fa-circle-xmark text-rose-600'}"></i>
                        <span>${q.isCorrect ? 'Correct (+1.0)' : 'Incorrect (0.0)'}</span>
                    </span>
                </div>

                <p class="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed pt-1">
                    ${q.text}
                </p>

                <div class="space-y-2 pt-1">
                    ${optionsHtml}
                </div>

                <div class="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs text-blue-950 dark:text-blue-200">
                    <div class="font-bold flex items-center gap-1.5 mb-1 text-blue-800 dark:text-blue-300">
                        <i class="fas fa-lightbulb text-amber-500"></i>
                        <span>Pedagogical Explanation & Concept Solution:</span>
                    </div>
                    <p class="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">${q.explanation}</p>
                </div>
            `;

            container.appendChild(card);
        });
    }

    // --- CERTIFICATE MODAL ---
    viewCertificate(examTitle, scorePercent) {
        const modal = document.getElementById('certificateModal');
        const certName = document.getElementById('certStudentName');
        const certCourse = document.getElementById('certCourseName');
        const certScore = document.getElementById('certScoreBadge');
        const certDate = document.getElementById('certDate');

        if (certName) certName.textContent = this.data.demoAccounts.student.name;
        if (certCourse) certCourse.textContent = examTitle;
        if (certScore) certScore.textContent = `${scorePercent}% Verified Grade`;
        if (certDate) certDate.textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    closeCertificateModal() {
        const modal = document.getElementById('certificateModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    // --- EDUCATIONAL GUIDE: HOW THE EXAM LEADER SYSTEM WORKS ---
    openExamLeaderGuideModal() {
        const modal = document.getElementById('examLeaderGuideModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    closeExamLeaderGuideModal() {
        const modal = document.getElementById('examLeaderGuideModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    // --- PROFESSOR: CONVERT & FINALIZE GRADES ---
    convertStudentGrade(studentId) {
        const student = this.data.teacherResults.find(r => r.studentId === studentId);
        if (!student) return;

        let letter = "1.00 (A+)";
        if (student.percentage < 60) letter = "5.00 (F)";
        else if (student.percentage < 70) letter = "3.00 (C)";
        else if (student.percentage < 80) letter = "2.25 (B)";
        else if (student.percentage < 90) letter = "1.75 (B+)";

        student.grade = letter;
        student.gradeStatus = "FINALIZED";

        this.renderTeacherResults();
        this.logAuditEvent(this.data.demoAccounts.teacher.name, 'CONVERT_GRADE', 'Grades', `Converted and finalized grade for ${student.name} (${student.studentId}) to ${letter}`);
        this.showToast(`Grade for ${student.name} finalized to ${letter}!`, 'success');
    }

    // --- PROFESSOR: CSV EXPORT ---
    exportResultsCSV() {
        const rows = [
            ["Student ID", "Student Name", "Section", "Raw Score", "Percentage", "Official Converted Grade", "Status", "Date Taken"]
        ];

        this.data.teacherResults.forEach(r => {
            rows.push([r.studentId, r.name, r.section || "Section A", r.rawScore, `${r.percentage}%`, r.grade, r.status, r.date]);
        });

        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `VeriTest_Grades_CS101_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast('Grade sheet exported to CSV successfully.', 'success');
    }

    // --- ADMIN: MANAGE FACULTY & APPOINT EXAM LEADER ---
    openAssignProfessorModal(subjectCode) {
        const subject = this.data.subjects.find(s => s.code === subjectCode);
        if (!subject) return;

        const codeSpan = document.getElementById('assignSubjectCode');
        const nameSpan = document.getElementById('assignSubjectName');
        const checkboxesContainer = document.getElementById('facultyCheckboxesContainer');
        const leaderSelect = document.getElementById('assignProfLeaderSelect');

        if (codeSpan) codeSpan.textContent = subject.code;
        if (nameSpan) nameSpan.textContent = subject.name;

        // Render faculty checkboxes
        if (checkboxesContainer) {
            checkboxesContainer.innerHTML = '';
            const assignedIds = (subject.professors || []).map(p => p.id);

            this.data.faculty.filter(f => f.status === 'ACTIVE').forEach(fac => {
                const isChecked = assignedIds.includes(fac.id);
                const item = document.createElement('label');
                item.className = 'flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition';
                item.innerHTML = `
                    <input type="checkbox" value="${fac.id}" class="fac-assign-checkbox w-4 h-4 rounded text-blue-600 focus:ring-blue-500" ${isChecked ? 'checked' : ''}>
                    <div class="flex-1 text-xs">
                        <span class="font-bold text-slate-800 dark:text-slate-200">${fac.name}</span>
                        <span class="text-slate-400"> (${fac.dept})</span>
                    </div>
                `;

                item.querySelector('input').addEventListener('change', () => {
                    this.updateExamLeaderDropdown(subjectCode);
                });

                checkboxesContainer.appendChild(item);
            });
        }

        this.updateExamLeaderDropdown(subjectCode);

        const modal = document.getElementById('assignProfModal');
        if (modal) {
            modal.dataset.subjectCode = subjectCode;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    updateExamLeaderDropdown(subjectCode) {
        const leaderSelect = document.getElementById('assignProfLeaderSelect');
        if (!leaderSelect) return;

        const subject = this.data.subjects.find(s => s.code === subjectCode);
        const currentLeaderId = subject?.examLeaderId;

        // Get currently checked faculty checkboxes
        const checkedBoxes = document.querySelectorAll('.fac-assign-checkbox:checked');
        leaderSelect.innerHTML = '';

        if (checkedBoxes.length === 0) {
            leaderSelect.innerHTML = '<option value="">— No Professors Selected —</option>';
            leaderSelect.disabled = true;
            return;
        }

        leaderSelect.disabled = false;
        checkedBoxes.forEach(cb => {
            const fac = this.data.faculty.find(f => f.id === cb.value);
            if (fac) {
                const opt = document.createElement('option');
                opt.value = fac.id;
                opt.textContent = `⭐ ${fac.name} (${fac.dept})`;
                if (fac.id === currentLeaderId) opt.selected = true;
                leaderSelect.appendChild(opt);
            }
        });
    }

    saveSubjectAssignment() {
        const modal = document.getElementById('assignProfModal');
        const subjectCode = modal?.dataset.subjectCode;
        const leaderSelect = document.getElementById('assignProfLeaderSelect');
        const chosenLeaderId = leaderSelect?.value;

        const subject = this.data.subjects.find(s => s.code === subjectCode);
        if (!subject) return;

        const checkedBoxes = document.querySelectorAll('.fac-assign-checkbox:checked');
        const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);

        if (selectedIds.length === 0) {
            subject.professors = [];
            subject.examLeaderId = null;
            subject.examLeaderName = "— Unassigned —";
            subject.distributionStatus = "UNASSIGNED";
            this.logAuditEvent(this.data.demoAccounts.admin.name, 'UNASSIGN_SUBJECT', 'Curriculum', `Unassigned all professors from ${subject.code}`);
            this.showToast(`Subject ${subject.code} unassigned.`, 'info');
        } else {
            const finalLeaderId = chosenLeaderId || selectedIds[0];
            const leaderFac = this.data.faculty.find(f => f.id === finalLeaderId);

            const letters = ['A', 'B', 'C', 'D', 'E'];
            subject.professors = selectedIds.map((id, idx) => {
                const f = this.data.faculty.find(fac => fac.id === id);
                return {
                    id: f.id,
                    name: f.name,
                    role: f.id === finalLeaderId ? "EXAM_LEADER" : "CO_PROFESSOR",
                    section: `Section ${letters[idx] || (idx + 1)}`
                };
            });

            subject.examLeaderId = finalLeaderId;
            subject.examLeaderName = leaderFac ? leaderFac.name : "Assigned Leader";
            subject.distributionStatus = subject.professors.length > 1 ? "DISTRIBUTED_TO_ALL" : "SOLO_COURSE";

            const facultyNames = subject.professors.map(p => p.name).join(', ');
            this.logAuditEvent(
                this.data.demoAccounts.admin.name,
                'APPOINT_EXAM_LEADER',
                'Curriculum',
                `Appointed ${subject.examLeaderName} as EXAM LEADER for ${subject.code}. Assigned faculty: ${facultyNames}`
            );
            this.showToast(`Appointed ${subject.examLeaderName} as Exam Leader for ${subject.code}!`, 'success');
        }

        this.closeAssignProfModal();
        this.renderAdminSubjects();
        this.renderTeacherSubjects();
    }

    closeAssignProfModal() {
        const modal = document.getElementById('assignProfModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    // --- PROFESSOR: CO-PROFESSOR DEPLOYMENT ACTION ---
    deployDistributedExam(subjectCode, section) {
        const subject = this.data.subjects.find(s => s.code === subjectCode);
        if (!subject) return;

        this.logAuditEvent(
            this.data.demoAccounts.teacher.name,
            'DEPLOY_MASTER_EXAM',
            'Exams',
            `Prof. Maria Santos adopted and synchronized Master Exam for ${subject.code} into ${section}`
        );

        this.showToast(`✅ Standardized Master Exam for ${subject.code} deployed to ${section}!`, 'success');
        this.renderTeacherSubjects();
    }

    // --- RENDERING VIEWS & TABLES ---
    renderAllViews() {
        this.initPolicies();
        this.renderAdminDashboardStats();
        this.renderAdminFaculty();
        this.renderAdminSubjects();
        this.renderAdminAuditLogs();
        this.renderAdminCohorts();
        this.renderAdminMasterGrades();
        this.renderTeacherSubjects();
        this.renderTeacherQuestionBank();
        this.renderTeacherResults();
        this.renderTeacherTopicAnalytics('CS-101');
        this.renderStudentExams();
        this.renderStudentHistory();
    }

    // --- ADMIN PORTAL: STATS, COHORTS, GRADES & GOVERNANCE ---
    initPolicies() {
        if (!this.data.systemPolicies) return;
        const p = this.data.systemPolicies;
        this.maxTabSwitches = p.tabSwitchLimit || 3;

        const termInput = document.getElementById('policyAcademicTerm');
        const attemptsInput = document.getElementById('policyMaxAttempts');
        const heartbeatInput = document.getElementById('policyHeartbeat');
        const tabLimitInput = document.getElementById('policyTabLimit');
        const autoSubmitInput = document.getElementById('policyAutoSubmit');

        if (termInput) termInput.value = p.academicTerm || 'AY 2026–2027 • 1st Semester';
        if (attemptsInput) attemptsInput.value = p.maxAttemptsDefault || 1;
        if (heartbeatInput) heartbeatInput.value = p.heartbeatSeconds || 15;
        if (tabLimitInput) tabLimitInput.value = p.tabSwitchLimit || 3;
        if (autoSubmitInput) autoSubmitInput.checked = p.autoSubmitOnViolation !== false;
    }

    renderAdminDashboardStats() {
        const profsEl = document.getElementById('adminStatProfs');
        const subjectsEl = document.getElementById('adminStatSubjects');
        const examsEl = document.getElementById('adminStatExams');
        const logsEl = document.getElementById('adminStatLogs');
        const termBadgeEl = document.getElementById('adminAcademicTermBadge');

        const activeProfs = this.data.faculty ? this.data.faculty.filter(f => f.status === 'ACTIVE').length : 0;
        const activeSubjects = this.data.subjects ? this.data.subjects.filter(s => s.status === 'ACTIVE').length : 0;
        const activeExams = this.data.exams ? this.data.exams.filter(e => e.status === 'AVAILABLE' || e.status === 'UPCOMING').length : 0;
        const totalLogs = this.data.auditLogs ? this.data.auditLogs.length : 0;

        if (profsEl) profsEl.textContent = activeProfs;
        if (subjectsEl) subjectsEl.textContent = activeSubjects;
        if (examsEl) examsEl.textContent = activeExams;
        if (logsEl) logsEl.textContent = totalLogs;

        if (termBadgeEl && this.data.systemPolicies?.academicTerm) {
            termBadgeEl.textContent = this.data.systemPolicies.academicTerm;
        }

        // Live Activity & Proctor Feed on #admin-dashboard (Top 4 recent audit events)
        const feedContainer = document.getElementById('adminDashboardRecentFeed');
        if (feedContainer && this.data.auditLogs) {
            feedContainer.innerHTML = '';
            const recent = this.data.auditLogs.slice(0, 4);
            recent.forEach(log => {
                const item = document.createElement('div');
                item.className = 'py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition hover:bg-slate-50/60 dark:hover:bg-slate-800/30 px-2 rounded-xl';

                let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                if (log.action.includes('ALERT') || log.action.includes('VIOLATION')) {
                    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
                } else if (log.action.includes('ASSIGN') || log.action.includes('ENROLL')) {
                    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
                } else if (log.action.includes('POLICY')) {
                    badgeColor = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
                } else if (log.action.includes('GRADE') || log.action.includes('CONVERT')) {
                    badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
                }

                item.innerHTML = `
                    <div class="flex items-start sm:items-center gap-3">
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${badgeColor}">
                            ${log.action}
                        </span>
                        <div>
                            <div class="text-xs font-semibold text-slate-900 dark:text-slate-100">${log.details}</div>
                            <div class="text-[11px] text-slate-400 mt-0.5">By <span class="font-medium text-slate-600 dark:text-slate-300">${log.user}</span> • Module: ${log.module}</div>
                        </div>
                    </div>
                    <span class="text-[11px] font-mono text-slate-400 whitespace-nowrap self-end sm:self-center">${log.timestamp}</span>
                `;
                feedContainer.appendChild(item);
            });
        }
    }

    renderAdminCohorts(searchQuery = '') {
        const tbody = document.getElementById('adminCohortsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const q = (searchQuery || '').toLowerCase().trim();
        const students = (this.data.students || []).filter(s => {
            if (!q) return true;
            return (
                s.name.toLowerCase().includes(q) ||
                s.id.toLowerCase().includes(q) ||
                s.section.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q) ||
                (s.enrolledSubjects && s.enrolledSubjects.some(sub => sub.toLowerCase().includes(q)))
            );
        });

        if (students.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="py-8 text-center text-xs text-slate-400">
                        No students found matching "${searchQuery}".
                    </td>
                </tr>
            `;
            return;
        }

        students.forEach(s => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors';

            const subjectTags = (s.enrolledSubjects || []).map(code => 
                `<span class="inline-block px-2 py-0.5 mr-1 mb-1 rounded text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">${code}</span>`
            ).join('') || '<span class="text-slate-400 text-xs">— None —</span>';

            tr.innerHTML = `
                <td class="py-3 px-4 text-xs font-mono font-semibold text-slate-500">${s.id}</td>
                <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">${s.name}</td>
                <td class="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">${s.email}</td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">${s.section}</span>
                </td>
                <td class="py-3 px-4 max-w-xs">${subjectTags}</td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-1 text-xs font-bold rounded-full ${s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}">
                        ${s.status}
                    </span>
                </td>
                <td class="py-3 px-4 text-right space-x-2">
                    <button class="px-3 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-lg font-semibold border border-purple-200 dark:border-purple-800" onclick="app.openEnrollCohortModal('${s.id}')">
                        <i class="fas fa-plus mr-1"></i> Enroll Subject
                    </button>
                    <button class="px-3 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700" onclick="app.toggleStudentStatus('${s.id}')">
                        ${s.status === 'ACTIVE' ? 'Archive' : 'Restore'}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    filterAdminCohorts(query) {
        this.renderAdminCohorts(query);
    }

    toggleStudentStatus(id) {
        const s = (this.data.students || []).find(stu => stu.id === id);
        if (s) {
            s.status = s.status === 'ACTIVE' ? 'ARCHIVE' : 'ACTIVE';
            this.renderAdminCohorts();
            this.logAuditEvent(this.data.demoAccounts.admin.name, 'UPDATE_STUDENT', 'Cohorts', `Updated ${s.name} (${s.id}) status to ${s.status}`);
            this.showToast(`Student ${s.name} status updated to ${s.status}.`, 'info');
        }
    }

    openEnrollCohortModal(studentId = null) {
        const modal = document.getElementById('enrollCohortModal');
        const select = document.getElementById('enrollSubjectSelect');
        const nameInput = document.getElementById('enrollStudentName');
        const idInput = document.getElementById('enrollStudentID');
        const emailInput = document.getElementById('enrollStudentEmail');
        const sectionInput = document.getElementById('enrollStudentSection');

        if (select) {
            select.innerHTML = '';
            (this.data.subjects || []).forEach(sub => {
                const opt = document.createElement('option');
                opt.value = sub.code;
                opt.textContent = `${sub.code} - ${sub.name} (${sub.enrolled} enrolled)`;
                select.appendChild(opt);
            });
        }

        if (studentId) {
            const student = (this.data.students || []).find(s => s.id === studentId);
            if (student) {
                if (nameInput) nameInput.value = student.name;
                if (idInput) {
                    idInput.value = student.id;
                    idInput.readOnly = true;
                }
                if (emailInput) emailInput.value = student.email;
                if (sectionInput) sectionInput.value = student.section;
            }
        } else {
            if (nameInput) nameInput.value = '';
            if (idInput) {
                idInput.value = `STU-2024-${Math.floor(1000 + Math.random() * 9000)}`;
                idInput.readOnly = false;
            }
            if (emailInput) emailInput.value = '';
            if (sectionInput) sectionInput.value = '3BSCS-1';
        }

        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    closeEnrollCohortModal() {
        const modal = document.getElementById('enrollCohortModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    saveEnrollCohort() {
        const name = document.getElementById('enrollStudentName')?.value.trim();
        const id = document.getElementById('enrollStudentID')?.value.trim();
        const section = document.getElementById('enrollStudentSection')?.value.trim();
        const email = document.getElementById('enrollStudentEmail')?.value.trim();
        const subjectCode = document.getElementById('enrollSubjectSelect')?.value;

        if (!name || !id || !section || !email || !subjectCode) {
            this.showToast('Please fill out all enrollment fields.', 'danger');
            return;
        }

        if (!this.data.students) this.data.students = [];

        let student = this.data.students.find(s => s.id === id);
        if (student) {
            if (!student.enrolledSubjects) student.enrolledSubjects = [];
            if (!student.enrolledSubjects.includes(subjectCode)) {
                student.enrolledSubjects.push(subjectCode);
            }
            student.name = name;
            student.section = section;
            student.email = email;
        } else {
            student = {
                id: id,
                name: name,
                email: email,
                section: section,
                enrolledSubjects: [subjectCode],
                status: "ACTIVE"
            };
            this.data.students.unshift(student);
        }

        // Connects to this.data.subjects[i].enrolled
        const subject = (this.data.subjects || []).find(s => s.code === subjectCode);
        if (subject) {
            subject.enrolled = (subject.enrolled || 0) + 1;
        }

        this.logAuditEvent(
            this.data.demoAccounts.admin.name,
            'ENROLL_COHORT',
            'Cohorts',
            `Enrolled ${name} (${id}) from section ${section} into ${subjectCode}`
        );

        this.closeEnrollCohortModal();
        this.renderAdminCohorts();
        this.renderAdminSubjects();
        this.renderAdminDashboardStats();
        this.showToast(`Enrolled ${name} into ${subjectCode}! Roster updated.`, 'success');
    }

    renderAdminMasterGrades(searchQuery = '') {
        const tbody = document.getElementById('adminMasterGradesTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const q = (searchQuery || '').toLowerCase().trim();
        const results = (this.data.teacherResults || []).filter(r => {
            if (!q) return true;
            return r.name.toLowerCase().includes(q) || r.studentId.toLowerCase().includes(q);
        });

        if (results.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="py-8 text-center text-xs text-slate-400">
                        No examination records found matching "${searchQuery}".
                    </td>
                </tr>
            `;
            return;
        }

        results.forEach(r => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors text-xs';
            tr.innerHTML = `
                <td class="py-3 px-4 font-mono font-semibold text-slate-500">${r.studentId}</td>
                <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">${r.name}</td>
                <td class="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">CS-101 Midterm</td>
                <td class="py-3 px-4 text-center font-medium">${r.rawScore}</td>
                <td class="py-3 px-4 text-center font-bold">${r.percentage}%</td>
                <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">${r.grade}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded font-bold ${r.status === 'PASSED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'}">
                        ${r.status}
                    </span>
                </td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${r.gradeStatus === 'FINALIZED' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'}">
                        ${r.gradeStatus}
                    </span>
                </td>
                <td class="py-3 px-4 text-slate-500">${r.date}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    filterAdminMasterGrades(query) {
        this.renderAdminMasterGrades(query);
    }

    exportMasterGradesCSV() {
        const rows = [
            ["Student ID", "Student Name", "Exam / Subject", "Raw Score", "Percentage", "Institutional Grade", "Exam Status", "Review State", "Date Recorded"]
        ];

        (this.data.teacherResults || []).forEach(r => {
            rows.push([r.studentId, `"${r.name}"`, "CS-101 Midterm", r.rawScore, `${r.percentage}%`, `"${r.grade}"`, r.status, r.gradeStatus, r.date]);
        });

        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `VeriTest_Master_Institutional_Gradebook_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.logAuditEvent(this.data.demoAccounts.admin.name, 'EXPORT_MASTER_GRADES', 'Gradebook', `Exported master institutional gradebook CSV (${(this.data.teacherResults || []).length} records)`);
        this.showToast('Master gradebook exported to CSV successfully.', 'success');
    }

    exportTeacherResultsCSV() {
        return this.exportMasterGradesCSV();
    }

    saveSystemPolicies() {
        const termInput = document.getElementById('policyAcademicTerm');
        const attemptsInput = document.getElementById('policyMaxAttempts');
        const heartbeatInput = document.getElementById('policyHeartbeat');
        const tabLimitInput = document.getElementById('policyTabLimit');
        const autoSubmitInput = document.getElementById('policyAutoSubmit');

        const academicTerm = termInput ? termInput.value.trim() : (this.data.systemPolicies?.academicTerm || 'AY 2026–2027 • 1st Semester');
        const maxAttemptsDefault = attemptsInput ? parseInt(attemptsInput.value) || 1 : 1;
        const heartbeatSeconds = heartbeatInput ? parseInt(heartbeatInput.value) || 15 : 15;
        const tabSwitchLimit = tabLimitInput ? parseInt(tabLimitInput.value) || 3 : 3;
        const autoSubmitOnViolation = autoSubmitInput ? autoSubmitInput.checked : true;

        this.data.systemPolicies = {
            academicTerm,
            maxAttemptsDefault,
            heartbeatSeconds,
            tabSwitchLimit,
            autoSubmitOnViolation
        };

        // Ties into this.tabSwitchCount and this.maxTabSwitches in app.js
        this.maxTabSwitches = tabSwitchLimit;

        this.logAuditEvent(
            this.data.demoAccounts.admin.name,
            'UPDATE_POLICY',
            'Governance',
            `Saved institutional governance: Term '${academicTerm}', Tab Strike Limit ${tabSwitchLimit}, Heartbeat ${heartbeatSeconds}s, Auto-Submit ${autoSubmitOnViolation}`
        );

        this.renderAdminDashboardStats();
        this.showToast('Institutional governance policies saved successfully.', 'success');
    }

    // 1. Admin Faculty Table
    renderAdminFaculty() {
        const tbody = document.getElementById('adminFacultyTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.data.faculty.forEach(f => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors';
            tr.innerHTML = `
                <td class="py-3 px-4 text-xs font-mono font-semibold text-slate-500">${f.id}</td>
                <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">${f.name}</td>
                <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">${f.email}</td>
                <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">${f.dept}</td>
                <td class="py-3 px-4 text-center text-sm font-semibold">${(f.subjects || []).length}</td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-1 text-xs font-bold rounded-full ${f.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}">
                        ${f.status}
                    </span>
                </td>
                <td class="py-3 px-4 text-right space-x-2">
                    <button class="px-3 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700" onclick="app.showToast('Editing ${f.name}', 'info')">Edit</button>
                    <button class="px-3 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-lg font-medium hover:bg-red-50 text-red-600 dark:hover:bg-red-950/40" onclick="app.archiveFaculty('${f.id}')">${f.status === 'ACTIVE' ? 'Archive' : 'Restore'}</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 2. Admin Subject Directory Table (With Exam Leader Badging!)
    renderAdminSubjects() {
        const tbody = document.getElementById('adminSubjectsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.data.subjects.forEach(s => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors';

            const profList = s.professors || [];
            let facultyHtml = '';

            if (profList.length === 0) {
                facultyHtml = '<span class="text-slate-400 text-xs italic">— Unassigned —</span>';
            } else {
                const tags = profList.map(p => {
                    if (p.role === 'EXAM_LEADER') {
                        return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300" title="Designated Exam Leader (Master Maker)">
                            <i class="fas fa-crown text-[10px] text-amber-500"></i> ${p.name} <span class="text-[9px] uppercase tracking-wider font-extrabold opacity-75">(Leader)</span>
                        </span>`;
                    } else {
                        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300" title="Teaching Faculty / Co-Professor">
                            <i class="fas fa-user-group text-[9px] text-slate-400"></i> ${p.name}
                        </span>`;
                    }
                });
                facultyHtml = `<div class="flex flex-wrap items-center gap-1.5">${tags.join('')}</div>`;
            }

            tr.innerHTML = `
                <td class="py-3 px-4 text-xs font-mono font-bold text-blue-600 dark:text-blue-400">${s.code}</td>
                <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">${s.name}</td>
                <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">${s.domain}</td>
                <td class="py-3 px-4 max-w-xs">
                    ${facultyHtml}
                </td>
                <td class="py-3 px-4 text-center text-sm font-semibold">${s.enrolled}</td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-1 text-xs font-bold rounded-full ${s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}">
                        ${s.status}
                    </span>
                </td>
                <td class="py-3 px-4 text-right space-x-2">
                    <button class="px-3 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-lg font-semibold border border-blue-200 dark:border-blue-800" onclick="app.openAssignProfessorModal('${s.code}')">
                        <i class="fas fa-crown text-amber-500 mr-1"></i> Manage Faculty & Leader
                    </button>
                    <button class="px-3 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700" onclick="app.archiveSubject('${s.code}')">${s.status === 'ACTIVE' ? 'Archive' : 'Restore'}</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    archiveSubject(code) {
        const s = this.data.subjects.find(sub => sub.code === code);
        if (s) {
            s.status = s.status === 'ACTIVE' ? 'ARCHIVE' : 'ACTIVE';
            this.renderAdminSubjects();
            this.logAuditEvent(this.data.demoAccounts.admin.name, 'ARCHIVE_SUBJECT', 'Curriculum', `${s.status === 'ARCHIVE' ? 'Archived' : 'Restored'} subject ${code}`);
            this.showToast(`Subject ${code} status updated to ${s.status}.`, 'info');
        }
    }

    // 3. Admin Security Audit Log
    renderAdminAuditLogs() {
        const tbody = document.getElementById('adminAuditTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.data.auditLogs.forEach(log => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-200 dark:border-slate-800 text-xs font-mono';
            tr.innerHTML = `
                <td class="py-3 px-4 text-slate-500 whitespace-nowrap">${log.timestamp}</td>
                <td class="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 font-sans">${log.user}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded font-bold ${log.action.includes('LEADER') ? 'bg-amber-50 text-amber-800 border border-amber-300' : log.action.includes('ALERT') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300'}">
                        ${log.action}
                    </span>
                </td>
                <td class="py-3 px-4 font-sans text-slate-600 dark:text-slate-400">${log.module}</td>
                <td class="py-3 px-4 font-sans text-slate-700 dark:text-slate-300">${log.details}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 4. Professor Handled Subjects (Distinguishing Exam Leader vs Co-Professor roles!)
    renderTeacherSubjects() {
        const tbody = document.getElementById('teacherSubjectsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const currentProfId = this.data.demoAccounts.teacher.id; // FAC-124 (Prof. Maria Santos)

        // Find all subjects where Prof. Maria Santos is assigned
        const teacherCourses = this.data.subjects.filter(s => {
            return (s.professors || []).some(p => p.id === currentProfId);
        });

        teacherCourses.forEach(c => {
            const myRoleObj = c.professors.find(p => p.id === currentProfId);
            const isLeader = myRoleObj?.role === 'EXAM_LEADER';
            const totalProfs = c.professors.length;

            let roleBadgeHtml = '';
            let actionHtml = '';

            if (isLeader) {
                roleBadgeHtml = `
                    <div class="space-y-1">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300">
                            <i class="fas fa-crown text-amber-500"></i> Appointed Exam Leader (Maker)
                        </span>
                        <p class="text-[11px] text-slate-500">Responsible for authoring the standardized exam for all ${totalProfs} section(s)</p>
                    </div>
                `;
                actionHtml = `
                    <button class="px-3.5 py-1.5 text-xs bg-slate-900 text-white dark:bg-blue-600 rounded-lg font-bold hover:bg-blue-600 shadow-sm transition flex items-center gap-1.5" onclick="app.prepareCreateExamFor('${c.code}', '${c.name}', true)">
                        <i class="fas fa-plus"></i> Author Master Exam
                    </button>
                    <button class="px-3 py-1.5 text-xs bg-amber-50 text-amber-800 border border-amber-300 rounded-lg font-semibold hover:bg-amber-100" onclick="app.showToast('Master Exam distributed to ${totalProfs} faculty members across cohorts.', 'info')">
                        <i class="fas fa-share-nodes mr-1"></i> Distribution Info
                    </button>
                `;
            } else {
                roleBadgeHtml = `
                    <div class="space-y-1">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
                            <i class="fas fa-user-group text-slate-400"></i> Teaching Faculty (${myRoleObj?.section || 'My Section'})
                        </span>
                        <p class="text-[11px] text-slate-500">Exam Leader: <strong class="text-slate-700 dark:text-slate-300">${c.examLeaderName}</strong></p>
                    </div>
                `;
                actionHtml = `
                    <button class="px-3.5 py-1.5 text-xs bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 shadow-sm transition flex items-center gap-1.5" onclick="app.deployDistributedExam('${c.code}', '${myRoleObj?.section || 'Section B'}')">
                        <i class="fas fa-cloud-arrow-down"></i> Sync / Deploy Master Exam
                    </button>
                    <button class="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-100" onclick="app.showToast('Inspecting standardized exam authored by ${c.examLeaderName}', 'info')">
                        <i class="far fa-eye mr-1"></i> Review Master Exam
                    </button>
                `;
            }

            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40';
            tr.innerHTML = `
                <td class="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">${c.code}</td>
                <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">${c.name}</td>
                <td class="py-3 px-4">
                    ${roleBadgeHtml}
                </td>
                <td class="py-3 px-4 text-sm font-semibold">${c.enrolled} students</td>
                <td class="py-3 px-4 text-right space-x-2">
                    ${actionHtml}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    prepareCreateExamFor(code, name, isMaster = false) {
        this.showSubview('teacher-create-exam');
        const titleInput = document.getElementById('examTitleInput');
        const select = document.getElementById('examSubjectSelect');
        const masterNotice = document.getElementById('masterExamNotice');

        if (titleInput) titleInput.value = `${code} - Standardized Final Examination 2025`;
        if (select) {
            select.value = `${code} - ${name}`;
        }
        if (masterNotice) {
            masterNotice.classList.toggle('hidden', !isMaster);
        }
    }

    // 5. Professor Question Bank
    renderTeacherQuestionBank() {
        const tbody = document.getElementById('teacherQuestionsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.data.questionBank.slice(0, 10).forEach(q => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40';
            tr.innerHTML = `
                <td class="py-3 px-4 font-mono text-xs text-slate-500">${q.id}</td>
                <td class="py-3 px-4 text-sm font-medium text-slate-900 dark:text-slate-100 max-w-md truncate" title="${q.text}">${q.text}</td>
                <td class="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">${q.type}</td>
                <td class="py-3 px-4 text-xs font-mono font-semibold">${q.subject}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 text-xs font-bold rounded ${q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700' : q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}">
                        ${q.difficulty}
                    </span>
                </td>
                <td class="py-3 px-4 text-right space-x-2">
                    <button class="px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-700">Edit</button>
                    <button class="px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 text-red-600 rounded hover:bg-red-50">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 6. Professor Examination Results & Instant Grade Conversion!
    renderTeacherResults() {
        const tbody = document.getElementById('teacherResultsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.data.teacherResults.forEach(r => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40';
            const isFinalized = r.gradeStatus === "FINALIZED";

            tr.innerHTML = `
                <td class="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">${r.studentId}</td>
                <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    <div>${r.name}</div>
                    <div class="text-[10px] text-slate-400 font-mono">${r.section || 'Section A'}</div>
                </td>
                <td class="py-3 px-4 text-sm font-semibold whitespace-nowrap">${r.rawScore}</td>
                <td class="py-3 px-4 text-sm font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">${r.percentage}%</td>
                <td class="py-3 px-4 whitespace-nowrap">
                    <div class="flex items-center gap-1.5 whitespace-nowrap">
                        <span class="font-bold text-xs ${isFinalized ? 'text-slate-900 dark:text-slate-100' : 'text-amber-600'}">${r.grade}</span>
                        ${isFinalized ? '<i class="fas fa-check-circle text-emerald-500 text-xs" title="Finalized to Transcript"></i>' : ''}
                    </div>
                </td>
                <td class="py-3 px-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full whitespace-nowrap ${r.status === 'PASSED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400'}">
                        ${r.status}
                    </span>
                </td>
                <td class="py-3 px-4 text-right whitespace-nowrap">
                    ${isFinalized 
                        ? `<span class="text-xs text-slate-400 font-medium">Grade Posted</span>`
                        : `<button onclick="app.convertStudentGrade('${r.studentId}')" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition whitespace-nowrap">
                            <i class="fas fa-graduation-cap mr-1"></i> Convert to Grade
                           </button>`
                    }
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 7. Student Registered Assessments by Subject
    renderStudentExams() {
        const container = document.getElementById('studentExamsContainer');
        if (!container) return;

        container.innerHTML = '';
        this.data.exams.forEach(exam => {
            const card = document.createElement('div');
            card.className = 'p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all';

            let actionHtml = '';
            let badgeHtml = '';
            let restrictionPills = '';

            const res = exam.restrictions;
            if (res) {
                if (res.requiresAccessCode) {
                    restrictionPills += `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1"><i class="fas fa-key text-[9px]"></i> Passcode Restricted</span>`;
                }
                if (res.navigationMode === 'SEQUENTIAL') {
                    restrictionPills += `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center gap-1"><i class="fas fa-arrow-right text-[9px]"></i> Sequential Mode</span>`;
                }
                if (res.maxAttempts) {
                    restrictionPills += `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1"><i class="fas fa-lock text-[9px]"></i> ${res.maxAttempts} Attempt Max</span>`;
                }
            }

            if (exam.status === 'AVAILABLE') {
                badgeHtml = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">Available Now</span>';
                if (res && res.requiresAccessCode) {
                    actionHtml = `<button class="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-colors shadow-sm flex items-center gap-2" onclick="app.promptExamAccessCode('${exam.code}')"><i class="fas fa-lock"></i> Enter Code & Start</button>`;
                } else {
                    actionHtml = `<button class="px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm" onclick="app.startExamInstruction('${exam.code}')">Start Exam</button>`;
                }
            } else if (exam.status === 'RESTRICTED') {
                badgeHtml = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1"><i class="fas fa-lock text-[10px]"></i> Restricted Access</span>';
                actionHtml = `
                    <div class="flex flex-col items-end gap-1">
                        <button class="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-semibold text-xs cursor-not-allowed flex items-center gap-1.5" onclick="app.showToast('${exam.restrictionReason || 'Prerequisite conditions not met.'}', 'danger')">
                            <i class="fas fa-lock"></i> Locked (Prerequisite)
                        </button>
                        <span class="text-[10px] text-rose-500 font-medium">${exam.restrictionReason || 'Prerequisite unmet'}</span>
                    </div>
                `;
            } else if (exam.status === 'UPCOMING') {
                badgeHtml = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300">Upcoming</span>';
                actionHtml = `
                    <div class="flex flex-col items-end gap-1">
                        <button class="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 font-semibold text-sm cursor-not-allowed" disabled>Start Exam</button>
                        <span class="text-xs text-slate-500">Available in 2 hours</span>
                    </div>
                `;
            } else {
                badgeHtml = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Completed</span>';
                actionHtml = `<button class="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 font-medium text-sm cursor-not-allowed" disabled>Attempt Saved</button>`;
            }

            card.innerHTML = `
                <div class="space-y-1.5">
                    <div class="flex items-center gap-2.5 flex-wrap">
                        <span class="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">${exam.code}</span>
                        <h4 class="text-lg font-bold text-slate-900 dark:text-slate-100">${exam.title}</h4>
                        ${badgeHtml}
                        ${exam.isMasterExam ? `<span class="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded" title="Standardized by Exam Leader"><i class="fas fa-crown text-[9px] text-amber-500"></i> Standardized</span>` : ''}
                        ${restrictionPills}
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400 space-x-2">
                        <span>Exam Leader: <strong>${exam.examLeaderName || exam.professor}</strong></span>
                        <span>•</span>
                        <span>Duration: <strong>${exam.durationMins} minutes</strong></span>
                        <span>•</span>
                        <span>Total Items: <strong>${exam.totalItems} Questions</strong></span>
                    </div>
                    <div class="text-xs text-slate-400">
                        ${exam.status === 'AVAILABLE' ? `<span class="text-emerald-600 dark:text-emerald-400 font-medium"><i class="far fa-clock mr-1"></i> Deadline: ${exam.deadline}</span>` : (exam.status === 'RESTRICTED' ? `<span class="text-rose-600 font-medium"><i class="fas fa-circle-exclamation mr-1"></i> ${exam.restrictionReason}</span>` : `<span class="text-amber-600 dark:text-amber-400"><i class="far fa-calendar-clock mr-1"></i> ${exam.scheduledTime}</span>`)}
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    ${actionHtml}
                </div>
            `;

            container.appendChild(card);
        });
    }

    // 8. Student History & Accordion Breakdown
    renderStudentHistory() {
        const tbody = document.getElementById('studentHistoryTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.data.studentHistory.forEach((h, index) => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 cursor-pointer';

            const isPending = h.status === 'PENDING_GRADING';
            tr.innerHTML = `
                <td class="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-chevron-right text-xs text-slate-400 transition-transform accordion-arrow flex-shrink-0" id="arrow-${h.id}"></i>
                        <span class="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap mr-1">${h.subjectCode || 'CS-101'}</span>
                        <span class="whitespace-nowrap">${h.title}</span>
                    </div>
                </td>
                <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">${h.domain}</td>
                <td class="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">${h.date}</td>
                <td class="py-3 px-4 text-sm font-semibold whitespace-nowrap">${h.score}</td>
                <td class="py-3 px-4 text-sm font-bold whitespace-nowrap ${isPending ? 'text-slate-400' : 'text-blue-600 dark:text-blue-400'}">${h.percentage ? h.percentage + '%' : '—'}</td>
                <td class="py-3 px-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap shadow-xs ${isPending ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'}">
                        ${isPending ? 'Pending Review' : (h.equivalentGrade || 'Graded')}
                    </span>
                </td>
            `;

            const trDetails = document.createElement('tr');
            trDetails.className = `border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 ${index === 0 ? '' : 'hidden'}`;
            trDetails.id = `breakdown-${h.id}`;

            let breakdownHtml = h.breakdown.map(b => `<li class="text-xs text-slate-600 dark:text-slate-300">• <strong>${b.section}:</strong> ${b.score}</li>`).join('');
            let certBtnHtml = h.certificateAvailable ? `
                <button class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1" onclick="event.stopPropagation(); app.viewCertificate('${h.title}', ${h.percentage})">
                    <i class="fas fa-certificate"></i> Download Official Grade Certificate (PDF) →
                </button>
            ` : '';

            let reviewBtnHtml = (h.reviewQuestions && h.reviewQuestions.length > 0) ? `
                <button class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition flex items-center gap-1.5" onclick="event.stopPropagation(); app.openStudentExamReview('${h.id}')">
                    <i class="fas fa-clipboard-check"></i> Review Questions & Mistakes (${h.reviewQuestions.length} Questions) →
                </button>
            ` : '';

            trDetails.innerHTML = `
                <td colspan="6" class="p-4 pl-10">
                    <div class="space-y-2 border-l-2 border-blue-500 pl-4 py-1">
                        <div class="flex items-center gap-2 flex-wrap">
                            <h5 class="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Detailed Answer Breakdown (${h.title})</h5>
                            ${h.equivalentGrade ? `<span class="inline-flex items-center px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded-md whitespace-nowrap border border-blue-200 dark:border-blue-800">Official Grade: ${h.equivalentGrade}</span>` : ''}
                        </div>
                        ${h.masterExamNote ? `<p class="text-[11px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5"><i class="fas fa-crown text-[10px]"></i> <span>${h.masterExamNote}</span></p>` : ''}
                        <ul class="space-y-1">${breakdownHtml}</ul>
                        <div class="flex items-center gap-4 flex-wrap pt-1.5">
                            ${reviewBtnHtml}
                            ${certBtnHtml}
                        </div>
                    </div>
                </td>
            `;

            tr.addEventListener('click', () => {
                const isHidden = trDetails.classList.contains('hidden');
                trDetails.classList.toggle('hidden');
                const arrow = document.getElementById(`arrow-${h.id}`);
                if (arrow) arrow.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
            });

            tbody.appendChild(tr);
            tbody.appendChild(trDetails);
        });
    }

    // --- PROFESSOR: QUESTION DIFFICULTY & TOPIC MASTERY ANALYTICS ---
    renderTeacherTopicAnalytics(subjectCode = 'CS-101') {
        const analytics = this.data.examAnalytics ? this.data.examAnalytics[subjectCode] : null;
        if (!analytics) return;

        this.currentAnalyticsSubject = subjectCode;

        const cohortEl = document.getElementById('analyticsCohortSize');
        const avgEl = document.getElementById('analyticsAverageScore');
        const passEl = document.getElementById('analyticsPassRate');
        const highRiskEl = document.getElementById('analyticsHighRiskCount');
        const titleEl = document.getElementById('analyticsExamTitle');

        if (titleEl) titleEl.textContent = analytics.examTitle;
        if (cohortEl) cohortEl.textContent = `${analytics.cohortSize} Students Enrolled`;
        if (avgEl) avgEl.textContent = analytics.averageScore;
        if (passEl) passEl.textContent = analytics.passingRate;
        if (highRiskEl) highRiskEl.textContent = `${analytics.highRiskTopicsCount} Topics Need Review`;

        // Render Topic Mastery Progress Bars
        const topicContainer = document.getElementById('analyticsTopicMasteryContainer');
        if (topicContainer) {
            topicContainer.innerHTML = '';
            analytics.topicMastery.forEach(tm => {
                const item = document.createElement('div');
                item.className = 'p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-xs';
                
                let progressColor = 'bg-emerald-500';
                let statusLabel = 'Mastered';
                if (tm.status === 'CRITICAL_REVIEW') {
                    progressColor = 'bg-rose-500';
                    statusLabel = '⚠️ Hard Topic';
                } else if (tm.status === 'MODERATE') {
                    progressColor = 'bg-amber-500';
                    statusLabel = 'Moderate';
                }

                item.innerHTML = `
                    <div class="flex items-center justify-between text-xs">
                        <span class="font-bold text-slate-800 dark:text-slate-200">${tm.topic}</span>
                        <span class="font-mono font-bold ${tm.masteryPercent < 50 ? 'text-rose-600' : 'text-blue-600 dark:text-blue-400'}">${tm.masteryPercent}% Mastery</span>
                    </div>
                    <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div class="${progressColor} h-2 rounded-full transition-all duration-500" style="width: ${tm.masteryPercent}%"></div>
                    </div>
                    <div class="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Cohort Benchmark</span>
                        <span class="font-semibold ${tm.masteryPercent < 50 ? 'text-rose-500' : 'text-slate-500'}">${statusLabel}</span>
                    </div>
                `;
                topicContainer.appendChild(item);
            });
        }

        // Render Item Difficulty Table
        const tableBody = document.getElementById('analyticsQuestionTableBody');
        if (tableBody) {
            tableBody.innerHTML = '';
            analytics.questionItemStats.forEach(q => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 text-xs';
                
                const isHighFailure = q.failureRate >= 50;

                tr.innerHTML = `
                    <td class="py-3 px-4 font-mono font-bold text-slate-500 whitespace-nowrap">${q.id}</td>
                    <td class="py-3 px-4 max-w-xs font-medium text-slate-900 dark:text-slate-100">
                        <div class="line-clamp-2">${q.questionText}</div>
                        <div class="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">${q.topic}</div>
                    </td>
                    <td class="py-3 px-4 whitespace-nowrap">
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${isHighFailure ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}">
                            <i class="fas ${isHighFailure ? 'fa-triangle-exclamation text-rose-500' : 'fa-chart-simple text-slate-400'}"></i>
                            <span>${q.failureRate}% Failure Rate</span>
                        </span>
                    </td>
                    <td class="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-xs">
                        <div class="font-semibold text-rose-700 dark:text-rose-300">${q.mostCommonWrongOption}</div>
                        <div class="text-[11px] text-slate-500 mt-0.5">${q.diagnosticInsight}</div>
                    </td>
                    <td class="py-3 px-4 text-xs font-medium text-slate-700 dark:text-slate-300 max-w-xs">
                        <div class="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                            <i class="fas fa-chalkboard-user text-amber-600 mt-0.5 flex-shrink-0"></i>
                            <span>${q.pedagogicalAction}</span>
                        </div>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }
    }

    // --- FORM ACTIONS & MUTATIONS ---
    handlePublishExam(e) {
        if (e) e.preventDefault();

        const title = document.getElementById('examTitleInput')?.value;
        const subject = document.getElementById('examSubjectSelect')?.value;
        const duration = parseInt(document.getElementById('examDurationInput')?.value) || 60;
        const items = parseInt(document.getElementById('examItemsInput')?.value) || 20;
        const passing = parseInt(document.getElementById('examPassingInput')?.value) || 70;
        const isMaster = document.getElementById('checkMasterExamDistribute')?.checked ?? true;

        if (!title || !subject) {
            const alertBox = document.getElementById('createExamAlert');
            if (alertBox) alertBox.classList.remove('hidden');
            return;
        }

        const subjectCode = subject.split(' ')[0] || "NEW-101";
        const subjectObj = this.data.subjects.find(s => s.code === subjectCode);

        // Read configured Exam Restrictions
        const accessCode = document.getElementById('examRestrictionAccessCode')?.value.trim();
        const isSequential = document.getElementById('examRestrictionSequential')?.checked || false;
        const attempts = parseInt(document.getElementById('examRestrictionAttempts')?.value) || 1;
        const prereq = document.getElementById('examRestrictionPrereq')?.value || 'NONE';
        const blockAntiCopy = document.getElementById('examRestrictionAntiCopy')?.checked !== false;
        const blockTabLock = document.getElementById('examRestrictionTabLock')?.checked !== false;

        const newExam = {
            id: `EXAM-${Date.now()}`,
            code: subjectCode,
            title: title,
            subjectName: subject,
            isMasterExam: isMaster,
            examLeaderId: this.data.demoAccounts.teacher.id,
            examLeaderName: this.data.demoAccounts.teacher.name,
            professor: `${this.data.demoAccounts.teacher.name} (Exam Leader)`,
            durationMins: duration,
            totalItems: items,
            passingScore: passing,
            status: "AVAILABLE",
            scheduledTime: "Published Today",
            deadline: "Next Week",
            domain: "Computer Science",
            restrictions: {
                requiresAccessCode: !!accessCode,
                accessCode: accessCode || null,
                navigationMode: isSequential ? 'SEQUENTIAL' : 'FREE',
                maxAttempts: attempts,
                prerequisiteCode: prereq === 'NONE' ? null : prereq,
                blockClipboard: blockAntiCopy,
                blockTabSwitch: blockTabLock
            },
            instructions: [
                accessCode ? `Proctor PIN Restriction: Protected with authorization code '${accessCode}'.` : "Open exam session.",
                isSequential ? "Sequential Navigation Restriction: You cannot revisit past questions once answered." : "Free navigation allowed.",
                "Automated proctoring session is recorded.",
                "Standardized Master Exam: Authored by Exam Leader and distributed across course sections.",
                "Session will submit when timer finishes."
            ]
        };

        this.data.exams.unshift(newExam);
        this.renderStudentExams();

        const message = isMaster 
            ? `Master Exam '${title}' published by Exam Leader & distributed to course faculty!`
            : `Examination '${title}' successfully published!`;

        this.logAuditEvent(this.data.demoAccounts.teacher.name, 'PUBLISH_MASTER_EXAM', 'Exams', message);
        this.showToast(message, 'success');

        document.getElementById('createExamForm')?.reset();
        document.getElementById('createExamAlert')?.classList.add('hidden');
        this.showSubview('teacher-dashboard');
    }

    handleAddQuestionModal() {
        const text = prompt("Enter Question Prompt:");
        if (!text) return;

        const newQ = {
            id: `Q-${Date.now().toString().slice(-3)}`,
            text: text,
            type: "Multiple Choice",
            subject: "CS-101",
            difficulty: "Medium",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctIndex: 0
        };

        this.data.questionBank.unshift(newQ);
        this.renderTeacherQuestionBank();
        this.showToast("New question added to Question Bank!", "success");
    }

    handleAddFacultyModal() {
        const name = prompt("Enter Professor Name (e.g., Dr. Jane Foster):");
        if (!name) return;
        const dept = prompt("Enter Department (e.g., Computer Science):", "Computer Science") || "Computer Science";

        const newFac = {
            id: `FAC-${Math.floor(100 + Math.random() * 900)}`,
            name: name,
            email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}@veritest.edu`,
            dept: dept,
            subjects: [],
            subjectsCount: 0,
            status: "ACTIVE"
        };

        this.data.faculty.unshift(newFac);
        this.renderAdminFaculty();
        this.logAuditEvent(this.data.demoAccounts.admin.name, 'ADD_FACULTY', 'Faculty', `Created professor entry ${newFac.id} for ${name}`);
        this.showToast(`Professor ${name} created.`, 'success');
    }

    archiveFaculty(facId) {
        const f = this.data.faculty.find(item => item.id === facId);
        if (f) {
            f.status = f.status === 'ACTIVE' ? 'ARCHIVE' : 'ACTIVE';
            this.renderAdminFaculty();
            this.logAuditEvent(this.data.demoAccounts.admin.name, 'ARCHIVE_FACULTY', 'Faculty', `${f.status === 'ARCHIVE' ? 'Archived' : 'Restored'} professor ${f.name}`);
            this.showToast(`Professor ${f.name} status updated to ${f.status}.`, 'info');
        }
    }

    // --- TOAST NOTIFICATIONS ---
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const colors = {
            success: 'bg-emerald-600 text-white',
            danger: 'bg-rose-600 text-white',
            info: 'bg-slate-900 text-white dark:bg-blue-600',
            warning: 'bg-amber-600 text-white'
        };

        const icons = {
            success: 'fa-check-circle',
            danger: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            warning: 'fa-crown'
        };

        const toast = document.createElement('div');
        toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all transform duration-300 translate-y-2 opacity-0 ${colors[type] || colors.info}`;
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        });

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // --- EVENT LISTENERS ---
    setupEventListeners() {
        const honorCheck = document.getElementById('honorCodeCheckbox');
        const beginBtn = document.getElementById('btnBeginExam');
        if (honorCheck && beginBtn) {
            honorCheck.addEventListener('change', (e) => {
                beginBtn.disabled = !e.target.checked;
                beginBtn.classList.toggle('opacity-50', !e.target.checked);
                beginBtn.classList.toggle('cursor-not-allowed', !e.target.checked);
            });
        }

        window.addEventListener('keydown', (e) => {
            if (!this.isExamActive) return;

            const key = e.key.toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(key)) {
                const optIdx = key.charCodeAt(0) - 65;
                const currentQ = this.data.questionBank[this.currentQuestionIdx];
                if (currentQ && optIdx < currentQ.options.length) {
                    this.selectAnswer(this.currentQuestionIdx, optIdx);
                }
            } else if (e.key === 'ArrowRight' || e.key === 'n') {
                if (this.currentQuestionIdx < this.data.questionBank.length - 1) {
                    this.loadQuestion(this.currentQuestionIdx + 1);
                }
            } else if (e.key === 'ArrowLeft' || e.key === 'p') {
                if (this.currentQuestionIdx > 0) {
                    this.loadQuestion(this.currentQuestionIdx - 1);
                }
            } else if (e.key === 'f') {
                this.toggleFlagQuestion();
            }
        });
    }
}

const VeriTestApp = AppController;
window.VeriTestApp = VeriTestApp;

let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new AppController();
    window.app = app;
});
