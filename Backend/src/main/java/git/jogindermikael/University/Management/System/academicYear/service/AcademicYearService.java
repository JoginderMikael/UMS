package git.jogindermikael.University.Management.System.academicYear.service;

import git.jogindermikael.University.Management.System.academicYear.repository.AcademicYearRepository;
import git.jogindermikael.University.Management.System.academicYear.dto.AcademicYearRequest;
import git.jogindermikael.University.Management.System.academicYear.dto.AcademicYearResponse;
import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.semester.repository.SemesterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AcademicYearService {

    private final AcademicYearRepository repository;
    private final SemesterRepository semesterRepository;

    @CacheEvict(value = "academicYears", allEntries = true)
    public AcademicYearResponse addAcademicYear(AcademicYearRequest request) {
        //validation

        if(repository.existsByName(request.name())){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Academic Year already exists");
        }

        AcademicYear academicYear = AcademicYear.builder()
                .name(request.name())
                .active(false)
                .build();

        log.info("AcademicYear added: {}", academicYear);
       return mapToAcademicYearResponse(repository.save(academicYear));
    }

    @Cacheable(value = "academicYears", key = "'all'")
    public List<AcademicYearResponse> listAcademicYears() {
        log.info("AcademicYear listed....");
        return repository.findAll()
                .stream()
                .map(this::mapToAcademicYearResponse)
                .toList();
    }

    @CacheEvict(value = {"academicYears", "semesters"}, allEntries = true)
    public void activate(UUID id) {
        AcademicYear academicYear = repository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "Academic year not found"));

        List<AcademicYear> activeYears = repository.findAllByActiveTrue();
        for (AcademicYear activeYear : activeYears) {
            if (!activeYear.getId().equals(id)) {
                activeYear.setActive(false);
            }
        }
        repository.saveAll(activeYears);

        List<Semester> activeSemesters = semesterRepository.findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc();
        activeSemesters.stream()
                .filter(semester -> !semester.getAcademicYear().getId().equals(id))
                .forEach(semester -> semester.setActive(false));
        semesterRepository.saveAll(activeSemesters);

        academicYear.setActive(true);
        repository.save(academicYear);
        log.info("Academic Year activated: {}", academicYear);
    }
    private AcademicYearResponse mapToAcademicYearResponse(AcademicYear academicYear) {
        return new AcademicYearResponse(academicYear.getId(), academicYear.getName(), academicYear.isActive());
    }
}
