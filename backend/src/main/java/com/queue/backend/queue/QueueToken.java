package com.queue.backend.queue;

import jakarta.persistence.*;
import com.queue.backend.user.entity.User;

@Entity
@Table(name = "queue_tokens")
public class QueueToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private int tokenNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QueueStatus status;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public QueueToken() {
    }

    public QueueToken(int tokenNumber, QueueStatus status, User user) {
        this.tokenNumber = tokenNumber;
        this.status = status;
        this.user = user;
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
}
