# .junie Overview

## Project Summary
"Manga Factory" is an experimental manga-generation game built to explore rapid creative production with AI.
The project aims to show how structured randomness, timed prompts, and AI-driven feedback can emulate the feel of a chaotic anime studio.

## Scope
Deliver a functional creative loop within the hackathon window.
Do not aim for full deployment, backend persistence, or player accounts.

### Success Criteria (MVP)
- A player can complete at least one contract end-to-end: input idea → see generated panels → edit dialogue → receive critique.
- Generation is deterministic enough for debugging: seedable or logged inputs/outputs.
- Clear developer runbook exists and works on a clean machine.

### Out of Scope (Hackathon)
- User accounts and persistence beyond session lifetime.
- Billing/invoicing, complex analytics, multi-tenant features.
- Full art direction pipeline; prioritize playful coherence over photorealism.

## Guiding Idea
Build tools that make humans feel like manga artists under pressure, not passive prompt writers.

## Quick Map
- Runbook: ../runbook.md
- Project Map: ../context/project-map.md
- API/Data Contracts: ../context/api-contracts.md
- Prompts Library: ../prompts/library.md
- Principles: ../profile/principles.md
- Task Priorities: ../tasks/priorities.json


# Project Map

## Overview
"Manga Factory" is a narrative-generation and visual storytelling system built for a creative hackathon.
The project simulates an anime studio where players produce short manga stories under time pressure, guided by eccentric AI characters.

## Core Loop
1. Player receives a randomized creative contract (title, tone, audience).
2. Player submits a brief idea (storyboard sentences for the general story + each panel descriptions).
3. System generates three-five manga panels based on that input (number defined by contract).`
4. Player edits dialogue in each panel.
5. AI critics review and rate the work.
6. Player earns coins and continues to the next contract.

## Technical Surface
- Frontend: Web-based interactive app
- AI Core: OpenAI APIs for text generation
- Rendering: Engine "Kodo" to visualize panels
- Storage: Session-based memory (no persistent state during hackathon)
- Focus: Speed, creativity, replayability

## Key Goals
- Demonstrate LLM-assisted co-creation under time pressure
- Blend structured generation (contracts) with freeform creativity (panels)
- Use multiple AI voices to create a game-like feedback loop

## PRINCIPLES
- Document purpose and outcomes, not implementation trivia
- Keep hackathon scope narrow: functional prototype, not production stack
- Treat creativity and code as equal first-class citizens
- Maintain clear separation between narrative logic and runtime code
- Avoid mission drift: focus on completing one playable experience

## Priorities
```
    {
    "high": [
    "stabilize generation pipeline",
    "maintain creative coherence in outputs",
    "ensure consistent API and rendering flow"
    ],
    "medium": [
    "add optional polish to panel visuals",
    "expand critic dialogue variety"
    ],
    "low": [
    "optimize storage and caching",
    "minor UI cosmetic tuning"
    ],
    "tie_breakers": [
    "improves player immersion",
    "reduces confusion",
    "fits within hackathon timeframe"
    ]
    }
```