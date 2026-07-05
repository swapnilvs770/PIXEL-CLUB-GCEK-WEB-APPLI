# Pixel Club Management Portal (PCMP) v1.0

## SYSTEM ROLE

You are the Lead Software Architect, Senior Full Stack Engineer,
Database Architect, UI/UX Designer, and DevOps Engineer responsible for
developing the **Pixel Club Management Portal (PCMP)**.

Treat this document as the **single source of truth** for the project.
Do not redesign the architecture or replace technologies without
explicit approval.

------------------------------------------------------------------------

# PROJECT OVERVIEW

The Pixel Club Management Portal (PCMP) is a centralized platform for
**Pixel Club, Government College of Engineering, Karad**.

The portal replaces the current workflow of sharing Google Drive links
on WhatsApp with a secure, scalable web application that manages:

-   Authentication
-   Photography Requests
-   Album Management
-   Team Management
-   User Approval
-   Notifications
-   Logs
-   Analytics

Version 1 excludes AI features such as face recognition.

------------------------------------------------------------------------

# TECH STACK

## Frontend

-   React (Vite)
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   React Router
-   TanStack Query

## Backend

-   Node.js
-   Express.js

## Database

-   MongoDB Atlas + Mongoose

## Authentication

-   Google OAuth

## Storage

-   Google Drive (Original Photos)
-   Cloudinary (Compressed Preview)

## Realtime

-   Socket.IO

## Mail

-   Nodemailer

## Deployment

-   Frontend: Vercel
-   Backend: Railway
-   Database: MongoDB Atlas

------------------------------------------------------------------------

# USER ROLES

Only two roles exist.

## User

-   Login using Google
-   Requires manual admin approval
-   Submit/Edit photography requests
-   Browse published albums
-   Download original images
-   View notifications
-   Update profile

## Admin

Everything a User can do plus: - Approve/Block users - Promote admins -
Manage requests - Create and publish albums - Manage batch-wise team -
View analytics - View logs - Manage settings - Manage upload queue

------------------------------------------------------------------------

# AUTHENTICATION FLOW

Visitor → Google OAuth → User record created → Status = Pending → Admin
Approval → Dashboard Access

Blocked users cannot access protected resources.

------------------------------------------------------------------------

# TEAM MANAGEMENT

-   Team is synchronized with Admin accounts.
-   Batch-wise history is mandatory.
-   Never overwrite previous batches.

Each visible member contains: - Name - Photo - Designation - Bio -
Contributions - Social links - Batch - Display order

------------------------------------------------------------------------

# ALBUM PIPELINE

Admin pastes Google Drive folder link.

Pipeline:

1.  Validate folder
2.  Count images
3.  Download originals
4.  Compress images
5.  Upload compressed copies to Cloudinary
6.  Save metadata in MongoDB
7.  Save album as Draft
8.  Publish manually

Google Drive always stores original images. Cloudinary stores only
compressed previews.

------------------------------------------------------------------------

# UPLOAD ENGINE

Requirements: - Real-time progress - ETA - Upload speed - Pause -
Resume - Retry failed - Session recovery - Background processing - Live
logs

Display: - Total photos - Processed - Uploaded - Failed - Remaining -
Current file

Only one upload job runs at a time in Version 1.

------------------------------------------------------------------------

# REQUEST WORKFLOW

Submit → Pending → Approved → Photography Completed → Album Linked →
Completed

Pending requests may be edited.

------------------------------------------------------------------------

# GALLERY

-   Year-wise organization
-   Published albums only
-   Compressed previews
-   Original downloads from Google Drive
-   Search and filters

------------------------------------------------------------------------

# NOTIFICATIONS

Website + Email

Events: - Account Approved - Account Blocked - Request Approved -
Request Rejected - Album Published - Request Completed

------------------------------------------------------------------------

# LOGGING

Log: - Login/Logout - User approvals - Blocks - Album actions -
Downloads - Upload failures - Request updates

Include: - Timestamp - User - Browser - IP - Action - Result

------------------------------------------------------------------------

# SETTINGS

Admin configurable: - Website details - Theme - SMTP - Google Drive -
Cloudinary - Homepage - Maintenance mode - Feature toggles

Never hardcode operational settings.

------------------------------------------------------------------------

# UI PRINCIPLES

-   Responsive
-   Dark & Light mode
-   Clean SaaS design
-   Accessible
-   Lazy loading
-   Reusable components

------------------------------------------------------------------------

# DATABASE COLLECTIONS

-   users
-   albums
-   photos
-   requests
-   notifications
-   logs
-   uploadJobs
-   teamBatches
-   settings

------------------------------------------------------------------------

# SECURITY

-   Protect all APIs
-   Validate inputs
-   Use environment variables
-   Never expose secrets
-   Sanitize user data
-   Maintain audit logs

------------------------------------------------------------------------

# FUTURE (NOT V1)

-   Face Recognition
-   AI Search
-   Face Tagging
-   QR Attendance
-   Mobile App

------------------------------------------------------------------------

# DEFINITION OF DONE

The project is complete when:

-   Google OAuth works.
-   Admin approval works.
-   Request lifecycle is complete.
-   Album import pipeline works.
-   Cloudinary previews work.
-   Google Drive original downloads work.
-   Batch-wise team management works.
-   Notifications, logs, analytics, and settings are functional.
-   Application is production-ready.

------------------------------------------------------------------------

# AI INSTRUCTIONS

Always read this file before generating code.

Never: - Replace Google Drive originals. - Remove manual approval. - Add
extra user roles. - Change the technology stack. - Simplify the upload
pipeline.

If any requirement is ambiguous, ask before implementation.

This file is the authoritative specification for PCMP Version 1.0.
