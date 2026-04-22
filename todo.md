# Westmont Distance - Project TODO

## Phase 1: Database Schema
- [x] Custom athletes table (id, name, username, passwordHash, role, sport_mode)
- [x] Workout library table (id, title, description, type, event_details, venue)
- [x] Calendar events table (id, athleteId/null=team, workoutId, date, type: workout/race/notice, title, notes)
- [x] Mileage table (id, athleteId, week_start, planned_miles, actual_miles)
- [x] Pace chart table (id, athleteId, pace_type, pace_value)
- [x] S&C circuits table (id, title, description, exercises JSON)
- [x] S&C assignments table (id, circuitId, athleteId/null=team, date)

## Phase 2: Backend API
- [x] Custom login procedure (username + password, returns JWT-like session)
- [x] Athlete CRUD procedures (admin only)
- [x] Workout library CRUD procedures (admin only)
- [x] Calendar event CRUD procedures (admin: assign; athlete: read)
- [x] Mileage CRUD procedures (admin: set planned; athlete: log actual)
- [x] Pace chart CRUD procedures (admin: set per athlete; athlete: read)
- [x] S&C circuit CRUD procedures (admin: create/assign; athlete: read)
- [x] Seed default workout library on first run

## Phase 3: Login Page
- [x] Custom login page (not Manus OAuth) with username/password fields
- [x] Westmont Distance branding header on login page
- [x] Role-based redirect: athlete → dashboard, admin → admin panel
- [x] Session persistence with JWT cookie

## Phase 4: Athlete Dashboard
- [x] Current date display prominently at top
- [x] Track / Cross Country mode toggle (updates theme + content)
- [x] Today's prescribed workout card
- [x] Weekly calendar view (7 days, shows workout title/summary per day)
- [x] Calendar toggle: show/hide races and notices
- [x] Mileage graph (Recharts line/bar, past actual + upcoming planned)
- [x] Personal pace chart section (assigned training paces)
- [x] Strength & conditioning section (today's prescribed circuit)
- [x] Westmont Distance header on dashboard

## Phase 5: Admin Control Panel
- [x] Athlete management: add new athlete (name, username, password)
- [x] Athlete management: remove athlete
- [x] Workout library: view all workouts
- [x] Workout library: add new workout
- [x] Workout library: remove workout
- [x] Workout assignment: prescribe workout to individual athlete or whole team on a date
- [x] Calendar management: add races and notices to calendar
- [x] Mileage input: set planned mileage per week per athlete
- [x] Pace chart editor: set/update pace values per athlete
- [x] S&C management: create circuits, assign to athletes/team for specific dates
- [x] Pre-loaded default workout library (7 workouts)

## Phase 6: Design & Branding
- [x] Dark red, black, maroon color palette (CSS variables)
- [x] Bold athletic typography (Google Fonts - Bebas Neue + Inter)
- [x] "Westmont Distance" header on all pages
- [x] Track mode vs XC mode visual theme difference (red → green)
- [x] Fully responsive / mobile-friendly layout
- [x] Sidebar navigation for admin panel
- [x] Clean card-based layout for athlete dashboard

## Phase 7: Testing & Seed Data
- [x] Seed 7 default workouts in library
- [x] Seed admin account (username: admin, password: westmont2024)
- [x] Write vitest tests for auth and key procedures (8 tests passing)
- [x] End-to-end flow verification (login, admin panel, athlete dashboard, mode toggle)
- [x] Cookie auth fix (parse from header when req.cookies unavailable)

## Phase 8: Bug Fixes
- [x] Fix DATE column comparison bug (use sql template strings instead of new Date() for MySQL DATE columns)
- [x] Fix athlete hard-delete (prevent unique constraint on re-creation)
- [x] Fix LoginPage setState-during-render warning (wrap navigate in useEffect)
- [x] Add resetPassword procedure to athletes router
- [x] All 8 tests passing after fixes
