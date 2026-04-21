package git.jogindermikael.University.Management.System.academic.school.service;

import git.jogindermikael.University.Management.System.academic.school.dto.CreateSchoolRequest;
import git.jogindermikael.University.Management.System.academic.school.dto.SchoolResponse;
import git.jogindermikael.University.Management.System.academic.school.dto.UpdateSchoolRequest;
import git.jogindermikael.University.Management.System.academic.school.entity.School;

import java.util.List;
import java.util.UUID;

public interface SchoolService {
    SchoolResponse createSchool(CreateSchoolRequest createSchoolRequest);
    List<SchoolResponse> findAllSchools();
    SchoolResponse findSchoolById(UUID schoolId);
    SchoolResponse findSchoolByCode(String code);
    SchoolResponse updateSchool(UUID schoolId, UpdateSchoolRequest updateSchoolRequest);
    void deleteSchoolById(UUID schoolId);
    void restore(UUID schoolId);

    List<SchoolResponse> findAllDeletedSchools();
}
