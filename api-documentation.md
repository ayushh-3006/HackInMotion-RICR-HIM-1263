# API Documentation

## 1. Project Overview
This application serves as an "AI Resume Analyzer & Mock Interview Platform". It allows users to upload and parse their resumes (PDF format), analyze them against specific job descriptions or roles using AI, receive keyword density and match scores, and track progress over time. Furthermore, the platform conducts AI-powered mock interviews complete with audio transcription, live answer evaluations, body language analysis, and comprehensive performance reports which can be publicly shared. 

## 2. Technology Stack
- **Framework:** Node.js with Express.js and TypeScript
- **Database:** MongoDB (via Mongoose)
- **Authentication:** Clerk (`@clerk/express`)
- **File Upload/Handling:** Multer (memory storage)
- **PDF Generation & Parsing:** Puppeteer (for generating PDFs), custom PDF parsers
- **AI / NLP Service:** Groq API (`GroqAIProvider` / `ATSAnalyzerModule`)

## 3. Base URL
- Development: `http://localhost:<PORT>/api`
- Production: `<DEPLOYED_BACKEND_URL>`

## 4. Authentication
This project uses **Clerk** for user authentication and authorization. 
- Users authenticate via the Clerk frontend SDK, which provides short-lived JWT session tokens.
- Protected backend routes verify incoming tokens using Clerk's Express middleware (`clerkMiddleware` & `clerkAuth`).
- For protected routes, the client must include the token in the request header.

```http
Authorization: Bearer <access_token>
```
*Note: Some endpoints are public (e.g., webhook listeners, public shared reports) and do not require this header.*

---

## 5. Endpoints

### 5.1 System & Health Checks
**`GET /api/health`**
- **Description:** Basic health check to ensure the server is running.
- **Auth Required:** No
- **Response:**
  ```json
  {
    "status": "ok",
    "message": "Server is healthy"
  }
  ```

---

### 5.2 Users & Webhooks
**`POST /api/webhooks/clerk`**
- **Description:** Webhook endpoint for Clerk to sync user lifecycle events (creation, updates, deletion).
- **Auth Required:** No (Verifies via Clerk Webhook Signature, not Bearer token)
- **Headers:** Requires `application/json` raw body for signature validation.

**`POST /api/users/sync`**
- **Description:** Manually synchronizes user data from Clerk to the local database.
- **Auth Required:** Yes

---

### 5.3 ATS Analysis
*Note: These endpoints currently do not enforce Clerk authentication based on the current implementation.*

**`POST /api/ats/calculate`**
- **Description:** Calculates an ATS compatibility score based on raw resume text and job criteria.
- **Auth Required:** No
- **Request Body (JSON):**
  - `resumeText` (string) - Required
  - `jobSkills` (string) - Required if `jobRole` is missing
  - `jobRole` (string) - Required if `jobSkills` is missing
  - `experience` (string) - Optional
  - `filters` (stringified JSON) - Optional
- **Response:** Returns `score`, `matchedSkills`, `missingSkills`, `suggestions`, `keywordDensity`, `sectionScores`, `aiSummary`, and `atsCompatible`.

**`POST /api/ats/calculate-file`**
- **Description:** Extracts text from an uploaded resume file and calculates the ATS score.
- **Auth Required:** No
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `resumeFile` (File) - Required
  - `jobSkills` (string)
  - `jobRole` (string)
  - `experience` (string)
  - `filters` (stringified JSON)

---

### 5.4 Resume Enhancement (Resume Parser & AI)
*Note: Handles extracting and enhancing existing resumes.*

**`POST /api/resume/enhance`**
- **Description:** Uploads a PDF resume, extracts data, and uses AI to enhance it against a given job description.
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `resume` (File - PDF) - Required
  - `jobDescription` (string) - Required
  - `role` (string) - Required
- **Response:** `{ "success": true, "data": { ...enhancedResumeData } }`

**`GET /api/resume/my-resumes`**
- **Description:** Retrieves all enhanced resumes saved by the authenticated user.
- **Auth Required:** Yes

**`GET /api/resume/roles`**
- **Description:** Returns available predefined job roles for the frontend.
- **Auth Required:** No

**`GET /api/resume/:id`**
- **Description:** Retrieves a specific enhanced resume by its ID.
- **Auth Required:** Yes

---

### 5.5 Resume Builder
*Note: Handles the creation, AI generation, and exporting of resumes from scratch or chat history.*

**`POST /api/resume-builder/generate`**
- **Description:** Generates updated resume JSON data using Groq AI based on user chat history.
- **Auth Required:** Yes
- **Request Body (JSON):**
  - `chatHistory` (array/object) - Required
  - `currentData` (object) - Optional

**`POST /api/resume-builder/export`**
- **Description:** Exports resume JSON data to a downloadable PDF file.
- **Auth Required:** Yes
- **Request Body (JSON):**
  - `resumeData` (object) - Required
  - `theme` (string) - Optional (Defaults to "default")
- **Response:** File download stream (`application/pdf`).

**`POST /api/resume-builder/save`**
- **Description:** Creates a new resume draft or updates an existing one.
- **Auth Required:** Yes
- **Request Body (JSON):**
  - `id` (string) - Optional (Used for updating existing drafts, otherwise creates new)
  - `title` (string) - Required
  - `theme` (string) - Optional
  - Additional dynamic resume fields
- **Response:** `{ "success": true, "message": "Draft saved/updated", "id": "<draft_id>" }`

**`GET /api/resume-builder/list`**
- **Description:** Retrieves all resume drafts for the authenticated user.
- **Auth Required:** Yes

**`GET /api/resume-builder/:id`**
- **Description:** Retrieves a specific resume draft by its ID.
- **Auth Required:** Yes

**`DELETE /api/resume-builder/:id`**
- **Description:** Deletes a resume draft by its ID.
- **Auth Required:** Yes

---

### 5.6 Mock Interviews
*Note: Manages AI mock interviews, audio transcription, evaluation, and sharing.*

**`POST /api/interview/start`**
- **Description:** Initializes a new mock interview session and generates questions using AI.
- **Auth Required:** Yes
- **Request Body (JSON):**
  - `jobRole` (string) - Required
  - `interviewType` (string) - Required
  - `experience` (string) - Optional (Defaults to "mid")
  - `category` (string) - Optional
  - `difficulty` (string) - Optional
- **Response:** `{ "success": true, "session": { ... } }`

**`POST /api/interview/transcribe`**
- **Description:** Transcribes an uploaded audio/video blob to text.
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `audio` (File Blob - max 25MB) - Required
- **Response:** `{ "success": true, "transcript": "<text>" }`

**`POST /api/interview/submit-answer`**
- **Description:** Submits a transcribed answer to an interview question for AI evaluation.
- **Auth Required:** Yes
- **Request Body (JSON):**
  - `sessionId` (string) - Required
  - `questionId` (string) - Required
  - `transcribedText` (string) - Required
  - `audioDurationSeconds` (number) - Optional
- **Response:** `{ "success": true, "evaluation": { ... }, "session": { ... } }`

**`POST /api/interview/complete`**
- **Description:** Completes the interview session and calculates the overall performance scores.
- **Auth Required:** Yes
- **Request Body (JSON):**
  - `sessionId` (string) - Required
- **Response:** `{ "success": true, "session": { ... } }`

**`GET /api/interview/history`**
- **Description:** Fetches up to 50 past interview sessions for the authenticated user.
- **Auth Required:** Yes

**`POST /api/interview/analyze-video-frames`**
- **Description:** Analyzes video frames for body language and expressions.
- **Auth Required:** Yes

**`POST /api/interview/sessions/:id/share`**
- **Description:** Generates a unique shareable token for an interview session to make it public.
- **Auth Required:** Yes
- **Response:** `{ "success": true, "shareToken": "...", "shareUrl": "..." }`

**`DELETE /api/interview/sessions/:id/share`**
- **Description:** Revokes public sharing access for an interview session.
- **Auth Required:** Yes

**`GET /api/interview/shared/:shareToken`**
- **Description:** Retrieves the non-sensitive public report for a shared interview session.
- **Auth Required:** No

---

### 5.7 Dashboard & Analytics (Mock Data)
*Note: These endpoints currently return static mock data based on the current implementation.*

**`GET /api/dashboard/stats`**
- **Description:** Returns mock dashboard statistics (drafts, scans, PDFs, average score).
- **Auth Required:** No

**`GET /api/ats/history`**
- **Description:** Returns mock ATS analysis history.
- **Auth Required:** No
