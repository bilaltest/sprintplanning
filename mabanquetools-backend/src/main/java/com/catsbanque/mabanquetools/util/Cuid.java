package com.catsbanque.mabanquetools.util;

import org.hibernate.annotations.IdGeneratorType;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@IdGeneratorType(CuidGenerator.class)
@Retention(RUNTIME)
@Target({ FIELD, METHOD })
public @interface Cuid {
}
