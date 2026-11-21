/**
 * EduExam / NEUVLE Online Examination System - Mock Database & State Management
 * Designed for HCI Project Demonstration
 */

const INITIAL_DATA = {
    // Current active user / session
    currentUser: null, // null = guest / on landing page. Or { role: 'student'|'teacher'|'admin', name, email, id, avatar }

    // Faculty Registry (Admin & System View)
    faculty: [
        { id: "FAC-012", name: "Dr. Rachel Green", email: "rachel.green@examportal.edu", dept: "Computer Science", subjectsCount: 3, status: "ACTIVE" },
        { id: "FAC-044", name: "Prof. Arthur Dent", email: "arthur.dent@examportal.edu", dept: "Mathematics", subjectsCount: 2, status: "ACTIVE" },
        { id: "FAC-081", name: "Dr. Sarah Connor", email: "sarah.connor@examportal.edu", dept: "Mechanical Eng.", subjectsCount: 0, status: "ARCHIVE" },
        { id: "FAC-095", name: "Prof. Charles Xavier", email: "charles.xavier@examportal.edu", dept: "Neurology & Bio", subjectsCount: 4, status: "ACTIVE" },
        { id: "FAC-102", name: "Dr. Bruce Banner", email: "bruce.banner@examportal.edu", dept: "Nuclear Physics", subjectsCount: 1, status: "ACTIVE" },
        { id: "FAC-115", name: "Dr. Alan Turing", email: "alan.turing@examportal.edu", dept: "Artificial Intelligence", subjectsCount: 3, status: "ACTIVE" },
        { id: "FAC-124", name: "Prof. Maria Santos", email: "maria.santos@examportal.edu", dept: "Computer Science", subjectsCount: 4, status: "ACTIVE" }
    ],

    // Subject Directory (Curriculum & Domain registry)
    subjects: [
        { code: "CS-101", name: "Introduction to Programming", domain: "Computer Science", faculty: "Dr. Rachel Green", enrolled: 124, status: "ACTIVE" },
        { code: "MATH-302", name: "Advanced Linear Algebra", domain: "Mathematics", faculty: "Prof. Arthur Dent", enrolled: 84, status: "ACTIVE" },
        { code: "BIO-109", name: "Principles of Gen Biology", domain: "Biology", faculty: "Prof. Charles Xavier", enrolled: 192, status: "ACTIVE" },
        { code: "MECH-205", name: "Fluid Dynamics", domain: "Mechanical Eng.", faculty: "— Unassigned —", enrolled: 0, status: "ARCHIVE" },
        { code: "PHY-401", name: "Quantum Mechanics II", domain: "Nuclear Physics", faculty: "Dr. Bruce Banner", enrolled: 42, status: "ACTIVE" },
        { code: "CS-202", name: "Data Structures & Algorithms", domain: "Computer Science", faculty: "Prof. Maria Santos", enrolled: 98, status: "ACTIVE" },
        { code: "CS-303", name: "Database Management Systems", domain: "Computer Science", faculty: "Prof. Maria Santos", enrolled: 85, status: "ACTIVE" },
        { code: "IT-102", name: "Web Development Foundations", domain: "Information Technology", faculty: "Prof. Maria Santos", enrolled: 110, status: "ACTIVE" }
    ],

    // Question Bank (Teacher Management & Exam Generator)
    questionBank: [
        {
            id: "Q-101",
            text: "Which of the following data structures operates on a Last-In, First-Out (LIFO) access pattern?",
            type: "Multiple Choice",
            subject: "CS-101",
            difficulty: "Medium",
            options: ["Queue", "Stack", "Singly Linked List", "Binary Search Tree"],
            correctIndex: 1,
            explanation: "A Stack adds and removes elements from the same top end, making the last inserted element the first one removed (LIFO)."
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
            explanation: "JavaScript is dynamically and loosely typed, traditionally interpreted with Just-In-Time (JIT) compilation in modern runtimes."
        },
        {
            id: "Q-104",
            text: "What is the time complexity to access an element at a known index in a contiguous Array?",
            type: "Multiple Choice",
            subject: "CS-202",
            difficulty: "Easy",
            options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
            correctIndex: 0,
            explanation: "Arrays support constant time O(1) random access via base address arithmetic (base + index * element_size)."
        },
        {
            id: "Q-105",
            text: "Which protocol is utilized to transfer encrypted hypertext files securely over the World Wide Web?",
            type: "Multiple Choice",
            subject: "IT-102",
            difficulty: "Easy",
            options: ["FTP", "SMTP", "HTTPS", "SSH"],
            correctIndex: 2,
            explanation: "HTTPS (Hypertext Transfer Protocol Secure) uses TLS/SSL encryption to secure communications over the web."
        },
        {
            id: "Q-106",
            text: "Which SQL clause is used to filter records resulting from an aggregate function like COUNT() or AVG()?",
            type: "Multiple Choice",
            subject: "CS-303",
            difficulty: "Medium",
            options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
            correctIndex: 1,
            explanation: "HAVING filters groups created by GROUP BY after aggregate operations, whereas WHERE filters individual rows before aggregation."
        },
        {
            id: "Q-107",
            text: "What is the worst-case time complexity of QuickSort when the pivot chosen is consistently the extreme element without randomization?",
            type: "Multiple Choice",
            subject: "CS-202",
            difficulty: "Hard",
            options: ["O(n log n)", "O(n)", "O(n^2)", "O(log n)"],
            correctIndex: 2,
            explanation: "Unbalanced partition splits reduce QuickSort to quadratic time O(n^2)."
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
            explanation: "Keeping users informed via clear feedback (spinners, countdowns, auto-saved labels) reduces anxiety and cognitive load."
        },
        {
            id: "Q-109",
            text: "Explain normalized third normal form (3NF) relational constraints.",
            type: "Essay",
            subject: "CS-303",
            difficulty: "Hard",
            options: [],
            correctIndex: null,
            explanation: "A relation is in 3NF if it is in 2NF and has no transitive functional dependencies of non-prime attributes on candidate keys."
        },
        {
            id: "Q-110",
            text: "Which tree traversal technique yields nodes in ascending sorted order when applied to a Binary Search Tree (BST)?",
            type: "Multiple Choice",
            subject: "CS-202",
            difficulty: "Medium",
            options: ["Pre-order (Root, Left, Right)", "In-order (Left, Root, Right)", "Post-order (Left, Right, Root)", "Breadth-First Search"],
            correctIndex: 1,
            explanation: "In-order traversal visits left subtree, root, then right subtree, visiting keys in monotonic ascending order in a BST."
        },
        {
            id: "Q-111",
            text: "Which HTTP status code signifies that a requested resource is Unauthorized / requires valid authentication credentials?",
            type: "Multiple Choice",
            subject: "IT-102",
            difficulty: "Easy",
            options: ["200 OK", "401 Unauthorized", "404 Not Found", "500 Internal Server Error"],
            correctIndex: 1,
            explanation: "HTTP 401 indicates that the request has not been applied because it lacks valid authentication credentials for the target resource."
        },
        {
            id: "Q-112",
            text: "True or False: In a relational database, a Primary Key column allows duplicate and NULL values.",
            type: "True/False",
            subject: "CS-303",
            difficulty: "Easy",
            options: ["True", "False"],
            correctIndex: 1,
            explanation: "A primary key constraint enforces uniqueness and implicitly mandates NOT NULL constraints on all defined columns."
        },
        {
            id: "Q-113",
            text: "Which of the following sorting algorithms is stable and guarantees O(n log n) running time in all best, average, and worst cases?",
            type: "Multiple Choice",
            subject: "CS-202",
            difficulty: "Medium",
            options: ["Merge Sort", "QuickSort", "Selection Sort", "Bubble Sort"],
            correctIndex: 0,
            explanation: "Merge Sort consistently divides the array in half and merges sorted halves in O(n log n) time while maintaining stability."
        },
        {
            id: "Q-114",
            text: "What does the ACID acronym stand for in Database Transaction Management?",
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
            explanation: "ACID represents Atomicity, Consistency, Isolation, and Durability - the standard guarantees for reliable database transactions."
        },
        {
            id: "Q-115",
            text: "In web architecture, which CSS layout module is specifically designed for one-dimensional layouts (row OR column)?",
            type: "Multiple Choice",
            subject: "IT-102",
            difficulty: "Easy",
            options: ["CSS Grid", "Flexbox (Flexible Box)", "Float layout", "Table layout"],
            correctIndex: 1,
            explanation: "Flexbox handles 1D layout distribution across a single main axis, while CSS Grid is optimized for 2D row/column systems."
        },
        {
            id: "Q-116",
            text: "Explain the time complexity and mechanics of a binary search algorithm on a sorted sequence.",
            type: "Essay",
            subject: "CS-101",
            difficulty: "Hard",
            options: [],
            correctIndex: null,
            explanation: "Binary search repeatedly divides the search interval in half, achieving logarithmic O(log n) time complexity."
        },
        {
            id: "Q-117",
            text: "True or False: A queue operates on a First-In, First-Out (FIFO) ordering model.",
            type: "True/False",
            subject: "CS-101",
            difficulty: "Easy",
            options: ["True", "False"],
            correctIndex: 0,
            explanation: "Queues enforce FIFO ordering: elements are enqueued at the back and dequeued from the front."
        },
        {
            id: "Q-118",
            text: "Which software design principle states that software entities should be open for extension, but closed for modification?",
            type: "Multiple Choice",
            subject: "CS-101",
            difficulty: "Medium",
            options: ["Single Responsibility Principle", "Open/Closed Principle", "Liskov Substitution Principle", "Interface Segregation"],
            correctIndex: 1,
            explanation: "The Open/Closed Principle (the 'O' in SOLID) requires that software artifacts be open for extension without modifying existing tested code."
        },
        {
            id: "Q-119",
            text: "What is the primary function of the Domain Name System (DNS) on the internet?",
            type: "Multiple Choice",
            subject: "IT-102",
            difficulty: "Easy",
            options: [
                "Translating human-friendly domain names (e.g., example.com) into numerical IP addresses",
                "Encrypting email traffic between universities",
                "Compiling C++ programs into machine instructions",
                "Managing database backups across cloud storage"
            ],
            correctIndex: 0,
            explanation: "DNS acts as the phonebook of the internet, resolving hostnames to IP addresses."
        },
        {
            id: "Q-120",
            text: "In cybersecurity and online exam integrity, what is the purpose of automated session heartbeats?",
            type: "Multiple Choice",
            subject: "CS-101",
            difficulty: "Medium",
            options: [
                "To continuously verify active candidate presence and dynamically synchronize unanswered questions to prevent data loss",
                "To increase student CPU temperature and accelerate tests",
                "To delete answers if the student pauses thinking for 10 seconds",
                "To scramble the teacher's gradebook randomly"
            ],
            correctIndex: 0,
            explanation: "Session heartbeats save progress in real-time and provide proctoring telemetry without interrupting student focus."
        }
    ],

    // Assessments / Exams list for Students & Faculty
    exams: [
        {
            id: "EXAM-2024-01",
            code: "CS-202",
            title: "CS202 - Data Structures & Algorithms Quiz",
            subjectName: "Data Structures & Algorithms",
            teacher: "Prof. Maria Santos",
            durationMins: 45,
            totalItems: 15,
            passingScore: 60,
            status: "AVAILABLE", // AVAILABLE, UPCOMING, COMPLETED
            scheduledTime: "Today, Available Now",
            deadline: "Today, 11:59 PM",
            domain: "Computer Science",
            instructions: [
                "No tab or window switching: Browser activity is continuously logged by security proctor.",
                "Automated session backup: Answers are saved dynamically as you tick them. In case of network drops, reconnect to resume.",
                "System Timeout: Once 45 minutes elapse, your exam sheet submits automatically. Unanswered questions count as zero.",
                "Sequential Submission: Once you submit the exam, your attempt is final and cannot be reopened."
            ]
        },
        {
            id: "EXAM-2024-02",
            code: "CS-101",
            title: "CS101 - Midterm Examination",
            subjectName: "Introduction to Computing",
            teacher: "Dr. Alex Mercer",
            durationMins: 60,
            totalItems: 20,
            passingScore: 70,
            status: "UPCOMING", // Can be unlocked via demo trigger
            scheduledTime: "Today, 2:00 PM (Starts in 2 hours)",
            deadline: "Today, 4:00 PM",
            domain: "Computer Science Basics",
            instructions: [
                "No tab or window switching: Browser activity is logged. Switching tabs more than 3 times triggers lock-out.",
                "Automated session backup: Answers are saved dynamically as you tick them. In case of network drops, reconnect to resume.",
                "System Timeout: Once 60 minutes elapse, your exam sheet submits automatically. Unanswered questions count as zero.",
                "Sequential Submission: Once you submit the exam, your attempt is final and you cannot go back."
            ]
        },
        {
            id: "EXAM-2024-03",
            code: "DB-101",
            title: "DB101 - Database Systems Final Mock",
            subjectName: "Database Systems",
            teacher: "Prof. Juan Luna",
            durationMins: 60,
            totalItems: 20,
            passingScore: 70,
            status: "COMPLETED",
            scheduledTime: "Completed on Jan 14, 2025",
            deadline: "Expired",
            domain: "Database Systems",
            instructions: []
        }
    ],

    // Historical Student Submissions & Grades
    studentHistory: [
        {
            id: "HIST-01",
            title: "CS101 - Final Assessment",
            domain: "Intro to Computer Science",
            date: "Jan 12, 2025",
            score: "48 / 50",
            percentage: 96,
            status: "GRADED",
            breakdown: [
                { section: "Section 1 (Multiple Choice)", score: "28 / 30 correct" },
                { section: "Section 2 (Short Answer Essay)", score: "20 / 20 score (Graded by Dr. Alex Mercer)" }
            ],
            certificateAvailable: true
        },
        {
            id: "HIST-02",
            title: "CS101 - Quiz 3: Algorithms",
            domain: "Intro to Computer Science",
            date: "Dec 18, 2024",
            score: "12 / 15",
            percentage: 80,
            status: "GRADED",
            breakdown: [
                { section: "Section 1 (Algorithmic Logic)", score: "12 / 15 correct" }
            ],
            certificateAvailable: false
        },
        {
            id: "HIST-03",
            title: "CS101 - Quiz 2: Hardware",
            domain: "Intro to Computer Science",
            date: "Nov 22, 2024",
            score: "Pending",
            percentage: null,
            status: "PENDING_GRADING",
            breakdown: [
                { section: "Manual assessment in progress by instructor", score: "—" }
            ],
            certificateAvailable: false
        },
        {
            id: "HIST-04",
            title: "DB101 - Midterm Exam",
            domain: "Database Systems",
            date: "Oct 15, 2024",
            score: "42 / 50",
            percentage: 84,
            status: "GRADED",
            breakdown: [
                { section: "Section 1 (SQL Queries & Relational Algebra)", score: "42 / 50 correct" }
            ],
            certificateAvailable: true
        },
        {
            id: "HIST-05",
            title: "CS101 - Quiz 1: Software",
            domain: "Intro to Computer Science",
            date: "Sep 10, 2024",
            score: "14 / 15",
            percentage: 93,
            status: "GRADED",
            breakdown: [
                { section: "Section 1 (Foundations)", score: "14 / 15 correct" }
            ],
            certificateAvailable: false
        }
    ],

    // Teacher Student Submissions Table (for Examination Results page)
    teacherResults: [
        { studentId: "STU-501", name: "Alice Jenkins", score: "45 / 50", percentage: "90%", status: "PASSED", date: "2025-01-20" },
        { studentId: "STU-502", name: "David Miller", score: "42 / 50", percentage: "84%", status: "PASSED", date: "2025-01-20" },
        { studentId: "STU-503", name: "Emily Watson", score: "29 / 50", percentage: "58%", status: "FAILED", date: "2025-01-20" },
        { studentId: "STU-504", name: "Franklin Roosevelt", score: "48 / 50", percentage: "96%", status: "PASSED", date: "2025-01-19" },
        { studentId: "STU-505", name: "Gary Oldman", score: "38 / 50", percentage: "76%", status: "PASSED", date: "2025-01-19" },
        { studentId: "STU-506", name: "Grace Hopper", score: "49 / 50", percentage: "98%", status: "PASSED", date: "2025-01-19" },
        { studentId: "STU-507", name: "Ken Thompson", score: "34 / 50", percentage: "68%", status: "PASSED", date: "2025-01-18" }
    ],

    // Security Audit Logs (Administrator View)
    auditLogs: [
        { timestamp: "2024-09-30 14:22:15", user: "Alex Mercer (Admin)", action: "ADD_FACULTY", module: "Faculty", details: "Created entry FAC-102 for Dr. Bruce Banner" },
        { timestamp: "2024-09-30 13:10:04", user: "Alex Mercer (Admin)", action: "ASSIGN_SUBJECT", module: "Faculty", details: "Assigned PHY-401 to Dr. Bruce Banner" },
        { timestamp: "2024-09-30 11:45:50", user: "Alex Mercer (Admin)", action: "ARCHIVE_SUBJECT", module: "Subjects", details: "Archived MECH-205 due to curriculum refresh" },
        { timestamp: "2024-09-30 09:12:12", user: "Rachel Green (Faculty)", action: "LOGIN_SUCCESS", module: "Auth", details: "Successful login session from IP 192.168.1.44" },
        { timestamp: "2024-09-30 08:58:22", user: "System System", action: "COHORT_SYNC", module: "Cron", details: "Synced CS-101 student roster with main registry (124 users)" },
        { timestamp: "2024-09-30 08:30:10", user: "System Proctor", action: "TAB_SWITCH_ALERT", module: "Proctor", details: "Student STU-503 triggered 1st background tab switch in CS-101" }
    ],

    // Pre-configured role accounts for 1-click Demo Switching
    demoAccounts: {
        student: {
            role: "student",
            name: "Ythanigga (Student)",
            id: "2024-0892",
            email: "student.ythan@examportal.edu",
            avatar: "assets/student-avatar.png",
            program: "BS Computer Science",
            year: "3rd Year"
        },
        teacher: {
            role: "teacher",
            name: "Prof. Maria Santos",
            id: "EMP-204",
            email: "maria.santos@examportal.edu",
            avatar: "assets/teacher-avatar.png",
            dept: "Computer Science",
            room: "CS Building, Block B - Room 304",
            phone: "+1 (555) 234-5678",
            consultation: "Mon/Wed 2PM - 4PM"
        },
        admin: {
            role: "admin",
            name: "System Administrator",
            id: "ADM-001",
            email: "admin.super@examportal.edu",
            avatar: "assets/admin-avatar.png",
            dept: "University IT & Academic Affairs"
        }
    }
};

// Export to window for global access
window.EDUDATA = INITIAL_DATA;
