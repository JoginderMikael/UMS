package git.jogindermikael.University.Management.System.program.service;

import git.jogindermikael.University.Management.System.program.dto.AddProgramCourseRequest;
import git.jogindermikael.University.Management.System.program.dto.CreateProgramRequest;
import git.jogindermikael.University.Management.System.program.dto.ProgramCourseResponse;
import git.jogindermikael.University.Management.System.program.dto.ProgramMinimalResponse;
import git.jogindermikael.University.Management.System.program.dto.ProgramResponse;
import git.jogindermikael.University.Management.System.program.dto.UpdateProgramRequest;

import java.util.List;
import java.util.UUID;

public interface ProgramService {

    //CRUD for programs
    public ProgramResponse addProgram(CreateProgramRequest request);
    public ProgramResponse getProgramById(UUID id);
    public List<ProgramMinimalResponse> getAllPrograms();
    public List<ProgramResponse> getAllProgramsBySchool(UUID schoolId);
    public List<ProgramResponse> getAllProgramsByDepartment(UUID departmentId);
    public ProgramResponse updateProgram(UUID id,  UpdateProgramRequest request);
    public ProgramResponse deleteProgram(UUID id);

    //Assigning courses to programs
    public ProgramCourseResponse addCourse(UUID programId, UUID courseId, AddProgramCourseRequest request);
    public ProgramCourseResponse updateProgramCourse(UUID programId, UUID courseId, AddProgramCourseRequest request);
    public void removeCourse(UUID programId, UUID CourseId);
    public List<ProgramCourseResponse> getAllProgramCourses(UUID programId);

}
