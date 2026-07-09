import { useEffect, useMemo, useState } from 'react'
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
import { navItems, type Section, type Status, type StatusKind, summaryFallback } from '../components/dashboard/constants'
import { fullName, toId } from '../components/dashboard/helpers'
import {
  CoursesSection,
  CycleSection,
  DepartmentsSection,
  OverviewSection,
  ProgramsSection,
  SchoolsSection,
  UsersSection,
} from '../components/dashboard/sections'

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

  async function refreshAll(): Promise<void> {
    if (!token) return
    await Promise.all([loadSummary(token), loadUsers(token), loadSchools(token), loadCycle(token)])
    if (selectedSchoolId) {
      await Promise.all([loadDepartments(token, selectedSchoolId), loadPrograms(token, selectedSchoolId), loadCourses(token, selectedSchoolId)])
    }
  }

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

  const selectedNav = navItems.find((item) => item.key === section) || navItems[0]

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
            <div
              className={`mb-4 rounded-xl border px-3 py-2 text-sm ${
                status.kind === 'success'
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                  : status.kind === 'error'
                    ? 'border-rose-400/40 bg-rose-500/10 text-rose-200'
                    : 'border-slate-600 bg-slate-800/70 text-slate-200'
              }`}
            >
              {status.text}
            </div>
          ) : null}

          {section === 'overview' ? <OverviewSection summary={summary} setSection={setSection} /> : null}

          {section === 'users' ? (
            <UsersSection
              newUser={newUser}
              setNewUser={setNewUser}
              onCreateUser={() => void onCreateUser()}
              lookupMode={lookupMode}
              setLookupMode={setLookupMode}
              lookupValue={lookupValue}
              setLookupValue={setLookupValue}
              onLookupUser={() => void onLookupUser()}
              lookupUser={lookupUser}
              userQuery={userQuery}
              setUserQuery={setUserQuery}
              filteredUsers={filteredUsers}
              editUserId={editUserId}
              editUserData={editUserData}
              setEditUserData={setEditUserData}
              startEditUser={startEditUser}
              saveUser={(id) => void saveUser(id)}
              setEditUserId={setEditUserId}
              deactivateUser={(id) => void deactivateUser(id)}
              deletedUsers={deletedUsers}
              restoreUser={(id) => void restoreUser(id)}
            />
          ) : null}

          {section === 'schools' ? (
            <SchoolsSection
              newSchool={newSchool}
              setNewSchool={setNewSchool}
              onCreateSchool={() => void onCreateSchool()}
              schools={schools}
              editSchoolId={editSchoolId}
              editSchoolData={editSchoolData}
              setEditSchoolData={setEditSchoolData}
              startEditSchool={startEditSchool}
              saveSchool={(id) => void saveSchool(id)}
              setEditSchoolId={setEditSchoolId}
              removeSchool={(id) => void removeSchool(id)}
              deletedSchools={deletedSchools}
              restoreSchool={(id) => void restoreSchool(id)}
            />
          ) : null}

          {section === 'departments' ? (
            <DepartmentsSection
              selectedSchoolId={selectedSchoolId}
              setSelectedSchoolId={setSelectedSchoolId}
              schools={schools}
              newDepartment={newDepartment}
              setNewDepartment={setNewDepartment}
              onCreateDepartment={() => void onCreateDepartment()}
              departments={departments}
              editDepartmentId={editDepartmentId}
              editDepartmentData={editDepartmentData}
              setEditDepartmentData={setEditDepartmentData}
              startEditDepartment={startEditDepartment}
              saveDepartment={(id) => void saveDepartment(id)}
              setEditDepartmentId={setEditDepartmentId}
              removeDepartment={(id) => void removeDepartment(id)}
              deletedDepartments={deletedDepartments}
              restoreDepartment={(id) => void restoreDepartment(id)}
            />
          ) : null}

          {section === 'programs' ? (
            <ProgramsSection
              selectedSchoolId={selectedSchoolId}
              setSelectedSchoolId={setSelectedSchoolId}
              schools={schools}
              selectedDepartmentId={selectedDepartmentId}
              setSelectedDepartmentId={setSelectedDepartmentId}
              departments={departments}
              newProgram={newProgram}
              setNewProgram={setNewProgram}
              onCreateProgram={() => void onCreateProgram()}
              programs={programs}
              editProgramId={editProgramId}
              editProgramData={editProgramData}
              setEditProgramData={setEditProgramData}
              startEditProgram={startEditProgram}
              saveProgram={(id) => void saveProgram(id)}
              setEditProgramId={setEditProgramId}
              removeProgram={(id) => void removeProgram(id)}
              selectedProgramId={selectedProgramId}
              setSelectedProgramId={setSelectedProgramId}
              allPrograms={allPrograms}
              allCourses={allCourses}
              programMapForm={programMapForm}
              setProgramMapForm={setProgramMapForm}
              mapCourseToProgram={() => void mapCourseToProgram()}
              programCourses={programCourses}
              unmapCourse={(id) => void unmapCourse(id)}
            />
          ) : null}

          {section === 'courses' ? (
            <CoursesSection
              selectedSchoolId={selectedSchoolId}
              setSelectedSchoolId={setSelectedSchoolId}
              schools={schools}
              selectedDepartmentId={selectedDepartmentId}
              setSelectedDepartmentId={setSelectedDepartmentId}
              departments={departments}
              newCourse={newCourse}
              setNewCourse={setNewCourse}
              onCreateCourse={() => void onCreateCourse()}
              courseQuery={courseQuery}
              setCourseQuery={setCourseQuery}
              filteredCourses={filteredCourses}
              editCourseId={editCourseId}
              editCourseData={editCourseData}
              setEditCourseData={setEditCourseData}
              startEditCourse={startEditCourse}
              saveCourse={(id) => void saveCourse(id)}
              setEditCourseId={setEditCourseId}
              removeCourse={(id) => void removeCourse(id)}
            />
          ) : null}

          {section === 'cycle' ? (
            <CycleSection
              years={years}
              summary={summary}
              newYearName={newYearName}
              setNewYearName={setNewYearName}
              addAcademicYear={() => void addAcademicYear()}
              selectedYearId={selectedYearId}
              setSelectedYearId={setSelectedYearId}
              newSemesterNo={newSemesterNo}
              setNewSemesterNo={setNewSemesterNo}
              addSemester={() => void addSemester()}
              setActiveYear={(id) => void setActiveYear(id)}
              semesters={semesters}
              setActiveSemester={(id) => void setActiveSemester(id)}
            />
          ) : null}
        </section>
      </div>
    </main>
  )
}

export default AdminDashboardPage
