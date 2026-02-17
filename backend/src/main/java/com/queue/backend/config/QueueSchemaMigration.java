package com.queue.backend.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class QueueSchemaMigration {

    @Bean
    CommandLineRunner migrateQueueTokenConstraints(JdbcTemplate jdbcTemplate) {
        return args -> {
            // Remove legacy unique constraints on token_number so token numbering can reset per counter.
            String findLegacyUniqueConstraints = """
                    SELECT c.conname
                    FROM pg_constraint c
                    JOIN pg_class t ON t.oid = c.conrelid
                    WHERE t.relname = 'queue_tokens'
                      AND c.contype = 'u'
                      AND pg_get_constraintdef(c.oid) ILIKE '%%(token_number)%%'
                    """;

            List<String> constraintNames = jdbcTemplate.query(
                    findLegacyUniqueConstraints,
                    (rs, rowNum) -> rs.getString("conname"));

            for (String constraintName : constraintNames) {
                String dropSql = "ALTER TABLE queue_tokens DROP CONSTRAINT IF EXISTS \"" + constraintName + "\"";
                jdbcTemplate.execute(dropSql);
                System.out.println("Dropped legacy unique constraint on token_number: " + constraintName);
            }
        };
    }
}
