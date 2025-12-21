package com.catsbanque.mabanquetools.util;

import org.hibernate.HibernateException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.io.Serializable;

public class CuidGenerator implements IdentifierGenerator {

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) throws HibernateException {
        return generateCuid();
    }

    public static String generateCuid() {
        long timestamp = System.currentTimeMillis();
        int random = (int) (Math.random() * Integer.MAX_VALUE);
        return "c" + Long.toString(timestamp, 36) + Integer.toString(random, 36);
    }
}
