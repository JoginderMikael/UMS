export const routeBlueprint = {
  public: [
    { key: 'home', path: '/', page: 'features/public/pages/HomePage.jsx' },
    { key: 'login', path: '/login', page: 'features/public/pages/LoginPage.jsx' },
  ],
  admin: [
    { key: 'dashboard', path: '/admin/dashboard', page: 'features/admin/pages/AdminDashboardPage.jsx' },
    { key: 'academic-year', path: '/admin/academic-years', page: 'features/admin/pages/AcademicYearPage.jsx' },
    { key: 'course', path: '/admin/courses', page: 'features/admin/pages/CoursePage.jsx' },
    { key: 'department', path: '/admin/departments', page: 'features/admin/pages/DepartmentPage.jsx' },
    { key: 'enrollment', path: '/admin/enrollments', page: 'features/admin/pages/EnrollmentPage.jsx' },
    { key: 'fee', path: '/admin/fees', page: 'features/admin/pages/FeePage.jsx' },
    { key: 'program', path: '/admin/programs', page: 'features/admin/pages/ProgramPage.jsx' },
    { key: 'school', path: '/admin/schools', page: 'features/admin/pages/SchoolPage.jsx' },
    { key: 'profile', path: '/admin/profile', page: 'features/admin/pages/AdminProfilePage.jsx' },
  ],
  faculty: [
    { key: 'home', path: '/faculty', page: 'features/faculty/pages/FacultyHomePage.jsx' },
    { key: 'grading', path: '/faculty/grading', page: 'features/faculty/pages/GradingPage.jsx' },
  ],
  student: [
    { key: 'dashboard', path: '/student/dashboard', page: 'features/student/pages/StudentDashboardPage.jsx' },
    { key: 'course-registration', path: '/student/course-registration', page: 'features/student/pages/CourseRegistrationPage.jsx' },
    { key: 'exam-registration', path: '/student/exam-registration', page: 'features/student/pages/ExamRegistrationPage.jsx' },
    { key: 'fee-payment', path: '/student/fee-payment', page: 'features/student/pages/FeePaymentPage.jsx' },
    { key: 'semester-registration', path: '/student/semester-registration', page: 'features/student/pages/SemesterRegistrationPage.jsx' },
    { key: 'transcript', path: '/student/transcript', page: 'features/student/pages/TranscriptPage.jsx' },
  ],
}
