package git.jogindermikael.University.Management.System.user.controller;

import git.jogindermikael.University.Management.System.user.dto.CreateUserRequest;
import git.jogindermikael.University.Management.System.user.dto.UpdateRequest;
import git.jogindermikael.University.Management.System.user.dto.UserResponse;
import git.jogindermikael.University.Management.System.user.entity.Role;
import git.jogindermikael.University.Management.System.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
    }

    @Test
    void createUser_returnsCreated() {
        CreateUserRequest request = new CreateUserRequest();
        request.setFirstName("Admin");
        request.setLastName("User");
        request.setEmail("admin@university.com");
        request.setPassword("secret");
        request.setRole(Role.ADMIN);

        UserResponse response = UserResponse.builder()
                .id(userId)
                .firstName("Admin")
                .lastName("User")
                .email("admin@university.com")
                .role(Role.ADMIN)
                .build();

        when(userService.createUser(request)).thenReturn(response);

        ResponseEntity<UserResponse> result = userController.createUser(request);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(userService).createUser(request);
    }

    @Test
    void getAllUsers_returnsOk() {
        UserResponse response = UserResponse.builder()
                .id(userId)
                .firstName("Admin")
                .lastName("User")
                .email("admin@university.com")
                .role(Role.ADMIN)
                .build();

        when(userService.getAllUsers()).thenReturn(List.of(response));

        ResponseEntity<List<UserResponse>> result = userController.getAllUsers();

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assert result.getBody() != null;
        assertEquals(1, result.getBody().size());
        verify(userService).getAllUsers();
    }

    @Test
    void getUserByEmail_returnsOk() {
        UserResponse response = UserResponse.builder()
                .id(userId)
                .firstName("Admin")
                .lastName("User")
                .email("admin@university.com")
                .role(Role.ADMIN)
                .build();

        when(userService.getUserByEmail("admin@university.com")).thenReturn(response);

        ResponseEntity<UserResponse> result = userController.getUserByEmail("admin@university.com");

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(userService).getUserByEmail("admin@university.com");
    }

    @Test
    void getUserById_returnsOk() {
        UserResponse response = UserResponse.builder()
                .id(userId)
                .firstName("Admin")
                .lastName("User")
                .email("admin@university.com")
                .role(Role.ADMIN)
                .build();

        when(userService.getUserById(userId)).thenReturn(response);

        ResponseEntity<UserResponse> result = userController.getUserById(userId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(userService).getUserById(userId);
    }

    @Test
    void updateUser_returnsOk() {
        UpdateRequest request = UpdateRequest.builder()
                .firstName("New")
                .lastName("Name")
                .email("new@university.com")
                .role(Role.ADMIN)
                .build();

        UserResponse response = UserResponse.builder()
                .id(userId)
                .firstName("New")
                .lastName("Name")
                .email("new@university.com")
                .role(Role.ADMIN)
                .build();

        when(userService.updateUser(userId, request)).thenReturn(response);

        ResponseEntity<UserResponse> result = userController.updateUser(userId, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(userService).updateUser(userId, request);
    }

    @Test
    void deleteUser_returnsNoContent() {
        ResponseEntity<Void> result = userController.deleteUser(userId);

        assertEquals(HttpStatus.NO_CONTENT, result.getStatusCode());
        assertNull(result.getBody());
        verify(userService).deleteUser(userId);
    }

    @Test
    void getCurrentUser_returnsOk() {
        UserResponse response = UserResponse.builder()
                .id(userId)
                .firstName("Admin")
                .lastName("User")
                .email("admin@university.com")
                .role(Role.ADMIN)
                .build();

        when(userService.getCurrentUser()).thenReturn(response);

        ResponseEntity<UserResponse> result = userController.getCurrentUser();

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(userService).getCurrentUser();
    }

    @Test
    void restoreUser_returnsNoContent() {
        ResponseEntity<Void> result = userController.restoreUser(userId);

        assertEquals(HttpStatus.NO_CONTENT, result.getStatusCode());
        assertNull(result.getBody());
        verify(userService).restoreUser(userId);
    }

    @Test
    void getAllDeletedUsers_returnsOk() {
        UserResponse response = UserResponse.builder()
                .id(userId)
                .firstName("Admin")
                .lastName("User")
                .email("admin@university.com")
                .role(Role.ADMIN)
                .build();

        when(userService.getAllDeletedUsers()).thenReturn(List.of(response));

        ResponseEntity<List<UserResponse>> result = userController.getAllDeletedUsers();

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(1, result.getBody().size());
        verify(userService).getAllDeletedUsers();
    }
}
