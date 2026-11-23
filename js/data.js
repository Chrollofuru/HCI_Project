/**
 * VeriTest - Online Examination & Assessment System
 * Mock Database & State Management (HCI Project Prototype)
 * Includes "Exam Leader / Exam Maker" Academic Distribution Architecture
 */

const INITIAL_DATA = {
    // Current active user / session
    currentUser: null,

    // Faculty / Professor Registry (Admin View & Governance)
    faculty: [
        { id: "FAC-012", name: "Dr. Rachel Green", email: "rachel.green@veritest.edu", dept: "Computer Science", subjects: ["CS-101"], subjectsCount: 1, status: "ACTIVE" },
        { id: "FAC-044", name: "Prof. Arthur Dent", email: "arthur.dent@veritest.edu", dept: "Mathematics", subjects: ["CS-101", "MATH-302"], subjectsCount: 2, status: "ACTIVE" },
        { id: "FAC-081", name: "Dr. Sarah Connor", email: "sarah.connor@veritest.edu", dept: "Mechanical Eng.", subjects: [], subjectsCount: 0, status: "ARCHIVE" },
        { id: "FAC-095", name: "Prof. Charles Xavier", email: "charles.xavier@veritest.edu", dept: "Biological Sciences", subjects: ["BIO-109"], subjectsCount: 1, status: "ACTIVE" },
        { id: "FAC-102", name: "Dr. Bruce Banner", email: "bruce.banner@veritest.edu", dept: "Nuclear Physics", subjects: ["PHY-401"], subjectsCount: 1, status: "ACTIVE" },
        { id: "FAC-115", name: "Dr. Alan Turing", email: "alan.turing@veritest.edu", dept: "Artificial Intelligence", subjects: ["CS-202"], subjectsCount: 1, status: "ACTIVE" },
        { id: "FAC-124", name: "Prof. Maria Santos", email: "maria.santos@veritest.edu", dept: "Computer Science", subjects: ["CS-101", "CS-202", "CS-303", "IT-102"], subjectsCount: 4, status: "ACTIVE" }
    ],

    // Subject Directory (With Multi-Professor Teaching Teams & Appointed Exam Leaders)
    subjects: [
        {
            code: "CS-101",
            name: "Introduction to Programming",
            domain: "Computer Science",
            // Multi-professor assignment: 3 professors teach sections of CS-101!
            professors: [
                { id: "FAC-012", name: "Dr. Rachel Green", role: "EXAM_LEADER", section: "Section A" },
                { id: "FAC-124", name: "Prof. Maria Santos", role: "CO_PROFESSOR", section: "Section B" },
                { id: "FAC-044", name: "Prof. Arthur Dent", role: "CO_PROFESSOR", section: "Section C" }
            ],
            examLeaderId: "FAC-012",
            examLeaderName: "Dr. Rachel Green",
            enrolled: 124,
            masterExamId: "EXAM-2024-02",
            masterExamTitle: "CS101 - Midterm Examination",
            distributionStatus: "DISTRIBUTED_TO_ALL",
            status: "ACTIVE"
        },
        {
            code: "CS-202",
            name: "Data Structures & Algorithms",
            domain: "Computer Science",
            // Multi-professor assignment: Prof. Maria Santos is the appointed Exam Leader!
            professors: [
                { id: "FAC-124", name: "Prof. Maria Santos", role: "EXAM_LEADER", section: "Section A" },
                { id: "FAC-115", name: "Dr. Alan Turing", role: "CO_PROFESSOR", section: "Section B" }
            ],
            examLeaderId: "FAC-124",
            examLeaderName: "Prof. Maria Santos",
            enrolled: 98,
            masterExamId: "EXAM-2024-01",
            masterExamTitle: "CS202 - Data Structures & Algorithms Quiz",
            distributionStatus: "DISTRIBUTED_TO_ALL",
            status: "ACTIVE"
        },
        {
            code: "CS-303",
            name: "Database Management Systems",
            domain: "Computer Science",
            professors: [
                { id: "FAC-124", name: "Prof. Maria Santos", role: "EXAM_LEADER", section: "Section A" }
            ],
            examLeaderId: "FAC-124",
            examLeaderName: "Prof. Maria Santos",
            enrolled: 85,
            masterExamId: "EXAM-2024-03",
            masterExamTitle: "CS303 - Database Systems Midterm Exam",
            distributionStatus: "SOLO_COURSE",
            status: "ACTIVE"
        },
        {
            code: "IT-102",
            name: "Web Development Foundations",
            domain: "Information Technology",
            professors: [
                { id: "FAC-124", name: "Prof. Maria Santos", role: "EXAM_LEADER", section: "Section A" }
            ],
            examLeaderId: "FAC-124",
            examLeaderName: "Prof. Maria Santos",
            enrolled: 110,
            masterExamId: null,
            masterExamTitle: null,
            distributionStatus: "PENDING_CREATION",
            status: "ACTIVE"
        },
        {
            code: "MATH-302",
            name: "Advanced Linear Algebra",
            domain: "Mathematics",
            professors: [
                { id: "FAC-044", name: "Prof. Arthur Dent", role: "EXAM_LEADER", section: "Section A" }
            ],
            examLeaderId: "FAC-044",
            examLeaderName: "Prof. Arthur Dent",
            enrolled: 84,
            masterExamId: null,
            masterExamTitle: null,
            distributionStatus: "SOLO_COURSE",
            status: "ACTIVE"
        },
        {
            code: "BIO-109",
            name: "Principles of Gen Biology",
            domain: "Biology",
            professors: [
                { id: "FAC-095", name: "Prof. Charles Xavier", role: "EXAM_LEADER", section: "Section A" }
            ],
            examLeaderId: "FAC-095",
            examLeaderName: "Prof. Charles Xavier",
            enrolled: 192,
            masterExamId: null,
            masterExamTitle: null,
            distributionStatus: "SOLO_COURSE",
            status: "ACTIVE"
        },
        {
            code: "PHY-401",
            name: "Quantum Mechanics II",
            domain: "Nuclear Physics",
            professors: [
                { id: "FAC-102", name: "Dr. Bruce Banner", role: "EXAM_LEADER", section: "Section A" }
            ],
            examLeaderId: "FAC-102",
            examLeaderName: "Dr. Bruce Banner",
            enrolled: 42,
            masterExamId: null,
            masterExamTitle: null,
            distributionStatus: "SOLO_COURSE",
            status: "ACTIVE"
        },
        {
            code: "MECH-205",
            name: "Fluid Dynamics",
            domain: "Mechanical Eng.",
            professors: [],
            examLeaderId: null,
            examLeaderName: "— Unassigned —",
            enrolled: 0,
            masterExamId: null,
            masterExamTitle: null,
            distributionStatus: "ARCHIVED",
            status: "ARCHIVE"
        }
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

    // Assessments / Exams List (Master Exams created by Exam Leaders & Distributed)
    exams: [
        {
            id: "EXAM-2024-01",
            code: "CS-202",
            title: "CS202 - Data Structures & Algorithms Quiz",
            subjectName: "Data Structures & Algorithms",
            isMasterExam: true,
            examLeaderId: "FAC-124",
            examLeaderName: "Prof. Maria Santos",
            professor: "Prof. Maria Santos (Exam Leader)",
            distributedTo: [
                { name: "Prof. Maria Santos", section: "Section A", status: "SYNCED" },
                { name: "Dr. Alan Turing", section: "Section B", status: "DEPLOYED" }
            ],
            durationMins: 45,
            totalItems: 15,
            passingScore: 60,
            status: "AVAILABLE",
            scheduledTime: "Available Now",
            deadline: "Today, 11:59 PM",
            domain: "Computer Science",
            instructions: [
                "No tab or window switching: Browser activity is continuously tracked by the proctoring engine.",
                "Automated session backup: Answers are saved dynamically as you select them.",
                "Standardized Master Exam: This exam was authored by Exam Leader Prof. Maria Santos and distributed across all CS202 sections.",
                "Sequential Submission: Once you submit the exam, your attempt is final and cannot be reopened."
            ]
        },
        {
            id: "EXAM-2024-02",
            code: "CS-101",
            title: "CS101 - Midterm Examination",
            subjectName: "Introduction to Computing",
            isMasterExam: true,
            examLeaderId: "FAC-012",
            examLeaderName: "Dr. Rachel Green",
            professor: "Dr. Rachel Green (Exam Leader)",
            distributedTo: [
                { name: "Dr. Rachel Green", section: "Section A", status: "DEPLOYED" },
                { name: "Prof. Maria Santos", section: "Section B", status: "RECEIVED_PENDING_DEPLOY" },
                { name: "Prof. Arthur Dent", section: "Section C", status: "DEPLOYED" }
            ],
            durationMins: 60,
            totalItems: 20,
            passingScore: 70,
            status: "UPCOMING",
            scheduledTime: "Today, 2:00 PM (Starts in 2 hours)",
            deadline: "Today, 4:00 PM",
            domain: "Computer Science Basics",
            instructions: [
                "Standardized Master Exam: Authored by Exam Leader Dr. Rachel Green and distributed to all CS-101 sections.",
                "No tab or window switching: Switching tabs more than 3 times triggers an automatic exam lock-out.",
                "Automated session backup: Answers are saved dynamically. In case of network drops, reconnect to resume.",
                "Final Submission: You cannot return to the exam after submitting."
            ]
        },
        {
            id: "EXAM-2024-03",
            code: "CS-303",
            title: "CS303 - Database Systems Midterm Exam",
            subjectName: "Database Management Systems",
            isMasterExam: true,
            examLeaderId: "FAC-124",
            examLeaderName: "Prof. Maria Santos",
            professor: "Prof. Maria Santos (Solo Instructor & Leader)",
            distributedTo: [
                { name: "Prof. Maria Santos", section: "Section A", status: "COMPLETED" }
            ],
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
            masterExamNote: "Standardized Master Exam authored by Exam Leader Dr. Rachel Green",
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
            masterExamNote: "Standardized Master Exam",
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
            masterExamNote: "Standardized Master Exam",
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
            masterExamNote: "Authored by Exam Leader Prof. Maria Santos",
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
            masterExamNote: "Standardized Master Exam",
            status: "GRADED",
            breakdown: [
                { section: "Section 1 (Foundations)", score: "14 / 15 correct" }
            ],
            certificateAvailable: false
        }
    ],

    // Professor Student Submissions Table & Grade Conversion
    teacherResults: [
        { studentId: "STU-501", name: "Alice Jenkins", section: "CS101 - Section B", rawScore: "45 / 50", percentage: 90, grade: "1.25 (A)", status: "PASSED", gradeStatus: "FINALIZED", date: "2025-01-20" },
        { studentId: "STU-502", name: "David Miller", section: "CS101 - Section B", rawScore: "42 / 50", percentage: 84, grade: "1.75 (B+)", status: "PASSED", gradeStatus: "FINALIZED", date: "2025-01-20" },
        { studentId: "STU-503", name: "Emily Watson", section: "CS101 - Section B", rawScore: "29 / 50", percentage: 58, grade: "5.00 (F)", status: "FAILED", gradeStatus: "PENDING_REVIEW", date: "2025-01-20" },
        { studentId: "STU-504", name: "Franklin Roosevelt", section: "CS101 - Section B", rawScore: "48 / 50", percentage: 96, grade: "1.00 (A+)", status: "PASSED", gradeStatus: "FINALIZED", date: "2025-01-19" },
        { studentId: "STU-505", name: "Gary Oldman", section: "CS202 - Section A", rawScore: "38 / 50", percentage: 76, grade: "2.25 (C+)", status: "PASSED", gradeStatus: "FINALIZED", date: "2025-01-19" },
        { studentId: "STU-506", name: "Grace Hopper", section: "CS202 - Section A", rawScore: "49 / 50", percentage: 98, grade: "1.00 (A+)", status: "PASSED", gradeStatus: "FINALIZED", date: "2025-01-19" },
        { studentId: "STU-507", name: "Ken Thompson", section: "CS202 - Section A", rawScore: "34 / 50", percentage: 68, grade: "2.75 (C)", status: "PASSED", gradeStatus: "PENDING_REVIEW", date: "2025-01-18" }
    ],

    // Security Audit Logs (Administrator Oversight & Exam Leader Traceability)
    auditLogs: [
        { timestamp: "2025-02-14 15:30:00", user: "Admin (Higher Authority)", action: "APPOINT_EXAM_LEADER", module: "Curriculum", details: "Appointed Dr. Rachel Green as EXAM LEADER for multi-section course CS-101" },
        { timestamp: "2025-02-14 15:15:22", user: "Dr. Rachel Green (Leader)", action: "DISTRIBUTE_MASTER_EXAM", module: "Exams", details: "Distributed Master Midterm Exam 'CS101' to co-professors Prof. Maria Santos and Prof. Arthur Dent" },
        { timestamp: "2025-02-14 14:45:10", user: "Admin (Higher Authority)", action: "APPOINT_EXAM_LEADER", module: "Curriculum", details: "Appointed Prof. Maria Santos as EXAM LEADER for multi-section course CS-202" },
        { timestamp: "2025-02-14 13:10:04", user: "Admin (Higher Authority)", action: "ADD_FACULTY", module: "Faculty", details: "Created professor entry FAC-124 for Prof. Maria Santos" },
        { timestamp: "2025-02-14 09:12:12", user: "Prof. Maria Santos", action: "CONVERT_GRADES", module: "Grades", details: "Converted CS202 Section A quiz results to institutional letter grades (38 students)" },
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
            consultation: "Mon/Wed 2:00 PM - 4:00 PM",
            // Notice: Maria Santos is Exam Leader for CS-202 & CS-303, and Co-Professor for CS-101!
            leadershipSummary: "Exam Leader for CS-202 & CS-303 • Teaching Faculty for CS-101"
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
