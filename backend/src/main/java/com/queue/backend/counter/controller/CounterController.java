package com.queue.backend.counter.controller;

import com.queue.backend.counter.entity.Counter;
import com.queue.backend.counter.service.CounterService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/counters")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5176" })
public class CounterController {

    private final CounterService counterService;

    public CounterController(CounterService counterService) {
        this.counterService = counterService;
    }

    @GetMapping
    public List<Counter> getAllCounters() {
        return counterService.getAllCounters();
    }

    @GetMapping("/open")
    public List<Counter> getOpenCounters() {
        return counterService.getOpenCounters();
    }

    @PostMapping
    public Counter createCounter(@RequestParam String name, @RequestParam String serviceType,
            @RequestParam Long staffId) {
        return counterService.createCounter(name, serviceType, staffId);
    }

    @PutMapping("/{id}/open")
    public Counter openCounter(@PathVariable Long id) {
        return counterService.openCounter(id);
    }

    @PutMapping("/{id}/close")
    public Counter closeCounter(@PathVariable Long id) {
        return counterService.closeCounter(id);
    }

    @GetMapping("/services")
    public List<String> getServices() {
        return counterService.getUniqueServiceTypes();
    }

    @DeleteMapping("/{id}")
    public void deleteCounter(@PathVariable Long id) {
        counterService.deleteCounter(id);
    }
}
