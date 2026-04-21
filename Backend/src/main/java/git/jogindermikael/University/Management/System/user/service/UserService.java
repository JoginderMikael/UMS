package git.jogindermikael.University.Management.System.user.service;

import git.jogindermikael.University.Management.System.user.dto.CreateUserRequest;
import git.jogindermikael.University.Management.System.user.dto.UpdateRequest;
import git.jogindermikael.University.Management.System.user.dto.UserResponse;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserResponse createUser(CreateUserRequest createUserRequest);
    UserResponse getUserByEmail(String email);
    List<UserResponse> getAllUsers();
    UserResponse getUserById(UUID id);
    UserResponse updateUser(UUID id, UpdateRequest updateRequest);
    void deleteUser(UUID id);
    void restoreUser(UUID id);
    UserResponse getCurrentUser();
    List<UserResponse> getAllDeletedUsers();
}
