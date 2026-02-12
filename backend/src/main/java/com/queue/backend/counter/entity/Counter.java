package com.queue.backend.counter.entity;

import com.queue.backend.user.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "counter")
public class Counter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String counterName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CounterStatus status;

    @ManyToOne
    @JoinColumn(name = "staff_id", nullable = false)
    private User staff;  // staff user assigned to counter

    public Counter() {}

    public Counter(String counterName, CounterStatus status, User staff) {
        this.counterName = counterName;
        this.status = status;
        this.staff = staff;
    }

    public Long getId() {
        return id;
    }

    public String getCounterName() {
        return counterName;
    }

    public void setCounterName(String counterName) {
        this.counterName = counterName;
    }

    public CounterStatus getStatus() {
        return status;
    }

    public void setStatus(CounterStatus status) {
        this.status = status;
    }

    public User getStaff() {
        return staff;
    }

    public void setStaff(User staff) {
        this.staff = staff;
    }
}
