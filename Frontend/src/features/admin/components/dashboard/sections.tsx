import type {
  AcademicYear,
  Course,
  DashboardSummary,
  Department,
  Program,
  School,
  Semester,
  User,
} from '../../services/adminServices'
import { navItems, type Section } from './constants'
import { fullName, text, toId } from './helpers'
import { ActionButton, Input, Metric, Panel, RolePill, Select, SmallButton } from './ui'

export function OverviewSection({
  summary,
  setSection,
}: {
  summary: DashboardSummary
  setSection: (value: Section) => void
}) {
  return (
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
          {navItems
            .filter((item) => item.key !== 'overview')
            .map((item) => (
              <button
                key={`quick-${item.key}`}
                type="button"
                onClick={() => setSection(item.key)}
                className="rounded-full border border-slate-600 bg-slate-900/65 px-3 py-1.5 text-sm transition hover:border-violet-300/40 hover:bg-violet-400/10"
              >
                {item.icon} {item.label}
              </button>
            ))}
        </div>
      </Panel>
    </div>
  )
}

export function UsersSection({
  newUser,
  setNewUser,
  onCreateUser,
  lookupMode,
  setLookupMode,
  lookupValue,
  setLookupValue,
  onLookupUser,
  lookupUser,
  userQuery,
  setUserQuery,
  filteredUsers,
  editUserId,
  editUserData,
  setEditUserData,
  startEditUser,
  saveUser,
  setEditUserId,
  deactivateUser,
  deletedUsers,
  restoreUser,
}: {
  newUser: { firstName: string; lastName: string; email: string; role: string }
  setNewUser: React.Dispatch<React.SetStateAction<{ firstName: string; lastName: string; email: string; role: string }>>
  onCreateUser: () => void
  lookupMode: 'email' | 'id'
  setLookupMode: (value: 'email' | 'id') => void
  lookupValue: string
  setLookupValue: (value: string) => void
  onLookupUser: () => void
  lookupUser: User | null
  userQuery: string
  setUserQuery: (value: string) => void
  filteredUsers: User[]
  editUserId: string
  editUserData: { firstName: string; lastName: string; email: string; role: string }
  setEditUserData: React.Dispatch<React.SetStateAction<{ firstName: string; lastName: string; email: string; role: string }>>
  startEditUser: (user: User) => void
  saveUser: (userId: string) => void
  setEditUserId: (value: string) => void
  deactivateUser: (userId: string) => void
  deletedUsers: User[]
  restoreUser: (userId: string) => void
}) {
  return (
    <div className="space-y-5">
      <Panel title="Create user">
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={newUser.firstName} onChange={(v) => setNewUser((s) => ({ ...s, firstName: v }))} placeholder="First name" />
          <Input value={newUser.lastName} onChange={(v) => setNewUser((s) => ({ ...s, lastName: v }))} placeholder="Last name" />
          <Input value={newUser.email} onChange={(v) => setNewUser((s) => ({ ...s, email: v }))} placeholder="Email" />
          <Select value={newUser.role} onChange={(v) => setNewUser((s) => ({ ...s, role: v }))} options={['ADMIN', 'STUDENT', 'FACULTY']} />
        </div>
        <ActionButton onClick={onCreateUser}>Create user</ActionButton>
      </Panel>

      <Panel title="Lookup user">
        <div className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
          <Select value={lookupMode} onChange={(v) => setLookupMode(v as 'email' | 'id')} options={['email', 'id']} />
          <Input value={lookupValue} onChange={setLookupValue} placeholder="Lookup value" />
          <ActionButton onClick={onLookupUser}>Find</ActionButton>
        </div>
        {lookupUser ? (
          <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm">
            <p className="font-semibold">{fullName(lookupUser)}</p>
            <p className="text-slate-300">
              {text(lookupUser.email)} • {text(lookupUser.role)}
            </p>
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
                <tr>
                  <td className="px-2 py-3 text-slate-400" colSpan={4}>
                    No users found.
                  </td>
                </tr>
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
                        ) : (
                          fullName(user)
                        )}
                      </td>
                      <td className="px-2 py-2">
                        {editing ? (
                          <Input compact value={editUserData.email} onChange={(v) => setEditUserData((s) => ({ ...s, email: v }))} placeholder="Email" />
                        ) : (
                          text(user.email)
                        )}
                      </td>
                      <td className="px-2 py-2">
                        {editing ? (
                          <Select compact value={editUserData.role} onChange={(v) => setEditUserData((s) => ({ ...s, role: v }))} options={['ADMIN', 'STUDENT', 'FACULTY']} />
                        ) : (
                          <RolePill role={String(user.role || '')} />
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex flex-wrap gap-2">
                          {editing ? (
                            <>
                              <SmallButton kind="primary" onClick={() => saveUser(id)}>
                                Save
                              </SmallButton>
                              <SmallButton kind="ghost" onClick={() => setEditUserId('')}>
                                Cancel
                              </SmallButton>
                            </>
                          ) : (
                            <>
                              <SmallButton kind="secondary" onClick={() => startEditUser(user)}>
                                Edit
                              </SmallButton>
                              <SmallButton kind="danger" onClick={() => deactivateUser(id)}>
                                Deactivate
                              </SmallButton>
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
                  <span className="text-sm">
                    {fullName(user)} ({text(user.email)})
                  </span>
                  <SmallButton kind="success" onClick={() => restoreUser(id)}>
                    Restore
                  </SmallButton>
                </div>
              )
            })
          )}
        </div>
      </Panel>
    </div>
  )
}

export function SchoolsSection({
  newSchool,
  setNewSchool,
  onCreateSchool,
  schools,
  editSchoolId,
  editSchoolData,
  setEditSchoolData,
  startEditSchool,
  saveSchool,
  setEditSchoolId,
  removeSchool,
  deletedSchools,
  restoreSchool,
}: {
  newSchool: { name: string; code: string }
  setNewSchool: React.Dispatch<React.SetStateAction<{ name: string; code: string }>>
  onCreateSchool: () => void
  schools: School[]
  editSchoolId: string
  editSchoolData: { name: string; code: string }
  setEditSchoolData: React.Dispatch<React.SetStateAction<{ name: string; code: string }>>
  startEditSchool: (school: School) => void
  saveSchool: (schoolId: string) => void
  setEditSchoolId: (value: string) => void
  removeSchool: (schoolId: string) => void
  deletedSchools: School[]
  restoreSchool: (schoolId: string) => void
}) {
  return (
    <div className="space-y-5">
      <Panel title="Create school">
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={newSchool.name} onChange={(v) => setNewSchool((s) => ({ ...s, name: v }))} placeholder="School name" />
          <Input value={newSchool.code} onChange={(v) => setNewSchool((s) => ({ ...s, code: v }))} placeholder="School code" />
        </div>
        <ActionButton onClick={onCreateSchool}>Create school</ActionButton>
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
                      <SmallButton kind="primary" onClick={() => saveSchool(id)}>
                        Save
                      </SmallButton>
                      <SmallButton kind="ghost" onClick={() => setEditSchoolId('')}>
                        Cancel
                      </SmallButton>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {text(school.name || school.schoolName)} ({text(school.code || school.schoolCode)})
                      </span>
                      <div className="flex gap-2">
                        <SmallButton kind="secondary" onClick={() => startEditSchool(school)}>
                          Edit
                        </SmallButton>
                        <SmallButton kind="danger" onClick={() => removeSchool(id)}>
                          Delete
                        </SmallButton>
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
                  <span className="text-sm">
                    {text(school.name || school.schoolName)} ({text(school.code || school.schoolCode)})
                  </span>
                  <SmallButton kind="success" onClick={() => restoreSchool(id)}>
                    Restore
                  </SmallButton>
                </div>
              )
            })
          )}
        </div>
      </Panel>
    </div>
  )
}

export function DepartmentsSection({
  selectedSchoolId,
  setSelectedSchoolId,
  schools,
  newDepartment,
  setNewDepartment,
  onCreateDepartment,
  departments,
  editDepartmentId,
  editDepartmentData,
  setEditDepartmentData,
  startEditDepartment,
  saveDepartment,
  setEditDepartmentId,
  removeDepartment,
  deletedDepartments,
  restoreDepartment,
}: {
  selectedSchoolId: string
  setSelectedSchoolId: (value: string) => void
  schools: School[]
  newDepartment: { name: string; code: string }
  setNewDepartment: React.Dispatch<React.SetStateAction<{ name: string; code: string }>>
  onCreateDepartment: () => void
  departments: Department[]
  editDepartmentId: string
  editDepartmentData: { name: string; code: string }
  setEditDepartmentData: React.Dispatch<React.SetStateAction<{ name: string; code: string }>>
  startEditDepartment: (department: Department) => void
  saveDepartment: (departmentId: string) => void
  setEditDepartmentId: (value: string) => void
  removeDepartment: (departmentId: string) => void
  deletedDepartments: Department[]
  restoreDepartment: (departmentId: string) => void
}) {
  return (
    <div className="space-y-5">
      <Panel title="Department controls">
        <div className="grid gap-3 md:grid-cols-3">
          <Select
            value={selectedSchoolId}
            onChange={setSelectedSchoolId}
            options={schools.map((s) => ({ value: toId(s), label: text(s.name || s.schoolName) }))}
            placeholder="Select school"
          />
          <Input value={newDepartment.name} onChange={(v) => setNewDepartment((s) => ({ ...s, name: v }))} placeholder="Department name" />
          <Input value={newDepartment.code} onChange={(v) => setNewDepartment((s) => ({ ...s, code: v }))} placeholder="Department code" />
        </div>
        <ActionButton onClick={onCreateDepartment}>Create department</ActionButton>
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
                      <SmallButton kind="primary" onClick={() => saveDepartment(id)}>
                        Save
                      </SmallButton>
                      <SmallButton kind="ghost" onClick={() => setEditDepartmentId('')}>
                        Cancel
                      </SmallButton>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {text(department.name || department.departmentName)} ({text(department.code || department.departmentCode)})
                      </span>
                      <div className="flex gap-2">
                        <SmallButton kind="secondary" onClick={() => startEditDepartment(department)}>
                          Edit
                        </SmallButton>
                        <SmallButton kind="danger" onClick={() => removeDepartment(id)}>
                          Delete
                        </SmallButton>
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
                  <span className="text-sm">
                    {text(department.name || department.departmentName)} ({text(department.code || department.departmentCode)})
                  </span>
                  <SmallButton kind="success" onClick={() => restoreDepartment(id)}>
                    Restore
                  </SmallButton>
                </div>
              )
            })
          )}
        </div>
      </Panel>
    </div>
  )
}

export function ProgramsSection({
  selectedSchoolId,
  setSelectedSchoolId,
  schools,
  selectedDepartmentId,
  setSelectedDepartmentId,
  departments,
  newProgram,
  setNewProgram,
  onCreateProgram,
  programs,
  editProgramId,
  editProgramData,
  setEditProgramData,
  startEditProgram,
  saveProgram,
  setEditProgramId,
  removeProgram,
  selectedProgramId,
  setSelectedProgramId,
  allPrograms,
  allCourses,
  programMapForm,
  setProgramMapForm,
  mapCourseToProgram,
  programCourses,
  unmapCourse,
}: {
  selectedSchoolId: string
  setSelectedSchoolId: (value: string) => void
  schools: School[]
  selectedDepartmentId: string
  setSelectedDepartmentId: (value: string) => void
  departments: Department[]
  newProgram: { name: string; code: string }
  setNewProgram: React.Dispatch<React.SetStateAction<{ name: string; code: string }>>
  onCreateProgram: () => void
  programs: Program[]
  editProgramId: string
  editProgramData: { name: string; code: string }
  setEditProgramData: React.Dispatch<React.SetStateAction<{ name: string; code: string }>>
  startEditProgram: (program: Program) => void
  saveProgram: (programId: string) => void
  setEditProgramId: (value: string) => void
  removeProgram: (programId: string) => void
  selectedProgramId: string
  setSelectedProgramId: (value: string) => void
  allPrograms: Program[]
  allCourses: Course[]
  programMapForm: { courseId: string; courseType: string; yearOfStudy: number }
  setProgramMapForm: React.Dispatch<React.SetStateAction<{ courseId: string; courseType: string; yearOfStudy: number }>>
  mapCourseToProgram: () => void
  programCourses: Course[]
  unmapCourse: (courseId: string) => void
}) {
  return (
    <div className="space-y-5">
      <Panel title="Create and manage programs">
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            value={selectedSchoolId}
            onChange={setSelectedSchoolId}
            options={schools.map((s) => ({ value: toId(s), label: text(s.name || s.schoolName) }))}
            placeholder="Select school"
          />
          <Select
            value={selectedDepartmentId}
            onChange={setSelectedDepartmentId}
            options={departments.map((d) => ({ value: toId(d), label: text(d.name || d.departmentName) }))}
            placeholder="Select department"
          />
          <Input value={newProgram.name} onChange={(v) => setNewProgram((s) => ({ ...s, name: v }))} placeholder="Program name" />
          <Input value={newProgram.code} onChange={(v) => setNewProgram((s) => ({ ...s, code: v }))} placeholder="Program code" />
        </div>
        <ActionButton onClick={onCreateProgram}>Create program</ActionButton>
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
                      <SmallButton kind="primary" onClick={() => saveProgram(id)}>
                        Save
                      </SmallButton>
                      <SmallButton kind="ghost" onClick={() => setEditProgramId('')}>
                        Cancel
                      </SmallButton>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {text(program.name || program.programName)} ({text(program.code || program.programCode)})
                      </span>
                      <div className="flex gap-2">
                        <SmallButton kind="secondary" onClick={() => startEditProgram(program)}>
                          Edit
                        </SmallButton>
                        <SmallButton kind="danger" onClick={() => removeProgram(id)}>
                          Delete
                        </SmallButton>
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
          <Select
            value={selectedProgramId}
            onChange={setSelectedProgramId}
            options={allPrograms.map((p) => ({ value: toId(p), label: `${text(p.name || p.programName)} (${text(p.code || p.programCode)})` }))}
            placeholder="Select program"
          />
          <Select
            value={programMapForm.courseId}
            onChange={(v) => setProgramMapForm((s) => ({ ...s, courseId: v }))}
            options={allCourses.map((c) => ({ value: toId(c), label: `${text(c.title || c.courseTitle)} (${text(c.code || c.courseCode)})` }))}
            placeholder="Select course"
          />
          <Select value={programMapForm.courseType} onChange={(v) => setProgramMapForm((s) => ({ ...s, courseType: v }))} options={['CORE', 'ELECTIVE']} />
          <Input value={String(programMapForm.yearOfStudy)} onChange={(v) => setProgramMapForm((s) => ({ ...s, yearOfStudy: Number(v || 1) }))} placeholder="Year" />
        </div>
        <ActionButton onClick={mapCourseToProgram}>Map course</ActionButton>

        <div className="mt-3 space-y-2">
          {programCourses.length === 0 ? (
            <p className="text-sm text-slate-400">No mapped courses for selected program.</p>
          ) : (
            programCourses.map((c) => {
              const id = toId(c)
              return (
                <div key={`map-${id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm">
                  <span>
                    {text(c.courseTitle || c.title)} ({text(c.courseCode || c.code)}) • {text(c.courseType)} • Year {text(c.yearOfStudy)}
                  </span>
                  <SmallButton kind="danger" onClick={() => unmapCourse(id)}>
                    Remove
                  </SmallButton>
                </div>
              )
            })
          )}
        </div>
      </Panel>
    </div>
  )
}

export function CoursesSection({
  selectedSchoolId,
  setSelectedSchoolId,
  schools,
  selectedDepartmentId,
  setSelectedDepartmentId,
  departments,
  newCourse,
  setNewCourse,
  onCreateCourse,
  courseQuery,
  setCourseQuery,
  filteredCourses,
  editCourseId,
  editCourseData,
  setEditCourseData,
  startEditCourse,
  saveCourse,
  setEditCourseId,
  removeCourse,
}: {
  selectedSchoolId: string
  setSelectedSchoolId: (value: string) => void
  schools: School[]
  selectedDepartmentId: string
  setSelectedDepartmentId: (value: string) => void
  departments: Department[]
  newCourse: { title: string; code: string; creditUnits: number }
  setNewCourse: React.Dispatch<React.SetStateAction<{ title: string; code: string; creditUnits: number }>>
  onCreateCourse: () => void
  courseQuery: string
  setCourseQuery: (value: string) => void
  filteredCourses: Course[]
  editCourseId: string
  editCourseData: { title: string; creditUnits: number }
  setEditCourseData: React.Dispatch<React.SetStateAction<{ title: string; creditUnits: number }>>
  startEditCourse: (course: Course) => void
  saveCourse: (courseId: string) => void
  setEditCourseId: (value: string) => void
  removeCourse: (courseId: string) => void
}) {
  return (
    <div className="space-y-5">
      <Panel title="Create and manage courses">
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            value={selectedSchoolId}
            onChange={setSelectedSchoolId}
            options={schools.map((s) => ({ value: toId(s), label: text(s.name || s.schoolName) }))}
            placeholder="Select school"
          />
          <Select
            value={selectedDepartmentId}
            onChange={setSelectedDepartmentId}
            options={departments.map((d) => ({ value: toId(d), label: text(d.name || d.departmentName) }))}
            placeholder="Select department"
          />
          <Input value={newCourse.title} onChange={(v) => setNewCourse((s) => ({ ...s, title: v }))} placeholder="Course title" />
          <Input value={newCourse.code} onChange={(v) => setNewCourse((s) => ({ ...s, code: v }))} placeholder="Course code" />
          <Input value={String(newCourse.creditUnits)} onChange={(v) => setNewCourse((s) => ({ ...s, creditUnits: Number(v || 0) }))} placeholder="Credit units" />
        </div>
        <ActionButton onClick={onCreateCourse}>Create course</ActionButton>
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
                      <SmallButton kind="primary" onClick={() => saveCourse(id)}>
                        Save
                      </SmallButton>
                      <SmallButton kind="ghost" onClick={() => setEditCourseId('')}>
                        Cancel
                      </SmallButton>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {text(course.title || course.courseTitle)} ({text(course.code || course.courseCode)}) • {text(course.creditUnits)} credits
                      </span>
                      <div className="flex gap-2">
                        <SmallButton kind="secondary" onClick={() => startEditCourse(course)}>
                          Edit
                        </SmallButton>
                        <SmallButton kind="danger" onClick={() => removeCourse(id)}>
                          Delete
                        </SmallButton>
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
  )
}

export function CycleSection({
  years,
  summary,
  newYearName,
  setNewYearName,
  addAcademicYear,
  selectedYearId,
  setSelectedYearId,
  newSemesterNo,
  setNewSemesterNo,
  addSemester,
  setActiveYear,
  semesters,
  setActiveSemester,
}: {
  years: AcademicYear[]
  summary: DashboardSummary
  newYearName: string
  setNewYearName: (value: string) => void
  addAcademicYear: () => void
  selectedYearId: string
  setSelectedYearId: (value: string) => void
  newSemesterNo: number
  setNewSemesterNo: (value: number) => void
  addSemester: () => void
  setActiveYear: (yearId: string) => void
  semesters: Semester[]
  setActiveSemester: (semesterId: string) => void
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Academic Years" value={years.length} />
        <Metric label="Active Year" value={summary.activeAcademicYear} />
        <Metric label="Active Semester" value={summary.activeSemester} />
      </div>

      <Panel title="Academic years">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input value={newYearName} onChange={setNewYearName} placeholder="e.g., 2026-2027" />
          <ActionButton onClick={addAcademicYear}>Create year</ActionButton>
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
                    <SmallButton kind="secondary" onClick={() => setSelectedYearId(id)}>
                      Open
                    </SmallButton>
                    {!year.active ? (
                      <SmallButton kind="primary" onClick={() => setActiveYear(id)}>
                        Activate
                      </SmallButton>
                    ) : null}
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
          <ActionButton onClick={addSemester}>Create semester</ActionButton>
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
                    <span className="font-medium">
                      {text(semester.name)}
                      {semester.number ? ` (No. ${semester.number})` : ''}
                    </span>
                    {semester.active ? <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-200">Active</span> : null}
                  </div>
                  {!semester.active ? (
                    <SmallButton kind="primary" onClick={() => setActiveSemester(id)}>
                      Activate
                    </SmallButton>
                  ) : null}
                </div>
              )
            })
          )}
        </div>
      </Panel>
    </div>
  )
}
