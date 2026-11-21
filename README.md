# NEUVLE Online Examination Portal (HCI Project)

An interactive, user-centered **Online Examination System** prototype developed for Human-Computer Interaction (HCI) evaluation. Inspired by institutional portals like **NEUVLE (New Era University Virtual Learning Environment)** and upgraded from the initial design draft.

---

## 📌 Project Overview & System Purpose

> *"The purpose of the system is to develop an Online Examination System used to test the Domain knowledge of students and employees with respect to particular technology. The manual procedure used for conducting exams is a time-consuming process and error-prone due to human limitations. The System purpose is to completely automate the old manual procedure of conducting exams into an Online Web-Based Examination System for technical evaluation."*

### Key Improvements Over the Initial Draft:
1. **Institutional Landing / Home Page**: Instead of dropping users directly into a bare login screen, visitors land on an institutional portal inspired by NEUVLE, complete with university branding, campus architecture, academic program links, and clear purpose statements.
2. **3 Role-Specific Portals**:
   - 🎓 **Student / Examinee Portal**: Assigned assessments, digital honor code, live distraction-free exam sheet with 20-bubble Question Ledger, real-time timer, auto-saving, anti-cheat tab-switching monitoring, and verified grade certificates.
   - 👨‍🏫 **Faculty / Teacher Portal**: Course roster management, dynamic Exam Template Creator, multi-topic Question Bank (MCQ, True/False, Essay), and instant CSV grade sheet exports.
   - 🛡️ **Administrator Portal (Higher Authority)**: Full institutional governance, faculty roster management, subject curriculum domain directory, and real-time tamper-evident Security Audit Logs.
3. **Interactive reCAPTCHA & Error States**: Role selector tabs and simulated error notifications ("Login Failed! Incorrect username or password") to demonstrate error handling heuristics.
4. **HCI Evaluation Floating Toolbar**: A quick-switch toolbar pinned at the bottom allowing professors and evaluators to jump between any role, launch the live exam, or toggle dark mode with a single click.

---

## 🚀 How to Run the Website

This is a standalone, client-side web application built with vanilla HTML, modern CSS, and JavaScript. Zero installation, zero build steps, and zero dependencies required!

### Method 1: Direct Double Click
Simply navigate to the project folder and double-click:
```
index.html
```
It will open immediately in Chrome, Edge, Brave, or Firefox.

### Method 2: Local HTTP Server (Optional)
If you prefer running via a local server:
```powershell
npx serve .
# or
python -m http.server 8000
```
Then visit `http://localhost:8000` or the port displayed.

---

## 📂 Project Structure

```
HCI_Project/
├── index.html          # Main application containing all views, modals, and landing page
├── css/
│   └── styles.css      # Specialized styles, custom ledger bubbles, animations & dark mode
├── js/
│   ├── data.js         # Mock relational data (faculty, subjects, questions, exams, audit logs)
│   └── app.js          # Application controller, exam engine, proctoring & heuristics
└── README.md           # Documentation and HCI evaluation report
```

---

## 🧠 Nielsen's 10 Usability Heuristics Implemented

| Heuristic | Implementation in ExamPortal |
| :--- | :--- |
| **1. Visibility of System Status** | Real-time synchronized countdown timer (`⏱ 45:23`), pulsating "● Auto-saved" badge, progress bar percentage, and dynamic proctoring status. |
| **2. Match Between System & Real World** | Digital honor code declaration, 20-bubble standardized OMR-style question ledger, and familiar academic terms (Midterms, Quizzes, Office Hours). |
| **3. User Control & Freedom** | Examinees can jump non-linearly to any question, flag questions for later review, or quit. Teachers can save exam drafts or publish immediately. |
| **4. Consistency & Standards** | Unified color coding (Green for Passed/Available, Amber for Flagged/Upcoming, Red for Critical/Failed), standardized table layouts and navigation bars. |
| **5. Error Prevention** | **Unfinished Questions Warning Dialog**: Warns the student if they attempt to submit with unanswered items. Upcoming exams cannot be started before schedule. |
| **6. Recognition Rather Than Recall** | Question Ledger shows at-a-glance status of all 20 questions without requiring examinees to remember which questions they skipped. |
| **7. Flexibility & Efficiency** | Keyboard shortcuts during live exams (`A`, `B`, `C`, `D` to answer, `Arrow Left/Right` to navigate, `F` to flag). Search and domain filters for data tables. |
| **8. Aesthetic & Minimalist Design** | Distraction-free live exam layout, clean card-based dashboard, and responsive typography. |
| **9. Help Users Recognize Errors** | Specific validation messages (e.g. "Please fill in all required fields before publishing" and login failure banners). |
| **10. Security & Proctoring Integrity** | Tab-switch tracking simulation alerts students when window focus is lost and logs warnings into the Administrator Audit Log. |

---

## 🔌 Future Supabase Backend Integration Roadmap

When you are ready to connect a live database and backend:
1. **Supabase Auth**: Replace demo accounts with `supabase.auth.signInWithPassword()` using role claims in JWT (`app_metadata.role = 'student' | 'teacher' | 'admin'`).
2. **Supabase Database (PostgreSQL)**:
   - `users` (id, email, full_name, role)
   - `faculty` (id, name, email, department, status)
   - `subjects` (code, name, domain, faculty_id)
   - `question_bank` (id, text, type, subject_code, difficulty, options, correct_index)
   - `exams` (id, title, duration_minutes, total_items, passing_score, start_time, end_time)
   - `exam_submissions` (id, exam_id, student_id, score, answers_json, submitted_at)
   - `audit_logs` (id, timestamp, user_id, action, module, details)
3. **Row-Level Security (RLS)**: Enforce policies so students can only read their own exam sheets and grades, faculty can only edit questions for their assigned subjects, and admins have global audit privileges.
