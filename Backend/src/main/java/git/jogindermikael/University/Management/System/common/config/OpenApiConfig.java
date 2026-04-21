package git.jogindermikael.University.Management.System.common.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.Collections;

/**
 * OpenAPI/Swagger Configuration for University Management System
 * Provides comprehensive API documentation including servers, security, schemas, and tags
 */
@Configuration
public class OpenApiConfig {

    @Value("${spring.application.name:University-Management-System}")
    private String applicationName;

    @Value("${app.version:1.0.0}")
    private String appVersion;

    @Value("${app.environment:development}")
    private String environment;

    /**
     * Main OpenAPI bean configuration
     * Integrates info, servers, security, components, and tags
     */
    @Bean
    public OpenAPI UniversityOpenAPI() {
        return new OpenAPI()
                .info(buildInfo())
                .servers(buildServers())
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(buildComponents())
                .tags(buildTags());
    }

    /**
     * Builds comprehensive API information including contact, license, and terms
     */
    private Info buildInfo() {
        return new Info()
                .title("University Management System API")
                .description("Comprehensive REST API for managing academic operations including user management, " +
                        "course administration, student enrollment, grading, and transcript management. " +
                        "All endpoints require JWT authentication via Bearer token except login.")
                .version(appVersion);
    }

    /**
     * Defines server URLs for different environments
     * Helps API clients know where to make requests
     */
    private java.util.List<Server> buildServers() {
        return Collections.singletonList(
                new Server()
                        .url("http://localhost:8081")
                        .description("Local Development Server")
        );
    }

    /**
     * Builds security schemes and common response schemas
     * Provides reusable components for all endpoints
     */
    private Components buildComponents() {
        return new Components()
                .addSecuritySchemes("bearerAuth", buildBearerAuthScheme())
                .addSchemas("ErrorResponse", buildErrorResponseSchema())
                .addSchemas("BadRequestError", buildBadRequestErrorSchema())
                .addSchemas("UnauthorizedError", buildUnauthorizedErrorSchema())
                .addSchemas("ForbiddenError", buildForbiddenErrorSchema())
                .addSchemas("NotFoundError", buildNotFoundErrorSchema())
                .addSchemas("ConflictError", buildConflictErrorSchema())
                .addSchemas("InternalServerError", buildInternalServerErrorSchema())
                .addResponses("BadRequest", buildBadRequestResponse())
                .addResponses("Unauthorized", buildUnauthorizedResponse())
                .addResponses("Forbidden", buildForbiddenResponse())
                .addResponses("NotFound", buildNotFoundResponse())
                .addResponses("Conflict", buildConflictResponse())
                .addResponses("InternalServerError", buildInternalServerErrorResponse());
    }

    /**
     * Defines JWT Bearer authentication scheme with detailed documentation
     */
    private SecurityScheme buildBearerAuthScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .name("bearerAuth")
                .description("JWT Bearer token for API authentication.\n\n" +
                        "**Token Acquisition:**\n" +
                        "1. POST /api/v1/auth/login with email and password\n" +
                        "2. Receive JWT token in response\n\n" +
                        "**Token Usage:**\n" +
                        "- Include in Authorization header: `Authorization: Bearer {token}`\n" +
                        "- Token validity: 24 hours\n" +
                        "- Token refresh: Login again to get new token\n\n" +
                        "**Token Logout:**\n" +
                        "- POST /api/v1/auth/logout to invalidate token\n" +
                        "- Logout is optional but recommended");
    }

    /**
     * Defines base error response schema
     */
    private Schema<?> buildErrorResponseSchema() {
        return new Schema<>()
                .type("object")
                .title("Error Response")
                .description("Standard error response format used across all endpoints")
                .required(Arrays.asList("status", "message"))
                .addProperty("timestamp", new Schema<>()
                        .type("string")
                        .format("date-time")
                        .description("ISO 8601 timestamp when error occurred")
                        .example("2026-02-04T10:30:00Z"))
                .addProperty("status", new Schema<>()
                        .type("integer")
                        .description("HTTP status code")
                        .example(400))
                .addProperty("error", new Schema<>()
                        .type("string")
                        .description("Error type or category")
                        .example("Bad Request"))
                .addProperty("message", new Schema<>()
                        .type("string")
                        .description("Detailed error message")
                        .example("Invalid email format provided"))
                .addProperty("path", new Schema<>()
                        .type("string")
                        .description("API endpoint path where error occurred")
                        .example("/api/v1/users/createuser"));
    }

    /**
     * Builds 400 Bad Request error schema with validation details
     */
    private Schema<?> buildBadRequestErrorSchema() {
        return new Schema<>()
                .allOf(Arrays.asList(
                        new Schema<>().$ref("#/components/schemas/ErrorResponse"),
                        new Schema<>()
                                .type("object")
                                .addProperty("validationErrors", new Schema<Object>()
                                        .type("array")
                                        .description("List of validation errors if applicable")
                                        .items(new Schema<Object>()
                                                .type("object")
                                                .addProperty("field", new Schema<String>()
                                                        .type("string")
                                                        .description("Field name that failed validation"))
                                                .addProperty("message", new Schema<String>()
                                                        .type("string")
                                                        .description("Validation error message"))))
                ))
                .title("Bad Request Error");
    }

    /**
     * Builds 401 Unauthorized error schema
     */
    private Schema<?> buildUnauthorizedErrorSchema() {
        return new Schema<>()
                .allOf(Arrays.asList(
                        new Schema<>().$ref("#/components/schemas/ErrorResponse"),
                        new Schema<>()
                                .type("object")
                                .addProperty("details", new Schema<>()
                                        .type("string")
                                        .description("Details about authorization failure")
                                        .example("JWT token is missing or invalid"))
                ))
                .title("Unauthorized Error");
    }

    /**
     * Builds 403 Forbidden error schema
     */
    private Schema<?> buildForbiddenErrorSchema() {
        return new Schema<>()
                .allOf(Arrays.asList(
                        new Schema<>().$ref("#/components/schemas/ErrorResponse"),
                        new Schema<>()
                                .type("object")
                                .addProperty("requiredRole", new Schema<>()
                                        .type("string")
                                        .description("Role required to access this endpoint")
                                        .example("ADMIN"))
                ))
                .title("Forbidden Error");
    }

    /**
     * Builds 404 Not Found error schema
     */
    private Schema<?> buildNotFoundErrorSchema() {
        return new Schema<>()
                .allOf(Arrays.asList(
                        new Schema<>().$ref("#/components/schemas/ErrorResponse"),
                        new Schema<>()
                                .type("object")
                                .addProperty("resourceId", new Schema<>()
                                        .type("string")
                                        .description("ID of the resource that was not found")
                                        .example("550e8400-e29b-41d4-a716-446655440000"))
                ))
                .title("Not Found Error");
    }

    /**
     * Builds 409 Conflict error schema
     */
    private Schema<?> buildConflictErrorSchema() {
        return new Schema<>()
                .allOf(Arrays.asList(
                        new Schema<>().$ref("#/components/schemas/ErrorResponse"),
                        new Schema<>()
                                .type("object")
                                .addProperty("conflictField", new Schema<>()
                                        .type("string")
                                        .description("Field that caused the conflict")
                                        .example("email"))
                                .addProperty("conflictValue", new Schema<>()
                                        .type("string")
                                        .description("Value that caused the conflict")
                                        .example("user@example.com"))
                ))
                .title("Conflict Error");
    }

    /**
     * Builds 500 Internal Server Error schema
     */
    private Schema<?> buildInternalServerErrorSchema() {
        return new Schema<>()
                .allOf(Arrays.asList(
                        new Schema<>().$ref("#/components/schemas/ErrorResponse"),
                        new Schema<>()
                                .type("object")
                                .addProperty("errorCode", new Schema<>()
                                        .type("string")
                                        .description("Internal error code for support tickets")
                                        .example("ERR-DB-001"))
                ))
                .title("Internal Server Error");
    }

    /**
     * Builds 400 Bad Request response
     */
    private ApiResponse buildBadRequestResponse() {
        return new ApiResponse()
                .description("Bad Request - Invalid input data, malformed request, or validation errors. " +
                        "Check the response for specific validation errors.")
                .content(new io.swagger.v3.oas.models.media.Content()
                        .addMediaType("application/json",
                                new MediaType().schema(new Schema<>().$ref("#/components/schemas/BadRequestError"))));
    }

    /**
     * Builds 401 Unauthorized response
     */
    private ApiResponse buildUnauthorizedResponse() {
        return new ApiResponse()
                .description("Unauthorized - Authentication failed. Ensure JWT token is valid and not expired. " +
                        "Include token in Authorization header as: Bearer {token}")
                .content(new io.swagger.v3.oas.models.media.Content()
                        .addMediaType("application/json",
                                new MediaType().schema(new Schema<>().$ref("#/components/schemas/UnauthorizedError"))));
    }

    /**
     * Builds 403 Forbidden response
     */
    private ApiResponse buildForbiddenResponse() {
        return new ApiResponse()
                .description("Forbidden - User authenticated but does not have required role or permissions. " +
                        "Contact administrator for access to this resource.")
                .content(new io.swagger.v3.oas.models.media.Content()
                        .addMediaType("application/json",
                                new MediaType().schema(new Schema<>().$ref("#/components/schemas/ForbiddenError"))));
    }

    /**
     * Builds 404 Not Found response
     */
    private ApiResponse buildNotFoundResponse() {
        return new ApiResponse()
                .description("Not Found - The requested resource does not exist. " +
                        "Verify the resource ID and that the resource has not been deleted.")
                .content(new io.swagger.v3.oas.models.media.Content()
                        .addMediaType("application/json",
                                new MediaType().schema(new Schema<>().$ref("#/components/schemas/NotFoundError"))));
    }

    /**
     * Builds 409 Conflict response
     */
    private ApiResponse buildConflictResponse() {
        return new ApiResponse()
                .description("Conflict - Request conflicts with existing data. Common causes: " +
                        "duplicate email, student already enrolled in course, code already exists, etc. " +
                        "Resolve the conflict and retry.")
                .content(new io.swagger.v3.oas.models.media.Content()
                        .addMediaType("application/json",
                                new MediaType().schema(new Schema<>().$ref("#/components/schemas/ConflictError"))));
    }

    /**
     * Builds 500 Internal Server Error response
     */
    private ApiResponse buildInternalServerErrorResponse() {
        return new ApiResponse()
                .description("Internal Server Error - Unexpected server error occurred. " +
                        "The error has been logged. If the problem persists, contact support with the error code.")
                .content(new io.swagger.v3.oas.models.media.Content()
                        .addMediaType("application/json",
                                new MediaType().schema(new Schema<>().$ref("#/components/schemas/InternalServerError"))));
    }

    /**
     * Defines API tags with descriptions for logical organization
     * Tags help organize endpoints in Swagger UI
     */
    private java.util.List<Tag> buildTags() {
        return Arrays.asList(
                new Tag()
                        .name("Authentication")
                        .description("User authentication endpoints for login and logout"),
                new Tag()
                        .name("User Management")
                        .description("User account management, CRUD operations, and account administration"),
                new Tag()
                        .name("School Management")
                        .description("Academic school/faculty management and organization"),
                new Tag()
                        .name("Department Management")
                        .description("Academic department management and structure"),
                new Tag()
                        .name("Program Management")
                        .description("Academic program/degree management and course curriculum"),
                new Tag()
                        .name("Course Management")
                        .description("Course creation, updates, deletion, and course filtering"),
                new Tag()
                        .name("Academic Year Management")
                        .description("Academic calendar year creation and activation"),
                new Tag()
                        .name("Semester Management")
                        .description("Semester creation and management within academic years"),
                new Tag()
                        .name("Student Enrollment")
                        .description("Student course and program enrollment operations"),
                new Tag()
                        .name("Student Results & Grading")
                        .description("Student grade entry, result management, and grading operations"),
                new Tag()
                        .name("Student Fee Management")
                        .description("Student fee payment processing and clearing"),
                new Tag()
                        .name("Student Self-Service")
                        .description("Student self-service operations including registration and transcript viewing")
        );
    }
}
