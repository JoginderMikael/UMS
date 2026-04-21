package git.jogindermikael.University.Management.System.course.service;

import git.jogindermikael.University.Management.System.course.dto.CourseResponse;
import git.jogindermikael.University.Management.System.course.dto.CreateCourseRequest;
import git.jogindermikael.University.Management.System.course.dto.UpdateCourseRequest;
import git.jogindermikael.University.Management.System.course.entity.Course;
import git.jogindermikael.University.Management.System.course.repository.CourseRepository;
import git.jogindermikael.University.Management.System.academic.school.department.entity.Department;
import git.jogindermikael.University.Management.System.academic.school.department.repository.DepartmentRepository;
import git.jogindermikael.University.Management.System.academic.school.entity.School;
import git.jogindermikael.University.Management.System.program.repository.ProgramRepository;
import git.jogindermikael.University.Management.System.academic.school.repository.SchoolRepository;
import git.jogindermikael.University.Management.System.auth.security.UserPrincipal;
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
@RequiredArgsConstructor
@Slf4j
public class CourseServiceImplementation implements CourseService {

    private final CourseRepository courseRepository;
    private final ProgramRepository programRepository;
    private final SchoolRepository schoolRepository;
    private final DepartmentRepository departmentRepository;


    @Override
    @CacheEvict(value = "courses", allEntries = true)
    public CourseResponse createCourse(CreateCourseRequest request) {

        School school = schoolRepository.findById(request.schoolId())
                .orElseThrow(() -> new RuntimeException("School not found"));

        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Course course = new Course();
        course.setTitle(request.title());
        course.setCode(request.code());
        course.setCreditUnits(request.creditUnits());
        course.setActive(true);
        course.setSchool(school);
        course.setDepartment(department);

        Course savedCourse = courseRepository.save(course);
        log.info("Course created: {}", savedCourse);

        return mapToCourseResponse(savedCourse);
    }

    @Override
    @Cacheable(value = "courses", key = "'all'")
    public List<CourseResponse> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        log.info("Returning all courses offered in the university");
        return courses.stream().map(this::mapToCourseResponse).toList();
    }

    @Override
    @Cacheable(value = "courses", key = "#courseId")
    public CourseResponse getCourseById(UUID courseId) {
        Course course = findCourse(courseId);
        log.info("Course found: {}", course);
        return mapToCourseResponse(course);
    }



    @Override
    @Cacheable(value = "courses", key = "'school-' + #schoolId")
    public List<CourseResponse> getCoursesBySchool(UUID schoolId) {

        List<Course> courses = courseRepository.findAllBySchoolId(schoolId);
        log.info("Returning all courses in the school {}", schoolId);
        return courses.stream().map(this::mapToCourseResponse).toList();
    }

    @Override
    @Cacheable(value = "courses", key = "'department-' + #departmentId")
    public List<CourseResponse> getCoursesByDepartment(UUID departmentId) {
        List<Course> courses = courseRepository.findAllByDepartmentId(departmentId);
        log.info("Returning all courses in the department {}", departmentId);
        return courses.stream().map(this::mapToCourseResponse).toList();
    }

    @Override
    @Cacheable(value = "courses", key = "'program-' + #ProgramId")
    public List<CourseResponse> getCoursesByProgram(UUID ProgramId) {
        List<Course> courses = courseRepository.findAllByProgramId(ProgramId);
        log.info("Returning all courses in the program {}", ProgramId);
        return courses.stream().map(this::mapToCourseResponse).toList();
    }

    @Override
    @CacheEvict(value = "courses", allEntries = true, beforeInvocation = true)
    public CourseResponse updateCourse(UUID courseId, UpdateCourseRequest request) {
        Course  course = findCourse(courseId);
        course.setTitle(request.title());
        course.setCreditUnits(request.creditUnits());
        log.info("Updating course with id {}", course.getId());
        Course updatedCourse = courseRepository.save(course);
        log.info("Course updated: {}", courseId);

        return mapToCourseResponse(updatedCourse);
    }

    @Override
    @CacheEvict(value = "courses", allEntries = true)
    public void deleteCourse(UUID courseId) {
        Course course = findCourse(courseId);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assert authentication != null;
        UserPrincipal user = (UserPrincipal) authentication.getPrincipal();

        course.setActive(false);
        assert user != null;
        course.setDeletedBy(user.getId());
        course.setDeletedAt(Instant.now());

        courseRepository.save(course);
        log.info("Course deleted: {}", courseId);
    }

    private Course findCourse(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    private CourseResponse mapToCourseResponse(Course c) {
        return new CourseResponse(
                c.getId(),
                c.getTitle(),
                c.getCode(),
                c.getCreditUnits(),
                c.getSchool().getId(),
                c.getSchool().getCode(),
                c.getSchool().getName(),
                c.getDepartment().getId(),
                c.getDepartment().getCode(),
                c.getDepartment().getName()
        );
    }
}
