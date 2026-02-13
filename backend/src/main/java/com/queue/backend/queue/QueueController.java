package com.queue.backend.queue;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5176" })
public class QueueController {

    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    // Generate token
    @PostMapping("/generate/{userId}")
    public QueueToken generate(@PathVariable Long userId, @RequestParam String serviceType) {
        return queueService.generateToken(userId, serviceType);
    }

    // View waiting queue
    @GetMapping("/waiting")
    public List<QueueToken> waitingQueue() {
        return queueService.getWaitingQueue();
    }

    // Serve next
    @PutMapping("/serve")
    public QueueToken serveNext() {
        return queueService.serveNext();
    }

    // Get token by ID
    @GetMapping("/{tokenId}")
    public QueueToken getToken(@PathVariable Long tokenId) {
        return queueService.getTokenById(tokenId);
    }

    // Update token status
    @PutMapping("/{tokenId}/status")
    public QueueToken updateStatus(@PathVariable Long tokenId, @RequestBody QueueStatus newStatus) {
        return queueService.updateTokenStatus(tokenId, newStatus);
    }

    // Get queue statistics
    @GetMapping("/stats/count")
    public long getQueueCount(@RequestParam QueueStatus status) {
        return queueService.getQueueCountByStatus(status);
    }

    // Get active token for user
    @GetMapping("/user/{userId}")
    public QueueToken getActiveToken(@PathVariable Long userId) {
        return queueService.getActiveTokenForUser(userId).orElse(null);
    }
}
