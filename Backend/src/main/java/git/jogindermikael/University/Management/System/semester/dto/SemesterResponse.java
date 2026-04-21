package git.jogindermikael.University.Management.System.semester.dto;

import java.util.UUID;

public record SemesterResponse(UUID semesterId, String name, int number, boolean active) {}
