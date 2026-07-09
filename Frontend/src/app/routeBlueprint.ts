export type RouteBlueprintEntry = {
  key: string
  path: string
  page: string
}

export type RouteBlueprint = {
  public: RouteBlueprintEntry[]
  admin: RouteBlueprintEntry[]
  faculty: RouteBlueprintEntry[]
  student: RouteBlueprintEntry[]
}

export const routeBlueprint: RouteBlueprint = {
  public: [
    { key: 'home', path: '/', page: 'features/public/pages/HomePage.tsx' },
    { key: 'login', path: '/login', page: 'features/public/pages/LoginPage.tsx' },
  ],
  admin: [
    { key: 'dashboard', path: '/admin/dashboard', page: 'features/admin/pages/AdminDashboardPage.tsx' },
    { key: 'academic-year', path: '/admin/academic-years', page: 'features/admin/pages/AcademicYearPage.tsx' },
    { key: 'course', path: '/admin/courses', page: 'features/admin/pages/CoursePage.tsx' },
    { key: 'department', path: '/admin/departments', page: 'features/admin/pages/DepartmentPage.tsx' },
    { key: 'enrollment', path: '/admin/enrollments', page: 'features/admin/pages/EnrollmentPage.tsx' },
    { key: 'fee', path: '/admin/fees', page: 'features/admin/pages/FeePage.tsx' },
    { key: 'program', path: '/admin/programs', page: 'features/admin/pages/ProgramPage.tsx' },
    { key: 'school', path: '/admin/schools', page: 'features/admin/pages/SchoolPage.tsx' },
    { key: 'profile', path: '/admin/profile', page: 'features/admin/pages/AdminProfilePage.tsx' },
  ],
  faculty: [
    { key: 'home', path: '/faculty', page: 'features/faculty/pages/FacultyHomePage.tsx' },
    { key: 'grading', path: '/faculty/grading', page: 'features/faculty/pages/GradingPage.tsx' },
  ],
  student: [
    { key: 'dashboard', path: '/student/dashboard', page: 'features/student/pages/StudentDashboardPage.tsx' },
    { key: 'course-registration', path: '/student/course-registration', page: 'features/student/pages/CourseRegistrationPage.tsx' },
    { key: 'exam-registration', path: '/student/exam-registration', page: 'features/student/pages/ExamRegistrationPage.tsx' },
    { key: 'fee-payment', path: '/student/fee-payment', page: 'features/student/pages/FeePaymentPage.tsx' },
    { key: 'semester-registration', path: '/student/semester-registration', page: 'features/student/pages/SemesterRegistrationPage.tsx' },
    { key: 'transcript', path: '/student/transcript', page: 'features/student/pages/TranscriptPage.tsx' },
  ],
}