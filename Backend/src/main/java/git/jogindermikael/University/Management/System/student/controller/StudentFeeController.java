package git.jogindermikael.University.Management.System.student.controller;

import git.jogindermikael.University.Management.System.student.dto.FeePaymentRequest;
import git.jogindermikael.University.Management.System.student.dto.FeeStatusResponse;
import git.jogindermikael.University.Management.System.student.service.StudentFeePaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
@Tag(name = "Student Fee Management", description = "API endpoints for managing student fee payments and fee status")
public class StudentFeeController {

    private final StudentFeePaymentService feePaymentService;

    @Operation(
            summary = "Clear student fees for a semester",
            description = "Marks all fees for a specific student in a given semester as paid/cleared. " +
                    "Only administrators can perform this operation. This typically occurs when the student has completed payment or been granted a fee waiver. " +
                    "The operation updates fee records in the system."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Student fees successfully cleared for the semester"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format for studentId or semesterId"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Student or semester not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Fees already cleared or no fees to clear"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Fee processing error"
            )
    })
    @PostMapping("/{studentId}/fees/{semesterId}/clear")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> clearFees(
            @Parameter(description = "Student's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID studentId,
            @Parameter(description = "Semester's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440001", required = true)
            @PathVariable UUID semesterId
    ){
        feePaymentService.clearFees(studentId, semesterId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Pay student fees",
            description = "Records a fee payment made by a student for a specific semester and updates the backend payment status. " +
                    "When the total paid amount reaches the required fee, the fee record is marked as cleared."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Fee payment recorded successfully",
                    content = @Content(schema = @Schema(implementation = FeeStatusResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid payment amount"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have STUDENT or ADMIN role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Student, semester, or configured fee not found"
            )
    })
    @PostMapping("/{studentId}/fees/{semesterId}/pay")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<FeeStatusResponse> payFees(
            @Parameter(description = "Student's unique identifier (UUID)", required = true)
            @PathVariable UUID studentId,
            @Parameter(description = "Semester's unique identifier (UUID)", required = true)
            @PathVariable UUID semesterId,
            @RequestBody @Valid FeePaymentAmountRequest request
    ) {
        FeePaymentRequest paymentRequest = new FeePaymentRequest(studentId, semesterId, request.amount());
        return ResponseEntity.ok(feePaymentService.payFees(paymentRequest));
    }

    @Operation(
            summary = "Get student fee status",
            description = "Returns fee status for a student in a semester, including paid amount, signed balance " +
                    "(positive = credit carry-forward, negative = outstanding), and cleared status."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Fee status retrieved successfully",
                    content = @Content(schema = @Schema(implementation = FeeStatusResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have STUDENT or ADMIN role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Student, semester, or configured fee not found"
            )
    })
    @GetMapping("/{studentId}/fees/{semesterId}/status")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<FeeStatusResponse> getFeeStatus(
            @PathVariable UUID studentId,
            @PathVariable UUID semesterId
    ) {
        return ResponseEntity.ok(feePaymentService.getFeeStatus(studentId, semesterId));
    }

    public record FeePaymentAmountRequest(
            @NotNull(message = "Payment amount is required")
            @DecimalMin(value = "0.0", inclusive = false, message = "Payment amount must be greater than zero")
            java.math.BigDecimal amount
    ) {}

}
