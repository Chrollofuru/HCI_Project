/**
 * VeriTest - Online Examination & Assessment System
 * Application Controller & Heuristics Engine
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

    // --- STUDENT EXAM WORKFLOW ---
    startExamInstruction(examCode = 'CS-101') {
        const exam = this.data.exams.find(e => e.code === examCode) || this.data.exams[1];
        this.currentExam = exam;

        document.getElementById('preExamTitle').textContent = exam.title;
        document.getElementById('preExamDomain').textContent = exam.domain;
        document.getElementById('preExamDuration').textContent = `${exam.durationMins} minutes`;
        document.getElementById('preExamVolume').textContent = `${exam.totalItems} Multiple-Choice Items`;

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
            prevBtn.disabled = idx === 0;
            prevBtn.classList.toggle('opacity-50', idx === 0);
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
            certificateAvailable: passed
        };

        this.data.studentHistory.unshift(newRecord);
        this.showToast(`Exam submitted! Score: ${score}/${questions.length} (${percent}%) - ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'danger');

        this.renderStudentHistory();
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
            ["Student ID", "Student Name", "Raw Score", "Percentage", "Official Converted Grade", "Status", "Date Taken"]
        ];

        this.data.teacherResults.forEach(r => {
            rows.push([r.studentId, r.name, r.rawScore, `${r.percentage}%`, r.grade, r.status, r.date]);
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

    // --- ADMIN: ASSIGN PROFESSOR TO SUBJECT ---
    openAssignProfessorModal(subjectCode) {
        const subject = this.data.subjects.find(s => s.code === subjectCode);
        if (!subject) return;

        // Populate modal select
        const select = document.getElementById('assignProfSelect');
        const codeSpan = document.getElementById('assignSubjectCode');
        const nameSpan = document.getElementById('assignSubjectName');

        if (codeSpan) codeSpan.textContent = subject.code;
        if (nameSpan) nameSpan.textContent = subject.name;

        if (select) {
            select.innerHTML = '<option value="">— Unassign Professor —</option>';
            this.data.faculty.filter(f => f.status === 'ACTIVE').forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.id;
                opt.textContent = `${f.name} (${f.dept})`;
                if (subject.facultyId === f.id) opt.selected = true;
                select.appendChild(opt);
            });
        }

        const modal = document.getElementById('assignProfModal');
        if (modal) {
            modal.dataset.subjectCode = subjectCode;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    saveSubjectAssignment() {
        const modal = document.getElementById('assignProfModal');
        const subjectCode = modal?.dataset.subjectCode;
        const select = document.getElementById('assignProfSelect');
        const facultyId = select?.value;

        const subject = this.data.subjects.find(s => s.code === subjectCode);
        if (!subject) return;

        if (!facultyId) {
            subject.facultyId = null;
            subject.faculty = "— Unassigned —";
            this.logAuditEvent(this.data.demoAccounts.admin.name, 'UNASSIGN_SUBJECT', 'Curriculum', `Unassigned professor from ${subject.code}`);
            this.showToast(`Subject ${subject.code} unassigned.`, 'info');
        } else {
            const fac = this.data.faculty.find(f => f.id === facultyId);
            if (fac) {
                subject.facultyId = fac.id;
                subject.faculty = fac.name;
                this.logAuditEvent(this.data.demoAccounts.admin.name, 'ASSIGN_SUBJECT', 'Curriculum', `Assigned ${subject.code} (${subject.name}) to ${fac.name}`);
                this.showToast(`Assigned ${subject.code} to ${fac.name}!`, 'success');
            }
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
                <td class="py-3 px-4 text-center text-sm font-semibold">${f.subjectsCount}</td>
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

    // 2. Admin Subject Directory Table (With Direct Professor Assignment!)
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
                <td class="py-3 px-4 text-sm">
                    <span class="font-medium text-slate-900 dark:text-slate-100">${s.faculty}</span>
                </td>
                <td class="py-3 px-4 text-center text-sm font-semibold">${s.enrolled}</td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-1 text-xs font-bold rounded-full ${s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}">
                        ${s.status}
                    </span>
                </td>
                <td class="py-3 px-4 text-right space-x-2">
                    <button class="px-3 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-lg font-semibold border border-blue-200 dark:border-blue-800" onclick="app.openAssignProfessorModal('${s.code}')">
                        <i class="fas fa-user-plus mr-1"></i> Assign Prof
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
                    <span class="px-2 py-0.5 rounded font-bold ${log.action.includes('ALERT') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300'}">
                        ${log.action}
                    </span>
                </td>
                <td class="py-3 px-4 font-sans text-slate-600 dark:text-slate-400">${log.module}</td>
                <td class="py-3 px-4 font-sans text-slate-700 dark:text-slate-300">${log.details}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 4. Professor Handled Subjects (Know which subjects to make exams for!)
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
                <td class="py-3 px-4 text-right space-x-2">
                    <button class="px-3 py-1.5 text-xs bg-slate-900 text-white dark:bg-blue-600 rounded-lg font-semibold hover:bg-blue-600 transition" onclick="app.prepareCreateExamFor('${c.code}', '${c.name}')">
                        <i class="fas fa-plus mr-1"></i> Make Exam
                    </button>
                    <button class="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-100" onclick="app.showToast('Roster for ${c.code} loaded: ${c.enrolled} examinees', 'info')">
                        Roster
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    prepareCreateExamFor(code, name) {
        this.showSubview('teacher-create-exam');
        const titleInput = document.getElementById('examTitleInput');
        const select = document.getElementById('examSubjectSelect');
        if (titleInput) titleInput.value = `${code} Final Examination 2025`;
        if (select) {
            select.value = `${code} - ${name}`;
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
                <td class="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">${r.studentId}</td>
                <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">${r.name}</td>
                <td class="py-3 px-4 text-sm font-semibold">${r.rawScore}</td>
                <td class="py-3 px-4 text-sm font-bold text-blue-600 dark:text-blue-400">${r.percentage}%</td>
                <td class="py-3 px-4">
                    <div class="flex items-center gap-1.5">
                        <span class="font-bold text-xs ${isFinalized ? 'text-slate-900 dark:text-slate-100' : 'text-amber-600'}">${r.grade}</span>
                        ${isFinalized ? '<i class="fas fa-check-circle text-emerald-500 text-xs" title="Finalized to Transcript"></i>' : ''}
                    </div>
                </td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 text-xs font-bold rounded-full ${r.status === 'PASSED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400'}">
                        ${r.status}
                    </span>
                </td>
                <td class="py-3 px-4 text-right">
                    ${isFinalized 
                        ? `<span class="text-xs text-slate-400 font-medium">Grade Posted</span>`
                        : `<button onclick="app.convertStudentGrade('${r.studentId}')" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition">
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

            if (exam.status === 'AVAILABLE') {
                badgeHtml = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">Available Now</span>';
                actionHtml = `<button class="px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm" onclick="app.startExamInstruction('${exam.code}')">Start Exam</button>`;
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
                    <div class="flex items-center gap-3">
                        <span class="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">${exam.code}</span>
                        <h4 class="text-lg font-bold text-slate-900 dark:text-slate-100">${exam.title}</h4>
                        ${badgeHtml}
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400 space-x-2">
                        <span>Professor: <strong>${exam.professor}</strong></span>
                        <span>•</span>
                        <span>Duration: <strong>${exam.durationMins} minutes</strong></span>
                        <span>•</span>
                        <span>Total Items: <strong>${exam.totalItems} Questions</strong></span>
                    </div>
                    <div class="text-xs text-slate-400">
                        ${exam.status === 'AVAILABLE' ? `<span class="text-emerald-600 dark:text-emerald-400 font-medium"><i class="far fa-clock mr-1"></i> Deadline: ${exam.deadline}</span>` : `<span class="text-amber-600 dark:text-amber-400"><i class="far fa-calendar-clock mr-1"></i> ${exam.scheduledTime}</span>`}
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
                        <span class="font-mono text-xs text-blue-600 dark:text-blue-400 mr-1">${h.subjectCode || 'CS-101'}</span>
                        <span>${h.title}</span>
                    </div>
                </td>
                <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">${h.domain}</td>
                <td class="py-3 px-4 text-xs text-slate-500">${h.date}</td>
                <td class="py-3 px-4 text-sm font-semibold">${h.score}</td>
                <td class="py-3 px-4 text-sm font-bold ${isPending ? 'text-slate-400' : 'text-blue-600 dark:text-blue-400'}">${h.percentage ? h.percentage + '%' : '—'}</td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 text-xs font-bold rounded-full ${isPending ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'}">
                        ${isPending ? 'Pending Review' : (h.equivalentGrade || 'Graded')}
                    </span>
                </td>
            `;

            const trDetails = document.createElement('tr');
            trDetails.className = `border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 ${index === 0 ? '' : 'hidden'}`;
            trDetails.id = `breakdown-${h.id}`;

            let breakdownHtml = h.breakdown.map(b => `<li class="text-xs text-slate-600 dark:text-slate-300">• <strong>${b.section}:</strong> ${b.score}</li>`).join('');
            let certBtnHtml = h.certificateAvailable ? `
                <button class="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1" onclick="app.viewCertificate('${h.title}', ${h.percentage})">
                    <i class="fas fa-certificate"></i> Download Official Grade Certificate (PDF) →
                </button>
            ` : '';

            trDetails.innerHTML = `
                <td colspan="6" class="p-4 pl-10">
                    <div class="space-y-1.5 border-l-2 border-blue-500 pl-4 py-1">
                        <div class="flex items-center gap-2">
                            <h5 class="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Detailed Answer Breakdown (${h.title})</h5>
                            ${h.equivalentGrade ? `<span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded">Official Grade: ${h.equivalentGrade}</span>` : ''}
                        </div>
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
            professor: this.data.demoAccounts.teacher.name,
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
            warning: 'fa-bell'
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
