package git.jogindermikael.University.Management.System.academic.controller;

import git.jogindermikael.University.Management.System.student.dto.FeePaymentRequest;
import git.jogindermikael.University.Management.System.student.dto.FeeStatusResponse;
import git.jogindermikael.University.Management.System.student.dto.ProgramFeeRecordResponse;
import git.jogindermikael.University.Management.System.student.dto.SetProgramFeeRequest;
import git.jogindermikael.University.Management.System.student.service.StudentFeePaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/fees")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Fee Management", description = "Admin APIs for fee setup, payment tracking, and fee clearance")
public class AdminFeeController {

    private final StudentFeePaymentService feePaymentService;

    @Operation(summary = "Set program semester fee")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Program fee configured successfully"),
            @ApiResponse(responseCode = "400", description = "Bad Request - Semester does not belong to academic year or invalid amount"),
            @ApiResponse(responseCode = "404", description = "Not Found - Program, semester, or academic year not found")
    })
    @PostMapping("/programs")
    public ResponseEntity<Void> setProgramSemesterFee(@RequestBody @Valid SetProgramFeeRequest request) {
        feePaymentService.setProgramFee(request);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @Operation(summary = "View configured fee records for a program")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Program fee records retrieved",
                    content = @Content(schema = @Schema(implementation = ProgramFeeRecordResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Not Found - Program not found")
    })
    @GetMapping("/programs/{programId}/records")
    public ResponseEntity<List<ProgramFeeRecordResponse>> getProgramFeeRecords(
            @Parameter(required = true) @PathVariable UUID programId
    ) {
        return new ResponseEntity<>(feePaymentService.getProgramFeeRecords(programId), HttpStatus.OK);
    }

    @Operation(summary = "Record student fee payment")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Payment recorded successfully",
                    content = @Content(schema = @Schema(implementation = FeeStatusResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Bad Request - Invalid payment amount"),
            @ApiResponse(responseCode = "404", description = "Not Found - Student, semester, or configured program fee not found")
    })
    @PostMapping("/payments")
    public ResponseEntity<FeeStatusResponse> recordPayment(@RequestBody @Valid FeePaymentRequest request) {
        return new ResponseEntity<>(feePaymentService.payFees(request), HttpStatus.OK);
    }

    @Operation(summary = "Mark student fee as cleared")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Fee marked as cleared"),
            @ApiResponse(responseCode = "404", description = "Not Found - Student, semester, or configured program fee not found")
    })
    @PostMapping("/students/{studentId}/semesters/{semesterId}/clear")
    public ResponseEntity<Void> clearFees(
            @Parameter(required = true) @PathVariable UUID studentId,
            @Parameter(required = true) @PathVariable UUID semesterId
    ) {
        feePaymentService.clearFees(studentId, semesterId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get fee status for a student and semester")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Fee status retrieved",
                    content = @Content(schema = @Schema(implementation = FeeStatusResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Not Found - Student, semester, or configured program fee not found")
    })
    @GetMapping("/students/{studentId}/semesters/{semesterId}")
    public ResponseEntity<FeeStatusResponse> getFeeStatus(
            @Parameter(required = true) @PathVariable UUID studentId,
            @Parameter(required = true) @PathVariable UUID semesterId
    ) {
        return new ResponseEntity<>(feePaymentService.getFeeStatus(studentId, semesterId), HttpStatus.OK);
    }

    @Operation(summary = "View all fee payment records")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Fee payment records retrieved",
                    content = @Content(schema = @Schema(implementation = FeeStatusResponse.class))
            )
    })
    @GetMapping("/payments")
    public ResponseEntity<List<FeeStatusResponse>> getAllFeePayments() {
        return new ResponseEntity<>(feePaymentService.getAllFeeStatuses(), HttpStatus.OK);
    }
}
