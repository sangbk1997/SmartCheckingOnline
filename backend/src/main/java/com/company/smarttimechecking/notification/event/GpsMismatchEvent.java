package com.company.smarttimechecking.notification.event;

import com.company.smarttimechecking.domain.entity.AttendancePunch;
import com.company.smarttimechecking.domain.entity.Employee;

public record GpsMismatchEvent(AttendancePunch punch, Employee employee, double distanceMeters) {}

