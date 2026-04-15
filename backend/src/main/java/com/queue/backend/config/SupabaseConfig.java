package com.queue.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SupabaseConfig {
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.key}")
    private String supabaseKey;
    
    @Value("${supabase.jwt.secret}")
    private String jwtSecret;
    
    public String getSupabaseUrl() {
        return supabaseUrl;
    }
    
    public String getSupabaseKey() {
        return supabaseKey;
    }
    
    public String getJwtSecret() {
        return jwtSecret;
    }
}
