package com.queue.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping("/")
    public String home() {
        return "Backend is live and running perfectly! Please use the Vercel frontend URL to access the application.";
    }
}
