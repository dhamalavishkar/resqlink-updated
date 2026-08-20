# ResQLink Architecture

This document describes the architecture of the ResQLink emergency response platform.

## Overview

ResQLink is built around four pillars: SEE, CONNECT, THINK, and ACT. The system consists of:

1. A React-based frontend dashboard for command and control
2. A Python/FastAPI backend providing API services and AI processing
3. A Supabase PostgreSQL database for persistent storage
4. Optional Streamlit interface for AI/model testing
5. Computer Vision module using YOLOv8
6. Offline mesh networking using WebRTC
7. AI risk scoring and briefing generation

## Frontend Architecture

- **Framework**: React with Vite and TypeScript
- **UI Components**: Tailwind CSS and Radix UI (shadcn/ui)
- **Routing Map**: React-Leaflet for displaying hazard zones and routing
- **Internationalization (i18n)**: i18next for multi-language support (e.g. English, Spanish)
- **State Management**: React Hooks and Context

## Backend Architecture

- **Framework**: FastAPI (Python)
- **Routing Engine**: Graph-based A* (A-Star) search using `networkx` to compute optimal and safe routes avoiding detected hazard zones.
- **REST APIs**: Endpoints for incidents, resources, AI vision processing, and mesh networking.

## AI Architecture

- **Computer Vision**: YOLOv8 models for detecting survivors, fires, and structural damage from drone/camera feeds.
- **LLM Integration**: Briefing generation and risk analysis using Gemini/OpenAI.

## Database Architecture

- **Primary Database**: PostgreSQL via Supabase
- **Data Access**: SQLAlchemy ORM with Alembic for migrations

## Offline and Mesh Architecture

- **WebRTC**: Peer-to-peer mesh networking to allow communication in connectivity-denied environments.
- **Store and Forward**: Uses IndexedDB to store messages locally and forward them when peers reconnect.

## Data Flow

1. Incident detected (via Vision AI or Manual Report)
2. AI Risk Engine scores the incident
3. Mesh Network broadcasts alerts to available peers
4. Graph Routing Engine computes safe path for responders
5. Responders deploy and update status

## Components

- SEE: Computer Vision Pipeline (YOLOv8)
- CONNECT: WebRTC Mesh Network (Offline Sync)
- THINK: Risk Scoring Engine & AI Briefings
- ACT: Resource Allocation & Graph Routing Engine (networkx)

## Diagrams

(To be added)