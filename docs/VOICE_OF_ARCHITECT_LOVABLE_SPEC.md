# Voice of Architect — Lovable Vibe Coding Specification

## AEA India Conclave 2026 — Pre-Conclave Masterclass

**Product:** Voice of Architect  
**Event:** AEA India Conclave 2026  
**Date:** 26 September 2026  
**Location:** Hyderabad  
**Theme:** Architecting Intelligent Business Ecosystems  
**Tagline:** Think. Architect. Present. Influence.

---

# 1. Product Vision

Build **Voice of Architect** as a live, interactive, gamified architecture challenge platform for the AEA India Conclave 2026 pre-conclave masterclass.

Participants form teams, select one of six challenge themes, collaboratively develop an architecture/business point of view within a configurable time limit, present their solution, and vote on other teams.

The platform automatically calculates scores and announces the Top 3 teams.

This is not a traditional conference registration system. It combines:

- Enterprise Architecture workshop
- Hackathon
- Team challenge
- Collaborative thinking
- Live presentation arena
- QR-based audience voting
- Transparent scoring
- Awards ceremony

Core philosophy:

> **Every architect has a voice. Every idea deserves a stage. The collective decides what rises.**

Experience flow:

**Choose → Assemble → Think → Architect → Present → Vote → Discover the Winners**

---

# 2. Visual Design

Create a premium modern enterprise-tech interface.

## Visual language

- Blue → cyan → green gradient
- Deep navy backgrounds
- White cards
- Soft glassmorphism
- Subtle gradients
- Rounded corners
- Elegant shadows
- Minimal premium animations
- Modern enterprise SaaS aesthetic
- Responsive desktop/tablet/mobile

## Suggested colors

- Deep Navy: `#0B1F3A`
- Enterprise Blue: `#1769AA`
- Cyan: `#20B8D5`
- Aqua: `#36D7C7`
- Green: `#5CCB73`
- Light Background: `#F5FAFB`
- White: `#FFFFFF`
- Dark Text: `#102033`

Use a modern font such as Inter.

Do not make it look like a gaming website. It should feel like an enterprise innovation platform.

---

# 3. Landing Page

Hero:

## VOICE OF ARCHITECT

**Think. Architect. Present. Influence.**

"Where architects turn ideas into collective intelligence."

Show:

**AEA INDIA CONCLAVE 2026**  
Pre-Conclave Masterclass  
26 September 2026 | Hyderabad

Primary CTA:

**JOIN VOICE OF ARCHITECT**

Secondary CTA:

**HOW IT WORKS**

Show the six challenge themes below the hero.

---

# 4. Six Challenge Themes

Create exactly six selectable themes:

1. **Building an AI-empowered, future-ready workforce**
2. **Trusted, compliant, and scalable data foundation for AI**
3. **Navigating the Process Odyssey**
4. **Enterprise Operating Models**
5. **Intelligent Enterprise Foundations**
6. **Ecosystem-ready Technology Platforms**

Each theme has:

- Theme number
- Title
- Short description
- Icon
- Participant count
- Team count
- Selection button

Admin can edit, activate/deactivate, and reorder themes.

---

# 5. User Personas

Create role-based experiences.

## Participant

Can:

- Join event
- Create or join a team
- Select a theme
- Collaborate
- View countdown
- Submit presentation
- Watch presentations
- Vote for eligible teams

## Team Captain

Can:

- Create team
- Set team name
- Select theme
- Manage members
- Submit final presentation
- Start presentation when authorized

## Facilitator

Can:

- Start phases
- Pause/resume timer
- Move the room between stages
- Monitor teams
- Manage presentation order
- Control the live arena

## Admin

Can:

- Configure event
- Configure themes
- Configure maximum team size
- Configure timers
- Configure voting criteria
- Configure weights
- Configure winner count
- Manage participants
- Manage teams
- Control all event stages
- Reveal results
- Run Demo Mode

## Audience / Voter

Can:

- Scan QR
- Enter voting experience
- Watch eligible presentations
- Rate eligible teams
- Submit vote according to event rules

---

# 6. Team Creation

Create a beautiful **Build Your Team** screen.

Options:

- **CREATE TEAM**
- **JOIN TEAM**

Create Team fields:

- Team Name
- Team Captain
- Theme
- Team Description

## Configurable team size

Default:

**5 members**

Admin can configure:

**2–10 members**

Show live capacity:

`TEAM ALPHA — 4 / 5 MEMBERS`

Prevent a team from exceeding the configured maximum.

Show:

- Available teams
- Selected theme
- Current member count
- Remaining seats

Admin can configure whether participants may switch teams.

---

# 7. Event Journey

Display a visual journey:

**01 FORM → 02 SELECT THEME → 03 BUILD TEAM → 04 THINK → 05 ARCHITECT → 06 PRESENT → 07 VOTE → 08 WINNERS**

Highlight the current stage.

Admin/facilitator controls the global event stage.

All connected users see the same stage in real time.

---

# 8. Thinking / Architecture Challenge

After teams are formed:

## ARCHITECT YOUR ANSWER

Display a large central countdown.

Default:

**60 MINUTES**

Admin-configurable:

- 15 minutes
- 30 minutes
- 45 minutes
- 60 minutes
- 90 minutes
- Custom duration

Timer states:

- Not Started
- Running
- Paused
- Warning
- Time Up

Notifications:

- 15 minutes remaining: "Start converging your ideas."
- 5 minutes remaining: "Finalise your architecture."
- 1 minute remaining: "One minute remaining!"
- 0:00: "TIME'S UP — Prepare to Present"

Timer must synchronize across all connected users without page refresh.

---

# 9. Team Workspace

Every team gets a collaborative workspace.

Header:

**TEAM ALPHA**

Theme:

**Building an AI-empowered, future-ready workforce**

Show countdown.

Workspace sections:

## Problem
What is the problem?

## Point of View
What do we believe?

## Architecture
What is our proposed solution?

## Business Value
Why does it matter?

## Differentiator
What makes our approach different?

## Presentation
Upload presentation/document/PDF/optional image.

Provide a lightweight architecture canvas supporting:

- Cards
- Components
- Connections
- Layers

Suggested architecture layers:

**BUSINESS → PROCESS → DATA → APPLICATION → TECHNOLOGY → AI / ECOSYSTEM**

Keep collaboration simple enough for rapid thinking.

---

# 10. Presentation Submission

Team Captain clicks:

**SUBMIT FOR PRESENTATION**

Confirmation:

> Your architecture is locked for presentation.

Submission fields:

- Team Name
- Theme
- Presentation Title
- Executive Summary
- Key Architecture Idea
- Business Impact
- Presentation File
- Optional Architecture Diagram

Status:

**READY TO PRESENT**

Admin/facilitator can see all team statuses.

---

# 11. Presentation Arena

Create a dramatic live presentation screen.

Header:

**VOICE OF ARCHITECT — LIVE PRESENTATION ARENA**

Display:

- Team name
- Presentation title
- Theme
- Presentation content
- Team members

Presentation timer:

Default **5 minutes**

Admin-configurable.

Controls:

- START
- PAUSE
- EXTEND
- END PRESENTATION

Show:

**NOW PRESENTING**

and

**NEXT TEAM**

---

# 12. Voting System

After each presentation, voting opens.

Display:

## VOTE FOR THE ARCHITECT

Default evaluation criteria:

1. Architectural Thinking
2. Business Value
3. Innovation
4. Feasibility
5. Presentation

Rating:

**1–5**

Admin can configure criteria and weights.

Default weights:

- Architectural Thinking — 25%
- Business Value — 25%
- Innovation — 20%
- Feasibility — 15%
- Presentation — 15%

Participants can vote for other teams.

**A participant MUST NOT vote for their own team.**

The final ranking remains hidden until the competition ends unless Admin explicitly enables live scoring.

---

# 13. QR Code Voting

Add a dedicated **QR CODE VOTING** capability.

During voting, Admin/Facilitator can select:

**GENERATE VOTING QR**

Display on the main screen:

```text
VOICE OF ARCHITECT

SCAN TO VOTE

        [ LARGE QR CODE ]

Your Voice. Your Vote.

Voting closes in:
02:34
```

QR opens a mobile-friendly route such as:

`/vote/{eventId}/{votingSessionId}`

The QR must not expose sensitive information.

Do not encode:

- Participant identity
- Team membership
- Private data
- Voting results

Use a secure voting-session token.

---

# 14. QR Voting Modes

Admin configuration:

**QR VOTING: ON / OFF**

Voter modes:

1. Registered Participants
2. Registered Participants + Audience
3. Audience Only

Default:

**Registered Participants + Audience**

Registered participants must authenticate.

Audience voters can receive a secure temporary voting session/token.

All eligibility validation must happen server-side.

---

# 15. HARD BUSINESS RULE — NO SELF VOTING

This is a **mandatory integrity rule**.

A participant MUST NEVER be able to vote for their own team.

Example:

Participant:

`USER-001`

Team:

`TEAM-ALPHA`

Target:

`TEAM-ALPHA`

Result:

**REJECT**

Display:

> 🚫 VOTE NOT ALLOWED  
> You cannot vote for your own team.

The UI should disable the participant's own team, but that is only a UX convenience.

The backend must independently enforce the rule.

Self-voting must remain blocked even if the user:

- Changes the URL
- Changes browser state
- Manipulates the target team ID
- Opens developer tools
- Refreshes the page
- Uses another browser
- Uses another device
- Directly calls the API

Authoritative check:

`voter.team_id != target_team_id`

If false:

`403 FORBIDDEN`

Reason:

`SELF_VOTE_NOT_ALLOWED`

No vote record may be created.

---

# 16. HARD TEST CASE — SELF VOTING

Mandatory automated test.

Given:

- USER-001 belongs to TEAM-ALPHA
- Voting session is open
- USER-001 attempts to vote for TEAM-ALPHA

Then:

- Vote submission fails
- HTTP status = 403
- Error = SELF_VOTE_NOT_ALLOWED
- No vote record is created

Frontend:

> 🚫 You cannot vote for your own team.

This test must pass before the application is considered production-ready.

---

# 17. HARD TEST CASE — OTHER TEAM VOTING

Given:

- USER-001 belongs to TEAM-ALPHA
- Target is TEAM-BETA

When USER-001 submits a valid vote:

- Vote is accepted
- Vote is recorded
- Aggregate score updates

---

# 18. HARD TEST CASE — QR SELF VOTING

Scenario:

1. USER-001 belongs to TEAM-ALPHA.
2. Admin generates voting QR.
3. USER-001 scans QR.
4. Voting Arena opens.
5. USER-001 attempts to select TEAM-ALPHA.
6. USER-001 attempts to submit.

Expected:

**REJECT**

Display:

> 🚫 SELF-VOTING BLOCKED  
> Your team cannot be selected as a voting target.

QR voting must never bypass the self-voting rule.

---

# 19. HARD TEST CASE — MULTIPLE DEVICES

USER-001 belongs to TEAM-ALPHA.

Device A:

Desktop.

Device B:

Mobile.

Device B scans the QR.

USER-001 attempts to vote for TEAM-ALPHA.

Expected:

**REJECT**

Changing device must not change voting eligibility.

---

# 20. HARD TEST CASE — DUPLICATE VOTING

If a voter has already voted according to the configured voting policy, a second vote must be rejected.

Display:

> Your vote has already been recorded.

Enforce this at database/server level, not only by disabling a frontend button.

---

# 21. Voting Integrity Architecture

Never implement voting security only in React.

## Frontend

Responsible for:

- User experience
- Visual feedback
- Disabled own-team selection
- Timer display
- Voting forms

## Backend

Responsible for:

- Authentication
- Eligibility
- Self-voting enforcement
- Duplicate voting enforcement
- Session validation
- Score calculation

## Database

Responsible for:

- Referential integrity
- Unique constraints
- Vote records
- Audit trail

Never trust:

- Client-provided voter ID
- Client-provided team ID
- Client-provided eligibility
- Client-calculated score

Authoritative relationship:

**USER → EVENT PARTICIPATION → TEAM MEMBERSHIP → VOTING ELIGIBILITY → TARGET TEAM → VOTE**

---

# 22. Voting Database Model

Create:

`votes`

Fields:

- id
- event_id
- voting_session_id
- voter_id
- target_team_id
- architectural_thinking_score
- business_value_score
- innovation_score
- feasibility_score
- presentation_score
- total_score
- created_at

Create appropriate database constraints.

At minimum:

`event_id + voting_session_id + voter_id + target_team_id`

must be unique according to the configured voting policy.

Before inserting:

1. Authenticate voter.
2. Confirm voting session is OPEN.
3. Confirm voter belongs to event.
4. Retrieve voter's current team from database.
5. Retrieve target team.
6. Confirm voter.team_id != target_team_id.
7. Confirm voter has not already voted according to policy.
8. Validate scores.
9. Insert vote.
10. Recalculate aggregate scores server-side.

---

# 23. QR Security

Voting session should have:

- id
- event_id
- secure token
- created_at
- expires_at
- status

Statuses:

- NOT_STARTED
- OPEN
- PAUSED
- CLOSED

When voting closes, all subsequent vote submissions must fail.

Use cryptographically secure random session tokens.

---

# 24. QR Admin Controls

Admin Dashboard → Voting Control

Show:

- QR Voting Enabled
- Generate New QR
- Display QR on Screen
- Download QR
- Rotate QR
- Close Voting

Live status:

```text
ACTIVE VOTING SESSION
Session #003

Status: OPEN

Votes: 42
Eligible Voters: 58
Participation: 72%

QR Token: ACTIVE

Expiration: 02:34
```

---

# 25. Live Voting Screen

When a participant scans the QR:

## VOICE OF ARCHITECT

### 🗳️ VOTING IS LIVE

"Choose the architecture team that impressed you."

Show presentation cards.

Each card:

- Team name
- Theme
- View Presentation
- Rate Team

If the participant belongs to TEAM-ALPHA:

```text
TEAM ALPHA

YOUR TEAM

VOTING DISABLED
```

The backend must still reject manipulated requests.

---

# 26. Voting Confirmation

After a successful vote:

> ✓ VOTE RECORDED  
> Thank you. Your architectural voice has been counted.

Do not expose the user's individual vote publicly.

---

# 27. Admin Voting Monitor

Show real-time:

```text
VOTING LIVE

Eligible Voters: 58
Votes Cast: 43
Participation: 74%

Self-Voting Attempts: 3
Duplicate Attempts: 5
Rejected Votes: 8
```

Do not expose voter identity on the public leaderboard.

---

# 28. Voting Audit Log

Create:

`vote_audit_log`

Fields:

- id
- event_id
- voting_session_id
- voter_id
- target_team_id
- action
- reason
- timestamp
- device/session metadata

Actions:

- VOTE_ACCEPTED
- VOTE_REJECTED
- SELF_VOTE_BLOCKED
- DUPLICATE_VOTE_BLOCKED
- SESSION_CLOSED
- INVALID_TOKEN
- UNAUTHORIZED

This allows the organizer to demonstrate that the competition was conducted fairly.

---

# 29. Automated Test Suite

Build automated tests for the voting engine.

Mandatory tests:

### TEST 01
Participant votes for another team → PASS

### TEST 02
Participant votes for own team → BLOCK

### TEST 03
Participant manipulates target_team_id → BLOCK

### TEST 04
Participant votes twice → BLOCK

### TEST 05
Participant scans QR twice → eligibility remains unchanged

### TEST 06
Participant uses another device → self-voting remains blocked

### TEST 07
Voting session closed → vote rejected

### TEST 08
Invalid QR token → vote rejected

### TEST 09
Unauthenticated registered-participant vote → rejected

### TEST 10
Audience voter votes for eligible team → accepted according to admin settings

### TEST 11
Team member attempts to vote for own team through direct API request → rejected

### TEST 12
Admin changes team membership before voting → latest database membership determines eligibility

All tests must pass.

---

# 30. Fair Scoring Engine

Calculate:

`Team Score = Weighted Architectural Thinking + Business Value + Innovation + Feasibility + Presentation`

Normalize scores so teams are compared fairly even when voter counts differ.

Show after reveal:

- Average score
- Number of votes
- Category scores
- Final score

Do not reveal final ranking until competition ends unless Admin enables it.

---

# 31. Live Leaderboard

Create:

## LIVE SCOREBOARD

Admin setting:

**SHOW LIVE SCORES: ON / OFF**

Default:

**OFF**

If OFF, show participation metrics but hide rankings.

---

# 32. Final Results

After final presentation and voting closes:

## VOICE OF ARCHITECT

### THE VERDICT

Display:

🥇 **#1 — WINNER**

🥈 **#2 — RUNNER-UP**

🥉 **#3 — SECOND RUNNER-UP**

Show:

- Team Name
- Theme
- Final Score
- Votes
- Category scores

Add tasteful celebration/confetti animation.

The final screen should feel like an award ceremony.

---

# 33. Winner Logic

Admin can configure:

**NUMBER OF WINNERS: 2 / 3 / 5**

Default:

**Top 3**

Ranking algorithm:

1. Highest weighted score
2. If tied → highest Architectural Thinking
3. If still tied → highest Business Value
4. If still tied → highest total audience votes
5. If still tied → shared ranking

Use positive terminology:

- Winner
- Runner-Up
- Second Runner-Up

Never use "loser".

---

# 34. Architect Scorecard

For every team generate a visual scorecard.

Example:

```text
TEAM ALPHA
Enterprise Operating Models

Architectural Thinking     4.7 / 5
Business Value             4.5 / 5
Innovation                 4.8 / 5
Feasibility                4.2 / 5
Presentation               4.6 / 5

FINAL ARCHITECT SCORE
4.56 / 5
```

This should become a reusable architecture-learning artifact for participants and the AEA community.

---

# 35. Admin Control Center

Create:

## Event Control

- Event name
- Date
- Location
- Status

## Themes

- Add
- Edit
- Delete
- Activate/deactivate
- Reorder

## Team Settings

- Maximum team size
- Minimum team size
- Allow self-created teams
- Allow team switching

## Timers

- Thinking duration
- Presentation duration
- Voting duration

## Voting

- Enable/disable voting
- Voting criteria
- Criteria weights
- Audience voting
- Team-member voting

**Self Voting: ALWAYS OFF / LOCKED**

This setting must not be editable.

## Results

- Number of winners
- Ranking visibility
- Tie-break rules

## Live Control

- Start event
- Start team formation
- Start thinking
- Pause timer
- Resume timer
- Start presentations
- Open voting
- Close voting
- Reveal winners
- Reset stage

---

# 36. Participant Dashboard

Title:

## MY VOICE OF ARCHITECT

Show:

- My Team
- My Theme
- Team Members
- Current Stage
- Countdown
- Presentation Status
- Voting Status

Navigation:

- HOME
- MY TEAM
- CHALLENGE
- PRESENTATIONS
- VOTE
- LEADERBOARD
- PROFILE

---

# 37. Audience Mode

Create a simple audience experience.

Show:

## NOW PRESENTING

- Team name
- Theme
- Presentation

After presentation:

## RATE THIS ARCHITECT

Provide voting form.

Audience must not access team workspace.

---

# 38. Facilitator Screen

Create a dedicated large-screen mode for projectors.

Show:

## VOICE OF ARCHITECT

Current Stage

Large Countdown

Current Team

Next Team

Participation statistics:

```text
Teams: 12
Participants: 58
Votes: 42
```

Use large typography.

Optimize for conference-room display.

---

# 39. Gamification

Add subtle badges:

- VISIONARY ARCHITECT
- INNOVATION ARCHITECT
- BUSINESS ARCHITECT
- DATA ARCHITECT
- ECOSYSTEM ARCHITECT
- PRESENTATION MASTER

Optional awards:

- Best Architecture
- Most Innovative
- Best Business Impact
- Best Presentation
- Audience Choice

Admin can enable/disable awards.

---

# 40. Notifications

Use contextual notifications:

- "Your team has been created."
- "Theme locked."
- "45 minutes remaining."
- "10 minutes remaining."
- "Your team is next."
- "Voting is now open."
- "Voting closes in 60 seconds."
- "Results are ready."

---

# 41. Security

Implement:

- Authenticated participants
- Role-based access control
- Server-side eligibility validation
- One vote per voter according to configured policy
- Mandatory no-self-voting
- Voting lock after deadline
- Admin-only result reveal
- Server-side score calculation
- Vote audit trail
- Duplicate submission protection
- Secure QR tokens

---

# 42. Real-Time Architecture

Recommended stack:

**Frontend**
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

**Backend**
- Supabase

Use:

- Supabase Authentication
- PostgreSQL
- Supabase Realtime
- Supabase Storage

Real-time objects:

- Event state
- Current stage
- Timer state
- Teams
- Team membership
- Theme selections
- Presentation status
- Voting state
- Votes
- Scores
- Leaderboard

All connected participants must see stage/timer updates without refreshing.

---

# 43. Database Model

Create tables:

- events
- users
- participants
- teams
- team_members
- themes
- event_stages
- presentations
- votes
- vote_scores
- leaderboards
- event_settings
- voting_sessions
- vote_audit_log
- notifications

Relationship:

**Event → Themes → Teams → Team Members → Presentation → Votes → Scores → Ranking**

---

# 44. Home Dashboard

Create:

```text
VOICE OF ARCHITECT

LIVE

--------------------------------

6 THEMES
12 TEAMS
58 ARCHITECTS
60:00

--------------------------------

CURRENT STAGE

ARCHITECT

[ COUNTDOWN ]

--------------------------------

YOUR TEAM

TEAM ALPHA

4 / 5 MEMBERS

Theme:
Enterprise Operating Models

--------------------------------

NEXT:

Presentation Arena
```

Use animated blue-green gradient progress indicators.

---

# 45. Micro-interactions

Use tasteful animations:

- Theme selection pulse
- Team joining animation
- Countdown transitions
- Progress animations
- Voting confirmation
- Presentation transitions
- Winner reveal
- Confetti for Top 3

Avoid excessive animation.

---

# 46. Empty States

Example:

## NO TEAM YET

"Great architecture starts with the right minds."

**CREATE TEAM**

Example:

## VOTING NOT OPEN

"Listen. Challenge. Then make your voice count."

---

# 47. Demo Mode

Create a complete **DEMO MODE** so organizers can simulate the event without real participants.

Seed:

- 6 themes
- 8 teams
- 40 participants
- Sample presentations
- Sample votes
- Sample scores
- Sample leaderboard

Allow the organizer to simulate:

1. Team formation
2. Theme selection
3. Thinking countdown
4. Presentation
5. QR voting
6. Vote validation
7. Vote closure
8. Automatic scoring
9. Winner reveal

Include a visible:

**DEMO MODE**

indicator.

---

# 48. QR Display Mode

Create a dedicated large-screen display:

```text
VOICE OF ARCHITECT

SCAN TO VOTE

        [ LARGE QR CODE ]

Use your phone to make your
voice count.

Votes:
42 / 58

Participation:
72%

Voting closes:
02:34
```

Use an animated blue-green gradient background.

QR must be large enough to scan from a conference-room screen.

---

# 49. Admin Configuration Defaults

Set initial defaults:

```text
Maximum Team Size: 5
Minimum Team Size: 2

Thinking Duration: 60 minutes
Presentation Duration: 5 minutes
Voting Duration: 5 minutes

QR Voting: ON
Registered Participant Voting: ON
Audience Voting: ON

Self Voting: ALWAYS OFF / LOCKED
Duplicate Voting: BLOCK

Reveal Scores: AFTER VOTING CLOSES
Reveal Rankings: AFTER ALL PRESENTATIONS

Number of Winners: 3
```

---

# 50. UX Principle

On every screen the participant should immediately know:

**WHERE AM I?**  
**WHAT DO I DO NOW?**  
**HOW MUCH TIME DO I HAVE?**  
**WHAT HAPPENS NEXT?**

Every screen should prominently show:

- Current Stage
- Next Action
- Time Remaining

---

# 51. Final Product Experience

The final application should feel like:

**Enterprise Architecture Workshop**  
+ **Hackathon**  
+ **Live Conference Experience**  
+ **Team Challenge**  
+ **Audience Voting**  
+ **Awards Ceremony**

Central philosophy:

> **Every architect has a voice. Every idea deserves a stage. The collective decides what rises.**

The platform must guarantee:

> **Everyone gets a voice.  
> No one votes for themselves.  
> Every vote is validated.  
> Every score is auditable.  
> The winner is determined transparently.**

The QR code makes participation effortless.

The backend makes the competition fair.

---

# 52. Lovable Build Instructions

Build this as a production-quality MVP.

Priorities:

1. Create the complete navigation and role-based experience.
2. Implement the six themes.
3. Implement team creation and configurable team size.
4. Implement synchronized event stages.
5. Implement synchronized configurable timers.
6. Implement team workspace.
7. Implement presentation arena.
8. Implement QR voting.
9. Implement server-side voting eligibility.
10. Implement the mandatory no-self-voting rule.
11. Implement duplicate vote prevention.
12. Implement vote audit logging.
13. Implement weighted scoring.
14. Implement automatic Top 3 calculation.
15. Implement winner reveal.
16. Implement Admin Control Center.
17. Implement Facilitator large-screen mode.
18. Implement Demo Mode.
19. Implement automated voting integrity tests.
20. Seed realistic demo data.

Do not build a superficial prototype.

The most important engineering requirement is that **voting integrity is enforced server-side and at database level**.

The most important UX requirement is that the application feels like a **live masterclass**, not a form-based conference application.

The most important visual requirement is a **modern blue-green gradient enterprise experience**.

---

# Acceptance Criteria

The MVP is accepted only when all of the following work:

- [ ] Participant can join event
- [ ] Participant can create team
- [ ] Participant can join team
- [ ] Maximum team size is configurable
- [ ] Team cannot exceed maximum size
- [ ] Participant can select one of six themes
- [ ] Admin can control event stages
- [ ] Timer is synchronized
- [ ] Timer duration is configurable
- [ ] Team can create architecture response
- [ ] Team can submit presentation
- [ ] Facilitator can run presentations
- [ ] Voting can be opened/closed
- [ ] QR code can be generated
- [ ] QR code opens mobile voting
- [ ] Participant can vote for another team
- [ ] Participant cannot vote for own team
- [ ] Self-voting is blocked server-side
- [ ] Direct API self-voting is blocked
- [ ] Self-voting remains blocked across devices
- [ ] Duplicate voting is blocked
- [ ] Closed voting rejects submissions
- [ ] Invalid QR tokens are rejected
- [ ] Votes are auditable
- [ ] Scores are calculated server-side
- [ ] Ranking is automatic
- [ ] Top 3 are automatically identified
- [ ] Tie-break logic works
- [ ] Winner reveal works
- [ ] Admin can configure winner count
- [ ] Demo Mode works
- [ ] Automated voting integrity tests pass

---

# Product Mantra

## VOICE OF ARCHITECT

### Think.
### Architect.
### Present.
### Influence.

**Your idea is your architecture.  
Your architecture is your voice.**
