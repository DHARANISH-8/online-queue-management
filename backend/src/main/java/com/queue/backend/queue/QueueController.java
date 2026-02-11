package com.queue.backend.queue;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/queue")
public class QueueController {

    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    // Generate token
    @PostMapping("/generate/{userId}")
    public QueueToken generate(@PathVariable Long userId) {
        return queueService.generateToken(userId);
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
}
