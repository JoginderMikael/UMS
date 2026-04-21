package git.jogindermikael.University.Management.System;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class UniversityManagementSystemApplication {

	/*
	http://127.0.0.1:8081/swagger-ui/index.html
	 */
	public static void main(String[] args) {
		SpringApplication.run(UniversityManagementSystemApplication.class, args);
	}

}
