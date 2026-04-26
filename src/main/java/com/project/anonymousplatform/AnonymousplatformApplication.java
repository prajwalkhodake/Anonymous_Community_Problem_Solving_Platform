package com.project.anonymousplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AnonymousplatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(AnonymousplatformApplication.class, args);
	}

}
