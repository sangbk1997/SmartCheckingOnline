package com.company.smarttimechecking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartTimeCheckingApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartTimeCheckingApplication.class, args);
    }
}

