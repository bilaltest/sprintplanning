package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.dto.RegisterRequest;
import com.catsbanque.eventplanning.exception.BadRequestException;
import com.catsbanque.eventplanning.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.fail;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuthServiceSimpleTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testWeakPassword() {
        RegisterRequest request = new RegisterRequest("test@ca-ts.fr", "abc");

        try {
            authService.register(request);
            fail("Should have thrown BadRequestException");
        } catch (BadRequestException e) {
            System.out.println("Exception message: [" + e.getMessage() + "]");
            assertNotNull(e.getMessage());
        }
    }
}
