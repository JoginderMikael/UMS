package git.jogindermikael.University.Management.System.student.service;

import git.jogindermikael.University.Management.System.student.dto.FeePaymentRequest;
import git.jogindermikael.University.Management.System.student.dto.FeeStatusResponse;
import git.jogindermikael.University.Management.System.student.dto.ProgramFeeRecordResponse;
import git.jogindermikael.University.Management.System.student.dto.SetProgramFeeRequest;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.student.entity.Student;

import java.util.List;
import java.util.UUID;

public interface StudentFeePaymentService {
    void carryForwardPositiveBalances(Semester fromSemester, Semester toSemester);
    void clearFees(UUID studentId, UUID semesterId);
    boolean isFeesCleared(Student student, Semester semester);
    void setProgramFee(SetProgramFeeRequest request);
    List<ProgramFeeRecordResponse> getProgramFeeRecords(UUID programId);
    FeeStatusResponse payFees(FeePaymentRequest request);
    FeeStatusResponse getFeeStatus(UUID studentId, UUID semesterId);
    List<FeeStatusResponse> getAllFeeStatuses();
}
