import { useEffect, useMemo, useState } from 'react'
import StudentFeatureSection from '../components/StudentFeatureSection'
import { buildTranscriptSummary, fetchTranscript, type TranscriptRecord } from '../services/studentServices'
import { useStudentPortalContext } from '../services/useStudentPortalContext'

function TranscriptPage() {
  const { token, profile, loading, error } = useStudentPortalContext()
  const [records, setRecords] = useState<TranscriptRecord[]>([])
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('')
  const [status, setStatus] = useState('Loading transcript details...')

  useEffect(() => {
    if (!token || !profile) return

    const studentId = String(profile.studentId || profile.userId || '')
    if (!studentId) return

    let active = true
    setStatus('Loading transcript details...')

    void fetchTranscript(token, studentId)
      .then((next) => {
        if (!active) return
        setRecords(next)

        const years = next
          .map((item) => item.academicYear)
          .filter(Boolean)
          .sort((left, right) => right.localeCompare(left))

        setSelectedAcademicYear(years[0] || '')
        setStatus('Transcript details loaded.')
      })
      .catch((transcriptError) => {
        if (!active) return
        setStatus(transcriptError instanceof Error ? transcriptError.message : 'Failed to load transcript.')
      })

    return () => {
      active = false
    }
  }, [profile, token])

  const academicYears = useMemo(
    () => [...new Set(records.map((item) => item.academicYear).filter(Boolean))].sort((a, b) => b.localeCompare(a)),
    [records],
  )

  const filteredRecords = useMemo(() => {
    if (!selectedAcademicYear) return records
    return records.filter((item) => item.academicYear === selectedAcademicYear)
  }, [records, selectedAcademicYear])

  const semesters = useMemo(() => filteredRecords.flatMap((item) => item.semesters), [filteredRecords])
  const summary = useMemo(() => buildTranscriptSummary(filteredRecords), [filteredRecords])

  return (
    <div className="space-y-4">
      <StudentFeatureSection title="Transcript summary" subtitle="Snapshot of your academic results.">
        {loading ? <p className="text-sm text-slate-300">Loading student profile...</p> : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <p className="mb-3 text-sm text-cyan-100">{status}</p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Academic Year</p>
            <p className="mt-1 font-semibold text-white">{summary.academicYear}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Semesters</p>
            <p className="mt-1 font-semibold text-white">{summary.semesterCount}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Completed Courses</p>
            <p className="mt-1 font-semibold text-white">{summary.totalCourses}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Average Marks</p>
            <p className="mt-1 font-semibold text-white">{summary.averageMarksText}</p>
          </article>
        </div>
      </StudentFeatureSection>

      <StudentFeatureSection
        title="Results and transcript"
        subtitle="Filter by academic year and inspect semester-level course performance."
      >
        <div className="mb-4 max-w-xs">
          <label className="text-sm text-slate-300">
            Academic Year
            <select
              value={selectedAcademicYear}
              onChange={(event) => setSelectedAcademicYear(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-hidden ring-cyan-300/40 focus:ring-1"
            >
              {academicYears.length === 0 ? <option value="">No academic years available</option> : null}
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-4">
          {semesters.length === 0 ? (
            <p className="text-sm text-slate-400">No transcript records available yet.</p>
          ) : (
            semesters.map((semester, index) => (
              <section key={`${semester.academicYear}-${semester.semesterNumber}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <h4 className="mb-2 text-sm font-semibold text-white">
                  {semester.academicYear ? `${semester.academicYear} - ` : ''}Semester {semester.semesterNumber || 'N/A'}
                </h4>

                <div className="overflow-x-auto rounded-lg border border-white/10">
                  <table className="min-w-full text-left text-sm text-slate-200">
                    <thead className="bg-slate-800/80 text-xs uppercase tracking-[0.08em] text-slate-400">
                      <tr>
                        <th className="px-3 py-2">Course Code</th>
                        <th className="px-3 py-2">Course Title</th>
                        <th className="px-3 py-2">Marks</th>
                        <th className="px-3 py-2">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semester.courses.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-slate-400">
                            No course results found for this semester.
                          </td>
                        </tr>
                      ) : (
                        semester.courses.map((course, courseIndex) => (
                          <tr key={`${course.courseCode}-${courseIndex}`} className="border-b border-white/5 last:border-b-0">
                            <td className="px-3 py-2">{course.courseCode || 'N/A'}</td>
                            <td className="px-3 py-2">{course.courseName || 'N/A'}</td>
                            <td className="px-3 py-2">{course.marks ?? 'N/A'}</td>
                            <td className="px-3 py-2">{course.grade || 'N/A'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            ))
          )}
        </div>
      </StudentFeatureSection>
    </div>
  )
}

export default TranscriptPage