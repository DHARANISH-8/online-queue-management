package com.queue.backend.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@Profile("!test")
public class QueueSchemaMigration {

    @Bean
    CommandLineRunner migrateQueueTokenConstraints(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
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

                // Ensure queue token status check constraint supports consultation workflow statuses.
                String findStatusCheckConstraints = """
                        SELECT c.conname, pg_get_constraintdef(c.oid) AS def
                        FROM pg_constraint c
                        JOIN pg_class t ON t.oid = c.conrelid
                        WHERE t.relname = 'queue_tokens'
                          AND c.contype = 'c'
                          AND pg_get_constraintdef(c.oid) ILIKE '%%status%%'
                        """;

                List<String> statusConstraintNames = jdbcTemplate.query(
                        findStatusCheckConstraints,
                        (rs, rowNum) -> {
                            String definition = rs.getString("def");
                            if (definition != null
                                    && definition.contains("IN_CONSULTATION")
                                    && definition.contains("COMPLETED")) {
                                return null;
                            }
                            return rs.getString("conname");
                        });

                for (String constraintName : statusConstraintNames) {
                    if (constraintName == null || constraintName.isBlank()) {
                        continue;
                    }
                    String dropSql = "ALTER TABLE queue_tokens DROP CONSTRAINT IF EXISTS \"" + constraintName + "\"";
                    jdbcTemplate.execute(dropSql);
                    System.out.println("Dropped outdated status check constraint: " + constraintName);
                }

                Integer existingUpdatedStatusConstraint = jdbcTemplate.queryForObject(
                        """
                                SELECT COUNT(1)
                                FROM pg_constraint c
                                JOIN pg_class t ON t.oid = c.conrelid
                                WHERE t.relname = 'queue_tokens'
                                  AND c.contype = 'c'
                                  AND pg_get_constraintdef(c.oid) ILIKE '%%status%%'
                                  AND pg_get_constraintdef(c.oid) ILIKE '%%IN_CONSULTATION%%'
                                  AND pg_get_constraintdef(c.oid) ILIKE '%%COMPLETED%%'
                                """,
                        Integer.class);

                if (existingUpdatedStatusConstraint == null || existingUpdatedStatusConstraint == 0) {
                    jdbcTemplate.execute("""
                            ALTER TABLE queue_tokens
                            ADD CONSTRAINT queue_tokens_status_check
                            CHECK (status IN ('WAITING', 'IN_CONSULTATION', 'COMPLETED', 'SERVED', 'CANCELLED'))
                            """);
                    System.out.println("Created updated queue_tokens_status_check constraint.");
                }
            } catch (Exception e) {
                // Skip migration if database is not PostgreSQL or if queries fail
                System.out.println("Skipping PostgreSQL-specific migrations. Database may not be PostgreSQL: " + e.getMessage());
            }
        };
    }
}
