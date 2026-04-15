package com.queue.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import reactor.core.publisher.Mono;

@Service
public class SupabaseService {
    
    private final SupabaseConfig supabaseConfig;
    private final WebClient webClient;
    private final Gson gson;
    
    @Autowired
    public SupabaseService(SupabaseConfig supabaseConfig, WebClient.Builder webClientBuilder) {
        this.supabaseConfig = supabaseConfig;
        this.webClient = webClientBuilder.baseUrl(supabaseConfig.getSupabaseUrl()).build();
        this.gson = new Gson();
    }
    
    /**
     * Query data from a Supabase table
     */
    public Mono<String> queryTable(String tableName, String filters) {
        String url = "/rest/v1/" + tableName;
        
        return webClient.get()
                .uri(uri -> {
                    var uriBuilder = uri.path(url);
                    if (filters != null && !filters.isEmpty()) {
                        uriBuilder.query(filters);
                    }
                    return uriBuilder.build();
                })
                .header("apikey", supabaseConfig.getSupabaseKey())
                .header("Authorization", "Bearer " + supabaseConfig.getSupabaseKey())
                .retrieve()
                .bodyToMono(String.class);
    }
    
    /**
     * Insert data into a Supabase table
     */
    public Mono<String> insertIntoTable(String tableName, JsonObject data) {
        String url = "/rest/v1/" + tableName;
        
        return webClient.post()
                .uri(url)
                .header("apikey", supabaseConfig.getSupabaseKey())
                .header("Authorization", "Bearer " + supabaseConfig.getSupabaseKey())
                .header("Prefer", "return=representation")
                .bodyValue(data.toString())
                .retrieve()
                .bodyToMono(String.class);
    }
    
    /**
     * Update data in a Supabase table
     */
    public Mono<String> updateTable(String tableName, String filter, JsonObject data) {
        String url = "/rest/v1/" + tableName;
        
        return webClient.patch()
                .uri(uri -> uri.path(url).query(filter).build())
                .header("apikey", supabaseConfig.getSupabaseKey())
                .header("Authorization", "Bearer " + supabaseConfig.getSupabaseKey())
                .bodyValue(data.toString())
                .retrieve()
                .bodyToMono(String.class);
    }
    
    /**
     * Delete data from a Supabase table
     */
    public Mono<Void> deleteFromTable(String tableName, String filter) {
        String url = "/rest/v1/" + tableName;
        
        return webClient.delete()
                .uri(uri -> uri.path(url).query(filter).build())
                .header("apikey", supabaseConfig.getSupabaseKey())
                .header("Authorization", "Bearer " + supabaseConfig.getSupabaseKey())
                .retrieve()
                .bodyToMono(Void.class);
    }
}
