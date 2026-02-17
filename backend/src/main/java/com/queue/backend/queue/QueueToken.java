package com.queue.backend.queue;

import jakarta.persistence.*;
import com.queue.backend.user.entity.User;
import com.queue.backend.counter.entity.Counter;

@Entity
@Table(name = "queue_tokens")
public class QueueToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int tokenNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QueueStatus status;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "counter_id", nullable = true)
    private Counter counter;

    @Column(nullable = true)
    private String serviceType;

    public QueueToken() {
    }

    public QueueToken(int tokenNumber, QueueStatus status, User user, String serviceType) {
        this.tokenNumber = tokenNumber;
        this.status = status;
        this.user = user;
        this.serviceType = serviceType;
    }

    public Long getId() {
        return id;
    }

    public int getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(int tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public QueueStatus getStatus() {
        return status;
    }

    public void setStatus(QueueStatus status) {
        this.status = status;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Counter getCounter() {
        return counter;
    }

    public void setCounter(Counter counter) {
        this.counter = counter;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }
}
