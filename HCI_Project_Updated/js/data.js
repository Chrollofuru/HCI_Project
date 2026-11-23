/**
 * VeriTest - Online Examination & Assessment System
 * Mock Database & State Management (HCI Project Prototype)
 */

const INITIAL_DATA = {
    // Current active user / session
    currentUser: null,

    // Faculty / Professor Registry (Admin View & Governance)
    faculty: [
        { id: "FAC-012", name: "Dr. Rachel Green", email: "rachel.green@veritest.edu", dept: "Computer Science", subjects: ["CS-101", "CS-105", "CS-205"], subjectsCount: 3, status: "ACTIVE" },
        { id: "FAC-044", name: "Prof. Arthur Dent", email: "arthur.dent@veritest.edu", dept: "Mathematics", subjects: ["MATH-302", "MATH-101"], subjectsCount: 2, status: "ACTIVE" },
        { id: "FAC-081", name: "Dr. Sarah Connor", email: "sarah.connor@veritest.edu", dept: "Mechanical Eng.", subjects: [], subjectsCount: 0, status: "ARCHIVE" },
        { id: "FAC-095", name: "Prof. Charles Xavier", email: "charles.xavier@veritest.edu", dept: "Biological Sciences", subjects: ["BIO-109", "BIO-201"], subjectsCount: 2, status: "ACTIVE" },
        { id: "FAC-102", name: "Dr. Bruce Banner", email: "bruce.banner@veritest.edu", dept: "Nuclear Physics", subjects: ["PHY-401"], subjectsCount: 1, status: "ACTIVE" },
        { id: "FAC-115", name: "Dr. Alan Turing", email: "alan.turing@veritest.edu", dept: "Artificial Intelligence", subjects: ["CS-401", "CS-405"], subjectsCount: 2, status: "ACTIVE" },
        { id: "FAC-124", name: "Prof. Maria Santos", email: "maria.santos@veritest.edu", dept: "Computer Science", subjects: ["CS-202", "CS-303", "IT-102"], subjectsCount: 3, status: "ACTIVE" }
    ],

    // Subject Directory (Curriculum Mapping & Professor Assignment)
    subjects: [
        { code: "CS-101", name: "Introduction to Programming", domain: "Computer Science", facultyId: "FAC-012", faculty: "Dr. Rachel Green", enrolled: 124, status: "ACTIVE" },
        { code: "MATH-302", name: "Advanced Linear Algebra", domain: "Mathematics", facultyId: "FAC-044", faculty: "Prof. Arthur Dent", enrolled: 84, status: "ACTIVE" },
        { code: "BIO-109", name: "Principles of Gen Biology", domain: "Biology", facultyId: "FAC-095", faculty: "Prof. Charles Xavier", enrolled: 192, status: "ACTIVE" },
        { code: "MECH-205", name: "Fluid Dynamics", domain: "Mechanical Eng.", facultyId: null, faculty: "— Unassigned —", enrolled: 0, status: "ARCHIVE" },
        { code: "PHY-401", name: "Quantum Mechanics II", domain: "Nuclear Physics", facultyId: "FAC-102", faculty: "Dr. Bruce Banner", enrolled: 42, status: "ACTIVE" },
        { code: "CS-202", name: "Data Structures & Algorithms", domain: "Computer Science", facultyId: "FAC-124", faculty: "Prof. Maria Santos", enrolled: 98, status: "ACTIVE" },
        { code: "CS-303", name: "Database Management Systems", domain: "Computer Science", facultyId: "FAC-124", faculty: "Prof. Maria Santos", enrolled: 85, status: "ACTIVE" },
        { code: "IT-102", name: "Web Development Foundations", domain: "Information Technology", facultyId: "FAC-124", faculty: "Prof. Maria Santos", enrolled: 110, status: "ACTIVE" }
    ],

    // Question Bank (Curated by Professors per subject)
    questionBank: [
        {
            id: "Q-101",
            text: "Which of the following data structures operates on a Last-In, First-Out (LIFO) access pattern?",
            type: "Multiple Choice",
            subject: "CS-101",
            difficulty: "Medium",
            options: ["Queue", "Stack", "Singly Linked List", "Binary Search Tree"],
            correctIndex: 1,
            explanation: "A Stack adds and removes elements from the top, following Last-In, First-Out."
        },
        {
            id: "Q-102",
            text: "What is the primary difference between a Compiler and an Interpreter?",
            type: "Multiple Choice",
            subject: "CS-101",
            difficulty: "Medium",
            options: [
                "A compiler translates entire source code to machine code before execution; an interpreter translates and executes line-by-line.",
                "A compiler only executes in cloud environments, while an interpreter requires bare metal hardware.",
                "An interpreter creates a permanent standalone executable binary file.",
                "Compilers cannot catch syntax errors during translation."
            ],
            correctIndex: 0,
            explanation: "Compilers convert the complete high-level program into target machine code, whereas interpreters parse and run code line by line."
        },
        {
            id: "Q-103",
            text: "True or False: JavaScript is a strongly typed, purely compiled language.",
            type: "True/False",
            subject: "CS-101",
            difficulty: "Easy",
            options: ["True", "False"],
            correctIndex: 1,
            explanation: "JavaScript is dynamically typed and interpreted/JIT compiled."
        },
        {
            id: "Q-104",
            text: "What is the time complexity to access an element at a known index in an Array?",
            type: "Multiple Choice",
            subject: "CS-202",
            difficulty: "Easy",
            options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
            correctIndex: 0,
            explanation: "Arrays support constant time O(1) random access via memory offset calculation."
        },
        {
            id: "Q-105",
            text: "Which protocol is utilized to transfer encrypted hypertext files securely over the web?",
            type: "Multiple Choice",
            subject: "IT-102",
            difficulty: "Easy",
            options: ["FTP", "SMTP", "HTTPS", "SSH"],
            correctIndex: 2,
            explanation: "HTTPS encrypts HTTP requests and responses using TLS/SSL."
        },
        {
            id: "Q-106",
            text: "Which SQL clause is used to filter records resulting from an aggregate function like COUNT() or AVG()?",
            type: "Multiple Choice",
            subject: "CS-303",
            difficulty: "Medium",
            options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
            correctIndex: 1,
            explanation: "HAVING filters aggregate results, whereas WHERE filters individual rows prior to grouping."
        },
        {
            id: "Q-107",
            text: "What is the worst-case time complexity of QuickSort without randomized pivot selection?",
            type: "Multiple Choice",
            subject: "CS-202",
            difficulty: "Hard",
            options: ["O(n log n)", "O(n)", "O(n^2)", "O(log n)"],
            correctIndex: 2,
            explanation: "Unbalanced partitions yield quadratic O(n^2) time complexity."
        },
        {
            id: "Q-108",
            text: "In Human-Computer Interaction (HCI), what does Nielsen's heuristic 'Visibility of System Status' dictate?",
            type: "Multiple Choice",
            subject: "CS-101",
            difficulty: "Medium",
            options: [
                "The system should always keep users informed about what is going on, through appropriate feedback within a reasonable time.",
                "The system must hide backend computation details completely and never show timers or progress bars.",
                "Users should have full sudo administrator privileges at all times.",
                "Interfaces must use high contrast neon colors exclusively."
            ],
            correctIndex: 0,
            explanation: "Immediate feedback (e.g., auto-saved status, countdown timer) keeps the user confident and oriented."
        },
        {
            id: "Q-109",
            text: "Explain normalized third normal form (3NF) relational constraints.",
            type: "Essay",
            subject: "CS-303",
            difficulty: "Hard",
            options: [],
            correctIndex: null,
            explanation: "A table is in 3NF if it is in 2NF and non-key attributes have no transitive dependencies on the primary key."
        },
        {
            id: "Q-110",
            text: "Which tree traversal technique yields nodes in ascending order in a Binary Search Tree (BST)?",
            type: "Multiple Choice",
            subject: "CS-202",
            difficulty: "Medium",
            options: ["Pre-order (Root, Left, Right)", "In-order (Left, Root, Right)", "Post-order (Left, Right, Root)", "Breadth-First Search"],
            correctIndex: 1,
            explanation: "In-order traversal visits left subtree, root, then right subtree in ascending order."
        },
        {
            id: "Q-111",
            text: "Which HTTP status code signifies that a request lacks valid authentication credentials?",
            type: "Multiple Choice",
            subject: "IT-102",
            difficulty: "Easy",
            options: ["200 OK", "401 Unauthorized", "404 Not Found", "500 Internal Server Error"],
            correctIndex: 1,
            explanation: "HTTP 401 signifies that authentication is required."
        },
        {
            id: "Q-112",
            text: "True or False: In a relational database, a Primary Key allows duplicate or NULL values.",
            type: "True/False",
            subject: "CS-303",
            difficulty: "Easy",
            options: ["True", "False"],
            correctIndex: 1,
            explanation: "A Primary Key must be unique and cannot contain NULL values."
        },
        {
            id: "Q-113",
            text: "Which of the following sorting algorithms is stable and guarantees O(n log n) in all cases?",
            type: "Multiple Choice",
            subject: "CS-202",
            difficulty: "Medium",
            options: ["Merge Sort", "QuickSort", "Selection Sort", "Bubble Sort"],
            correctIndex: 0,
            explanation: "Merge sort guarantees O(n log n) worst-case time and maintains relative order of equal elements."
        },
        {
            id: "Q-114",
            text: "What does the ACID acronym stand for in Database Transactions?",
            type: "Multiple Choice",
            subject: "CS-303",
            difficulty: "Medium",
            options: [
                "Atomicity, Consistency, Isolation, Durability",
                "Authentication, Ciphering, Integrity, Delivery",
                "Allocation, Compilation, Indexing, Deletion",
                "Asynchronous, Clustered, Integrated, Distributed"
            ],
            correctIndex: 0,
            explanation: "ACID guarantees transactional reliability in databases."
        },
        {
            id: "Q-115",
            text: "Which CSS layout model is specifically engineered for one-dimensional layouts (row or column)?",
            type: "Multiple Choice",
            subject: "IT-102",
            difficulty: "Easy",
            options: ["CSS Grid", "Flexbox (Flexible Box)", "Float layout", "Table layout"],
            correctIndex: 1,
            explanation: "Flexbox specializes in 1D space distribution."
        },
        {
            id: "Q-116",
            text: "Explain the time complexity and mechanics of a binary search algorithm on a sorted list.",
            type: "Essay",
            subject: "CS-101",
            difficulty: "Hard",
            options: [],
            correctIndex: null,
            explanation: "Binary search cuts the search space in half with each iteration, achieving O(log n)."
        },
        {
            id: "Q-117",
            text: "True or False: A Queue operates on a First-In, First-Out (FIFO) access order.",
            type: "True/False",
            subject: "CS-101",
            difficulty: "Easy",
            options: ["True", "False"],
            correctIndex: 0,
            explanation: "Queues add at the rear and remove from the front (FIFO)."
        },
        {
            id: "Q-118",
            text: "Which software design principle states that classes should be open for extension, but closed for modification?",
            type: "Multiple Choice",
            subject: "CS-101",
            difficulty: "Medium",
            options: ["Single Responsibility Principle", "Open/Closed Principle", "Liskov Substitution Principle", "Interface Segregation"],
            correctIndex: 1,
            explanation: "The Open/Closed Principle allows extending behavior without editing tested code."
        },
        {
            id: "Q-119",
            text: "What is the primary function of the Domain Name System (DNS)?",
            type: "Multiple Choice",
            subject: "IT-102",
            difficulty: "Easy",
            options: [
                "Translating human-friendly domain names to IP addresses",
                "Encrypting email traffic",
                "Compiling C++ programs",
                "Managing database backups"
            ],
            correctIndex: 0,
            explanation: "DNS maps readable domain names to numerical IP addresses."
        },
        {
            id: "Q-120",
            text: "In online examination integrity, what is the primary purpose of dynamic session heartbeats?",
            type: "Multiple Choice",
            subject: "CS-101",
            difficulty: "Medium",
            options: [
                "To continuously verify active candidate presence and save progress dynamically to avoid data loss",
                "To increase student CPU usage artificially",
                "To erase answers if the student pauses thinking",
                "To change question order every 5 seconds"
            ],
            correctIndex: 0,
            explanation: "Heartbeats ensure session persistence and seamless recovery in case of connection dropouts."
        }
    ],

    // Assessments / Exams List (For Students to take and Professors to manage)
    exams: [
        {
            id: "EXAM-2024-01",
            code: "CS-202",
            title: "CS202 - Data Structures & Algorithms Quiz",
            subjectName: "Data Structures & Algorithms",
            professor: "Prof. Maria Santos",
            durationMins: 45,
            totalItems: 15,
            passingScore: 60,
            status: "AVAILABLE", // AVAILABLE, UPCOMING, COMPLETED
            scheduledTime: "Available Now",
            deadline: "Today, 11:59 PM",
            domain: "Computer Science",
            instructions: [
                "No tab or window switching: Browser activity is continuously tracked by the proctoring engine.",
                "Automated session backup: Answers are saved dynamically as you select them.",
                "System Timeout: Once 45 minutes elapse, your exam sheet submits automatically. Unanswered questions count as zero.",
                "Sequential Submission: Once you submit the exam, your attempt is final and cannot be reopened."
            ]
        },
        {
            id: "EXAM-2024-02",
            code: "CS-101",
            title: "CS101 - Midterm Examination",
            subjectName: "Introduction to Computing",
            professor: "Dr. Rachel Green",
            durationMins: 60,
            totalItems: 20,
            passingScore: 70,
            status: "UPCOMING",
            scheduledTime: "Today, 2:00 PM (Starts in 2 hours)",
            deadline: "Today, 4:00 PM",
            domain: "Computer Science Basics",
            instructions: [
                "No tab or window switching: Switching tabs more than 3 times triggers an automatic exam lock-out.",
                "Automated session backup: Answers are saved dynamically. In case of network drops, reconnect to resume.",
                "System Timeout: Once 60 minutes elapse, your exam sheet submits automatically.",
                "Final Submission: You cannot return to the exam after submitting."
            ]
        },
        {
            id: "EXAM-2024-03",
            code: "DB-101",
            title: "CS303 - Database Systems Midterm Exam",
            subjectName: "Database Management Systems",
            professor: "Prof. Maria Santos",
            durationMins: 60,
            totalItems: 20,
            passingScore: 70,
            status: "COMPLETED",
            scheduledTime: "Completed on Jan 14",
            deadline: "Expired",
            domain: "Database Systems",
            instructions: []
        }
    ],

    // Student Exam Submission Records & Grade History
    studentHistory: [
        {
            id: "HIST-01",
            title: "CS101 - Final Assessment",
            subjectCode: "CS-101",
            domain: "Computer Science",
            date: "Jan 12, 2025",
            score: "48 / 50",
            percentage: 96,
            equivalentGrade: "1.00 (Excellent / A+)",
            status: "GRADED",
            breakdown: [
                { section: "Section 1 (Multiple Choice)", score: "28 / 30 correct" },
                { section: "Section 2 (Short Answer Essay)", score: "20 / 20 score (Graded by Dr. Rachel Green)" }
            ],
            certificateAvailable: true
        },
        {
            id: "HIST-02",
            title: "CS101 - Quiz 3: Algorithms",
            subjectCode: "CS-101",
            domain: "Computer Science",
            date: "Dec 18, 2024",
            score: "12 / 15",
            percentage: 80,
            equivalentGrade: "2.00 (Satisfactory / B)",
            status: "GRADED",
            breakdown: [
                { section: "Section 1 (Algorithmic Logic)", score: "12 / 15 correct" }
            ],
            certificateAvailable: false
        },
        {
            id: "HIST-03",
            title: "CS101 - Quiz 2: Hardware",
            subjectCode: "CS-101",
            domain: "Computer Science",
            date: "Nov 22, 2024",
            score: "Pending",
            percentage: null,
            equivalentGrade: "Under Professor Review",
            status: "PENDING_GRADING",
            breakdown: [
                { section: "Manual assessment in progress by professor", score: "—" }
            ],
            certificateAvailable: false
        },
        {
            id: "HIST-04",
            title: "CS303 - Midterm Exam",
            subjectCode: "CS-303",
            domain: "Database Systems",
            date: "Oct 15, 2024",
            score: "42 / 50",
            percentage: 84,
            equivalentGrade: "1.75 (Very Good / B+)",
            status: "GRADED",
            breakdown: [
                { section: "Section 1 (SQL Queries & Relational Algebra)", score: "42 / 50 correct" }
            ],
            certificateAvailable: true
        },
        {
            id: "HIST-05",
            title: "CS101 - Quiz 1: Software",
            subjectCode: "CS-101",
            domain: "Computer Science",
            date: "Sep 10, 2024",
            score: "14 / 15",
            percentage: 93,
            equivalentGrade: "1.25 (Superior / A)",
            status: "GRADED",
            breakdown: [
                { section: "Section 1 (Foundations)", score: "14 / 15 correct" }
            ],
            certificateAvailable: false
        }
    ],

    // Professor Student Submissions Table & Grade Conversion
    teacherResults: [
        { studentId: "STU-501", name: "Alice Jenkins", rawScore: "45 / 50", percentage: 90, grade: "1.25 (A)", status: "PASSED", gradeStatus: "FINALIZED", date: "2025-01-20" },
        { studentId: "STU-502", name: "David Miller", rawScore: "42 / 50", percentage: 84, grade: "1.75 (B+)", status: "PASSED", gradeStatus: "FINALIZED", date: "2025-01-20" },
        { studentId: "STU-503", name: "Emily Watson", rawScore: "29 / 50", percentage: 58, grade: "5.00 (F)", status: "FAILED", gradeStatus: "PENDING_REVIEW", date: "2025-01-20" },
        { studentId: "STU-504", name: "Franklin Roosevelt", rawScore: "48 / 50", percentage: 96, grade: "1.00 (A+)", status: "PASSED", gradeStatus: "FINALIZED", date: "2025-01-19" },
        { studentId: "STU-505", name: "Gary Oldman", rawScore: "38 / 50", percentage: 76, grade: "2.25 (C+)", status: "PASSED", gradeStatus: "FINALIZED", date: "2025-01-19" },
        { studentId: "STU-506", name: "Grace Hopper", rawScore: "49 / 50", percentage: 98, grade: "1.00 (A+)", status: "PASSED", gradeStatus: "FINALIZED", date: "2025-01-19" },
        { studentId: "STU-507", name: "Ken Thompson", rawScore: "34 / 50", percentage: 68, grade: "2.75 (C)", status: "PASSED", gradeStatus: "PENDING_REVIEW", date: "2025-01-18" }
    ],

    // Student & Cohort Registry (Admin Cohort Governance)
    students: [
        { id: "STU-2024-0892", name: "Ythan S.", email: "student@veritest.edu", section: "3BSCS-1", enrolledSubjects: ["CS-101", "CS-202", "CS-303"], status: "ACTIVE" },
        { id: "STU-501", name: "Alice Jenkins", email: "alice.j@veritest.edu", section: "3BSCS-1", enrolledSubjects: ["CS-101", "CS-202"], status: "ACTIVE" },
        { id: "STU-502", name: "David Miller", email: "david.m@veritest.edu", section: "3BSCS-1", enrolledSubjects: ["CS-202", "CS-303"], status: "ACTIVE" },
        { id: "STU-503", name: "Emily Watson", email: "emily.w@veritest.edu", section: "3BSCS-2", enrolledSubjects: ["CS-101", "CS-202"], status: "ACTIVE" },
        { id: "STU-504", name: "Franklin Roosevelt", email: "franklin.r@veritest.edu", section: "3BSCS-1", enrolledSubjects: ["CS-101", "CS-303"], status: "ACTIVE" },
        { id: "STU-505", name: "Gary Oldman", email: "gary.o@veritest.edu", section: "3BSCS-2", enrolledSubjects: ["CS-202", "IT-102"], status: "ACTIVE" },
        { id: "STU-506", name: "Grace Hopper", email: "grace.h@veritest.edu", section: "3BSCS-1", enrolledSubjects: ["CS-101", "CS-202", "CS-303"], status: "ACTIVE" },
        { id: "STU-507", name: "Ken Thompson", email: "ken.t@veritest.edu", section: "3BSCS-2", enrolledSubjects: ["CS-202", "CS-303"], status: "ACTIVE" }
    ],

    // Institutional Exam & Proctoring Governance Policies
    systemPolicies: {
        academicTerm: "AY 2026–2027 • 1st Semester",
        maxAttemptsDefault: 1,
        heartbeatSeconds: 15,
        tabSwitchLimit: 3,
        autoSubmitOnViolation: true
    },

    // Security Audit Logs (Administrator Oversight)
    auditLogs: [
        { timestamp: "2025-02-14 14:22:15", user: "Admin (Higher Authority)", action: "ASSIGN_SUBJECT", module: "Curriculum", details: "Assigned CS-101 (Intro to Programming) to Dr. Rachel Green" },
        { timestamp: "2025-02-14 13:10:04", user: "Admin (Higher Authority)", action: "ADD_FACULTY", module: "Faculty", details: "Created professor entry FAC-124 for Prof. Maria Santos" },
        { timestamp: "2025-02-14 11:45:50", user: "Admin (Higher Authority)", action: "ARCHIVE_SUBJECT", module: "Curriculum", details: "Archived MECH-205 due to curriculum refresh" },
        { timestamp: "2025-02-14 09:12:12", user: "Prof. Maria Santos", action: "CONVERT_GRADES", module: "Grades", details: "Converted CS202 Quiz results to institutional letter grades (38 students)" },
        { timestamp: "2025-02-14 08:58:22", user: "System Proctor", action: "COHORT_SYNC", module: "System", details: "Synced CS-101 student examination roster with main registry (124 users)" },
        { timestamp: "2025-02-14 08:30:10", user: "System Proctor", action: "TAB_SWITCH_ALERT", module: "Security", details: "Candidate STU-503 triggered 1st background tab switch alert in CS-101" }
    ],

    // Pre-configured accounts for 1-click Demo Switching
    demoAccounts: {
        student: {
            role: "student",
            name: "Ythan S. (Student)",
            id: "STU-2024-0892",
            email: "student@veritest.edu",
            program: "BS Computer Science",
            year: "3rd Year"
        },
        teacher: {
            role: "teacher",
            name: "Prof. Maria Santos",
            id: "FAC-124",
            email: "maria.santos@veritest.edu",
            dept: "Computer Science",
            room: "Academic Complex - Room 304",
            phone: "+1 (555) 234-5678",
            consultation: "Mon/Wed 2:00 PM - 4:00 PM"
        },
        admin: {
            role: "admin",
            name: "System Administrator",
            id: "ADM-001",
            email: "admin@veritest.edu",
            dept: "Academic Affairs & Examination Governance"
        }
    }
};

window.VERITEST_DATA = INITIAL_DATA;
// Backward compatibility
window.EDUDATA = INITIAL_DATA;
