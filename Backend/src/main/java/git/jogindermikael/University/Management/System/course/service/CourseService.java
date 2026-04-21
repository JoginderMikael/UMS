package git.jogindermikael.University.Management.System.course.service;

import git.jogindermikael.University.Management.System.course.dto.CourseResponse;
import git.jogindermikael.University.Management.System.course.dto.CreateCourseRequest;
import git.jogindermikael.University.Management.System.course.dto.UpdateCourseRequest;

import java.util.List;
import java.util.UUID;

public interface CourseService {

    public CourseResponse createCourse(CreateCourseRequest request);
    public List<CourseResponse> getAllCourses();
    public CourseResponse getCourseById(UUID courseId);
    public List<CourseResponse> getCoursesBySchool(UUID schoolId);
    public List<CourseResponse> getCoursesByDepartment(UUID departmentId);
    public List<CourseResponse> getCoursesByProgram(UUID programId);
    public CourseResponse updateCourse(UUID courseId, UpdateCourseRequest request);
    public void deleteCourse(UUID CourseId);


}
