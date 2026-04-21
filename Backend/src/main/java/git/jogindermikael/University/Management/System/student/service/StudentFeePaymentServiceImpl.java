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
import git.jogindermikael.University.Management.System.student.dto.FeeStatusResponse;
import git.jogindermikael.University.Management.System.student.dto.ProgramFeeRecordResponse;
import git.jogindermikael.University.Management.System.student.dto.SetProgramFeeRequest;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.student.entity.StudentFeePayment;
import git.jogindermikael.University.Management.System.student.repositories.StudentFeePaymentRepository;
import git.jogindermikael.University.Management.System.student.repositories.StudentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class StudentFeePaymentServiceImpl implements StudentFeePaymentService{

    private final StudentFeePaymentRepository feePaymentRepository;
    private final StudentRepository studentRepository;
    private final SemesterRepository semesterRepository;
    private final ProgramRepository programRepository;
    private final ProgramSemesterFeeRepository programSemesterFeeRepository;
    private final AcademicYearRepository academicYearRepository;

    @Override
    public void carryForwardPositiveBalances(Semester fromSemester, Semester toSemester) {
        List<StudentFeePayment> overpaidRecords = feePaymentRepository
                .findBySemesterAndBalanceGreaterThan(fromSemester, BigDecimal.ZERO);

        for (StudentFeePayment previousPayment : overpaidRecords) {
            Student student = previousPayment.getStudent();
            BigDecimal fromSemesterRequiredAmount = programSemesterFeeRepository
                    .findByProgramAndSemester(student.getProgram(), fromSemester)
                    .map(ProgramSemesterFee::getAmount)
                    .map(this::getOrZero)
                    .orElse(BigDecimal.ZERO);

            BigDecimal effectiveFromSemesterBalance = getOrZero(previousPayment.getOpeningBalance())
                    .add(getOrZero(previousPayment.getAmountPaid()))
                    .subtract(fromSemesterRequiredAmount);
            previousPayment.setBalance(effectiveFromSemesterBalance);
            previousPayment.setCleared(effectiveFromSemesterBalance.compareTo(BigDecimal.ZERO) >= 0);

            BigDecimal carryAmount = effectiveFromSemesterBalance.max(BigDecimal.ZERO);
            if (carryAmount.compareTo(BigDecimal.ZERO) <= 0) {
                feePaymentRepository.save(previousPayment);
                continue;
            }

            BigDecimal requiredAmountForNextSemester = programSemesterFeeRepository
                    .findByProgramAndSemester(student.getProgram(), toSemester)
                    .map(ProgramSemesterFee::getAmount)
                    .map(this::getOrZero)
                    .orElse(BigDecimal.ZERO);

            StudentFeePayment nextSemesterPayment = feePaymentRepository
                    .findByStudentAndSemester(student, toSemester)
                    .orElse(
                            StudentFeePayment.builder()
                                    .student(student)
                                    .semester(toSemester)
                                    .openingBalance(BigDecimal.ZERO)
                                    .amountPaid(BigDecimal.ZERO)
                                    .balance(BigDecimal.ZERO)
                                    .cleared(false)
                                    .build()
                    );

            // Carry-forward is treated as paid amount in the new semester for fee summary consistency.
            BigDecimal updatedOpening = getOrZero(nextSemesterPayment.getOpeningBalance());
            BigDecimal updatedPaid = getOrZero(nextSemesterPayment.getAmountPaid()).add(carryAmount);
            BigDecimal updatedBalance = updatedOpening.add(updatedPaid).subtract(requiredAmountForNextSemester);

            nextSemesterPayment.setOpeningBalance(updatedOpening);
            nextSemesterPayment.setAmountPaid(updatedPaid);
            nextSemesterPayment.setBalance(updatedBalance);
            nextSemesterPayment.setCleared(updatedBalance.compareTo(BigDecimal.ZERO) >= 0);

            feePaymentRepository.save(previousPayment);
            feePaymentRepository.save(nextSemesterPayment);
            log.info("Carried {} from semester {} to {} for student {}",
                    carryAmount,
                    fromSemester.getNumber(),
                    toSemester.getNumber(),
                    student.getRegistrationNumber());
        }
    }

    @Override
    public void clearFees(UUID studentId, UUID semesterId) {

        Student student = findStudent(studentId);
        Semester semester = findSemester(semesterId);
        ProgramSemesterFee requiredFee = findProgramSemesterFee(student.getProgram(), semester);

        StudentFeePayment payment = feePaymentRepository.findByStudentAndSemester(student, semester)
                .orElse(
                        StudentFeePayment.builder()
                                .student(student)
                                .semester(semester)
                                .openingBalance(getOpeningBalance(student, semester))
                                .amountPaid(BigDecimal.ZERO)
                                .balance(BigDecimal.ZERO)
                                .build()
                );

        BigDecimal opening = getOrZero(payment.getOpeningBalance());
        BigDecimal requiredAmount = getOrZero(requiredFee.getAmount());
        BigDecimal requiredStudentPayment = requiredAmount.subtract(opening);
        if (requiredStudentPayment.compareTo(BigDecimal.ZERO) < 0) {
            requiredStudentPayment = BigDecimal.ZERO;
        }

        BigDecimal currentPaid = getOrZero(payment.getAmountPaid());
        BigDecimal finalAmountPaid = currentPaid.max(requiredStudentPayment);
        BigDecimal closingBalance = opening.add(finalAmountPaid).subtract(requiredAmount);
        payment.setAmountPaid(finalAmountPaid);
        payment.setBalance(closingBalance);
        payment.setCleared(closingBalance.compareTo(BigDecimal.ZERO) >= 0);
        feePaymentRepository.save(payment);
        log.info("Fees cleared for student {} for semester {}", student.getRegistrationNumber(), semester.getNumber());
    }

    @Override
    public boolean isFeesCleared(Student student, Semester semester) {
        return feePaymentRepository
                .findByStudentAndSemester(student, semester)
                .map(StudentFeePayment::isCleared)
                .orElse(false);
    }

    @Override
    public void setProgramFee(SetProgramFeeRequest request) {
        Program program = programRepository.findById(request.programId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Program not found"));
        AcademicYear academicYear = academicYearRepository.findById(request.academicYearId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Academic year not found"));
        Semester semester = findSemester(request.semesterId());

        if (!semester.getAcademicYear().getId().equals(academicYear.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Semester does not belong to the provided academic year");
        }

        ProgramSemesterFee fee = programSemesterFeeRepository.findByProgramAndSemester(program, semester)
                .orElse(
                        ProgramSemesterFee.builder()
                                .program(program)
                                .semester(semester)
                                .build()
                );
        fee.setAmount(request.amount());
        programSemesterFeeRepository.save(fee);

        List<StudentFeePayment> semesterPayments = feePaymentRepository
                .findBySemesterAndStudent_Program(semester, program);
        for (StudentFeePayment payment : semesterPayments) {
            BigDecimal updatedBalance = getOrZero(payment.getOpeningBalance())
                    .add(getOrZero(payment.getAmountPaid()))
                    .subtract(getOrZero(fee.getAmount()));
            payment.setBalance(updatedBalance);
            payment.setCleared(updatedBalance.compareTo(BigDecimal.ZERO) >= 0);
        }
        feePaymentRepository.saveAll(semesterPayments);
    }

    @Override
    public List<ProgramFeeRecordResponse> getProgramFeeRecords(UUID programId) {
        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Program not found"));

        return programSemesterFeeRepository
                .findByProgram_IdOrderBySemester_AcademicYear_NameAscSemester_NumberAsc(programId)
                .stream()
                .map(fee -> new ProgramFeeRecordResponse(
                        program.getId(),
                        program.getName(),
                        fee.getSemester().getId(),
                        fee.getSemester().getNumber(),
                        fee.getSemester().getName(),
                        fee.getSemester().getAcademicYear().getId(),
                        fee.getSemester().getAcademicYear().getName(),
                        fee.getAmount()
                ))
                .toList();
    }

    @Override
    public FeeStatusResponse payFees(FeePaymentRequest request) {
        Student student = findStudent(request.studentId());
        Semester semester = findSemester(request.semesterId());
        ProgramSemesterFee requiredFee = findProgramSemesterFee(student.getProgram(), semester);

        StudentFeePayment payment = feePaymentRepository.findByStudentAndSemester(student, semester)
                .orElse(
                        StudentFeePayment.builder()
                                .student(student)
                                .semester(semester)
                                .openingBalance(getOpeningBalance(student, semester))
                                .amountPaid(BigDecimal.ZERO)
                                .balance(BigDecimal.ZERO)
                                .cleared(false)
                                .build()
                );

        BigDecimal currentPaid = payment.getAmountPaid() == null ? BigDecimal.ZERO : payment.getAmountPaid();
        BigDecimal updatedPaid = currentPaid.add(request.amount());
        BigDecimal opening = getOrZero(payment.getOpeningBalance());
        BigDecimal requiredAmount = getOrZero(requiredFee.getAmount());
        BigDecimal closingBalance = opening.add(updatedPaid).subtract(requiredAmount);
        payment.setAmountPaid(updatedPaid);
        payment.setBalance(closingBalance);
        payment.setCleared(closingBalance.compareTo(BigDecimal.ZERO) >= 0);
        StudentFeePayment saved = feePaymentRepository.save(payment);

        return mapToFeeStatus(saved.getStudent(), saved.getSemester(), requiredAmount, saved);
    }

    @Override
    public FeeStatusResponse getFeeStatus(UUID studentId, UUID semesterId) {
        Student student = findStudent(studentId);
        Semester semester = findSemester(semesterId);
        ProgramSemesterFee requiredFee = findProgramSemesterFee(student.getProgram(), semester);
        StudentFeePayment payment = feePaymentRepository.findByStudentAndSemester(student, semester).orElse(null);
        if (payment == null) {
            BigDecimal opening = getOpeningBalance(student, semester);
            BigDecimal requiredAmount = getOrZero(requiredFee.getAmount());
            BigDecimal balance = opening.subtract(requiredAmount);
            return new FeeStatusResponse(
                    student.getId(),
                    student.getRegistrationNumber(),
                    student.getFirstName() + " " + student.getLastName(),
                    student.getProgram().getId(),
                    student.getProgram().getName(),
                    semester.getId(),
                    semester.getAcademicYear().getId(),
                    requiredAmount,
                    BigDecimal.ZERO,
                    balance,
                    balance.compareTo(BigDecimal.ZERO) >= 0
            );
        }
        return mapToFeeStatus(student, semester, requiredFee.getAmount(), payment);
    }

    @Override
    public List<FeeStatusResponse> getAllFeeStatuses() {
        return feePaymentRepository.findAll()
                .stream()
                .map(payment -> {
                    ProgramSemesterFee requiredFee = findProgramSemesterFee(payment.getStudent().getProgram(), payment.getSemester());
                    return mapToFeeStatus(payment.getStudent(), payment.getSemester(), requiredFee.getAmount(), payment);
                })
                .toList();
    }

    private BigDecimal getOpeningBalance(Student student, Semester semester) {
        return feePaymentRepository.findByStudentOrderByCreatedAtDesc(student)
                .stream()
                .filter(record -> !record.getSemester().getId().equals(semester.getId()))
                .map(StudentFeePayment::getBalance)
                .filter(balance -> balance != null)
                .findFirst()
                .orElse(BigDecimal.ZERO);
    }

    private BigDecimal getOrZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private Student findStudent(UUID studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
    }

    private Semester findSemester(UUID semesterId) {
        return semesterRepository.findById(semesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Semester not found"));
    }

    private ProgramSemesterFee findProgramSemesterFee(Program program, Semester semester) {
        return programSemesterFeeRepository.findByProgramAndSemester(program, semester)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Program fee not configured for this semester"));
    }

    private FeeStatusResponse mapToFeeStatus(
            Student student,
            Semester semester,
            BigDecimal requiredAmount,
            StudentFeePayment payment
    ) {
        BigDecimal amountPaid = payment == null || payment.getAmountPaid() == null ? BigDecimal.ZERO : payment.getAmountPaid();
        BigDecimal balance = payment == null || payment.getBalance() == null
                ? BigDecimal.ZERO
                : payment.getBalance();
        boolean cleared = payment != null && payment.isCleared();

        return new FeeStatusResponse(
                student.getId(),
                student.getRegistrationNumber(),
                student.getFirstName() + " " + student.getLastName(),
                student.getProgram().getId(),
                student.getProgram().getName(),
                semester.getId(),
                semester.getAcademicYear().getId(),
                requiredAmount,
                amountPaid,
                balance,
                cleared
        );
    }
}
