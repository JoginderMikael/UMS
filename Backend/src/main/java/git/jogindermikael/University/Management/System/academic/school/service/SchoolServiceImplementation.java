package git.jogindermikael.University.Management.System.academic.school.service;

import git.jogindermikael.University.Management.System.academic.school.dto.CreateSchoolRequest;
import git.jogindermikael.University.Management.System.academic.school.dto.SchoolResponse;
import git.jogindermikael.University.Management.System.academic.school.dto.UpdateSchoolRequest;
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
public class SchoolServiceImplementation implements SchoolService {

    private final SchoolRepository schoolRepository;

    @Override
    @CacheEvict(value = "schools", allEntries = true)
    public SchoolResponse createSchool(CreateSchoolRequest createSchoolRequest) {

        if(schoolRepository.findByNameIgnoreCase(createSchoolRequest.getName()).isPresent()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "School already exists");
        }
        if(schoolRepository.existsByNameIgnoreCase(createSchoolRequest.getName())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "School Name already exists");
        }
        if(schoolRepository.existsByCodeIgnoreCase(createSchoolRequest.getCode())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code already exists");
        }

        School school = School.builder()
                .name(createSchoolRequest.getName())
                .code(createSchoolRequest.getCode())
                .active(true)
                .build();

        School savedSchool = schoolRepository.save(school);
        log.info("Created School: {} ({})", savedSchool.getName(), savedSchool.getCode() );
        return mapToSchoolResponse(savedSchool);
    }

    @Override
    @Cacheable(value = "schools", key = "'all'")
    public List<SchoolResponse> findAllSchools() {
        log.info("Finding all schools");
        return schoolRepository.findAll()
                .stream().map(this::mapToSchoolResponse).toList();
    }

    @Override
    @Cacheable(value = "schools", key = "#schoolId")
    public SchoolResponse findSchoolById(UUID schoolId) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found"));
        log.info("Found School : {} ({})", school.getName(), school.getCode());
        return mapToSchoolResponse(school);
    }

    @Override
    @Cacheable(value = "schools", key = "#code")
    public SchoolResponse findSchoolByCode(String code) {
        School school = schoolRepository.findByCodeIgnoreCase(code)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found"));
        log.info("Found School: {} ({})", school.getName(), school.getCode());
        return mapToSchoolResponse(school);
    }

    @Override
    @CacheEvict(value = "schools", allEntries = true)
    public SchoolResponse updateSchool(UUID schoolId, UpdateSchoolRequest updateSchoolRequest) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found"));

        String updatedName = updateSchoolRequest.getName().trim();
        String updatedCode = updateSchoolRequest.getCode().trim();

        if (!updatedName.equalsIgnoreCase(school.getName())
                && schoolRepository.existsByNameIgnoreCase(updatedName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "School Name already exists");
        }

        if (!updatedCode.equalsIgnoreCase(school.getCode())
                && schoolRepository.existsByCodeIgnoreCase(updatedCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code already exists");
        }

        school.setName(updatedName);
        school.setCode(updatedCode);

        School updatedSchool = schoolRepository.save(school);
        log.info("Updated School: {} ({})", updatedSchool.getName(), updatedSchool.getCode());
        return mapToSchoolResponse(updatedSchool);
    }

    @Override
    @CacheEvict(value = "schools", allEntries = true)
    public void deleteSchoolById(UUID schoolId) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assert authentication != null;
        UserPrincipal admin =  (UserPrincipal) authentication.getPrincipal();


        school.setActive(false);
        school.setDeletedAt(Instant.now());
        assert admin != null;
        school.setDeletedBy(admin.getId());

        schoolRepository.save(school);
        log.info("Deleted School: {} ({})", school.getName(), school.getCode() );
    }

    @Override
    @CacheEvict(value = "schools", allEntries = true)
    public void restore(UUID schoolId) {
        School school = schoolRepository.findDeleted(schoolId)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found"));
        school.setDeletedBy(null);
        school.setActive(true);
        school.setDeletedAt(null);
        schoolRepository.save(school);
        log.info("Restored School: {} ({})", school.getName(), school.getCode());
    }

    @Override
    public List<SchoolResponse> findAllDeletedSchools() {
        log.info("Finding all deleted schools");
        return schoolRepository.findAllDeleted()
                .stream().map(this::mapToSchoolResponse)
                .toList();
    }

    private SchoolResponse mapToSchoolResponse(School school) {
        return SchoolResponse.builder()
                .id(school.getId())
                .name(school.getName())
                .code(school.getCode())
                .build();
    }
}
