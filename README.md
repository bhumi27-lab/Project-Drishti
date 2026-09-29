

# Project Drishti

### Autonomous AI SOC — Multi-Agent AI Orchestration for Real-Time Cyber Threat Detection & Mitigation

> **The AI That Fights Back.**

Project Drishti is a **multi-agent AI system** designed to detect, investigate, and respond to suspicious cyber activity through specialized AI agents, RAG-based knowledge retrieval, local LLM reasoning, and controlled autonomous response.

---

## 🎯 Vision

Cybersecurity is the problem domain.  
**AI is the solution engine.**

Project Drishti follows a simple principle:

**SEE → UNDERSTAND → DECIDE → DEFEND**

---

## 🧠 How It Works

Project Drishti uses three specialized AI agents:

### 👁️ Watcher — Detection

- Monitors incoming security logs
- Identifies suspicious or anomalous activity
- Retrieves relevant historical context from PostgreSQL
- Passes important events to the Detective

### 🕵️ Detective — Investigation

- Investigates suspicious events
- Retrieves relevant knowledge using RAG
- Uses MITRE ATT&CK as the threat knowledge source
- Performs reasoning using a local Llama 3.2 model
- Can request additional context from the Watcher when information is insufficient

### 🛡️ Bouncer — Mitigation

- Receives the validated decision
- Performs controlled response actions
- Can block a malicious IP when the required confidence conditions are satisfied

---

## 🔄 System Flow

```text
Incoming Logs
      │
      ▼
   Watcher
      │
      ├── Historical Context
      │        │
      │        ▼
      │   PostgreSQL
      │
      ▼
  Detective
      │
      ├── RAG Retrieval
      │        │
      │        ▼
      │   ChromaDB
      │        │
      │        ▼
      │  MITRE ATT&CK
      │
      ├── Llama 3.2
      │        │
      │        ▼
      │    AI Reasoning
      │
      ▼
 Confidence Gate
      │
      ├── High Confidence ──► Bouncer ──► Controlled Response
      │
      └── Low Confidence ───► Human Analyst
