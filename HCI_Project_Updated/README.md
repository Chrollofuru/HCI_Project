# VeriTest - Unified Online Examination Platform (HCI Project)

An interactive, user-centered **Online Examination & Assessment System** prototype developed for Human-Computer Interaction (HCI) evaluation.

---

## 📌 Project Overview & System Purpose

> *"The purpose of the system is to develop an Online Examination System used to test the Domain knowledge of students and employees with respect to particular technology. The manual procedure used for conducting exams is a time-consuming process and error-prone due to human limitations. The System purpose is to completely automate the old manual procedure of conducting exams into an Online Web-Based Examination System for technical evaluation."*

### 🎯 Core User Roles & Responsibilities:

1. **For Students / Examinees:**
   * Log in to immediately view active examinations across enrolled subjects.
   * Check upcoming scheduled exams with start times and deadlines.
   * Take proctored assessments with live synchronized countdown timer (`⏱ 45:23`), real-time auto-saving, anti-cheat tab-switch detection, and the interactive 20-bubble Question Ledger.
   * View instant score breakdowns and official converted letter grades right after submission.

2. **For Professors / Instructors:**
   * Review handled subjects assigned by the administration.
   * Author and publish new examination templates with custom durations and passing scores.
   * Manage multi-domain Question Banks (Multiple Choice, True/False, Essay).
   * Review submission scores and **instantly convert them to official letter grades** (e.g. `1.00 / A+`, `1.25 / A`, `5.00 / F`) with 1-click CSV export.

3. **For Administrators (Higher Authority):**
   * Institutional governance and professor account management (add, edit, archive).
   * **Subject Assignment:** Directly assign which professors are responsible for teaching and conducting exams for each subject.
   * Inspect centralized, tamper-evident **Security Audit Logs** tracking logins, subject assignments, and anti-cheat tab-switch alerts.

---

## 🎨 Visual Design & Aesthetics

* **Predominantly White & Minimalist:** Crisp, clean white backgrounds, high-contrast typography, and subtle borders.
* **Dark Mode Support:** Instant 1-click dark theme toggle with local persistence.
* **Exam-Focused Information Architecture:** Focused strictly on examinations, proctoring guidelines, live schedules, and assessment tools.

---

## 🚀 How to Run the Website

This is a standalone, client-side web application built with vanilla HTML, modern CSS, and JavaScript.

### Method 1: Direct Double Click
Simply navigate to the project folder and double-click:
```
index.html
```
It will open in Google Chrome, Microsoft Edge, Brave, or Firefox.

### Method 2: Local HTTP Server (Optional)
```powershell
npx serve .
# or
python -m http.server 8000
```
Then visit `http://localhost:8000`.

---

## 📂 Project Structure

```
HCI_Project/
├── index.html       # Single-Page App with all 3 role views, exam sheet, and modals
├── css/
│   └── styles.css   # Predominantly white styling, ledger bubbles, animations & dark mode
├── js/
│   ├── data.js      # Relational dataset (Professors, subjects, questions, exams, audit logs)
│   └── app.js       # App controller, proctoring engine, grade conversion & subject assignment
└── README.md        # Documentation and HCI evaluation report
```
