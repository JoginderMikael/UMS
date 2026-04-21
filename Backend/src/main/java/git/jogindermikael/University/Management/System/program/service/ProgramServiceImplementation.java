package git.jogindermikael.University.Management.System.program.service;

import git.jogindermikael.University.Management.System.course.entity.Course;
import git.jogindermikael.University.Management.System.course.repository.CourseRepository;
import git.jogindermikael.University.Management.System.academic.school.department.entity.Department;
import git.jogindermikael.University.Management.System.academic.school.department.repository.DepartmentRepository;
import git.jogindermikael.University.Management.System.academic.school.entity.School;
import git.jogindermikael.University.Management.System.academic.school.repository.SchoolRepository;
import git.jogindermikael.University.Management.System.auth.security.UserPrincipal;
import git.jogindermikael.University.Management.System.program.repository.ProgramCourseRepository;
import git.jogindermikael.University.Management.System.program.repository.ProgramRepository;
import git.jogindermikael.University.Management.System.program.dto.AddProgramCourseRequest;
import git.jogindermikael.University.Management.System.program.dto.CreateProgramRequest;
import git.jogindermikael.University.Management.System.program.dto.ProgramCourseResponse;
import git.jogindermikael.University.Management.System.program.dto.ProgramMinimalResponse;
import git.jogindermikael.University.Management.System.program.dto.ProgramResponse;
import git.jogindermikael.University.Management.System.program.dto.UpdateProgramRequest;
import git.jogindermikael.University.Management.System.program.entity.Program;
import git.jogindermikael.University.Management.System.program.entity.ProgramCourse;
import git.jogindermikael.University.Management.System.program.entity.ProgramCourseId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProgramServiceImplementation implements ProgramService{

    public final ProgramRepository programRepository;
    public final CourseRepository courseRepository;
    public final ProgramCourseRepository programCourseRepository;
    public final SchoolRepository schoolRepository;
    public final DepartmentRepository departmentRepository;


    @Override
    @CacheEvict(value = "programs", allEntries = true)
    public ProgramResponse addProgram(CreateProgramRequest request) {

        School school = schoolRepository.findById(request.schoolId())
                .orElseThrow(() -> new RuntimeException("School not found"));

        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Program program = new Program();
        program.setName(request.name());
        program.setCode(request.code());
        program.setSchool(school);
        program.setDepartment(department);
        program.setActive(true);

        log.info("Adding program with name {} and code {}", program.getName(), program.getCode());
        return mapToProgramResponse(programRepository.save(program));
    }



    @Override
    @Cacheable(value = "programs", key = "#id")
    public ProgramResponse getProgramById(UUID id) {
        Program program = findProgram(id);
        log.info("Getting program with id {}", program.getId());
        return mapToProgramResponse(program);
    }

    @Override
    @Cacheable(value = "programs", key = "'all'")
    public List<ProgramMinimalResponse> getAllPrograms() {
        log.info("Getting all programs");
        return programRepository.findAll()
                .stream()
                .map(this::mapToProgramMinimalResponse)
                .toList();
    }

    @Override
    @Cacheable(value = "programs", key = "'school-' + #schoolId")
    public List<ProgramResponse> getAllProgramsBySchool(UUID schoolId) {
        List<Program> programs = programRepository.findAllBySchoolId(schoolId);
        log.info("Getting all programs by school {}", schoolId);
        return programs.stream().map(this::mapToProgramResponse).toList();
    }

    @Override
    @Cacheable(value = "programs", key = "'department-' + #departmentId")
    public List<ProgramResponse> getAllProgramsByDepartment(UUID departmentId) {
        List<Program> programs = programRepository.findAllByDepartmentId(departmentId);
        log.info("Getting all programs by department {}", departmentId);
        return programs.stream().map(this::mapToProgramResponse).toList();
    }

    @Override
    @CacheEvict(value = "programs", allEntries = true, beforeInvocation = true)
    public ProgramResponse updateProgram(UUID id, UpdateProgramRequest request) {
        Program program = findProgram(id);
        log.info("Updating program with id {}", program.getId());
        program.setName(request.name());
        program.setCode(request.code());
        Program savedProgram = programRepository.save(program);
        log.info("Updated successfully. Program ID {}", savedProgram.getId());
        return mapToProgramResponse(savedProgram);
    }

    @Override
    @CacheEvict(value = "programs", allEntries = true)
    public ProgramResponse deleteProgram(UUID id) {
        Program program = findProgram(id);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assert authentication != null;
        UserPrincipal user = (UserPrincipal) authentication.getPrincipal();

        log.info("Deleting program with id {}", program.getId());
        program.setActive(false);
        assert user != null;
        program.setDeletedBy(user.getId());
        program.setDeletedAt(Instant.now());
        log.info("Deleted program with id {}", program.getId());
        return mapToProgramResponse(programRepository.save(program));
    }

    @Override
    public ProgramCourseResponse addCourse(UUID programId, UUID courseId, AddProgramCourseRequest request) {
        Program program = findProgram(programId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (programCourseRepository.findByProgram_IdAndCourse_Id(programId, courseId).isPresent()) {
            throw new RuntimeException("Course already added to this program");
        }

        ProgramCourse association = new ProgramCourse();
        association.setId(new ProgramCourseId(programId, courseId));
        association.setProgram(program);
        association.setCourse(course);
        association.setCourseType(request.courseType());
        association.setYearOfStudy(request.yearOfStudy());
        ProgramCourse savedAssociation = programCourseRepository.save(association);

        log.info("Added course with id {} to program with id {}", course.getId(), program.getId());
        return mapToProgramCourseResponse(savedAssociation);
    }

    @Override
    public ProgramCourseResponse updateProgramCourse(UUID programId, UUID courseId, AddProgramCourseRequest request) {
        findProgram(programId);
        ProgramCourse association = programCourseRepository.findByProgram_IdAndCourse_Id(programId, courseId)
                .orElseThrow(() -> new RuntimeException("Course association not found in this program"));

        association.setCourseType(request.courseType());
        association.setYearOfStudy(request.yearOfStudy());

        ProgramCourse savedAssociation = programCourseRepository.save(association);
        log.info("Updated program-course association for program {} and course {}", programId, courseId);
        return mapToProgramCourseResponse(savedAssociation);
    }

    @Override
    public void removeCourse(UUID programId, UUID CourseId) {
        Program program = findProgram(programId);
        ProgramCourse association = programCourseRepository.findByProgram_IdAndCourse_Id(programId, CourseId)
                .orElseThrow(() -> new RuntimeException("Course association not found in this program"));
        programCourseRepository.delete(association);
        log.info("Removed course with id {} from program with id {}", CourseId, program.getId());
    }

    @Override
    public List<ProgramCourseResponse> getAllProgramCourses(UUID programId) {
        Program program = findProgram(programId);
        log.info("Getting all program courses by program {}", program.getId());
        return  programCourseRepository.findAllByProgram_Id(programId)
                .stream()
                .map(this::mapToProgramCourseResponse)
                .toList();
    }


    private Program findProgram(UUID id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found"));
    }

    private ProgramCourseResponse mapToProgramCourseResponse(ProgramCourse association) {
        Course c = association.getCourse();
        return new ProgramCourseResponse(
                c.getId(),
                c.getTitle(),
                c.getCode(),
                c.getCreditUnits(),
                association.getCourseType(),
                association.getYearOfStudy()
        );
    }
    private ProgramResponse mapToProgramResponse(Program p) {
        return new  ProgramResponse(
                p.getId(),
                p.getName(),
                p.getCode(),
                p.getSchool().getId(),
                p.getSchool().getCode(),
                p.getSchool().getName(),
                p.getDepartment().getId(),
                p.getDepartment().getCode(),
                p.getDepartment().getName()

        );
    }

    private ProgramMinimalResponse mapToProgramMinimalResponse(Program p) {
        return new ProgramMinimalResponse(
                p.getId(),
                p.getSchool().getId(),
                p.getDepartment().getId()
        );
    }
}
