package git.jogindermikael.University.Management.System.academic.school.department.service;

import git.jogindermikael.University.Management.System.academic.school.department.dto.CreateDepartmentRequest;
import git.jogindermikael.University.Management.System.academic.school.department.dto.DepartmentResponse;

import java.util.List;
import java.util.UUID;

public interface DepartmentService {
    DepartmentResponse addDepartment(UUID schoolId, CreateDepartmentRequest createDepartmentRequest);
    List<DepartmentResponse> getAllDepartments(UUID schoolId);
    DepartmentResponse getDepartmentById(UUID schoolId, UUID id);
    DepartmentResponse updateDepartment(UUID schoolId, UUID id, CreateDepartmentRequest createDepartmentRequest);
    void deleteDepartmentById(UUID schoolId, UUID id);
    void restoreDepartment(UUID schoolId, UUID id);
    List<DepartmentResponse> getAllDeletedDepartments(UUID schoolId);
}
