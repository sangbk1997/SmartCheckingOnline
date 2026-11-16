package com.company.smarttimechecking.notification.event;

import com.company.smarttimechecking.domain.entity.AttendanceRequest;
import com.company.smarttimechecking.domain.entity.Employee;

public record RequestCreatedEvent(AttendanceRequest request, Employee employee) {}

