package com.catsbanque.eventplanning.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
public class RequestLoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;

        // Format identique à Node.js
        String timestamp = LocalDateTime.now()
            .format(DateTimeFormatter.ISO_DATE_TIME);
        String method = httpRequest.getMethod();
        String path = httpRequest.getRequestURI();

        log.info("{} - {} {}", timestamp, method, path);

        chain.doFilter(request, response);
    }
}
