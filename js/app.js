/**
 * EduExam / NEUVLE Online Examination System - Main Application Controller
 * Handles Navigation, Role Switching, Exam Engine, Proctoring Simulation, Modals, and Heuristics
 */

class AppController {
    constructor() {
        this.data = window.EDUDATA;
        this.currentView = 'view-landing';
        this.currentRole = null;
        this.currentExam = null;
        this.currentQuestionIdx = 0;
        this.examAnswers = {}; // { questionIndex: selectedOptionIndex }
        this.examFlags = {};   // { questionIndex: boolean }
        this.examTimer = null;
        this.examSecondsRemaining = 45 * 60 + 23; // 45:23 like in draft
        this.tabSwitchCount = 0;
        this.maxTabSwitches = 3;
        this.isExamActive = false;
        this.darkMode = false;

        this.init();
    }

    init() {
        this.initTheme();
        this.setupEventListeners();
        this.setupProctoringListener();
        this.renderAllViews();
        this.showView('view-landing');
    }

    // --- THEME MANAGEMENT ---
    initTheme() {
        const savedTheme = localStorage.getItem('eduexam_theme');
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
            localStorage.setItem('eduexam_theme', 'dark');
            document.querySelectorAll('.theme-toggle-icon').forEach(el => {
                el.className = 'fas fa-sun theme-toggle-icon text-amber-400';
            });
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('eduexam_theme', 'light');
            document.querySelectorAll('.theme-toggle-icon').forEach(el => {
                el.className = 'fas fa-moon theme-toggle-icon text-slate-600';
            });
        }
    }

    // --- NAVIGATION & ROUTING ---
    showView(viewId, subviewId = null) {
        // Hide all major views
        const views = document.querySelectorAll('.app-view');
        views.forEach(v => v.classList.add('hidden'));

        // Show target view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
            this.currentView = viewId;
        }

        // Handle subviews for portals
        if (subviewId) {
            this.showSubview(subviewId);
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update active states on nav
        this.updateNavState();
    }

    showSubview(subviewId) {
        const subviews = document.querySelectorAll('.subview-pane');
        subviews.forEach(s => s.classList.add('hidden'));

        const target = document.getElementById(subviewId);
        if (target) {
            target.classList.remove('hidden');
        }

        // Update active sidebar link
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
            // Live exam is full-screen distraction-free
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
        const userAvatar = document.getElementById('currentUserAvatar');

        if (!this.currentRole) return;

        const roleConfig = {
            student: { title: 'STUDENT', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400', user: this.data.demoAccounts.student },
            teacher: { title: 'TEACHER', bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-400', user: this.data.demoAccounts.teacher },
            admin: { title: 'ADMIN', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400', user: this.data.demoAccounts.admin }
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
            // reset error
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
        document.querySelectorAll('.login-role-tab').forEach(tab => {
            if (tab.dataset.role === role) {
                tab.classList.add('border-blue-600', 'text-blue-600', 'dark:text-blue-400', 'dark:border-blue-400', 'font-semibold');
                tab.classList.remove('border-transparent', 'text-slate-500');
            } else {
                tab.classList.remove('border-blue-600', 'text-blue-600', 'dark:text-blue-400', 'dark:border-blue-400', 'font-semibold');
                tab.classList.add('border-transparent', 'text-slate-500');
            }
        });

        // Set form presets
        const user = this.data.demoAccounts[role];
        const idInput = document.getElementById('loginIdentifier');
        const passInput = document.getElementById('loginPassword');
        if (idInput && user) idInput.value = user.email;
        if (passInput) passInput.value = "••••••••••••";
    }

    loginAs(role) {
        this.currentRole = role;
        this.closeLoginModal();

        this.showToast(`Logged in successfully as ${role.toUpperCase()}!`, 'success');
        this.logAuditEvent(this.data.demoAccounts[role].name, 'LOGIN_SUCCESS', 'Auth', `Successful login session from IP 192.168.1.104 (${role})`);

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

                // Toast security warning
                this.showToast(
                    `⚠️ Security Warning: Tab switch #${this.tabSwitchCount} detected! (${Math.max(0, remaining)} remaining before lockout)`,
                    'danger'
                );

                // Add to proctor audit log
                this.logAuditEvent(
                    this.data.demoAccounts.student.name,
                    'TAB_SWITCH_ALERT',
                    'Proctor',
                    `Candidate switched active tab/window during CS101 Exam. Count: ${this.tabSwitchCount}/${this.maxTabSwitches}`
                );

                // If reached max switches, simulate lockout
                if (this.tabSwitchCount >= this.maxTabSwitches) {
                    alert('🚨 MAXIMUM SECURITY VIOLATIONS REACHED:\nYou have switched tabs 3 times. Your exam is now locked and submitted for administrative integrity review.');
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
    }

    // --- STUDENT EXAM WORKFLOW ---
    startExamInstruction(examCode = 'CS-101') {
        const exam = this.data.exams.find(e => e.code === examCode) || this.data.exams[1];
        this.currentExam = exam;

        // Render instruction screen
        document.getElementById('preExamTitle').textContent = exam.title;
        document.getElementById('preExamDomain').textContent = exam.domain;
        document.getElementById('preExamDuration').textContent = `${exam.durationMins} minutes`;
        document.getElementById('preExamVolume').textContent = `${exam.totalItems} Multiple-Choice Items`;

        // Reset honor code checkbox
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

        // 45 minutes and 23 seconds countdown as displayed in draft
        this.examSecondsRemaining = 45 * 60 + 23;

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

        this.currentQuestionIdx = idx;
        const q = questions[idx];

        // Update question numbering & progress
        const qNumEl = document.getElementById('currentQuestionNumber');
        const qTotalEl = document.getElementById('totalQuestionsCount');
        const progPercentEl = document.getElementById('examProgressPercent');
        const progBarEl = document.getElementById('examProgressBar');

        if (qNumEl) qNumEl.textContent = idx + 1;
        if (qTotalEl) qTotalEl.textContent = questions.length;

        const percent = Math.round(((idx + 1) / questions.length) * 100);
        if (progPercentEl) progPercentEl.textContent = `${percent}% Complete`;
        if (progBarEl) progBarEl.style.width = `${percent}%`;

        // Render question text
        const qTextEl = document.getElementById('liveQuestionText');
        if (qTextEl) qTextEl.textContent = q.text;

        // Render options
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

        // Update Flag button state
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

        // Previous button disabled state
        const prevBtn = document.getElementById('btnPrevQuestion');
        if (prevBtn) {
            prevBtn.disabled = idx === 0;
            prevBtn.classList.toggle('opacity-50', idx === 0);
        }

        // Update Ledger UI
        this.renderQuestionLedger();
    }

    selectAnswer(qIdx, optIdx) {
        this.examAnswers[qIdx] = optIdx;

        // Auto-save pulse feedback
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

        for (let i = 0; i < total; i++) {
            const isAnswered = this.examAnswers[i] !== undefined;
            const isFlagged = !!this.examFlags[i];
            const isActive = i === this.currentQuestionIdx;

            const bubble = document.createElement('button');
            bubble.className = `ledger-bubble ${isAnswered ? 'answered' : 'unanswered'} ${isFlagged ? 'flagged' : ''} ${isActive ? 'active-q' : ''}`;
            bubble.textContent = i + 1;
            bubble.title = `Question ${i + 1} (${isAnswered ? 'Answered' : 'Unanswered'}${isFlagged ? ', Flagged' : ''})`;

            bubble.addEventListener('click', () => {
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
            // Show Unfinished Questions modal dialog matching Page 9 of draft!
            const countEl = document.getElementById('unansweredQuestionsCount');
            if (countEl) countEl.textContent = unansweredCount;
            const modal = document.getElementById('unfinishedModal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        } else {
            // Confirm direct submission
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

        // Calculate score
        let score = 0;
        const questions = this.data.questionBank;
        questions.forEach((q, idx) => {
            if (this.examAnswers[idx] === q.correctIndex) {
                score++;
            }
        });

        const percent = Math.round((score / questions.length) * 100);
        const passed = percent >= (this.currentExam?.passingScore || 60);

        // Add to historical submissions
        const newRecord = {
            id: `HIST-${Date.now()}`,
            title: this.currentExam?.title || "CS101 - Midterm Examination",
            domain: this.currentExam?.domain || "Computer Science Basics",
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            score: `${score} / ${questions.length}`,
            percentage: percent,
            status: "GRADED",
            breakdown: [
                { section: "Section 1 (Multiple Choice Questions)", score: `${score} / ${questions.length} correct` }
            ],
            certificateAvailable: passed
        };

        this.data.studentHistory.unshift(newRecord);

        // Show submission toast
        this.showToast(`Exam submitted! Score: ${score}/${questions.length} (${percent}%) - ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'danger');

        // Render updated student results
        this.renderStudentHistory();

        // Navigate to student results view
        this.showView('view-student', 'student-results');
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

    // --- CSV EXPORT (TEACHER RESULTS) ---
    exportResultsCSV() {
        const rows = [
            ["Student ID", "Student Name", "Score", "Percentage", "Status", "Date Taken"]
        ];

        this.data.teacherResults.forEach(r => {
            rows.push([r.studentId, r.name, r.score, r.percentage, r.status, r.date]);
        });

        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Exam_Results_CS101_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast('Grade sheet exported to CSV successfully.', 'success');
    }

    // --- RENDERING VIEWS & TABLES ---
    renderAllViews() {
        this.renderAdminFaculty();
        this.renderAdminSubjects();
        this.renderAdminAuditLogs();
        this.renderTeacherSubjects();
        this.renderTeacherQuestionBank();
        this.renderTeacherResults();
        this.renderStudentExams();
        this.renderStudentHistory();
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
                <td class="py-3 px-4 text-center text-sm font-semibold">${f.subjectsCount}</td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-1 text-xs font-bold rounded-full ${f.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}">
                        ${f.status}
                    </span>
                </td>
                <td class="py-3 px-4 text-right space-x-2">
                    <button class="px-3 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700" onclick="app.editFaculty('${f.id}')">Edit</button>
                    <button class="px-3 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-lg font-medium hover:bg-red-50 text-red-600 dark:hover:bg-red-950/40" onclick="app.archiveFaculty('${f.id}')">${f.status === 'ACTIVE' ? 'Archive' : 'Restore'}</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 2. Admin Subject Directory Table
    renderAdminSubjects() {
        const tbody = document.getElementById('adminSubjectsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.data.subjects.forEach(s => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors';
            tr.innerHTML = `
                <td class="py-3 px-4 text-xs font-mono font-bold text-blue-600 dark:text-blue-400">${s.code}</td>
                <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">${s.name}</td>
                <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">${s.domain}</td>
                <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">${s.faculty}</td>
                <td class="py-3 px-4 text-center text-sm font-semibold">${s.enrolled}</td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-1 text-xs font-bold rounded-full ${s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}">
                        ${s.status}
                    </span>
                </td>
                <td class="py-3 px-4 text-right space-x-2">
                    <button class="px-3 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700">Edit</button>
                    <button class="px-3 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700">${s.status === 'ACTIVE' ? 'Archive' : 'Restore'}</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
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
                    <span class="px-2 py-0.5 rounded font-bold ${log.action.includes('ALERT') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'}">
                        ${log.action}
                    </span>
                </td>
                <td class="py-3 px-4 font-sans text-slate-600 dark:text-slate-400">${log.module}</td>
                <td class="py-3 px-4 font-sans text-slate-700 dark:text-slate-300">${log.details}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 4. Teacher Subjects
    renderTeacherSubjects() {
        const tbody = document.getElementById('teacherSubjectsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const teacherCourses = this.data.subjects.filter(s => s.faculty === "Prof. Maria Santos" || s.faculty === "Dr. Rachel Green");
        teacherCourses.forEach(c => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40';
            tr.innerHTML = `
                <td class="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">${c.code}</td>
                <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">${c.name}</td>
                <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">${c.domain}</td>
                <td class="py-3 px-4 text-sm font-semibold">${c.enrolled} students</td>
                <td class="py-3 px-4 text-right">
                    <button class="px-3 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium" onclick="app.showToast('Viewing roster for ${c.code}', 'info')">View Roster</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 5. Teacher Question Bank
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
                    <span class="px-2 py-0.5 text-xs font-bold rounded ${q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' : q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}">
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

    // 6. Teacher Results Table
    renderTeacherResults() {
        const tbody = document.getElementById('teacherResultsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.data.teacherResults.forEach(r => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40';
            tr.innerHTML = `
                <td class="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">${r.studentId}</td>
                <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">${r.name}</td>
                <td class="py-3 px-4 text-sm font-semibold">${r.score}</td>
                <td class="py-3 px-4 text-sm font-bold text-blue-600 dark:text-blue-400">${r.percentage}</td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 text-xs font-bold rounded-full ${r.status === 'PASSED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'}">
                        ${r.status}
                    </span>
                </td>
                <td class="py-3 px-4 text-xs text-slate-500">${r.date}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 7. Student Registered Exams
    renderStudentExams() {
        const container = document.getElementById('studentExamsContainer');
        if (!container) return;

        container.innerHTML = '';
        this.data.exams.forEach(exam => {
            const card = document.createElement('div');
            card.className = 'p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow';

            let actionHtml = '';
            let badgeHtml = '';

            if (exam.status === 'AVAILABLE') {
                badgeHtml = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">Available Now</span>';
                actionHtml = `<button class="px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm" onclick="app.startExamInstruction('${exam.code}')">Start Exam</button>`;
            } else if (exam.status === 'UPCOMING') {
                badgeHtml = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">Upcoming</span>';
                actionHtml = `
                    <div class="flex flex-col items-end gap-1">
                        <button class="px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 font-semibold text-sm cursor-not-allowed" disabled>Start Exam</button>
                        <span class="text-xs text-slate-500">Available in 2 hours</span>
                    </div>
                `;
            } else {
                badgeHtml = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Completed</span>';
                actionHtml = `<button class="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 font-medium text-sm cursor-not-allowed" disabled>Attempt Saved</button>`;
            }

            card.innerHTML = `
                <div class="space-y-1.5">
                    <div class="flex items-center gap-3">
                        <h4 class="text-lg font-bold text-slate-900 dark:text-slate-100">${exam.title}</h4>
                        ${badgeHtml}
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400 space-x-2">
                        <span>Teacher: <strong>${exam.teacher}</strong></span>
                        <span>•</span>
                        <span>Duration: <strong>${exam.durationMins} minutes</strong></span>
                        <span>•</span>
                        <span>Total Items: <strong>${exam.totalItems} Questions</strong></span>
                    </div>
                    <div class="text-xs text-slate-400">
                        ${exam.status === 'AVAILABLE' ? `<span class="text-emerald-600 dark:text-emerald-400 font-medium">Deadline: ${exam.deadline}</span>` : exam.scheduledTime}
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
                <td class="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-chevron-right text-xs text-slate-400 transition-transform accordion-arrow" id="arrow-${h.id}"></i>
                        <span>${h.title}</span>
                    </div>
                </td>
                <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">${h.domain}</td>
                <td class="py-3 px-4 text-xs text-slate-500">${h.date}</td>
                <td class="py-3 px-4 text-sm font-semibold">${h.score}</td>
                <td class="py-3 px-4 text-sm font-bold ${isPending ? 'text-slate-400' : 'text-blue-600 dark:text-blue-400'}">${h.percentage ? h.percentage + '%' : '—'}</td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 text-xs font-bold rounded-full ${isPending ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'}">
                        ${isPending ? 'Pending Review' : 'Graded'}
                    </span>
                </td>
            `;

            // Expandable Accordion Row for Detailed Breakdown (matches draft page 9!)
            const trDetails = document.createElement('tr');
            trDetails.className = `border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 ${index === 0 ? '' : 'hidden'}`;
            trDetails.id = `breakdown-${h.id}`;

            let breakdownHtml = h.breakdown.map(b => `<li class="text-xs text-slate-600 dark:text-slate-300">• <strong>${b.section}:</strong> ${b.score}</li>`).join('');
            let certBtnHtml = h.certificateAvailable ? `
                <button class="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1" onclick="app.viewCertificate('${h.title}', ${h.percentage})">
                    <i class="fas fa-certificate"></i> Download Verified Grade Certificate (PDF) →
                </button>
            ` : '';

            trDetails.innerHTML = `
                <td colspan="6" class="p-4 pl-10">
                    <div class="space-y-1.5 border-l-2 border-blue-500 pl-4 py-1">
                        <h5 class="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Detailed Answer Breakdown (${h.title})</h5>
                        <ul class="space-y-1">${breakdownHtml}</ul>
                        ${certBtnHtml}
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

    // --- FORM ACTIONS & MUTATIONS ---
    handlePublishExam(e) {
        if (e) e.preventDefault();

        const title = document.getElementById('examTitleInput')?.value;
        const subject = document.getElementById('examSubjectSelect')?.value;
        const duration = parseInt(document.getElementById('examDurationInput')?.value) || 60;
        const items = parseInt(document.getElementById('examItemsInput')?.value) || 20;
        const passing = parseInt(document.getElementById('examPassingInput')?.value) || 70;

        if (!title || !subject) {
            const alertBox = document.getElementById('createExamAlert');
            if (alertBox) alertBox.classList.remove('hidden');
            return;
        }

        const newExam = {
            id: `EXAM-${Date.now()}`,
            code: subject.split(' ')[0] || "NEW-101",
            title: title,
            subjectName: subject,
            teacher: this.data.demoAccounts.teacher.name,
            durationMins: duration,
            totalItems: items,
            passingScore: passing,
            status: "AVAILABLE",
            scheduledTime: "Published Today",
            deadline: "Next Week",
            domain: "Computer Science",
            instructions: [
                "Automated proctoring session is recorded.",
                "Ensure reliable network connectivity.",
                "Session will submit when timer finishes."
            ]
        };

        this.data.exams.unshift(newExam);
        this.renderStudentExams();

        this.logAuditEvent(this.data.demoAccounts.teacher.name, 'PUBLISH_EXAM', 'Exams', `Published examination '${title}' (${items} items)`);
        this.showToast(`Examination '${title}' successfully published!`, 'success');

        // Reset form & go to teacher dashboard
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
        const name = prompt("Enter Faculty Name (e.g., Dr. Jane Foster):");
        if (!name) return;
        const dept = prompt("Enter Department (e.g., Computer Science):", "Computer Science") || "Computer Science";

        const newFac = {
            id: `FAC-${Math.floor(100 + Math.random() * 900)}`,
            name: name,
            email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}@examportal.edu`,
            dept: dept,
            subjectsCount: 1,
            status: "ACTIVE"
        };

        this.data.faculty.unshift(newFac);
        this.renderAdminFaculty();
        this.logAuditEvent(this.data.demoAccounts.admin.name, 'ADD_FACULTY', 'Faculty', `Created faculty entry ${newFac.id} for ${name}`);
        this.showToast(`Faculty member ${name} created.`, 'success');
    }

    archiveFaculty(facId) {
        const f = this.data.faculty.find(item => item.id === facId);
        if (f) {
            f.status = f.status === 'ACTIVE' ? 'ARCHIVE' : 'ACTIVE';
            this.renderAdminFaculty();
            this.logAuditEvent(this.data.demoAccounts.admin.name, 'ARCHIVE_FACULTY', 'Faculty', `${f.status === 'ARCHIVE' ? 'Archived' : 'Restored'} faculty ${f.name}`);
            this.showToast(`Faculty ${f.name} status updated to ${f.status}.`, 'info');
        }
    }

    // --- TOAST NOTIFICATIONS (HCI Feedback) ---
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
            warning: 'fa-bell'
        };

        const toast = document.createElement('div');
        toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all transform duration-300 translate-y-2 opacity-0 ${colors[type] || colors.info}`;
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        });

        // Remove after 3.5s
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // --- EVENT LISTENERS ---
    setupEventListeners() {
        // Honor code checkbox in pre-exam screen
        const honorCheck = document.getElementById('honorCodeCheckbox');
        const beginBtn = document.getElementById('btnBeginExam');
        if (honorCheck && beginBtn) {
            honorCheck.addEventListener('change', (e) => {
                beginBtn.disabled = !e.target.checked;
                beginBtn.classList.toggle('opacity-50', !e.target.checked);
                beginBtn.classList.toggle('cursor-not-allowed', !e.target.checked);
            });
        }

        // Live exam keyboard shortcuts (HCI Heuristic: Flexibility & Efficiency of Use)
        window.addEventListener('keydown', (e) => {
            if (!this.isExamActive) return;

            // A, B, C, D to answer
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

// Global instance
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new AppController();
    window.app = app;
});
