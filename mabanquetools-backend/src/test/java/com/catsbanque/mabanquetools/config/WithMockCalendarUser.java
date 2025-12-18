package com.catsbanque.mabanquetools.config;

import org.springframework.security.test.context.support.WithMockUser;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
@WithMockUser(username = "test-user", authorities = {
    "PERMISSION_CALENDAR_WRITE",
    "PERMISSION_RELEASES_WRITE",
    "PERMISSION_ADMIN_WRITE",
    "ROLE_USER"
})
public @interface WithMockCalendarUser {
}
