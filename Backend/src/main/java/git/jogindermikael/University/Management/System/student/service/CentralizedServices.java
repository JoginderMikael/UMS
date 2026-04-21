package git.jogindermikael.University.Management.System.student.service;


import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.academicYear.repository.AcademicYearRepository;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.semester.repository.SemesterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CentralizedServices {

    private final SemesterRepository semesterRepository;
    private final AcademicYearRepository academicYearRepository;

    public String calculateGrade(int marks){
        if (marks >= 75) return "A";
        if (marks >= 60) return "B";
        if (marks >= 50) return "C";
        if (marks >= 40) return "D";
        return "F";
    }


    public void studentPromotionIfNeeded(
            Student student,
            Semester activeSemester){

        //First time enrollment
        if(student.getSemester() == null){
            student.setSemester(activeSemester);
            student.setAcademicYear(activeSemester.getAcademicYear());
            student.setSemesterNumber(activeSemester.getNumber());
            return;
        }

        //semesters 1 -> semester 2
        if(student.getSemesterNumber() == 1){
            student.setSemesterNumber(2);
            student.setSemester(
                    semesterRepository.findByAcademicYearAndNumber(
                            student.getAcademicYear(), 2
                    ).orElseThrow()
            );
            return;
        }

        //semester 2 -> next academic year, semester 1
        student.setYearOfStudy(student.getYearOfStudy() + 1);

        AcademicYear nextYear = academicYearRepository.findByActiveTrue()
                .orElseThrow(()-> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Next academic year not active"
                ));
        student.setAcademicYear(nextYear);
        student.setSemesterNumber(1);
        student.setSemester(
                semesterRepository.findByAcademicYearAndNumber(nextYear, 1).orElseThrow()
        );
    }
}
