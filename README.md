<div align="center">
  <br>
  <h1>R E S U M I N D</h1>
  <p>
    <b>An AI-powered resume analysis and enhancement platform.</b>
  </p>
  <p>
    <sub>
      One intelligent platform to analyze, optimize, and elevate your resume for modern hiring systems.
    </sub>
  </p>
  <br>
  <p>
    <img src="https://img.shields.io/badge/Node.js-111111?style=for-the-badge&logo=nodedotjs&logoColor=15803D">
    <img src="https://img.shields.io/badge/Next.js-111111?style=for-the-badge&logo=nextdotjs&logoColor=white">
    <img src="https://img.shields.io/badge/MongoDB-111111?style=for-the-badge&logo=mongodb&logoColor=47A248">
    <img src="https://img.shields.io/badge/Clerk-111111?style=for-the-badge">
  </p>

  <br>
  <a href="#-project-overview">Project Overview</a> ✦
  <a href="#-key-features">Key Features</a> ✦
  <a href="#-system-architecture">Architecture</a> ✦
  <a href="#-system-architecture-diagrams">Diagrams</a> ✦
  <a href="#-project-structure">Structure</a> ✦
  <a href="#-installation">Installation</a> ✦
  <a href="#-api-flow">Flow</a> ✦
  <a href="#-tech-stack">Tech Stack</a>
  <br>
</div>
<hr>

## ◈ Project Overview

**Resumind** is an intelligent web application that helps users analyze, optimize, and enhance their resumes using AI.

Instead of manually editing resumes or guessing what recruiters want, Resumind provides a **structured, data-driven approach** to resume building. It evaluates content, improves formatting, enhances keyword relevance, and generates actionable insights to increase ATS (Applicant Tracking System) success rates.

The platform simplifies resume optimization into a seamless workflow — from upload to enhancement to export.

<br>

## ◈ Key Features

### Core Capabilities

| <kbd>01</kbd> Resume Analysis                                                               | <kbd>02</kbd> ATS Optimization                                                               |
|----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| AI evaluates resume content and identifies weaknesses, gaps, and improvements.              | Optimizes keywords and formatting to improve ATS compatibility.                               |

| <kbd>03</kbd> Resume Enhancement                                                           | <kbd>04</kbd> Authentication                                                                 |
|---------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| AI rewrites and enhances resumes based on job descriptions and industry standards.          | Secure login/signup using Clerk (Google OAuth + Email authentication).                         |

<br>

### Platform Capabilities

- **Real-time Feedback** — Instant suggestions and improvements  
- **Structured Resume Builder** — Guided content creation  
- **Export System** — Download optimized resumes  
- **Dashboard Tracking** — Manage and revisit previous resumes  

<br>

### Coming Soon

| Capability | Impact |
|----------|--------|
| **Cover Letter Generator** | Generate personalized cover letters |
| **Job Matching** | Suggest relevant jobs based on resume |
| **Advanced Export** | PDF, Word, ATS-ready formats |

<br>

### ◈ AI/NLP Integration — Industry-Specific Question Bank Generator

The **Question Bank Generator** dynamically builds tailored interview questions based on the candidate's target industry, role, and experience level.

#### AI Service: Groq API (Llama 3)

| Dimension | Detail |
|-----------|--------|
| **Provider** | [Groq](https://groq.com/) — LPU-accelerated inference |
| **Model** | `llama-3.1-8b-instant` |
| **Resilience Strategy** | Built-in static dictionary fallbacks for core industries (Software Engineering, Finance, Marketing) to guarantee 100% uptime even if rate limits are hit. |

#### How it works

1. **Dynamic Tailoring**: The generator blends technical, situational, and behavioral questions specific to the industry (e.g., System Design for Software Engineering vs. DCF modeling for Finance).
2. **Experience Scaling**: Question difficulty is strictly aligned with the requested experience level (Entry-Level vs. Senior).
3. **Structured Evaluation Guidelines**: Every generated question includes `keyPointsExpected` and a `suggestedAnswerStructure` (like the STAR method) to power downstream answer evaluation.

#### Endpoint Reference

**`POST /api/interview/questions/generate`**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `industry` | `string` | ✅ | e.g. "Tech & Software", "Finance" |
| `targetRole` | `string` | ✅ | e.g. "Senior React Developer" |
| `experienceLevel` | `string` | ✅ | e.g. "Senior / Lead (5+ yrs)" |
| `questionCount` | `number` | | Default: 5 |
| `includeBehavioral` | `boolean` | | Default: true |

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "industry": "Tech & Software",
    "targetRole": "Senior React Developer",
    "difficulty": "Senior / Lead (5+ yrs)",
    "questions": [
      {
        "id": "e9b2...8f7d",
        "type": "System Design",
        "question": "How would you design the architecture for a real-time collaborative document editor like Google Docs?",
        "keyPointsExpected": ["Operational Transformation (OT) or CRDTs", "WebSockets", "Conflict resolution"],
        "suggestedAnswerStructure": "Start with high-level architecture, move to data models, and then dive deep into the specific conflict resolution algorithm.",
        "difficulty": "Hard"
      }
    ]
  }
}
```

<br>

### ◈ AI API Justification (Groq)

For the core NLP tasks—specifically the real-time Job Description Matching Engine and dynamic Question Bank generation—Groq was selected over traditional LLM providers due to its specialized LPU (Language Processing Unit) architecture. This hardware enables ultra-fast inference speeds and exceptionally low latency. In the context of an ATS matching engine where users expect instant feedback upon uploading a resume and pasting a job description, standard API latency (often 2-5 seconds) degrades the UX. Groq processes these heavy text payloads and returns structured JSON in a fraction of that time, ensuring a seamless, real-time experience.

Furthermore, leveraging the Llama 3 models via Groq provides a massive advantage in structured data extraction over standard text-similarity algorithms (like Cosine Similarity with TF-IDF or basic embedding comparisons). Traditional similarity algorithms only detect exact or fuzzy keyword matches, failing to understand the context of how a skill was applied. Llama 3 deeply parses the semantic meaning behind bullet points, accurately identifying true missing skills and generating highly specific, context-aware actionable suggestions. Crucially, Llama 3 on Groq consistently strictly adheres to JSON schema constraints, allowing our backend to reliably parse `matchScore`, `missingSkills`, and `actionableSuggestions` without regex hacks or parsing failures.

<br>

### Implementation Comparison

| Domain | Traditional Approach | Resumind |
|------|---------------------|----------|
| Resume Writing | Manual editing | AI-assisted optimization |
| ATS Compatibility | Guess-based | Data-driven keyword analysis |
| Feedback | Limited | Real-time AI insights |
| Efficiency | Time-consuming | Automated workflow |

<br>

## ◈ System Architecture

The system is designed with a modular service-based architecture:

- **Authentication Layer** — Handles user sessions via Clerk  
- **Resume Builder** — Manages templates and content creation  
- **ATS Service** — Analyzes resumes and generates scores  
- **Enhancer Service** — Uses AI to improve resume content  
- **Database Layer** — Stores users, resumes, and reports using MongoDB  

This layered architecture ensures scalability, maintainability, and clean separation of concerns.

<br>

## ◈ System Architecture Diagrams

<details>
<summary><b>View System Diagrams</b></summary>

<br>

<div align="center">

### System Architecture
![Architecture Diagram](./architecture-diagram.png)
<br><br>

### UML Diagrams

![Class Diagram](./diagrams/Class_Diagram/final.png)
<br><br>

![Class Breakdown 1](./diagrams/Class_Diagram/1.png)
<br><br>
![Class Breakdown 2](./diagrams/Class_Diagram/2.png)
<br><br>

![Class Breakdown 3](./diagrams/Class_Diagram/3.png)
<br><br>
![Class Breakdown 4](./diagrams/Class_Diagram/4.png)
<br><br>

![Class Breakdown 5](./diagrams/Class_Diagram/5.png)
<br><br>
![Class Breakdown 6](./diagrams/Class_Diagram/6.png)

<br><br>

### Database Schema

![ER Diagram](./diagrams/ER_Diagram/1.png)
<br><br>
![ER Diagram](./diagrams/ER_Diagram/2.png)
<br><br>
![ER Diagram](./diagrams/ER_Diagram/3.png)
<br><br>
![ER Diagram](./diagrams/ER_Diagram/4.png)
<br><br>
![ER Diagram](./diagrams/ER_Diagram/5.png)

<br><br>

### Sequence Diagrams

![Sequence Diagram](./diagrams/Sequence_Diagram/1.png)
<br><br>
![Sequence Diagram](./diagrams/Sequence_Diagram/2.png)
<br><br>
![Sequence Diagram](./diagrams/Sequence_Diagram/3.png)
<br><br>
![Sequence Diagram](./diagrams/Sequence_Diagram/4.png)
<br><br>
![Sequence Diagram](./diagrams/Sequence_Diagram/5.png)

<br><br>

### Use Case Diagram

![Use Case Diagram](./diagrams/Use_Case_Diagram/1.png)
<br><br>
![Use Case Diagram](./diagrams/Use_Case_Diagram/2.png)
<br><br>
![Use Case Diagram](./diagrams/Use_Case_Diagram/3.png)
<br><br>
![Use Case Diagram](./diagrams/Use_Case_Diagram/4.png)
<br><br>
![Use Case Diagram](./diagrams/Use_Case_Diagram/5.png)
<br><br>
![Use Case Diagram](./diagrams/Use_Case_Diagram/6.png)

</div>

</details>

<br>

## ◈ Project Structure

```text
resumind/
├── backend/                   # Node.js backend services and API routes
│   ├── src/                   # Backend source code, models, and controllers
│   └── uploads/               # Directory for temporary/stored file uploads
├── frontend/                  # Next.js frontend application
│   ├── app/                   # Application routing and pages
│   ├── components/            # Reusable React components (UI, layout, etc.)
│   └── lib/                   # Utility functions and shared logic
├── diagrams/                  # Application flow and detailed UML diagrams
├── architecture-diagram.png   # High-level architecture overview diagram
├── api-documentation.md       # API endpoints and integration documentation
└── presentation.pptx          # Project presentation slides