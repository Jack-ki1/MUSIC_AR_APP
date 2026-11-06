# Breakout Radar Implementation Plan

## Executive Summary
Breakout Radar will be a premium A&R intelligence platform. The architecture will separate concerns into a React frontend (Vite), a FastAPI backend, a PostgreSQL database (using SQLAlchemy/Alembic), and a robust Python-based worker service for autonomous data collection and processing.

## 1. Foundation & Infrastructure
- **Database**: Provision PostgreSQL via CloudSQL.
- **Backend**: Implement FastAPI framework, Pydantic 2 schemas, and SQLAlchemy 2 ORM.
- **Worker**: Implement a PostgreSQL-backed job queue for autonomous tasks (discovery, evidence collection, metrics).
- **Environment**: Set up robust logging, configuration management, and secrets handling (via server-side proxy).

## 2. Database Schema (PostgreSQL)
- **Core Entities**: Workspaces, Users, Artists, Identities, Sources.
- **Intelligence**: Metric Observations, Evidence Items, Artistic Reviews.
- **Discovery**: Seeds, Runs, Candidates.
- **Automation**: Scheduled Jobs, Heartbeats, Audit Logs.

## 3. Provider Engine
- Implement a standardized adapter interface (`ProviderAdapter`) for music platforms (Spotify, YouTube, MusicBrainz, etc.).
- Build a Quota Manager (critical for YouTube/Spotify) to track API usage and manage rate limits.

## 4. Frontend Development (Premium UI)
- **Design System**: Implement reusable tokens and components using Tailwind CSS based on the requested premium aesthetic.
- **Pages**:
    - **Discovery**: Autonomous discovery dashboard, scan activity, candidate review queue.
    - **Analyse**: Artist directory, detailed profile workspace, trend analysis, anomaly detection, A&R scorecard.
    - **Recommendations**: Ranking board, explainable scoring engine, decision management.
    - **Settings**: Professional provider management, secret management, automation controls.

## 5. Development Phases
1. **Phase 1**: Database schema design & FastAPI setup.
2. **Phase 2**: Provider adapter framework & autonomous discovery worker foundation.
3. **Phase 3**: Core UI implementation (Layout + Discovery).
4. **Phase 4**: Intelligence & Analysis modules (Metrics, Artistic Review).
5. **Phase 5**: Recommendation Engine & Settings/Automation configuration.

## Feedback Request
- Confirm if you have a preferred region for the database deployment.
- Please confirm if you approve this architectural roadmap to proceed with schema and environment initialization.
