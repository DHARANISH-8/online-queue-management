package com.queue.backend.queue;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

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
    public ResponseEntity<?> generate(@PathVariable Long userId, @RequestParam String serviceType,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long counterId) {
        try {
            return ResponseEntity.ok(queueService.generateToken(userId, serviceType, doctorId, counterId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
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

    @GetMapping("/doctor/{doctorId}/dashboard")
    public ResponseEntity<?> getDoctorDashboard(@PathVariable Long doctorId) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("currentPatient", queueService.getCurrentConsultationForDoctor(doctorId).map(this::toDashboardToken).orElse(null));
            payload.put("waitingQueue", queueService.getWaitingQueueForDoctor(doctorId).stream()
                    .map(this::toDashboardToken)
                    .collect(Collectors.toList()));
            payload.put("totalWaiting", queueService.getWaitingCountForDoctor(doctorId));
            return ResponseEntity.ok(payload);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/doctor/{doctorId}/call-next")
    public ResponseEntity<?> callNextForDoctor(@PathVariable Long doctorId) {
        try {
            return ResponseEntity.ok(toDashboardToken(queueService.callNextForDoctor(doctorId)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/doctor/{doctorId}/complete-current")
    public ResponseEntity<?> completeCurrentForDoctor(@PathVariable Long doctorId) {
        try {
            return ResponseEntity.ok(toDashboardToken(queueService.completeCurrentConsultationForDoctor(doctorId)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/doctor/{doctorId}/start")
    public ResponseEntity<?> startQueueForDoctor(@PathVariable Long doctorId) {
        try {
            QueueService.StartQueueResult result = queueService.startQueueForDoctor(doctorId);
            return ResponseEntity.ok(Map.of(
                    "openedCounters", result.openedCounters(),
                    "notifiedUsers", result.notifiedUsers(),
                    "message", "Queue has started successfully. Email updates were delivered to " + result.notifiedUsers() + " enrolled patient(s)."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private Map<String, Object> toDashboardToken(QueueToken token) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", token.getId());
        item.put("tokenNumber", token.getTokenNumber());
        item.put("displayToken", (token.getCounter() != null ? token.getCounter().getCounterName() : "T") + "-"
                + String.format("%03d", token.getTokenNumber()));
        item.put("status", token.getStatus());
        item.put("serviceType", token.getServiceType());
        item.put("counterName", token.getCounter() != null ? token.getCounter().getCounterName() : null);
        item.put("department", token.getCounter() != null ? token.getCounter().getServiceType() : null);

        Map<String, Object> patient = new LinkedHashMap<>();
        if (token.getUser() != null) {
            patient.put("id", token.getUser().getId());
            patient.put("name", token.getUser().getName());
            patient.put("email", token.getUser().getEmail());
            patient.put("phone", token.getUser().getPhone());
        }
        item.put("patient", patient);
        return item;
    }
}
