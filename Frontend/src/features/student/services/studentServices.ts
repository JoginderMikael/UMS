const API_BASE_URL = '/api/v1'

export type StudentProfile = {
  studentId: string
  userId: string
  firstName: string
  lastName: string
  email: string
  programId: string
  programName: string
  schoolId: string
  schoolName: string
  departmentName: string
  yearOfStudy: number
}

export type AcademicContext = {
  activeAcademicYearId: string
  activeAcademicYearName: string
  activeSemesterId: string
  activeSemesterName: string
}

export type StudentCourse = {
  courseId: string
  courseCode: string
  courseTitle: string
  creditUnits: number
  courseType: string
  yearOfStudy: number | null
  examRegistered: boolean
  departmentName: string
}

export type FeeStatus = {
  requiredAmount: number
  amountPaid: number
  balance: number
  cleared: boolean
}

export type TranscriptCourse = {
  courseCode: string
  courseName: string
  marks: number | null
  grade: string
}

export type TranscriptSemester = {
  academicYear: string
  semesterNumber: string
  courses: TranscriptCourse[]
}

export type TranscriptRecord = {
  academicYear: string
  semesters: TranscriptSemester[]
}

export type TranscriptSummary = {
  academicYear: string
  semesterCount: number
  totalCourses: number
  averageMarksText: string
  gradeSnapshot: string
}

type RequestOptions = {
  method?: 'GET' | 'POST'
  token: string
  body?: unknown
}

async function request<T = unknown>(path: string, options: RequestOptions): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.token}`,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) {
    throw await buildApiError(response, `${options.method ?? 'GET'} ${path}`)
  }

  if (response.status === 204) {
    return null as T
  }

  const text = await response.text()
  if (!text.trim()) {
    return null as T
  }

  try {
    return JSON.parse(text) as T
  } catch {
    return text as T
  }
}

async function buildApiError(response: Response, action: string): Promise<Error> {
  let errorMessage = `${action} failed with status ${response.status}`

  try {
    const errorBody = (await response.json()) as { message?: string; error?: string }
    errorMessage = errorBody?.message || errorBody?.error || errorMessage
  } catch {
    // keep fallback
  }

  return new Error(errorMessage)
}

export function normalizeCollection<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[]
  }

  if (!value || typeof value !== 'object') {
    return []
  }

  const candidateKeys = [
    'data',
    'content',
    'items',
    'results',
    'courses',
    'records',
    'programCourses',
    'semesters',
    'academicYears',
  ]

  for (const key of candidateKeys) {
    const nested = (value as Record<string, unknown>)[key]
    if (Array.isArray(nested)) {
      return nested as T[]
    }

    if (nested && typeof nested === 'object') {
      const normalized = normalizeCollection<T>(nested)
      if (normalized.length > 0) {
        return normalized
      }
    }
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    if (Array.isArray(nested)) {
      return nested as T[]
    }
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    if (nested && typeof nested === 'object') {
      const normalized = normalizeCollection<T>(nested)
      if (normalized.length > 0) {
        return normalized
      }
    }
  }

  return []
}

function unwrapEntity<T>(value: unknown): T {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value as T
  }

  const wrapperKeys = ['data', 'result', 'item', 'content', 'payload', 'record']
  for (const key of wrapperKeys) {
    const nested = (value as Record<string, unknown>)[key]
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return unwrapEntity<T>(nested)
    }
  }

  return value as T
}

function asString(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  return String(value)
}

function asNumber(value: unknown): number {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

export function resolveFeeCleared(value: unknown): boolean {
  const data = value && typeof value === 'object' ? (value as Record<string, unknown>) : null
  if (!data) {
    return false
  }

  const boolCandidates = [data.cleared, data.feeCleared, data.isCleared, data.feesCleared]
  for (const candidate of boolCandidates) {
    if (typeof candidate === 'boolean') {
      return candidate
    }
  }

  const statusText = String(data.status || data.feeStatus || '').trim().toLowerCase()
  if (statusText.includes('not cleared') || statusText.includes('pending') || statusText.includes('unpaid')) {
    return false
  }
  if (statusText.includes('cleared') || statusText.includes('paid')) {
    return true
  }

  const required = asNumber(data.requiredAmount)
  const paid = asNumber(data.amountPaid)
  if (required > 0) {
    return paid >= required
  }

  return asNumber(data.balance) <= 0
}

export function formatCurrency(amount: number): string {
  return `KES ${Math.abs(amount).toLocaleString()}`
}

export function formatSignedCurrency(amount: number): string {
  if (amount > 0) return `+KES ${Math.abs(amount).toLocaleString()}`
  if (amount < 0) return `-KES ${Math.abs(amount).toLocaleString()}`
  return 'KES 0'
}

export async function fetchCurrentStudentProfile(token: string): Promise<StudentProfile> {
  const payload = unwrapEntity<Record<string, unknown>>(await request('/users/me', { token }))

  return {
    studentId: asString(payload.studentId || payload.id || payload.userId),
    userId: asString(payload.userId || payload.id),
    firstName: asString(payload.firstName),
    lastName: asString(payload.lastName),
    email: asString(payload.email),
    programId: asString(payload.programId),
    programName: asString(payload.programName || payload.program),
    schoolId: asString(payload.schoolId),
    schoolName: asString(payload.schoolName || payload.school),
    departmentName: asString(payload.departmentName || payload.department),
    yearOfStudy: asNumber(payload.yearOfStudy),
  }
}

type AcademicYear = { id?: string | number; academicYearId?: string | number; name?: string; active?: boolean }
type Semester = { id?: string | number; semesterId?: string | number; name?: string; active?: boolean }

export async function fetchAcademicContext(token: string): Promise<AcademicContext> {
  const yearsResponse = await request('/academic-years/all', { token })
  const years = normalizeCollection<AcademicYear>(yearsResponse)
  const activeYear = years.find((item) => Boolean(item.active)) || years[0]

  const activeAcademicYearId = asString(activeYear?.academicYearId || activeYear?.id)
  const activeAcademicYearName = asString(activeYear?.name) || 'N/A'

  if (!activeAcademicYearId) {
    return {
      activeAcademicYearId: '',
      activeAcademicYearName,
      activeSemesterId: '',
      activeSemesterName: 'N/A',
    }
  }

  const semesterResponse = await request(`/academic-years/${activeAcademicYearId}/semesters`, { token })
  const semesters = normalizeCollection<Semester>(semesterResponse)
  const activeSemester = semesters.find((item) => Boolean(item.active)) || semesters[0]

  return {
    activeAcademicYearId,
    activeAcademicYearName,
    activeSemesterId: asString(activeSemester?.semesterId || activeSemester?.id),
    activeSemesterName: asString(activeSemester?.name) || 'N/A',
  }
}

export async function fetchRegisteredCourses(token: string, studentId: string): Promise<StudentCourse[]> {
  if (!studentId) {
    return []
  }

  const response = await request(`/students/me/courses/${encodeURIComponent(studentId)}`, { token })
  const rows = normalizeCollection<Record<string, unknown>>(response)

  return rows.map((row) => ({
    courseId: asString(row.courseId || row.id),
    courseCode: asString(row.courseCode || row.code),
    courseTitle: asString(row.courseTitle || row.title || row.courseName),
    creditUnits: asNumber(row.creditUnits),
    courseType: asString(row.courseType),
    yearOfStudy: row.yearOfStudy === undefined || row.yearOfStudy === null ? null : asNumber(row.yearOfStudy),
    examRegistered: Boolean(row.examRegistered),
    departmentName: asString(row.departmentName || row.departmentCode),
  }))
}

export async function fetchExamStatuses(token: string, studentId: string): Promise<Record<string, boolean>> {
  if (!studentId) {
    return {}
  }

  const response = await request(`/students/me/courses/${encodeURIComponent(studentId)}/exam-status`, { token })
  const rows = normalizeCollection<Record<string, unknown>>(response)
  const map: Record<string, boolean> = {}

  rows.forEach((row) => {
    const id = asString(row.courseId || row.id)
    if (!id) return
    map[id] = Boolean(row.examRegistered || row.registered)
  })

  return map
}

export function mergeCoursesWithExamStatus(courses: StudentCourse[], examMap: Record<string, boolean>): StudentCourse[] {
  return courses.map((course) => ({
    ...course,
    examRegistered: Boolean(examMap[course.courseId] ?? course.examRegistered),
  }))
}

export async function fetchFeeStatus(token: string, studentId: string, semesterId: string): Promise<FeeStatus | null> {
  if (!studentId || !semesterId) {
    return null
  }

  const payload = unwrapEntity<Record<string, unknown>>(
    await request(`/students/${encodeURIComponent(studentId)}/fees/${encodeURIComponent(semesterId)}/status`, {
      token,
    }),
  )

  return {
    requiredAmount: asNumber(payload.requiredAmount),
    amountPaid: asNumber(payload.amountPaid),
    balance: asNumber(payload.balance),
    cleared: resolveFeeCleared(payload),
  }
}

export async function fetchProgramCourses(token: string, programId: string): Promise<StudentCourse[]> {
  if (!programId) {
    return []
  }
  const response = await request(`/programs/${encodeURIComponent(programId)}/courses`, { token })
  const rows = normalizeCollection<Record<string, unknown>>(response)

  return rows.map((row) => {
    const course =
      row.course && typeof row.course === 'object' ? (row.course as Record<string, unknown>) : row

    return {
      courseId: asString(row.courseId || course.courseId || course.id),
      courseCode: asString(row.courseCode || course.courseCode || course.code),
      courseTitle: asString(row.courseTitle || course.courseTitle || course.title || course.courseName),
      creditUnits: asNumber(row.creditUnits || course.creditUnits),
      courseType: asString(row.courseType || course.courseType),
      yearOfStudy:
        row.yearOfStudy === undefined || row.yearOfStudy === null
          ? null
          : asNumber(row.yearOfStudy),
      examRegistered: false,
      departmentName: asString(row.departmentName || course.departmentName || row.departmentCode),
    }
  })
}

export async function fetchSchoolCourses(token: string, schoolId: string): Promise<StudentCourse[]> {
  const path = schoolId
    ? `/courses/schools/${encodeURIComponent(schoolId)}`
    : '/courses/university/all'

  const response = await request(path, { token })
  const rows = normalizeCollection<Record<string, unknown>>(response)

  return rows.map((row) => ({
    courseId: asString(row.courseId || row.id),
    courseCode: asString(row.courseCode || row.code),
    courseTitle: asString(row.courseTitle || row.title || row.courseName),
    creditUnits: asNumber(row.creditUnits),
    courseType: asString(row.courseType),
    yearOfStudy: row.yearOfStudy === undefined || row.yearOfStudy === null ? null : asNumber(row.yearOfStudy),
    examRegistered: false,
    departmentName: asString(row.departmentName || row.departmentCode),
  }))
}

export async function registerCourse(token: string, studentId: string, courseId: string): Promise<void> {
  await request(`/students/me/courses/${encodeURIComponent(studentId)}/${encodeURIComponent(courseId)}`, {
    method: 'POST',
    token,
  })
}

export async function registerCoursesBulk(token: string, studentId: string, courseIds: string[]): Promise<void> {
  await request('/students/me/courses/bulk', {
    method: 'POST',
    token,
    body: { studentId, courseIds },
  })
}

export async function registerExam(token: string, studentId: string, courseId: string): Promise<void> {
  await request(`/students/me/courses/${encodeURIComponent(studentId)}/${encodeURIComponent(courseId)}/exam`, {
    method: 'POST',
    token,
  })
}

export async function payFees(
  token: string,
  studentId: string,
  semesterId: string,
  amount: number,
): Promise<Record<string, unknown> | null> {
  return request(`/students/${encodeURIComponent(studentId)}/fees/${encodeURIComponent(semesterId)}/pay`, {
    method: 'POST',
    token,
    body: { amount },
  })
}

export async function registerCurrentSemester(token: string, studentId: string): Promise<void> {
  await request(`/students/me/semesters/enroll/${encodeURIComponent(studentId)}`, {
    method: 'POST',
    token,
  })
}

export async function fetchTranscript(token: string, studentId: string): Promise<TranscriptRecord[]> {
  if (!studentId) {
    return []
  }

  const payload = unwrapEntity<unknown>(
    await request(`/students/me/${encodeURIComponent(studentId)}/transcript`, { token }),
  )

  const records = Array.isArray(payload) ? payload : payload ? [payload] : []
  return records.map((recordRaw) => {
    const record = (recordRaw || {}) as Record<string, unknown>
    const year = asString(record.academicYear)
    const semestersRaw = Array.isArray(record.semesters) ? record.semesters : []

    return {
      academicYear: year,
      semesters: semestersRaw.map((semesterRaw) => {
        const semester = (semesterRaw || {}) as Record<string, unknown>
        const coursesRaw = Array.isArray(semester.courses) ? semester.courses : []
        return {
          academicYear: year,
          semesterNumber: asString(semester.semesterNumber),
          courses: coursesRaw.map((courseRaw) => {
            const course = (courseRaw || {}) as Record<string, unknown>
            const marksNum = Number(course.marks)
            return {
              courseCode: asString(course.courseCode),
              courseName: asString(course.courseName || course.courseTitle),
              marks: Number.isFinite(marksNum) ? marksNum : null,
              grade: asString(course.grade),
            }
          }),
        }
      }),
    }
  })
}

export function buildTranscriptSummary(records: TranscriptRecord[]): TranscriptSummary {
  const semesters = records.flatMap((record) => record.semesters)
  let totalCourses = 0
  let marksTotal = 0
  let marksCount = 0
  const gradeCount: Record<string, number> = {}

  semesters.forEach((semester) => {
    semester.courses.forEach((course) => {
      totalCourses += 1
      if (typeof course.marks === 'number') {
        marksTotal += course.marks
        marksCount += 1
      }

      const grade = course.grade.trim()
      if (grade) {
        gradeCount[grade] = (gradeCount[grade] || 0) + 1
      }
    })
  })

  const sortedYears = records
    .map((item) => item.academicYear)
    .filter(Boolean)
    .sort((left, right) => parseAcademicYearSortValue(right) - parseAcademicYearSortValue(left))

  const gradeSnapshot = Object.entries(gradeCount)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([grade, count]) => `${grade}:${count}`)
    .join(' | ')

  return {
    academicYear: sortedYears[0] || 'N/A',
    semesterCount: semesters.length,
    totalCourses,
    averageMarksText: marksCount > 0 ? `${(marksTotal / marksCount).toFixed(2)}%` : 'N/A',
    gradeSnapshot: gradeSnapshot || 'N/A',
  }
}

function parseAcademicYearSortValue(value: string): number {
  const text = String(value || '').trim()
  const matched = text.match(/^(\d{4})(?:\D+(\d{4}))?/) 
  if (!matched) {
    return 0
  }

  const startYear = Number(matched[1] || 0)
  const endYear = Number(matched[2] || startYear)
  return startYear * 10000 + endYear
}