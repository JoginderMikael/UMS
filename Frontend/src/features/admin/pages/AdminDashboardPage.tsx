import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  activateAcademicYear,
  activateSemester,
  addCourseToProgram,
  createAcademicYear,
  createCourse,
  createDepartment,
  createProgram,
  createSchool,
  createSemester,
  createUser,
  deleteCourse,
  deleteDepartment,
  deleteProgram,
  deleteSchool,
  deleteUser,
  fetchAllAcademicYears,
  fetchAllDeletedSchools,
  fetchAllDeletedUsers,
  fetchAllProgramsMinimal,
  fetchAllSchools,
  fetchAllUniversityCourses,
  fetchAllUsers,
  fetchCoursesBySchool,
  fetchDashboardSummary,
  fetchDeletedDepartmentsBySchool,
  fetchDepartmentsBySchool,
  fetchProgramCourses,
  fetchProgramsBySchool,
  fetchSemestersByAcademicYear,
  fetchUserByEmail,
  fetchUserById,
  removeCourseFromProgram,
  restoreDeletedDepartment,
  restoreDeletedSchool,
  restoreDeletedUser,
  updateCourse,
  updateDepartment,
  updateProgram,
  updateSchool,
  updateUser,
  type AcademicYear,
  type Course,
  type DashboardSummary,
  type Department,
  type Program,
  type School,
  type Semester,
  type User,
} from '../services/adminServices'
import { loadToken } from '../../../utils/session'

type Section = 'overview' | 'users' | 'schools' | 'departments' | 'programs' | 'courses' | 'cycle'
type StatusKind = 'success' | 'error' | 'info'

type Status = {
  text: string
  kind: StatusKind
}

type IdLike = {
  id?: string | number
  schoolId?: string | number
  departmentId?: string | number
  programId?: string | number
  courseId?: string | number
  userId?: string | number
  academicYearId?: string | number
  semesterId?: string | number
}

const navItems: Array<{ key: Section; label: string; icon: string; subtitle: string }> = [
  { key: 'overview', label: 'Overview', icon: '📊', subtitle: 'System health and quick actions' },
  { key: 'users', label: 'Users', icon: '👥', subtitle: 'Create / lookup / deactivate / restore users' },
  { key: 'schools', label: 'Schools', icon: '🏛️', subtitle: 'School lifecycle management' },
  { key: 'departments', label: 'Departments', icon: '🧭', subtitle: 'School-scoped departments controls' },
  { key: 'programs', label: 'Programs', icon: '🎓', subtitle: 'Program lifecycle + course mapping' },
  { key: 'courses', label: 'Courses', icon: '📚', subtitle: 'Course catalog operations' },
  { key: 'cycle', label: 'Academic Cycle', icon: '🗓️', subtitle: 'Academic year and semester controls' },
]

const summaryFallback: DashboardSummary = {
  totalSchools: 0,
  totalDepartments: 0,
  totalPrograms: 0,
  totalCourses: 0,
  totalStudents: 0,
  totalAdmins: 0,
  totalFaculty: 0,
  activeAcademicYear: 'N/A',
  activeSemester: 'N/A',
}

function toId(value: IdLike): string {
  return String(
    value.id ||
      value.userId ||
      value.schoolId ||
      value.departmentId ||
      value.programId ||
      value.courseId ||
      value.academicYearId ||
      value.semesterId ||
      '',
  )
}

function text(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }
  return String(value)
}

function fullName(user: User): string {
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed user'
}

function RolePill({ role }: { role: string }) {
  const value = role.toUpperCase() || 'UNKNOWN'
  const className =
    value === 'ADMIN'
      ? 'border-violet-300/40 bg-violet-500/20 text-violet-100'
      : value === 'FACULTY'
        ? 'border-sky-300/40 bg-sky-500/20 text-sky-100'
        : 'border-emerald-300/40 bg-emerald-500/20 text-emerald-100'

  return <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${className}`}>{value}</span>
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-violet-100">{text(value)}</p>
    </article>
  )
}

function Input({ value, onChange, placeholder, compact = false }: { value: string; onChange: (v: string) => void; placeholder?: string; compact?: boolean }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`rounded-lg border border-slate-700 bg-slate-900/70 text-slate-100 outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20 ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`}
    />
  )
}

function Select({ value, onChange, options, placeholder, compact = false }: { value: string; onChange: (v: string) => void; options: Array<string | { value: string; label: string }>; placeholder?: string; compact?: boolean }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border border-slate-700 bg-slate-900/70 text-slate-100 outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20 ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) =>
        typeof option === 'string' ? (
          <option key={option} value={option}>
            {option}
          </option>
        ) : (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ),
      )}
    </select>
  )
}

function ActionButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="mt-3 rounded-lg bg-linear-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
      {children}
    </button>
  )
}

function SmallButton({ onClick, children, kind }: { onClick: () => void; children: ReactNode; kind: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' }) {
  const style =
    kind === 'primary'
      ? 'border-violet-300/40 bg-violet-500/20 text-violet-100'
      : kind === 'secondary'
        ? 'border-sky-300/40 bg-sky-500/15 text-sky-100'
        : kind === 'danger'
          ? 'border-rose-300/40 bg-rose-500/15 text-rose-100'
          : kind === 'success'
            ? 'border-emerald-300/40 bg-emerald-500/15 text-emerald-100'
            : 'border-slate-600 bg-slate-800/70 text-slate-200'

  return (
    <button type="button" onClick={onClick} className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition hover:brightness-110 ${style}`}>
      {children}
    </button>
  )
}

function AdminDashboardPage() {
  const token = useMemo(() => loadToken(), [])

  const [section, setSection] = useState<Section>('overview')
  const [status, setStatus] = useState<Status | null>(null)
  const [busy, setBusy] = useState(false)

  const [summary, setSummary] = useState<DashboardSummary>(summaryFallback)

  const [users, setUsers] = useState<User[]>([])
  const [deletedUsers, setDeletedUsers] = useState<User[]>([])
  const [userQuery, setUserQuery] = useState('')
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', role: 'STUDENT' })
  const [editUserId, setEditUserId] = useState('')
  const [editUserData, setEditUserData] = useState({ firstName: '', lastName: '', email: '', role: 'STUDENT' })
  const [lookupMode, setLookupMode] = useState<'email' | 'id'>('email')
  const [lookupValue, setLookupValue] = useState('')
  const [lookupUser, setLookupUser] = useState<User | null>(null)

  const [schools, setSchools] = useState<School[]>([])
  const [deletedSchools, setDeletedSchools] = useState<School[]>([])
  const [newSchool, setNewSchool] = useState({ name: '', code: '' })
  const [editSchoolId, setEditSchoolId] = useState('')
  const [editSchoolData, setEditSchoolData] = useState({ name: '', code: '' })

  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [departments, setDepartments] = useState<Department[]>([])
  const [deletedDepartments, setDeletedDepartments] = useState<Department[]>([])
  const [newDepartment, setNewDepartment] = useState({ name: '', code: '' })
  const [editDepartmentId, setEditDepartmentId] = useState('')
  const [editDepartmentData, setEditDepartmentData] = useState({ name: '', code: '' })

  const [programs, setPrograms] = useState<Program[]>([])
  const [allPrograms, setAllPrograms] = useState<Program[]>([])
  const [newProgram, setNewProgram] = useState({ name: '', code: '' })
  const [editProgramId, setEditProgramId] = useState('')
  const [editProgramData, setEditProgramData] = useState({ name: '', code: '' })
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [selectedProgramId, setSelectedProgramId] = useState('')
  const [programMapForm, setProgramMapForm] = useState({ courseId: '', courseType: 'CORE', yearOfStudy: 1 })
  const [programCourses, setProgramCourses] = useState<Course[]>([])

  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [courseQuery, setCourseQuery] = useState('')
  const [newCourse, setNewCourse] = useState({ title: '', code: '', creditUnits: 3 })
  const [editCourseId, setEditCourseId] = useState('')
  const [editCourseData, setEditCourseData] = useState({ title: '', creditUnits: 3 })

  const [years, setYears] = useState<AcademicYear[]>([])
  const [selectedYearId, setSelectedYearId] = useState('')
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [newYearName, setNewYearName] = useState('')
  const [newSemesterNo, setNewSemesterNo] = useState(1)

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => {
      return (
        fullName(u).toLowerCase().includes(q) ||
        String(u.email || '').toLowerCase().includes(q) ||
        String(u.role || '').toLowerCase().includes(q) ||
        toId(u).toLowerCase().includes(q)
      )
    })
  }, [users, userQuery])

  const filteredCourses = useMemo(() => {
    const q = courseQuery.trim().toLowerCase()
    if (!q) return courses
    return courses.filter((c) => String(c.title || c.courseTitle || '').toLowerCase().includes(q) || String(c.code || c.courseCode || '').toLowerCase().includes(q))
  }, [courses, courseQuery])

  async function run(action: () => Promise<void>): Promise<void> {
    setBusy(true)
    try {
      await action()
    } finally {
      setBusy(false)
    }
  }

  function showStatus(textValue: string, kind: StatusKind = 'info'): void {
    setStatus({ text: textValue, kind })
  }

  async function loadSummary(currentToken: string): Promise<void> {
    setSummary(await fetchDashboardSummary(currentToken))
  }

  async function loadUsers(currentToken: string): Promise<void> {
    const [active, deleted] = await Promise.all([fetchAllUsers(currentToken), fetchAllDeletedUsers(currentToken)])
    setUsers(active)
    setDeletedUsers(deleted)
  }

  async function loadSchools(currentToken: string): Promise<void> {
    const [active, deleted] = await Promise.all([fetchAllSchools(currentToken), fetchAllDeletedSchools(currentToken)])
    setSchools(active)
    setDeletedSchools(deleted)
    if (!selectedSchoolId && active.length > 0) {
      setSelectedSchoolId(toId(active[0]))
    }
  }

  async function loadDepartments(currentToken: string, schoolId: string): Promise<void> {
    if (!schoolId) {
      setDepartments([])
      setDeletedDepartments([])
      return
    }
    const [active, deleted] = await Promise.all([
      fetchDepartmentsBySchool(currentToken, schoolId),
      fetchDeletedDepartmentsBySchool(currentToken, schoolId),
    ])
    setDepartments(active)
    setDeletedDepartments(deleted)
    if (!selectedDepartmentId && active.length > 0) {
      setSelectedDepartmentId(toId(active[0]))
    }
  }

  async function loadPrograms(currentToken: string, schoolId: string): Promise<void> {
    const all = await fetchAllProgramsMinimal(currentToken)
    setAllPrograms(all)
    if (!schoolId) {
      setPrograms([])
      return
    }
    setPrograms(await fetchProgramsBySchool(currentToken, schoolId))
  }

  async function loadCourses(currentToken: string, schoolId: string): Promise<void> {
    const all = await fetchAllUniversityCourses(currentToken)
    setAllCourses(all)
    if (!schoolId) {
      setCourses([])
      return
    }
    setCourses(await fetchCoursesBySchool(currentToken, schoolId))
  }

  async function loadCycle(currentToken: string): Promise<void> {
    const yearList = await fetchAllAcademicYears(currentToken)
    setYears(yearList)
    const activeYear = yearList.find((y) => Boolean(y.active)) || yearList[0]
    const activeYearId = toId(activeYear || {})
    setSelectedYearId(activeYearId)
    if (activeYearId) {
      setSemesters(await fetchSemestersByAcademicYear(currentToken, activeYearId))
    } else {
      setSemesters([])
    }
  }

  useEffect(() => {
    if (!token) {
      showStatus('Session expired. Please log in again.', 'error')
      return
    }

    void run(async () => {
      await Promise.all([loadSummary(token), loadUsers(token), loadSchools(token), loadCycle(token)])
      showStatus('Admin workspace loaded.', 'success')
    })
  }, [token])

  useEffect(() => {
    if (!token || !selectedSchoolId) return
    void run(async () => {
      await Promise.all([loadDepartments(token, selectedSchoolId), loadPrograms(token, selectedSchoolId), loadCourses(token, selectedSchoolId)])
    })
  }, [token, selectedSchoolId])

  useEffect(() => {
    if (!token || !selectedYearId) return
    void run(async () => {
      setSemesters(await fetchSemestersByAcademicYear(token, selectedYearId))
    })
  }, [token, selectedYearId])

  useEffect(() => {
    if (!token || !selectedProgramId) {
      setProgramCourses([])
      return
    }
    void run(async () => {
      setProgramCourses(await fetchProgramCourses(token, selectedProgramId))
    })
  }, [token, selectedProgramId])

  const selectedNav = navItems.find((item) => item.key === section) || navItems[0]

  async function refreshAll(): Promise<void> {
    if (!token) return
    await Promise.all([loadSummary(token), loadUsers(token), loadSchools(token), loadCycle(token)])
    if (selectedSchoolId) {
      await Promise.all([loadDepartments(token, selectedSchoolId), loadPrograms(token, selectedSchoolId), loadCourses(token, selectedSchoolId)])
    }
  }

  // Users handlers
  async function onCreateUser(): Promise<void> {
    if (!token) return
    if (!newUser.firstName.trim() || !newUser.lastName.trim() || !newUser.email.trim()) {
      showStatus('First name, last name, and email are required.', 'error')
      return
    }

    await run(async () => {
      await createUser(token, {
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
      })
      setNewUser({ firstName: '', lastName: '', email: '', role: 'STUDENT' })
      await Promise.all([loadUsers(token), loadSummary(token)])
      showStatus('User created successfully.', 'success')
    })
  }

  async function onLookupUser(): Promise<void> {
    if (!token) return
    if (!lookupValue.trim()) {
      showStatus('Provide lookup value first.', 'error')
      return
    }

    await run(async () => {
      const result = lookupMode === 'email' ? await fetchUserByEmail(token, lookupValue.trim()) : await fetchUserById(token, lookupValue.trim())
      setLookupUser(result)
      showStatus(result ? 'User found.' : 'No user found.', result ? 'success' : 'info')
    })
  }

  function startEditUser(user: User): void {
    setEditUserId(toId(user))
    setEditUserData({
      firstName: String(user.firstName || ''),
      lastName: String(user.lastName || ''),
      email: String(user.email || ''),
      role: String(user.role || 'STUDENT'),
    })
  }

  async function saveUser(userId: string): Promise<void> {
    if (!token) return
    await run(async () => {
      await updateUser(token, userId, {
        firstName: editUserData.firstName.trim(),
        lastName: editUserData.lastName.trim(),
        email: editUserData.email.trim(),
        role: editUserData.role,
      })
      setEditUserId('')
      await Promise.all([loadUsers(token), loadSummary(token)])
      showStatus('User updated successfully.', 'success')
    })
  }

  async function deactivateUser(userId: string): Promise<void> {
    if (!token) return
    if (!window.confirm('Deactivate this user?')) return

    await run(async () => {
      await deleteUser(token, userId)
      await Promise.all([loadUsers(token), loadSummary(token)])
      showStatus('User deactivated successfully.', 'success')
    })
  }

  async function restoreUser(userId: string): Promise<void> {
    if (!token) return
    await run(async () => {
      await restoreDeletedUser(token, userId)
      await Promise.all([loadUsers(token), loadSummary(token)])
      showStatus('User restored successfully.', 'success')
    })
  }

  // School handlers
  async function onCreateSchool(): Promise<void> {
    if (!token) return
    if (!newSchool.name.trim() || !newSchool.code.trim()) {
      showStatus('School name and code are required.', 'error')
      return
    }

    await run(async () => {
      await createSchool(token, { name: newSchool.name.trim(), code: newSchool.code.trim() })
      setNewSchool({ name: '', code: '' })
      await Promise.all([loadSchools(token), loadSummary(token)])
      showStatus('School created successfully.', 'success')
    })
  }

  function startEditSchool(school: School): void {
    setEditSchoolId(toId(school))
    setEditSchoolData({ name: String(school.name || school.schoolName || ''), code: String(school.code || school.schoolCode || '') })
  }

  async function saveSchool(schoolId: string): Promise<void> {
    if (!token) return
    await run(async () => {
      await updateSchool(token, schoolId, { name: editSchoolData.name.trim(), code: editSchoolData.code.trim() })
      setEditSchoolId('')
      await Promise.all([loadSchools(token), loadSummary(token)])
      showStatus('School updated successfully.', 'success')
    })
  }

  async function removeSchool(schoolId: string): Promise<void> {
    if (!token) return
    if (!window.confirm('Delete this school?')) return

    await run(async () => {
      await deleteSchool(token, schoolId)
      await Promise.all([loadSchools(token), loadSummary(token)])
      showStatus('School deleted successfully.', 'success')
    })
  }

  async function restoreSchool(schoolId: string): Promise<void> {
    if (!token) return
    await run(async () => {
      await restoreDeletedSchool(token, schoolId)
      await Promise.all([loadSchools(token), loadSummary(token)])
      showStatus('School restored successfully.', 'success')
    })
  }

  // Department handlers
  async function onCreateDepartment(): Promise<void> {
    if (!token) return
    if (!selectedSchoolId || !newDepartment.name.trim() || !newDepartment.code.trim()) {
      showStatus('Select school, and provide department name and code.', 'error')
      return
    }

    await run(async () => {
      await createDepartment(token, selectedSchoolId, { name: newDepartment.name.trim(), code: newDepartment.code.trim() })
      setNewDepartment({ name: '', code: '' })
      await Promise.all([loadDepartments(token, selectedSchoolId), loadSummary(token)])
      showStatus('Department created successfully.', 'success')
    })
  }

  function startEditDepartment(department: Department): void {
    setEditDepartmentId(toId(department))
    setEditDepartmentData({ name: String(department.name || department.departmentName || ''), code: String(department.code || department.departmentCode || '') })
  }

  async function saveDepartment(departmentId: string): Promise<void> {
    if (!token || !selectedSchoolId) return
    await run(async () => {
      await updateDepartment(token, selectedSchoolId, departmentId, { name: editDepartmentData.name.trim(), code: editDepartmentData.code.trim() })
      setEditDepartmentId('')
      await Promise.all([loadDepartments(token, selectedSchoolId), loadSummary(token)])
      showStatus('Department updated successfully.', 'success')
    })
  }

  async function removeDepartment(departmentId: string): Promise<void> {
    if (!token || !selectedSchoolId) return
    if (!window.confirm('Delete this department?')) return

    await run(async () => {
      await deleteDepartment(token, selectedSchoolId, departmentId)
      await Promise.all([loadDepartments(token, selectedSchoolId), loadSummary(token)])
      showStatus('Department deleted successfully.', 'success')
    })
  }

  async function restoreDepartment(departmentId: string): Promise<void> {
    if (!token || !selectedSchoolId) return
    await run(async () => {
      await restoreDeletedDepartment(token, selectedSchoolId, departmentId)
      await Promise.all([loadDepartments(token, selectedSchoolId), loadSummary(token)])
      showStatus('Department restored successfully.', 'success')
    })
  }

  // Program handlers
  async function onCreateProgram(): Promise<void> {
    if (!token) return
    if (!selectedSchoolId || !selectedDepartmentId || !newProgram.name.trim() || !newProgram.code.trim()) {
      showStatus('Select school/department and fill program name/code.', 'error')
      return
    }

    await run(async () => {
      await createProgram(token, {
        name: newProgram.name.trim(),
        code: newProgram.code.trim(),
        schoolId: selectedSchoolId,
        departmentId: selectedDepartmentId,
      })
      setNewProgram({ name: '', code: '' })
      await Promise.all([loadPrograms(token, selectedSchoolId), loadSummary(token)])
      showStatus('Program created successfully.', 'success')
    })
  }

  function startEditProgram(program: Program): void {
    setEditProgramId(toId(program))
    setEditProgramData({ name: String(program.name || program.programName || ''), code: String(program.code || program.programCode || '') })
  }

  async function saveProgram(programId: string): Promise<void> {
    if (!token || !selectedSchoolId) return
    await run(async () => {
      await updateProgram(token, programId, { name: editProgramData.name.trim(), code: editProgramData.code.trim() })
      setEditProgramId('')
      await Promise.all([loadPrograms(token, selectedSchoolId), loadSummary(token)])
      showStatus('Program updated successfully.', 'success')
    })
  }

  async function removeProgram(programId: string): Promise<void> {
    if (!token || !selectedSchoolId) return
    if (!window.confirm('Delete this program?')) return

    await run(async () => {
      await deleteProgram(token, programId)
      await Promise.all([loadPrograms(token, selectedSchoolId), loadSummary(token)])
      showStatus('Program deleted successfully.', 'success')
    })
  }

  async function mapCourseToProgram(): Promise<void> {
    if (!token) return
    if (!selectedProgramId || !programMapForm.courseId) {
      showStatus('Select program and course first.', 'error')
      return
    }

    await run(async () => {
      await addCourseToProgram(token, selectedProgramId, programMapForm.courseId, {
        courseType: programMapForm.courseType,
        yearOfStudy: Number(programMapForm.yearOfStudy),
      })
      setProgramCourses(await fetchProgramCourses(token, selectedProgramId))
      showStatus('Course mapped successfully.', 'success')
    })
  }

  async function unmapCourse(courseId: string): Promise<void> {
    if (!token || !selectedProgramId) return
    await run(async () => {
      await removeCourseFromProgram(token, selectedProgramId, courseId)
      setProgramCourses(await fetchProgramCourses(token, selectedProgramId))
      showStatus('Mapped course removed.', 'success')
    })
  }

  // Course handlers
  async function onCreateCourse(): Promise<void> {
    if (!token) return
    if (!selectedSchoolId || !selectedDepartmentId || !newCourse.title.trim() || !newCourse.code.trim()) {
      showStatus('Select school/department and fill course title/code.', 'error')
      return
    }

    await run(async () => {
      await createCourse(token, {
        title: newCourse.title.trim(),
        code: newCourse.code.trim(),
        creditUnits: Number(newCourse.creditUnits),
        schoolId: selectedSchoolId,
        departmentId: selectedDepartmentId,
      })
      setNewCourse({ title: '', code: '', creditUnits: 3 })
      await Promise.all([loadCourses(token, selectedSchoolId), loadSummary(token)])
      showStatus('Course created successfully.', 'success')
    })
  }

  function startEditCourse(course: Course): void {
    setEditCourseId(toId(course))
    setEditCourseData({ title: String(course.title || course.courseTitle || ''), creditUnits: Number(course.creditUnits || 0) })
  }

  async function saveCourse(courseId: string): Promise<void> {
    if (!token || !selectedSchoolId) return
    await run(async () => {
      await updateCourse(token, courseId, { title: editCourseData.title.trim(), creditUnits: Number(editCourseData.creditUnits) })
      setEditCourseId('')
      await Promise.all([loadCourses(token, selectedSchoolId), loadSummary(token)])
      showStatus('Course updated successfully.', 'success')
    })
  }

  async function removeCourse(courseId: string): Promise<void> {
    if (!token || !selectedSchoolId) return
    if (!window.confirm('Delete this course?')) return

    await run(async () => {
      await deleteCourse(token, courseId)
      await Promise.all([loadCourses(token, selectedSchoolId), loadSummary(token)])
      showStatus('Course deleted successfully.', 'success')
    })
  }

  // Cycle handlers
  async function addAcademicYear(): Promise<void> {
    if (!token) return
    if (!newYearName.trim()) {
      showStatus('Academic year name is required.', 'error')
      return
    }

    await run(async () => {
      await createAcademicYear(token, newYearName.trim())
      setNewYearName('')
      await Promise.all([loadCycle(token), loadSummary(token)])
      showStatus('Academic year created.', 'success')
    })
  }

  async function setActiveYear(yearId: string): Promise<void> {
    if (!token) return
    await run(async () => {
      await activateAcademicYear(token, yearId)
      await Promise.all([loadCycle(token), loadSummary(token)])
      showStatus('Academic year activated.', 'success')
    })
  }

  async function addSemester(): Promise<void> {
    if (!token || !selectedYearId) {
      showStatus('Select an academic year first.', 'error')
      return
    }

    await run(async () => {
      await createSemester(token, selectedYearId, Number(newSemesterNo))
      setSemesters(await fetchSemestersByAcademicYear(token, selectedYearId))
      await loadSummary(token)
      showStatus('Semester created.', 'success')
    })
  }

  async function setActiveSemester(semesterId: string): Promise<void> {
    if (!token || !selectedYearId) return
    await run(async () => {
      await activateSemester(token, semesterId)
      setSemesters(await fetchSemestersByAcademicYear(token, selectedYearId))
      await loadSummary(token)
      showStatus('Semester activated.', 'success')
    })
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-slate-100 md:px-8 md:py-10">
      <div className="pointer-events-none absolute -left-24 top-4 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-[290px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <p className="inline-flex rounded-full border border-violet-300/30 bg-violet-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-100">Admin Portal</p>
          <h1 className="mt-4 text-2xl font-black tracking-tight">UMS Control Center</h1>
          <p className="mt-2 text-sm text-slate-300">Modernized admin experience with expanded legacy functionality.</p>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSection(item.key)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                  section === item.key
                    ? 'bg-violet-500/25 text-violet-100 ring-1 ring-violet-300/40'
                    : 'bg-slate-900/65 text-slate-200 hover:bg-slate-800/75'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => token && void run(async () => refreshAll())}
            className="mt-6 w-full rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            {busy ? 'Refreshing...' : 'Sync all data'}
          </button>
        </aside>

        <section className="rounded-3xl border border-white/10 bg-white/6 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Active module</p>
              <h2 className="text-3xl font-black tracking-tight">{selectedNav.label}</h2>
              <p className="mt-1 text-sm text-slate-300">{selectedNav.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => token && void run(async () => loadSummary(token))}
              className="rounded-xl border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-400/20"
            >
              Refresh summary
            </button>
          </div>

          {status ? (
            <div className={`mb-4 rounded-xl border px-3 py-2 text-sm ${status.kind === 'success' ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200' : status.kind === 'error' ? 'border-rose-400/40 bg-rose-500/10 text-rose-200' : 'border-slate-600 bg-slate-800/70 text-slate-200'}`}>
              {status.text}
            </div>
          ) : null}

          {section === 'overview' ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label="Schools" value={summary.totalSchools} />
                <Metric label="Departments" value={summary.totalDepartments} />
                <Metric label="Programs" value={summary.totalPrograms} />
                <Metric label="Courses" value={summary.totalCourses} />
                <Metric label="Students" value={summary.totalStudents} />
                <Metric label="Admins" value={summary.totalAdmins} />
                <Metric label="Faculty" value={summary.totalFaculty} />
                <Metric label="Active Semester" value={summary.activeSemester} />
              </div>

              <Panel title="Quick navigation">
                <div className="flex flex-wrap gap-2">
                  {navItems.filter((item) => item.key !== 'overview').map((item) => (
                    <button key={`quick-${item.key}`} type="button" onClick={() => setSection(item.key)} className="rounded-full border border-slate-600 bg-slate-900/65 px-3 py-1.5 text-sm transition hover:border-violet-300/40 hover:bg-violet-400/10">
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              </Panel>
            </div>
          ) : null}

          {section === 'users' ? (
            <div className="space-y-5">
              <Panel title="Create user">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input value={newUser.firstName} onChange={(v) => setNewUser((s) => ({ ...s, firstName: v }))} placeholder="First name" />
                  <Input value={newUser.lastName} onChange={(v) => setNewUser((s) => ({ ...s, lastName: v }))} placeholder="Last name" />
                  <Input value={newUser.email} onChange={(v) => setNewUser((s) => ({ ...s, email: v }))} placeholder="Email" />
                  <Select value={newUser.role} onChange={(v) => setNewUser((s) => ({ ...s, role: v }))} options={['ADMIN', 'STUDENT', 'FACULTY']} />
                </div>
                <ActionButton onClick={() => void onCreateUser()}>Create user</ActionButton>
              </Panel>

              <Panel title="Lookup user">
                <div className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
                  <Select value={lookupMode} onChange={(v) => setLookupMode(v as 'email' | 'id')} options={['email', 'id']} />
                  <Input value={lookupValue} onChange={setLookupValue} placeholder="Lookup value" />
                  <ActionButton onClick={() => void onLookupUser()}>Find</ActionButton>
                </div>
                {lookupUser ? (
                  <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm">
                    <p className="font-semibold">{fullName(lookupUser)}</p>
                    <p className="text-slate-300">{text(lookupUser.email)} • {text(lookupUser.role)}</p>
                    <p className="text-xs text-slate-400">ID: {toId(lookupUser)}</p>
                  </div>
                ) : null}
              </Panel>

              <Panel title="Active users">
                <Input value={userQuery} onChange={setUserQuery} placeholder="Search users by name/email/role/id" />
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-300">
                        <th className="px-2 py-2">Name</th>
                        <th className="px-2 py-2">Email</th>
                        <th className="px-2 py-2">Role</th>
                        <th className="px-2 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td className="px-2 py-3 text-slate-400" colSpan={4}>No users found.</td></tr>
                      ) : (
                        filteredUsers.map((user) => {
                          const id = toId(user)
                          const editing = editUserId === id
                          return (
                            <tr key={`user-${id}`} className="border-b border-slate-800/80">
                              <td className="px-2 py-2">
                                {editing ? (
                                  <div className="grid gap-1">
                                    <Input compact value={editUserData.firstName} onChange={(v) => setEditUserData((s) => ({ ...s, firstName: v }))} placeholder="First" />
                                    <Input compact value={editUserData.lastName} onChange={(v) => setEditUserData((s) => ({ ...s, lastName: v }))} placeholder="Last" />
                                  </div>
                                ) : fullName(user)}
                              </td>
                              <td className="px-2 py-2">{editing ? <Input compact value={editUserData.email} onChange={(v) => setEditUserData((s) => ({ ...s, email: v }))} placeholder="Email" /> : text(user.email)}</td>
                              <td className="px-2 py-2">{editing ? <Select compact value={editUserData.role} onChange={(v) => setEditUserData((s) => ({ ...s, role: v }))} options={['ADMIN', 'STUDENT', 'FACULTY']} /> : <RolePill role={String(user.role || '')} />}</td>
                              <td className="px-2 py-2">
                                <div className="flex flex-wrap gap-2">
                                  {editing ? (
                                    <>
                                      <SmallButton kind="primary" onClick={() => void saveUser(id)}>Save</SmallButton>
                                      <SmallButton kind="ghost" onClick={() => setEditUserId('')}>Cancel</SmallButton>
                                    </>
                                  ) : (
                                    <>
                                      <SmallButton kind="secondary" onClick={() => startEditUser(user)}>Edit</SmallButton>
                                      <SmallButton kind="danger" onClick={() => void deactivateUser(id)}>Deactivate</SmallButton>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title="Deleted users">
                <div className="space-y-2">
                  {deletedUsers.length === 0 ? (
                    <p className="text-sm text-slate-400">No deleted users.</p>
                  ) : (
                    deletedUsers.map((user) => {
                      const id = toId(user)
                      return (
                        <div key={`deleted-user-${id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                          <span className="text-sm">{fullName(user)} ({text(user.email)})</span>
                          <SmallButton kind="success" onClick={() => void restoreUser(id)}>Restore</SmallButton>
                        </div>
                      )
                    })
                  )}
                </div>
              </Panel>
            </div>
          ) : null}

          {section === 'schools' ? (
            <div className="space-y-5">
              <Panel title="Create school">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input value={newSchool.name} onChange={(v) => setNewSchool((s) => ({ ...s, name: v }))} placeholder="School name" />
                  <Input value={newSchool.code} onChange={(v) => setNewSchool((s) => ({ ...s, code: v }))} placeholder="School code" />
                </div>
                <ActionButton onClick={() => void onCreateSchool()}>Create school</ActionButton>
              </Panel>

              <Panel title="Active schools">
                <div className="space-y-2">
                  {schools.length === 0 ? (
                    <p className="text-sm text-slate-400">No schools found.</p>
                  ) : (
                    schools.map((school) => {
                      const id = toId(school)
                      const editing = editSchoolId === id
                      return (
                        <div key={`school-${id}`} className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                          {editing ? (
                            <div className="grid gap-2 md:grid-cols-[1fr_220px_auto_auto]">
                              <Input compact value={editSchoolData.name} onChange={(v) => setEditSchoolData((s) => ({ ...s, name: v }))} placeholder="School name" />
                              <Input compact value={editSchoolData.code} onChange={(v) => setEditSchoolData((s) => ({ ...s, code: v }))} placeholder="Code" />
                              <SmallButton kind="primary" onClick={() => void saveSchool(id)}>Save</SmallButton>
                              <SmallButton kind="ghost" onClick={() => setEditSchoolId('')}>Cancel</SmallButton>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-medium">{text(school.name || school.schoolName)} ({text(school.code || school.schoolCode)})</span>
                              <div className="flex gap-2">
                                <SmallButton kind="secondary" onClick={() => startEditSchool(school)}>Edit</SmallButton>
                                <SmallButton kind="danger" onClick={() => void removeSchool(id)}>Delete</SmallButton>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </Panel>

              <Panel title="Deleted schools">
                <div className="space-y-2">
                  {deletedSchools.length === 0 ? (
                    <p className="text-sm text-slate-400">No deleted schools.</p>
                  ) : (
                    deletedSchools.map((school) => {
                      const id = toId(school)
                      return (
                        <div key={`deleted-school-${id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                          <span className="text-sm">{text(school.name || school.schoolName)} ({text(school.code || school.schoolCode)})</span>
                          <SmallButton kind="success" onClick={() => void restoreSchool(id)}>Restore</SmallButton>
                        </div>
                      )
                    })
                  )}
                </div>
              </Panel>
            </div>
          ) : null}

          {section === 'departments' ? (
            <div className="space-y-5">
              <Panel title="Department controls">
                <div className="grid gap-3 md:grid-cols-3">
                  <Select value={selectedSchoolId} onChange={setSelectedSchoolId} options={schools.map((s) => ({ value: toId(s), label: text(s.name || s.schoolName) }))} placeholder="Select school" />
                  <Input value={newDepartment.name} onChange={(v) => setNewDepartment((s) => ({ ...s, name: v }))} placeholder="Department name" />
                  <Input value={newDepartment.code} onChange={(v) => setNewDepartment((s) => ({ ...s, code: v }))} placeholder="Department code" />
                </div>
                <ActionButton onClick={() => void onCreateDepartment()}>Create department</ActionButton>
              </Panel>

              <Panel title="Active departments">
                <div className="space-y-2">
                  {departments.length === 0 ? (
                    <p className="text-sm text-slate-400">No departments found for selected school.</p>
                  ) : (
                    departments.map((department) => {
                      const id = toId(department)
                      const editing = editDepartmentId === id
                      return (
                        <div key={`department-${id}`} className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                          {editing ? (
                            <div className="grid gap-2 md:grid-cols-[1fr_220px_auto_auto]">
                              <Input compact value={editDepartmentData.name} onChange={(v) => setEditDepartmentData((s) => ({ ...s, name: v }))} placeholder="Department name" />
                              <Input compact value={editDepartmentData.code} onChange={(v) => setEditDepartmentData((s) => ({ ...s, code: v }))} placeholder="Code" />
                              <SmallButton kind="primary" onClick={() => void saveDepartment(id)}>Save</SmallButton>
                              <SmallButton kind="ghost" onClick={() => setEditDepartmentId('')}>Cancel</SmallButton>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-medium">{text(department.name || department.departmentName)} ({text(department.code || department.departmentCode)})</span>
                              <div className="flex gap-2">
                                <SmallButton kind="secondary" onClick={() => startEditDepartment(department)}>Edit</SmallButton>
                                <SmallButton kind="danger" onClick={() => void removeDepartment(id)}>Delete</SmallButton>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </Panel>

              <Panel title="Deleted departments">
                <div className="space-y-2">
                  {deletedDepartments.length === 0 ? (
                    <p className="text-sm text-slate-400">No deleted departments.</p>
                  ) : (
                    deletedDepartments.map((department) => {
                      const id = toId(department)
                      return (
                        <div key={`deleted-department-${id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                          <span className="text-sm">{text(department.name || department.departmentName)} ({text(department.code || department.departmentCode)})</span>
                          <SmallButton kind="success" onClick={() => void restoreDepartment(id)}>Restore</SmallButton>
                        </div>
                      )
                    })
                  )}
                </div>
              </Panel>
            </div>
          ) : null}

          {section === 'programs' ? (
            <div className="space-y-5">
              <Panel title="Create and manage programs">
                <div className="grid gap-3 md:grid-cols-2">
                  <Select value={selectedSchoolId} onChange={setSelectedSchoolId} options={schools.map((s) => ({ value: toId(s), label: text(s.name || s.schoolName) }))} placeholder="Select school" />
                  <Select value={selectedDepartmentId} onChange={setSelectedDepartmentId} options={departments.map((d) => ({ value: toId(d), label: text(d.name || d.departmentName) }))} placeholder="Select department" />
                  <Input value={newProgram.name} onChange={(v) => setNewProgram((s) => ({ ...s, name: v }))} placeholder="Program name" />
                  <Input value={newProgram.code} onChange={(v) => setNewProgram((s) => ({ ...s, code: v }))} placeholder="Program code" />
                </div>
                <ActionButton onClick={() => void onCreateProgram()}>Create program</ActionButton>
              </Panel>

              <Panel title="Programs">
                <div className="space-y-2">
                  {programs.length === 0 ? (
                    <p className="text-sm text-slate-400">No programs for selected school.</p>
                  ) : (
                    programs.map((program) => {
                      const id = toId(program)
                      const editing = editProgramId === id
                      return (
                        <div key={`program-${id}`} className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                          {editing ? (
                            <div className="grid gap-2 md:grid-cols-[1fr_220px_auto_auto]">
                              <Input compact value={editProgramData.name} onChange={(v) => setEditProgramData((s) => ({ ...s, name: v }))} placeholder="Program name" />
                              <Input compact value={editProgramData.code} onChange={(v) => setEditProgramData((s) => ({ ...s, code: v }))} placeholder="Code" />
                              <SmallButton kind="primary" onClick={() => void saveProgram(id)}>Save</SmallButton>
                              <SmallButton kind="ghost" onClick={() => setEditProgramId('')}>Cancel</SmallButton>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-medium">{text(program.name || program.programName)} ({text(program.code || program.programCode)})</span>
                              <div className="flex gap-2">
                                <SmallButton kind="secondary" onClick={() => startEditProgram(program)}>Edit</SmallButton>
                                <SmallButton kind="danger" onClick={() => void removeProgram(id)}>Delete</SmallButton>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </Panel>

              <Panel title="Map courses to program">
                <div className="grid gap-3 md:grid-cols-4">
                  <Select value={selectedProgramId} onChange={setSelectedProgramId} options={allPrograms.map((p) => ({ value: toId(p), label: `${text(p.name || p.programName)} (${text(p.code || p.programCode)})` }))} placeholder="Select program" />
                  <Select value={programMapForm.courseId} onChange={(v) => setProgramMapForm((s) => ({ ...s, courseId: v }))} options={allCourses.map((c) => ({ value: toId(c), label: `${text(c.title || c.courseTitle)} (${text(c.code || c.courseCode)})` }))} placeholder="Select course" />
                  <Select value={programMapForm.courseType} onChange={(v) => setProgramMapForm((s) => ({ ...s, courseType: v }))} options={['CORE', 'ELECTIVE']} />
                  <Input value={String(programMapForm.yearOfStudy)} onChange={(v) => setProgramMapForm((s) => ({ ...s, yearOfStudy: Number(v || 1) }))} placeholder="Year" />
                </div>
                <ActionButton onClick={() => void mapCourseToProgram()}>Map course</ActionButton>

                <div className="mt-3 space-y-2">
                  {programCourses.length === 0 ? (
                    <p className="text-sm text-slate-400">No mapped courses for selected program.</p>
                  ) : (
                    programCourses.map((c) => {
                      const id = toId(c)
                      return (
                        <div key={`map-${id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm">
                          <span>{text(c.courseTitle || c.title)} ({text(c.courseCode || c.code)}) • {text(c.courseType)} • Year {text(c.yearOfStudy)}</span>
                          <SmallButton kind="danger" onClick={() => void unmapCourse(id)}>Remove</SmallButton>
                        </div>
                      )
                    })
                  )}
                </div>
              </Panel>
            </div>
          ) : null}

          {section === 'courses' ? (
            <div className="space-y-5">
              <Panel title="Create and manage courses">
                <div className="grid gap-3 md:grid-cols-2">
                  <Select value={selectedSchoolId} onChange={setSelectedSchoolId} options={schools.map((s) => ({ value: toId(s), label: text(s.name || s.schoolName) }))} placeholder="Select school" />
                  <Select value={selectedDepartmentId} onChange={setSelectedDepartmentId} options={departments.map((d) => ({ value: toId(d), label: text(d.name || d.departmentName) }))} placeholder="Select department" />
                  <Input value={newCourse.title} onChange={(v) => setNewCourse((s) => ({ ...s, title: v }))} placeholder="Course title" />
                  <Input value={newCourse.code} onChange={(v) => setNewCourse((s) => ({ ...s, code: v }))} placeholder="Course code" />
                  <Input value={String(newCourse.creditUnits)} onChange={(v) => setNewCourse((s) => ({ ...s, creditUnits: Number(v || 0) }))} placeholder="Credit units" />
                </div>
                <ActionButton onClick={() => void onCreateCourse()}>Create course</ActionButton>
              </Panel>

              <Panel title="Course catalog">
                <Input value={courseQuery} onChange={setCourseQuery} placeholder="Search by title or code" />
                <div className="mt-3 space-y-2">
                  {filteredCourses.length === 0 ? (
                    <p className="text-sm text-slate-400">No courses found.</p>
                  ) : (
                    filteredCourses.map((course) => {
                      const id = toId(course)
                      const editing = editCourseId === id
                      return (
                        <div key={`course-${id}`} className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                          {editing ? (
                            <div className="grid gap-2 md:grid-cols-[1fr_220px_auto_auto]">
                              <Input compact value={editCourseData.title} onChange={(v) => setEditCourseData((s) => ({ ...s, title: v }))} placeholder="Course title" />
                              <Input compact value={String(editCourseData.creditUnits)} onChange={(v) => setEditCourseData((s) => ({ ...s, creditUnits: Number(v || 0) }))} placeholder="Credit units" />
                              <SmallButton kind="primary" onClick={() => void saveCourse(id)}>Save</SmallButton>
                              <SmallButton kind="ghost" onClick={() => setEditCourseId('')}>Cancel</SmallButton>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-medium">{text(course.title || course.courseTitle)} ({text(course.code || course.courseCode)}) • {text(course.creditUnits)} credits</span>
                              <div className="flex gap-2">
                                <SmallButton kind="secondary" onClick={() => startEditCourse(course)}>Edit</SmallButton>
                                <SmallButton kind="danger" onClick={() => void removeCourse(id)}>Delete</SmallButton>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </Panel>
            </div>
          ) : null}

          {section === 'cycle' ? (
            <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-3">
                <Metric label="Academic Years" value={years.length} />
                <Metric label="Active Year" value={summary.activeAcademicYear} />
                <Metric label="Active Semester" value={summary.activeSemester} />
              </div>

              <Panel title="Academic years">
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <Input value={newYearName} onChange={setNewYearName} placeholder="e.g., 2026-2027" />
                  <ActionButton onClick={() => void addAcademicYear()}>Create year</ActionButton>
                </div>
                <div className="mt-3 space-y-2">
                  {years.length === 0 ? (
                    <p className="text-sm text-slate-400">No academic years configured.</p>
                  ) : (
                    years.map((year) => {
                      const id = toId(year)
                      return (
                        <div key={`year-${id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                          <div className="text-sm">
                            <span className="font-medium">{text(year.name)}</span>
                            {year.active ? <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-200">Active</span> : null}
                          </div>
                          <div className="flex gap-2">
                            <SmallButton kind="secondary" onClick={() => setSelectedYearId(id)}>Open</SmallButton>
                            {!year.active ? <SmallButton kind="primary" onClick={() => void setActiveYear(id)}>Activate</SmallButton> : null}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </Panel>

              <Panel title="Semesters">
                <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                  <Select value={selectedYearId} onChange={setSelectedYearId} options={years.map((y) => ({ value: toId(y), label: text(y.name) }))} placeholder="Select academic year" />
                  <Input value={String(newSemesterNo)} onChange={(v) => setNewSemesterNo(Number(v || 1))} placeholder="Semester number" />
                  <ActionButton onClick={() => void addSemester()}>Create semester</ActionButton>
                </div>

                <div className="mt-3 space-y-2">
                  {semesters.length === 0 ? (
                    <p className="text-sm text-slate-400">No semesters for selected year.</p>
                  ) : (
                    semesters.map((semester) => {
                      const id = toId(semester)
                      return (
                        <div key={`semester-${id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                          <div className="text-sm">
                            <span className="font-medium">{text(semester.name)}{semester.number ? ` (No. ${semester.number})` : ''}</span>
                            {semester.active ? <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-200">Active</span> : null}
                          </div>
                          {!semester.active ? <SmallButton kind="primary" onClick={() => void setActiveSemester(id)}>Activate</SmallButton> : null}
                        </div>
                      )
                    })
                  )}
                </div>
              </Panel>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}

export default AdminDashboardPage
