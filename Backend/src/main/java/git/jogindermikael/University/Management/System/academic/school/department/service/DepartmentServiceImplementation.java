package git.jogindermikael.University.Management.System.academic.school.department.service;

import git.jogindermikael.University.Management.System.academic.school.department.dto.CreateDepartmentRequest;
import git.jogindermikael.University.Management.System.academic.school.department.dto.DepartmentResponse;
import git.jogindermikael.University.Management.System.academic.school.department.entity.Department;
import git.jogindermikael.University.Management.System.academic.school.department.repository.DepartmentRepository;
import git.jogindermikael.University.Management.System.academic.school.entity.School;
import git.jogindermikael.University.Management.System.academic.school.repository.SchoolRepository;
import git.jogindermikael.University.Management.System.auth.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DepartmentServiceImplementation implements DepartmentService{

    private final DepartmentRepository departmentRepository;
    private final SchoolRepository schoolRepository;

    @Override
    @CacheEvict(value = "departments", allEntries = true)
    public DepartmentResponse addDepartment(
            UUID schoolId,
            CreateDepartmentRequest createDepartmentRequest) {

        if(departmentRepository.existsByCodeIgnoreCase(createDepartmentRequest.getCode())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code already exists");
        }
        if(departmentRepository.existsByNameIgnoreCase(createDepartmentRequest.getName())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name already exists");
        }

        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found"));

        Department department = Department.builder()
                .name(createDepartmentRequest.getName())
                .code(createDepartmentRequest.getCode())
                .active(true)
                .school(school)
                .build();
        Department savedDepartment = departmentRepository.save(department);
        log.info("Department created successfully: {} ({})", savedDepartment.getName(), savedDepartment.getCode());

        return mapToDepartmentResponse(savedDepartment);
    }



    @Override
    @Cacheable(value = "departments", key = "'school-' + #schoolId")
    public List<DepartmentResponse> getAllDepartments(UUID schoolId) {

        if(!schoolRepository.existsById(schoolId)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found");
        }
        log.info("Getting all departments for School: {}", schoolId);
        return departmentRepository.findAllBySchoolId(schoolId)
                .stream()
                .map(this::mapToDepartmentResponse)
                .toList();
    }

    @Override
    @Cacheable(value = "departments", key = "#id")
    public DepartmentResponse getDepartmentById(UUID schoolId, UUID id) {

        if(!schoolRepository.existsById(schoolId)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found");
        }

        log.info("Getting department by ID: {}", id);
        return departmentRepository.findByIdAndSchoolId(id, schoolId)
                .map(this::mapToDepartmentResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));
    }

    @Override
    @CacheEvict(value = "departments", allEntries = true)
    public DepartmentResponse updateDepartment(

            UUID schoolId,
            UUID id,
            CreateDepartmentRequest createDepartmentRequest) {

        if(!schoolRepository.existsById(schoolId)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found");
        }

        Department department = departmentRepository.findByIdAndSchoolId(id,  schoolId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));

        department.setName(createDepartmentRequest.getName());
        department.setCode(createDepartmentRequest.getCode());
        Department updatedDepartment = departmentRepository.save(department);
        log.info("Department updated successfully: {} ({})", updatedDepartment.getName(), updatedDepartment.getCode());

        return mapToDepartmentResponse(updatedDepartment);
    }

    @Override
    @CacheEvict(value = "departments", allEntries = true)
    public void deleteDepartmentById(
            UUID schoolId,
            UUID id
    ) {

        if(!schoolRepository.existsById(schoolId)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found");
        }

        Department department = departmentRepository.findByIdAndSchoolId(id,   schoolId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assert auth != null;
        UserPrincipal admin = (UserPrincipal) auth.getPrincipal();

        department.setActive(false);
        department.setDeletedAt(Instant.now());
        assert admin != null;
        department.setDeletedBy(admin.getId());
        departmentRepository.save(department);
        log.info("Department deleted successfully: {} ({})", department.getName(), department.getCode());
    }

    @Override
    @CacheEvict(value = "departments", allEntries = true)
    public void restoreDepartment(UUID schoolId, UUID id) {
        if(!schoolRepository.existsById(schoolId)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found");
        }
        Department department = departmentRepository.findIncludingDeleted(id, schoolId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));
        department.setActive(true);
        department.setDeletedAt(null);
        department.setDeletedBy(null);
        departmentRepository.save(department);
        log.info("Department restored successfully: {} ({})", department.getName(), department.getCode());
    }

    @Override
    public List<DepartmentResponse> getAllDeletedDepartments(UUID schoolId) {

        if(!schoolRepository.existsById(schoolId)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found");
        }

        log.info("Getting all deleted departments successfully");
        return departmentRepository.findAllDeleted(schoolId).stream()
                .map(this::mapToDepartmentResponse)
                .toList();
    }

    private DepartmentResponse mapToDepartmentResponse(Department d) {
        return DepartmentResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .code(d.getCode())
                .schoolId(d.getSchool().getId())
                .schoolName(d.getSchool().getName())
                .schoolCode(d.getSchool().getCode())
                .build();
    }
}
