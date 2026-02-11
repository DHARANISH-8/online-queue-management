package com.queue.backend.queue;

import jakarta.persistence.*;

@Entity
public class QueueToken {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private int tokenNumber;

	@Enumerated(EnumType.STRING)
	private QueueStatus status;

	private Long userId;

	public QueueToken() {
	}

	public QueueToken(int tokenNumber, QueueStatus status, Long userId) {
		this.tokenNumber = tokenNumber;
		this.status = status;
		this.userId = userId;
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

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}
}

