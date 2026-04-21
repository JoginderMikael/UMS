package git.jogindermikael.University.Management.System.semester.service;

import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.academicYear.repository.AcademicYearRepository;
import git.jogindermikael.University.Management.System.semester.dto.CreateSemesterRequest;
import git.jogindermikael.University.Management.System.semester.dto.SemesterResponse;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.semester.repository.SemesterRepository;
import git.jogindermikael.University.Management.System.student.service.StudentFeePaymentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SemesterService {
    private final SemesterRepository semesterRepository;
    private final AcademicYearRepository academicYearRepository;
    private final StudentFeePaymentService studentFeePaymentService;

    @CacheEvict(value = {"semesters", "academicYears"}, allEntries = true)
    public SemesterResponse createSemester(
            UUID academicYearId,
            CreateSemesterRequest createSemesterRequest
    ) {
        AcademicYear academicYear = academicYearRepository.findById(academicYearId)
                .orElseThrow(()-> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Academic Year not found!"
                ));

        semesterRepository.findByAcademicYearAndNumber(academicYear, createSemesterRequest.number())
                .ifPresent(semester -> {throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "Semester already exists!");
                });

        Semester semester = Semester.builder()
                .academicYear(academicYear)
                .number(createSemesterRequest.number())
                .name("Semester " + createSemesterRequest.number())
                .active(false)
                .build();
        semester = semesterRepository.save(semester);
        log.info("Semester {} created!", createSemesterRequest.number());
        return mapToSemesterResponse(semester);
    }

    @Cacheable(value = "semesters", key = "'academicYear-' + #academicYearId")
    public List<SemesterResponse> getByAcademicYear(UUID academicYearId) {
        log.info("Returning all semesters ..... ");
        return semesterRepository.findByAcademicYear_Id(academicYearId)
                .stream()
                .map(this::mapToSemesterResponse)
                .toList();
    }

    @CacheEvict(value = {"semesters", "academicYears"}, allEntries = true)
    public void activateSemester(UUID semesterId) {
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "Semester not found!"));

        List<AcademicYear> activeYears = academicYearRepository.findAllByActiveTrue();
        activeYears.forEach(year -> year.setActive(year.getId().equals(semester.getAcademicYear().getId())));
        semester.getAcademicYear().setActive(true);

        List<Semester> activeSemesters = semesterRepository.findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc();
        Semester deactivatedSemester = activeSemesters.stream()
                .filter(s -> !s.getId().equals(semester.getId()))
                .findFirst()
                .orElse(null);

        activeSemesters.forEach(s -> s.setActive(false));

        semester.setActive(true);

        if (deactivatedSemester != null) {
            studentFeePaymentService.carryForwardPositiveBalances(deactivatedSemester, semester);
        }

        log.info("Semester {} activated!", semesterId);
    }
    private SemesterResponse mapToSemesterResponse(Semester semester) {
        return new SemesterResponse(
                semester.getId(),
                semester.getName(),
                semester.getNumber(),
                semester.isActive()
        );
    }
}
