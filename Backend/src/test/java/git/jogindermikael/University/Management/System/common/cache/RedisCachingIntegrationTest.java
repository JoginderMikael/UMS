package git.jogindermikael.University.Management.System.common.cache;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import git.jogindermikael.University.Management.System.academic.school.entity.School;
import git.jogindermikael.University.Management.System.academic.school.repository.SchoolRepository;
import git.jogindermikael.University.Management.System.academic.school.service.SchoolService;
import git.jogindermikael.University.Management.System.academic.school.service.SchoolServiceImplementation;
import git.jogindermikael.University.Management.System.academic.school.dto.SchoolResponse;
import git.jogindermikael.University.Management.System.academic.school.department.entity.Department;
import git.jogindermikael.University.Management.System.academic.school.department.repository.DepartmentRepository;
import git.jogindermikael.University.Management.System.course.dto.CourseResponse;
import git.jogindermikael.University.Management.System.course.dto.UpdateCourseRequest;
import git.jogindermikael.University.Management.System.course.entity.Course;
import git.jogindermikael.University.Management.System.course.repository.CourseRepository;
import git.jogindermikael.University.Management.System.course.service.CourseService;
import git.jogindermikael.University.Management.System.course.service.CourseServiceImplementation;
import git.jogindermikael.University.Management.System.program.dto.ProgramResponse;
import git.jogindermikael.University.Management.System.program.dto.UpdateProgramRequest;
import git.jogindermikael.University.Management.System.program.entity.Program;
import git.jogindermikael.University.Management.System.program.repository.ProgramCourseRepository;
import git.jogindermikael.University.Management.System.program.repository.ProgramRepository;
import git.jogindermikael.University.Management.System.program.service.ProgramService;
import git.jogindermikael.University.Management.System.program.service.ProgramServiceImplementation;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.utility.DockerImageName;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringJUnitConfig(classes = RedisCachingIntegrationTest.TestConfig.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class RedisCachingIntegrationTest {

    private static final GenericContainer<?> REDIS =
            new GenericContainer<>(DockerImageName.parse("redis:7.4-alpine")).withExposedPorts(6379);

    static {
        REDIS.start();
    }

    @Autowired
    private CourseService courseService;
    @Autowired
    private ProgramService programService;
    @Autowired
    private SchoolService schoolService;
    @Autowired
    private SchoolRepository schoolRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private ProgramRepository programRepository;
    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    @Autowired
    private CacheManager cacheManager;

    @AfterAll
    void tearDownContainer() {
        REDIS.stop();
    }

    @BeforeEach
    void clearState() {
        reset(schoolRepository, courseRepository, programRepository);
        stringRedisTemplate.getConnectionFactory().getConnection().serverCommands().flushDb();
    }

    @Test
    void cacheManager_shouldUseRedisBackend() {
        assertInstanceOf(RedisCacheManager.class, cacheManager);
    }

    @Test
    void school_findAll_shouldRoundTripCollectionFromRedis() {
        UUID schoolId = UUID.randomUUID();
        School school = school(schoolId, "Engineering", "ENG");

        when(schoolRepository.findAll()).thenReturn(List.of(school));

        List<SchoolResponse> first = schoolService.findAllSchools();
        List<SchoolResponse> second = schoolService.findAllSchools();

        assertEquals(1, first.size());
        assertEquals("Engineering", second.getFirst().getName());
        verify(schoolRepository, times(1)).findAll();
    }

    @Test
    void course_getById_shouldWriteRedisKey() {
        UUID schoolId = UUID.randomUUID();
        UUID departmentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        Course course = course(courseId, "Intro to CS", "CS101", 3, schoolId, departmentId);

        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));

        CourseResponse first = courseService.getCourseById(courseId);
        assertEquals(courseId, first.id());

        Set<String> redisKeys = stringRedisTemplate.keys("*courses*");
        assertFalse(redisKeys == null || redisKeys.isEmpty());
    }

    @Test
    void course_update_shouldEvictCourseCache() {
        UUID schoolId = UUID.randomUUID();
        UUID departmentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        Course oldCourse = course(courseId, "Intro to CS", "CS101", 3, schoolId, departmentId);
        Course updatedCourse = course(courseId, "Advanced CS", "CS101", 4, schoolId, departmentId);

        when(courseRepository.findById(courseId))
                .thenReturn(Optional.of(oldCourse))
                .thenReturn(Optional.of(oldCourse))
                .thenReturn(Optional.of(updatedCourse));
        when(courseRepository.save(any(Course.class))).thenReturn(updatedCourse);

        courseService.getCourseById(courseId);
        courseService.getCourseById(courseId);
        verify(courseRepository, times(1)).findById(courseId);

        courseService.updateCourse(courseId, new UpdateCourseRequest("Advanced CS", 4));

        CourseResponse afterEviction = courseService.getCourseById(courseId);

        verify(courseRepository, times(3)).findById(courseId);
        assertEquals("Advanced CS", afterEviction.title());
        assertEquals(4, afterEviction.creditUnits());
    }

    @Test
    void program_update_shouldEvictProgramCache() {
        UUID schoolId = UUID.randomUUID();
        UUID departmentId = UUID.randomUUID();
        UUID programId = UUID.randomUUID();

        Program oldProgram = program(programId, "BSc Computer Science", "BCS", schoolId, departmentId);
        Program updatedProgram = program(programId, "BSc Advanced CS", "BACS", schoolId, departmentId);

        when(programRepository.findById(programId))
                .thenReturn(Optional.of(oldProgram))
                .thenReturn(Optional.of(oldProgram))
                .thenReturn(Optional.of(updatedProgram));
        when(programRepository.save(any(Program.class))).thenReturn(updatedProgram);

        programService.getProgramById(programId);
        programService.getProgramById(programId);

        programService.updateProgram(programId, new UpdateProgramRequest("BSc Advanced CS", "BACS"));

        ProgramResponse afterEviction = programService.getProgramById(programId);

        verify(programRepository, atLeast(2)).findById(programId);
        assertEquals("BSc Advanced CS", afterEviction.name());
        assertEquals("BACS", afterEviction.code());
    }

    private School school(UUID id, String name, String code) {
        School school = new School();
        school.setId(id);
        school.setName(name);
        school.setCode(code);
        school.setActive(true);
        return school;
    }

    private Course course(
            UUID id,
            String title,
            String code,
            int creditUnits,
            UUID schoolId,
            UUID departmentId
    ) {
        School school = school(schoolId, "Engineering", "ENG");

        Department department = Department.builder()
                .name("Computer Science")
                .code("CS")
                .school(school)
                .active(true)
                .build();
        department.setId(departmentId);

        Course course = new Course();
        course.setId(id);
        course.setTitle(title);
        course.setCode(code);
        course.setCreditUnits(creditUnits);
        course.setSchool(school);
        course.setDepartment(department);
        course.setActive(true);
        return course;
    }

    private Program program(UUID id, String name, String code, UUID schoolId, UUID departmentId) {
        School school = school(schoolId, "Engineering", "ENG");

        Department department = Department.builder()
                .name("Computer Science")
                .code("CS")
                .school(school)
                .active(true)
                .build();
        department.setId(departmentId);

        Program program = new Program();
        program.setId(id);
        program.setName(name);
        program.setCode(code);
        program.setSchool(school);
        program.setDepartment(department);
        program.setActive(true);
        return program;
    }

    @Configuration
    @EnableCaching
    static class TestConfig {

        @Bean
        RedisConnectionFactory redisConnectionFactory() {
            return new LettuceConnectionFactory(REDIS.getHost(), REDIS.getMappedPort(6379));
        }

        @Bean
        StringRedisTemplate stringRedisTemplate(RedisConnectionFactory redisConnectionFactory) {
            return new StringRedisTemplate(redisConnectionFactory);
        }

        @Bean
        RedisCacheManager redisCacheManager(RedisConnectionFactory redisConnectionFactory) {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.findAndRegisterModules();
            objectMapper.activateDefaultTyping(
                    BasicPolymorphicTypeValidator.builder()
                            .allowIfSubType("java.lang.")
                            .allowIfSubType("java.time.")
                            .allowIfSubType("java.util.")
                            .allowIfSubType("git.jogindermikael.University.Management.System.")
                            .build(),
                    ObjectMapper.DefaultTyping.EVERYTHING,
                    JsonTypeInfo.As.WRAPPER_ARRAY
            );

            RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(45))
                    .disableCachingNullValues()
                    .computePrefixWith(cacheName -> "ums:test:" + cacheName + "::")
                    .serializeKeysWith(RedisSerializationContext.SerializationPair
                            .fromSerializer(new StringRedisSerializer()))
                    .serializeValuesWith(RedisSerializationContext.SerializationPair
                            .fromSerializer(new GenericJackson2JsonRedisSerializer(objectMapper)));

            return RedisCacheManager.builder(redisConnectionFactory)
                    .cacheDefaults(config)
                    .build();
        }

        @Bean
        SchoolRepository schoolRepository() {
            return Mockito.mock(SchoolRepository.class);
        }

        @Bean
        CourseRepository courseRepository() {
            return Mockito.mock(CourseRepository.class);
        }

        @Bean
        DepartmentRepository departmentRepository() {
            return Mockito.mock(DepartmentRepository.class);
        }

        @Bean
        ProgramRepository programRepository() {
            return Mockito.mock(ProgramRepository.class);
        }

        @Bean
        ProgramCourseRepository programCourseRepository() {
            return Mockito.mock(ProgramCourseRepository.class);
        }

        @Bean
        SchoolService schoolService(SchoolRepository schoolRepository) {
            return new SchoolServiceImplementation(schoolRepository);
        }

        @Bean
        CourseService courseService(
                CourseRepository courseRepository,
                ProgramRepository programRepository,
                SchoolRepository schoolRepository,
                DepartmentRepository departmentRepository
        ) {
            return new CourseServiceImplementation(
                    courseRepository,
                    programRepository,
                    schoolRepository,
                    departmentRepository
            );
        }

        @Bean
        ProgramService programService(
                ProgramRepository programRepository,
                CourseRepository courseRepository,
                ProgramCourseRepository programCourseRepository,
                SchoolRepository schoolRepository,
                DepartmentRepository departmentRepository
        ) {
            return new ProgramServiceImplementation(
                    programRepository,
                    courseRepository,
                    programCourseRepository,
                    schoolRepository,
                    departmentRepository
            );
        }
    }
}
