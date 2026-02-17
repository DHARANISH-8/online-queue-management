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

    @Column(nullable = true)
    private String serviceType;

    @ManyToOne
    @JoinColumn(name = "staff_id", nullable = true)
    private User staff; // staff user assigned to counter

    public Counter() {
    }

    public Counter(String counterName, String serviceType, CounterStatus status, User staff) {
        this.counterName = counterName;
        this.serviceType = serviceType;
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

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public User getStaff() {
        return staff;
    }

    public void setStaff(User staff) {
        this.staff = staff;
    }
}
