package com.company.smarttimechecking.notification.event;

import com.company.smarttimechecking.domain.entity.AttendanceRequest;
import com.company.smarttimechecking.domain.entity.Employee;

public record RequestReviewedEvent(AttendanceRequest request, Employee reviewer, String action, String comment) {}

