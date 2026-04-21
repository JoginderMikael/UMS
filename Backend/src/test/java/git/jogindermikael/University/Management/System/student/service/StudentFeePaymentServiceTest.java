package git.jogindermikael.University.Management.System.student.service;

import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.academicYear.repository.AcademicYearRepository;
import git.jogindermikael.University.Management.System.program.entity.Program;
import git.jogindermikael.University.Management.System.program.entity.ProgramSemesterFee;
import git.jogindermikael.University.Management.System.program.repository.ProgramRepository;
import git.jogindermikael.University.Management.System.program.repository.ProgramSemesterFeeRepository;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.semester.repository.SemesterRepository;
import git.jogindermikael.University.Management.System.student.dto.FeePaymentRequest;
import git.jogindermikael.University.Management.System.student.dto.SetProgramFeeRequest;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.student.entity.StudentFeePayment;
import git.jogindermikael.University.Management.System.student.repositories.StudentFeePaymentRepository;
import git.jogindermikael.University.Management.System.student.repositories.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentFeePaymentServiceTest {

    @Mock
    private StudentFeePaymentRepository feePaymentRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private SemesterRepository semesterRepository;
    @Mock
    private ProgramRepository programRepository;
    @Mock
    private ProgramSemesterFeeRepository programSemesterFeeRepository;
    @Mock
    private AcademicYearRepository academicYearRepository;

    @InjectMocks
    private StudentFeePaymentServiceImpl feePaymentService;

    @Test
    void setProgramFee_shouldUpsertAmount() {
        Program program = new Program();
        UUID programId = UUID.randomUUID();
        program.setId(programId);

        AcademicYear year = AcademicYear.builder().name("2025/2026").build();
        UUID yearId = UUID.randomUUID();
        year.setId(yearId);

        Semester semester = Semester.builder().number(1).academicYear(year).build();
        UUID semesterId = UUID.randomUUID();
        semester.setId(semesterId);

        SetProgramFeeRequest request = new SetProgramFeeRequest(programId, yearId, semesterId, BigDecimal.valueOf(1200));

        when(programRepository.findById(programId)).thenReturn(Optional.of(program));
        when(academicYearRepository.findById(yearId)).thenReturn(Optional.of(year));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(programSemesterFeeRepository.findByProgramAndSemester(program, semester)).thenReturn(Optional.empty());
        when(feePaymentRepository.findBySemesterAndStudent_Program(semester, program)).thenReturn(List.of());

        feePaymentService.setProgramFee(request);

        verify(programSemesterFeeRepository).save(any(ProgramSemesterFee.class));
    }

    @Test
    void payFees_shouldAccumulateAndClearWhenFullyPaid() {
        Program program = new Program();
        program.setName("Computer Science");
        program.setId(UUID.randomUUID());

        AcademicYear year = AcademicYear.builder().name("2025/2026").build();
        year.setId(UUID.randomUUID());

        Semester semester = Semester.builder().number(1).academicYear(year).build();
        UUID semesterId = UUID.randomUUID();
        semester.setId(semesterId);

        Student student = Student.builder()
                .firstName("Jane")
                .lastName("Doe")
                .registrationNumber("REG001")
                .program(program)
                .build();
        UUID studentId = UUID.randomUUID();
        student.setId(studentId);

        ProgramSemesterFee requiredFee = ProgramSemesterFee.builder()
                .program(program)
                .semester(semester)
                .amount(BigDecimal.valueOf(1200))
                .build();

        StudentFeePayment existing = StudentFeePayment.builder()
                .student(student)
                .semester(semester)
                .openingBalance(BigDecimal.ZERO)
                .amountPaid(BigDecimal.valueOf(700))
                .balance(BigDecimal.valueOf(-500))
                .cleared(false)
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(programSemesterFeeRepository.findByProgramAndSemester(program, semester)).thenReturn(Optional.of(requiredFee));
        when(feePaymentRepository.findByStudentAndSemester(student, semester)).thenReturn(Optional.of(existing));
        when(feePaymentRepository.save(any(StudentFeePayment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = feePaymentService.payFees(new FeePaymentRequest(studentId, semesterId, BigDecimal.valueOf(500)));

        assertEquals(BigDecimal.valueOf(1200), response.amountPaid());
        assertTrue(response.cleared());
        assertEquals(BigDecimal.ZERO, response.balance());
    }

    @Test
    void payFees_shouldAllowOverPaymentAndCreatePositiveCarryForwardBalance() {
        Program program = new Program();
        program.setName("Computer Science");
        Semester semester = Semester.builder().number(1).academicYear(AcademicYear.builder().name("2025/2026").build()).build();
        Student student = Student.builder().program(program).build();

        UUID studentId = UUID.randomUUID();
        UUID semesterId = UUID.randomUUID();
        student.setId(studentId);
        semester.setId(semesterId);

        ProgramSemesterFee requiredFee = ProgramSemesterFee.builder()
                .program(program)
                .semester(semester)
                .amount(BigDecimal.valueOf(1000))
                .build();
        StudentFeePayment existing = StudentFeePayment.builder()
                .student(student)
                .semester(semester)
                .openingBalance(BigDecimal.ZERO)
                .amountPaid(BigDecimal.valueOf(900))
                .balance(BigDecimal.valueOf(-100))
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(programSemesterFeeRepository.findByProgramAndSemester(program, semester)).thenReturn(Optional.of(requiredFee));
        when(feePaymentRepository.findByStudentAndSemester(student, semester)).thenReturn(Optional.of(existing));
        when(feePaymentRepository.save(any(StudentFeePayment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = feePaymentService.payFees(new FeePaymentRequest(studentId, semesterId, BigDecimal.valueOf(200)));

        assertTrue(response.cleared());
        assertEquals(BigDecimal.valueOf(100), response.balance());
    }

    @Test
    void clearFees_shouldSetPaidAmountToRequiredAndCleared() {
        Program program = new Program();
        Student student = Student.builder().program(program).registrationNumber("REG-01").build();
        Semester semester = Semester.builder().number(1).academicYear(AcademicYear.builder().name("2025/2026").build()).build();
        ProgramSemesterFee requiredFee = ProgramSemesterFee.builder().program(program).semester(semester).amount(BigDecimal.valueOf(1500)).build();

        UUID studentId = UUID.randomUUID();
        UUID semesterId = UUID.randomUUID();
        student.setId(studentId);
        semester.setId(semesterId);

        StudentFeePayment payment = StudentFeePayment.builder().student(student).semester(semester).amountPaid(BigDecimal.ZERO).cleared(false).build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(programSemesterFeeRepository.findByProgramAndSemester(program, semester)).thenReturn(Optional.of(requiredFee));
        when(feePaymentRepository.findByStudentAndSemester(student, semester)).thenReturn(Optional.of(payment));
        when(feePaymentRepository.save(any(StudentFeePayment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        feePaymentService.clearFees(studentId, semesterId);

        assertEquals(BigDecimal.valueOf(1500), payment.getAmountPaid());
        assertTrue(payment.isCleared());
    }

    @Test
    void getFeeStatus_shouldReturnNegativeBalanceWhenUnderpaid() {
        Program program = new Program();
        program.setName("Computer Science");
        Student student = Student.builder()
                .firstName("Jane")
                .lastName("Doe")
                .registrationNumber("REG-01")
                .program(program)
                .build();
        UUID studentId = UUID.randomUUID();
        student.setId(studentId);

        AcademicYear year = AcademicYear.builder().name("2025/2026").build();
        year.setId(UUID.randomUUID());
        Semester semester = Semester.builder().number(1).academicYear(year).build();
        UUID semesterId = UUID.randomUUID();
        semester.setId(semesterId);

        ProgramSemesterFee requiredFee = ProgramSemesterFee.builder().program(program).semester(semester).amount(BigDecimal.valueOf(1200)).build();
        StudentFeePayment payment = StudentFeePayment.builder()
                .student(student)
                .semester(semester)
                .openingBalance(BigDecimal.ZERO)
                .amountPaid(BigDecimal.valueOf(300))
                .balance(BigDecimal.valueOf(-900))
                .cleared(false)
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(programSemesterFeeRepository.findByProgramAndSemester(program, semester)).thenReturn(Optional.of(requiredFee));
        when(feePaymentRepository.findByStudentAndSemester(student, semester)).thenReturn(Optional.of(payment));

        var status = feePaymentService.getFeeStatus(studentId, semesterId);
        assertFalse(status.cleared());
        assertEquals(BigDecimal.valueOf(-900), status.balance());
    }

    @Test
    void getAllFeeStatuses_shouldMapRepositoryRows() {
        Program program = new Program();
        program.setName("Computer Science");
        AcademicYear year = AcademicYear.builder().name("2025/2026").build();
        Semester semester = Semester.builder().number(1).academicYear(year).build();
        Student student = Student.builder()
                .firstName("Jane")
                .lastName("Doe")
                .registrationNumber("REG-01")
                .program(program)
                .build();

        StudentFeePayment payment = StudentFeePayment.builder()
                .student(student)
                .semester(semester)
                .openingBalance(BigDecimal.ZERO)
                .amountPaid(BigDecimal.valueOf(300))
                .balance(BigDecimal.valueOf(-700))
                .cleared(false)
                .build();

        ProgramSemesterFee requiredFee = ProgramSemesterFee.builder()
                .program(program)
                .semester(semester)
                .amount(BigDecimal.valueOf(1000))
                .build();

        when(feePaymentRepository.findAll()).thenReturn(List.of(payment));
        when(programSemesterFeeRepository.findByProgramAndSemester(program, semester)).thenReturn(Optional.of(requiredFee));

        var statuses = feePaymentService.getAllFeeStatuses();

        assertEquals(1, statuses.size());
        assertEquals(BigDecimal.valueOf(-700), statuses.get(0).balance());
        assertFalse(statuses.get(0).cleared());
    }

    @Test
    void isFeesCleared_shouldReturnFalseWhenNoRecord() {
        Student student = Student.builder().build();
        Semester semester = Semester.builder().build();

        when(feePaymentRepository.findByStudentAndSemester(student, semester)).thenReturn(Optional.empty());

        assertFalse(feePaymentService.isFeesCleared(student, semester));
    }

    @Test
    void carryForwardPositiveBalances_shouldApplyCarryToAmountPaidInNextSemester() {
        Program program = new Program();
        program.setName("Computer Science");

        AcademicYear year = AcademicYear.builder().name("2025/2026").build();
        Semester oldSemester = Semester.builder().number(1).academicYear(year).build();
        Semester newSemester = Semester.builder().number(2).academicYear(year).build();

        Student student = Student.builder()
                .firstName("Jane")
                .lastName("Doe")
                .registrationNumber("REG-01")
                .program(program)
                .build();

        StudentFeePayment oldPayment = StudentFeePayment.builder()
                .student(student)
                .semester(oldSemester)
                .openingBalance(BigDecimal.ZERO)
                .amountPaid(BigDecimal.valueOf(10000))
                .balance(BigDecimal.valueOf(5000))
                .cleared(true)
                .build();

        ProgramSemesterFee newSemesterRequiredFee = ProgramSemesterFee.builder()
                .program(program)
                .semester(newSemester)
                .amount(BigDecimal.valueOf(5000))
                .build();
        ProgramSemesterFee oldSemesterRequiredFee = ProgramSemesterFee.builder()
                .program(program)
                .semester(oldSemester)
                .amount(BigDecimal.valueOf(5000))
                .build();

        when(feePaymentRepository.findBySemesterAndBalanceGreaterThan(oldSemester, BigDecimal.ZERO))
                .thenReturn(List.of(oldPayment));
        when(programSemesterFeeRepository.findByProgramAndSemester(program, oldSemester))
                .thenReturn(Optional.of(oldSemesterRequiredFee));
        when(programSemesterFeeRepository.findByProgramAndSemester(program, newSemester))
                .thenReturn(Optional.of(newSemesterRequiredFee));
        when(feePaymentRepository.findByStudentAndSemester(student, newSemester))
                .thenReturn(Optional.empty());
        when(feePaymentRepository.save(any(StudentFeePayment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        feePaymentService.carryForwardPositiveBalances(oldSemester, newSemester);

        ArgumentCaptor<StudentFeePayment> paymentCaptor = ArgumentCaptor.forClass(StudentFeePayment.class);
        verify(feePaymentRepository, atLeastOnce()).save(paymentCaptor.capture());

        StudentFeePayment savedPayment = paymentCaptor.getAllValues().stream()
                .filter(payment -> payment.getSemester() == newSemester)
                .findFirst()
                .orElse(null);
        assertNotNull(savedPayment);
        assertEquals(BigDecimal.ZERO, savedPayment.getOpeningBalance());
        assertEquals(BigDecimal.valueOf(5000), savedPayment.getAmountPaid());
        assertEquals(BigDecimal.ZERO, savedPayment.getBalance());
        assertTrue(savedPayment.isCleared());
    }

    @Test
    void carryForwardPositiveBalances_shouldUseRecalculatedFromSemesterBalanceNotStaleStoredBalance() {
        Program program = new Program();
        AcademicYear year = AcademicYear.builder().name("2025/2026").build();
        Semester oldSemester = Semester.builder().number(1).academicYear(year).build();
        Semester newSemester = Semester.builder().number(2).academicYear(year).build();

        Student student = Student.builder().registrationNumber("REG-01").program(program).build();

        StudentFeePayment oldPayment = StudentFeePayment.builder()
                .student(student)
                .semester(oldSemester)
                .openingBalance(BigDecimal.ZERO)
                .amountPaid(BigDecimal.valueOf(10000))
                .balance(BigDecimal.valueOf(10000))
                .cleared(true)
                .build();

        StudentFeePayment nextPayment = StudentFeePayment.builder()
                .student(student)
                .semester(newSemester)
                .openingBalance(BigDecimal.ZERO)
                .amountPaid(BigDecimal.ZERO)
                .balance(BigDecimal.ZERO)
                .cleared(false)
                .build();

        ProgramSemesterFee fromRequired = ProgramSemesterFee.builder().program(program).semester(oldSemester).amount(BigDecimal.valueOf(2000)).build();
        ProgramSemesterFee toRequired = ProgramSemesterFee.builder().program(program).semester(newSemester).amount(BigDecimal.valueOf(5000)).build();

        when(feePaymentRepository.findBySemesterAndBalanceGreaterThan(oldSemester, BigDecimal.ZERO)).thenReturn(List.of(oldPayment));
        when(programSemesterFeeRepository.findByProgramAndSemester(program, oldSemester)).thenReturn(Optional.of(fromRequired));
        when(programSemesterFeeRepository.findByProgramAndSemester(program, newSemester)).thenReturn(Optional.of(toRequired));
        when(feePaymentRepository.findByStudentAndSemester(student, newSemester)).thenReturn(Optional.of(nextPayment));
        when(feePaymentRepository.save(any(StudentFeePayment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        feePaymentService.carryForwardPositiveBalances(oldSemester, newSemester);

        assertEquals(BigDecimal.valueOf(8000), oldPayment.getBalance());
        assertEquals(BigDecimal.valueOf(8000), nextPayment.getAmountPaid());
        assertEquals(BigDecimal.valueOf(3000), nextPayment.getBalance());
        assertTrue(nextPayment.isCleared());
    }

    @Test
    void carryForwardPositiveBalances_shouldNotCreateNextSemesterPaymentWhenRecalculatedBalanceIsNotPositive() {
        Program program = new Program();
        AcademicYear year = AcademicYear.builder().name("2026/2027").build();
        Semester oldSemester = Semester.builder().number(2).academicYear(year).build();
        Semester newSemester = Semester.builder().number(1).academicYear(AcademicYear.builder().name("2027/2028").build()).build();
        Student student = Student.builder().registrationNumber("REG-NEG").program(program).build();

        StudentFeePayment oldPayment = StudentFeePayment.builder()
                .student(student)
                .semester(oldSemester)
                .openingBalance(BigDecimal.ZERO)
                .amountPaid(BigDecimal.valueOf(1000))
                .balance(BigDecimal.valueOf(1000))
                .cleared(true)
                .build();

        ProgramSemesterFee fromRequired = ProgramSemesterFee.builder()
                .program(program)
                .semester(oldSemester)
                .amount(BigDecimal.valueOf(1500))
                .build();

        when(feePaymentRepository.findBySemesterAndBalanceGreaterThan(oldSemester, BigDecimal.ZERO)).thenReturn(List.of(oldPayment));
        when(programSemesterFeeRepository.findByProgramAndSemester(program, oldSemester)).thenReturn(Optional.of(fromRequired));

        feePaymentService.carryForwardPositiveBalances(oldSemester, newSemester);

        assertEquals(BigDecimal.valueOf(-500), oldPayment.getBalance());
        assertFalse(oldPayment.isCleared());
        verify(feePaymentRepository).save(oldPayment);
        verify(feePaymentRepository, never()).findByStudentAndSemester(student, newSemester);
    }

    @Test
    void carryForwardPositiveBalances_shouldTreatMissingFeeConfigurationsAsZero() {
        Program program = new Program();
        AcademicYear year = AcademicYear.builder().name("2026/2027").build();
        Semester oldSemester = Semester.builder().number(1).academicYear(year).build();
        Semester newSemester = Semester.builder().number(2).academicYear(year).build();
        Student student = Student.builder().registrationNumber("REG-ZERO").program(program).build();

        StudentFeePayment oldPayment = StudentFeePayment.builder()
                .student(student)
                .semester(oldSemester)
                .openingBalance(BigDecimal.valueOf(100))
                .amountPaid(BigDecimal.valueOf(200))
                .balance(BigDecimal.valueOf(300))
                .cleared(true)
                .build();

        when(feePaymentRepository.findBySemesterAndBalanceGreaterThan(oldSemester, BigDecimal.ZERO)).thenReturn(List.of(oldPayment));
        when(programSemesterFeeRepository.findByProgramAndSemester(program, oldSemester)).thenReturn(Optional.empty());
        when(programSemesterFeeRepository.findByProgramAndSemester(program, newSemester)).thenReturn(Optional.empty());
        when(feePaymentRepository.findByStudentAndSemester(student, newSemester)).thenReturn(Optional.empty());
        when(feePaymentRepository.save(any(StudentFeePayment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        feePaymentService.carryForwardPositiveBalances(oldSemester, newSemester);

        ArgumentCaptor<StudentFeePayment> paymentCaptor = ArgumentCaptor.forClass(StudentFeePayment.class);
        verify(feePaymentRepository, atLeastOnce()).save(paymentCaptor.capture());

        StudentFeePayment toSemesterPayment = paymentCaptor.getAllValues().stream()
                .filter(payment -> payment.getSemester() == newSemester)
                .findFirst()
                .orElseThrow();

        assertEquals(BigDecimal.valueOf(300), oldPayment.getBalance());
        assertEquals(BigDecimal.valueOf(300), toSemesterPayment.getAmountPaid());
        assertEquals(BigDecimal.valueOf(300), toSemesterPayment.getBalance());
        assertTrue(toSemesterPayment.isCleared());
    }

    @Test
    void carryForwardPositiveBalances_shouldMergeCarryForwardWithExistingNextSemesterPayment() {
        Program program = new Program();
        AcademicYear year = AcademicYear.builder().name("2026/2027").build();
        Semester oldSemester = Semester.builder().number(1).academicYear(year).build();
        Semester newSemester = Semester.builder().number(2).academicYear(year).build();
        Student student = Student.builder().registrationNumber("REG-MERGE").program(program).build();

        StudentFeePayment oldPayment = StudentFeePayment.builder()
                .student(student)
                .semester(oldSemester)
                .openingBalance(BigDecimal.ZERO)
                .amountPaid(BigDecimal.valueOf(1800))
                .balance(BigDecimal.valueOf(1800))
                .cleared(true)
                .build();

        StudentFeePayment nextPayment = StudentFeePayment.builder()
                .student(student)
                .semester(newSemester)
                .openingBalance(BigDecimal.valueOf(100))
                .amountPaid(BigDecimal.valueOf(200))
                .balance(BigDecimal.valueOf(-200))
                .cleared(false)
                .build();

        ProgramSemesterFee fromRequired = ProgramSemesterFee.builder().program(program).semester(oldSemester).amount(BigDecimal.valueOf(1000)).build();
        ProgramSemesterFee toRequired = ProgramSemesterFee.builder().program(program).semester(newSemester).amount(BigDecimal.valueOf(900)).build();

        when(feePaymentRepository.findBySemesterAndBalanceGreaterThan(oldSemester, BigDecimal.ZERO)).thenReturn(List.of(oldPayment));
        when(programSemesterFeeRepository.findByProgramAndSemester(program, oldSemester)).thenReturn(Optional.of(fromRequired));
        when(programSemesterFeeRepository.findByProgramAndSemester(program, newSemester)).thenReturn(Optional.of(toRequired));
        when(feePaymentRepository.findByStudentAndSemester(student, newSemester)).thenReturn(Optional.of(nextPayment));
        when(feePaymentRepository.save(any(StudentFeePayment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        feePaymentService.carryForwardPositiveBalances(oldSemester, newSemester);

        assertEquals(BigDecimal.valueOf(800), oldPayment.getBalance());
        assertEquals(BigDecimal.valueOf(1000), nextPayment.getAmountPaid());
        assertEquals(BigDecimal.valueOf(200), nextPayment.getBalance());
        assertTrue(nextPayment.isCleared());
    }

    @Test
    void setProgramFee_shouldRecalculateExistingSemesterPaymentBalances() {
        Program program = new Program();
        UUID programId = UUID.randomUUID();
        program.setId(programId);

        AcademicYear year = AcademicYear.builder().name("2025/2026").build();
        UUID yearId = UUID.randomUUID();
        year.setId(yearId);

        Semester semester = Semester.builder().number(2).academicYear(year).build();
        UUID semesterId = UUID.randomUUID();
        semester.setId(semesterId);

        Student student = Student.builder().program(program).build();
        StudentFeePayment payment = StudentFeePayment.builder()
                .student(student)
                .semester(semester)
                .openingBalance(BigDecimal.ZERO)
                .amountPaid(BigDecimal.valueOf(10000))
                .balance(BigDecimal.valueOf(10000))
                .cleared(true)
                .build();

        SetProgramFeeRequest request = new SetProgramFeeRequest(programId, yearId, semesterId, BigDecimal.valueOf(2000));

        when(programRepository.findById(programId)).thenReturn(Optional.of(program));
        when(academicYearRepository.findById(yearId)).thenReturn(Optional.of(year));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(programSemesterFeeRepository.findByProgramAndSemester(program, semester)).thenReturn(Optional.empty());
        when(feePaymentRepository.findBySemesterAndStudent_Program(semester, program)).thenReturn(List.of(payment));

        feePaymentService.setProgramFee(request);

        assertEquals(BigDecimal.valueOf(8000), payment.getBalance());
        assertTrue(payment.isCleared());
        verify(feePaymentRepository).saveAll(eq(List.of(payment)));
    }

    @Test
    void setProgramFee_shouldRejectWhenSemesterAcademicYearMismatch() {
        Program program = new Program();
        UUID programId = UUID.randomUUID();
        program.setId(programId);

        AcademicYear requestYear = AcademicYear.builder().name("2026/2027").build();
        requestYear.setId(UUID.randomUUID());
        AcademicYear semesterYear = AcademicYear.builder().name("2027/2028").build();
        semesterYear.setId(UUID.randomUUID());

        Semester semester = Semester.builder().number(1).academicYear(semesterYear).build();
        UUID semesterId = UUID.randomUUID();
        semester.setId(semesterId);

        SetProgramFeeRequest request = new SetProgramFeeRequest(
                programId,
                requestYear.getId(),
                semesterId,
                BigDecimal.valueOf(1200)
        );

        when(programRepository.findById(programId)).thenReturn(Optional.of(program));
        when(academicYearRepository.findById(requestYear.getId())).thenReturn(Optional.of(requestYear));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> feePaymentService.setProgramFee(request));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }
}
