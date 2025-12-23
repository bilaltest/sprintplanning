package com.catsbanque.mabanquetools.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @Data
    @AllArgsConstructor
    public static class ErrorResponse {
        private ErrorDetail error;
    }

    @Data
    @AllArgsConstructor
    public static class ErrorDetail {
        private String message;
        private int status;
    }

    // Resource Not Found (404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, WebRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
                new ErrorDetail(ex.getMessage(), HttpStatus.NOT_FOUND.value()));
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    // Bad Request (400)
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            BadRequestException ex, WebRequest request) {
        log.warn("Bad request: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
                new ErrorDetail(ex.getMessage(), HttpStatus.BAD_REQUEST.value()));
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // Validation errors (400)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        log.warn("Validation errors: {}", errors);
        return new ResponseEntity<>(Map.of("errors", errors), HttpStatus.BAD_REQUEST);
    }

    // Generic Exception (500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, WebRequest request) {
        log.error("Internal Server Error occurred", ex);
        ErrorResponse error = new ErrorResponse(
                new ErrorDetail(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value()));
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
