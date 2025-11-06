# Planning Guide

A World Cup-themed gamification platform that transforms leadership performance evaluation into an engaging championship experience, where managers compete through management tasks, team feedback, and peer recognition.

**Experience Qualities**: 
1. **Playful yet Professional** - Balances competitive sports excitement with serious performance metrics
2. **Visually Rich** - Trading card aesthetics with shiny effects, stadium imagery, and trophy presentations
3. **Immediately Rewarding** - Every action triggers visual feedback like confetti, goal celebrations, and score updates

**Complexity Level**: Complex Application (advanced functionality, accounts)
  - Requires user authentication, role-based access (leaders vs admin), real-time scoring system, CRUD operations for multiple entities, and sophisticated data visualization across multiple interconnected views.

## Essential Features

### 1. Authentication & Role Management
- **Functionality**: Login system with role-based routing (Leader vs Admin)
- **Purpose**: Separate experiences and permissions for different user types
- **Trigger**: User enters email/password on login screen
- **Progression**: Credentials validated → Role detected → Route to appropriate dashboard
- **Success criteria**: Leaders see their personal dashboard, Admins see management console

### 2. Leader Dashboard ("Vestiário")
- **Functionality**: Personal command center showing weekly tasks, ritual attendance, ranking position, and icebreaker challenges
- **Purpose**: Give leaders clear visibility of their performance and next actions
- **Trigger**: Leader logs in or navigates to home
- **Progression**: Dashboard loads → Widgets populate with personalized data → Leader can check off tasks → Confetti animation on completion → Points update
- **Success criteria**: All metrics visible, task completion triggers score recalculation and visual celebration

### 3. Interactive Ranking Table ("O Estádio")
- **Functionality**: Public leaderboard showing all leaders with photos, current position, overall score, weekly change indicators
- **Purpose**: Create healthy competition and visibility
- **Trigger**: User clicks "Ranking" navigation
- **Progression**: Table loads sorted by score → Shows position changes with arrows → Can search/filter → Click leader for profile modal
- **Success criteria**: Real-time accurate scoring, smooth animations for position changes

### 4. Trading Card Album ("Seleção de Líderes")
- **Functionality**: Grid of World Cup-style trading cards for each leader with overall score and team
- **Purpose**: Visual engagement and gamified profile browsing
- **Trigger**: User navigates to album view
- **Progression**: Grid displays cards → Hover shows lift effect → Click opens detailed profile modal → Can evaluate peer from modal
- **Success criteria**: Cards feel collectible with shiny chrome effects, smooth interactions

### 5. Leader Profile Modal (Detailed Card)
- **Functionality**: Expanded view showing leader's photo, attributes radar chart, strengths/weaknesses, trophy collection
- **Purpose**: Provide complete performance picture and enable peer evaluation
- **Trigger**: Click on trading card or name in ranking
- **Progression**: Modal opens with animation → Shows stats and radar chart → "Evaluate" button visible → Opens evaluation form
- **Success criteria**: All data displays correctly, radar chart accurately represents attributes

### 6. Peer Evaluation System ("Assistências")
- **Functionality**: Form where leaders give kudos to peers with tags and descriptions
- **Purpose**: Encourage cross-team recognition and collaboration
- **Trigger**: Click "Evaluate this Leader" button
- **Progression**: Modal opens → Fill description and select quality tags → Submit → Confirmation animation → Target leader gains "Assist" points
- **Success criteria**: Evaluations save, points update, activity appears in feed

### 7. Trophy Gallery & Badges
- **Functionality**: Visual display of earned trophies (Golden Boot, Golden Ball, Fair Play) and special badges (Hat-Trick, Invincible, #10)
- **Purpose**: Gamify achievements and provide status symbols
- **Trigger**: Earned automatically based on performance thresholds, displayed in profile
- **Progression**: Leader meets criteria → Trophy/badge unlocked → Appears in profile with animation
- **Success criteria**: Trophies accurately awarded based on rules, visible in profiles

### 8. Team Evaluation Input ("Nota da Torcida")
- **Functionality**: Simple pulse survey where team members anonymously rate their leader
- **Purpose**: Give teams a voice and leaders actionable feedback
- **Trigger**: Monthly or biweekly automated reminder to team members
- **Progression**: Team member opens survey → Answers 2-3 yes/no questions → Optional text feedback → Submit anonymously → Leader's "fan score" updates
- **Success criteria**: Anonymity preserved, scores calculated as percentage, impacts overall ranking

### 9. Admin Dashboard - Manage Leaders
- **Functionality**: CRUD interface for leader profiles including photos, teams, attributes
- **Purpose**: Allow admins to manage the system and adjust scores/profiles
- **Trigger**: Admin navigates to "Manage Leaders"
- **Progression**: Table displays all leaders → Click edit → Modal opens with form → Update fields → Save → Data refreshes
- **Success criteria**: All leader data editable, changes reflect immediately

### 10. Admin Dashboard - Manage Tasks
- **Functionality**: Create and manage weekly management tasks (1-on-1s, OKRs, PDIs) with point values
- **Purpose**: Define what actions earn points ("Gols de Placa")
- **Trigger**: Admin navigates to "Manage Tasks"
- **Progression**: View active tasks → Click create → Fill form with title/description/points → Publish → Tasks appear in leader dashboards
- **Success criteria**: Tasks assigned, completion tracked, points awarded correctly

### 11. Admin Dashboard - Register Rituals
- **Functionality**: Matrix grid where admin checks attendance for meetings (Dailies, Weeklies, RMR)
- **Purpose**: Track leader participation in key ceremonies and award points
- **Trigger**: Admin marks attendance after meetings occur
- **Progression**: Matrix loads → Admin checks boxes for present leaders → System calculates attendance percentage → Updates ritual scores
- **Success criteria**: Attendance percentages accurate, reflected in leader dashboards

### 12. Live Activity Feed ("Feed da Torcida")
- **Functionality**: Real-time ticker showing recent kudos, achievements, and milestones
- **Purpose**: Create buzz and social proof around participation
- **Trigger**: Continuously visible on ranking page
- **Progression**: New activity occurs → Appears in feed with animation → Scrolls through recent items
- **Success criteria**: Updates without page refresh, shows last 10-20 activities

## Edge Case Handling

- **No Tasks Assigned**: Show empty state with encouraging message "Stay tuned for this week's challenges!"
- **Zero Team Feedback**: Display "Awaiting first team evaluation" instead of 0/10 score
- **Tied Scores**: Use secondary tiebreaker (team feedback score, then assist points)
- **Image Upload Failures**: Fall back to initials avatar with team color
- **Leader Leaving Company**: Admin can archive leaders (hidden from rankings but data preserved)
- **Negative Feedback Overload**: System balances negative feedback visibility (anonymous aggregate only, not exposed publicly)
- **First-Time User**: Onboarding tooltip tour explaining the World Cup metaphor

## Design Direction

The design should feel like opening a premium World Cup trading card album - exciting, collectible, and championship-worthy, with a balance between playful soccer stadium energy and professional business metrics. The interface should be rich with visual rewards (trophies, badges, shiny effects) but maintain clean information hierarchy so performance data remains clear and actionable.

## Color Selection

Triadic (three equally spaced colors) - Using World Cup championship colors that evoke victory, prestige, and athletic excellence while maintaining professional credibility.

- **Primary Color**: Championship Green (oklch(0.52 0.15 155)) - The soccer field grass color representing growth and active participation, used for primary actions and success states
- **Secondary Colors**: 
  - Royal Blue (oklch(0.45 0.15 250)) - Premium detailing for cards and borders, suggesting elite competition
  - Graphite (oklch(0.25 0 0)) - Professional grounding for text and structure
- **Accent Color**: Trophy Gold (oklch(0.85 0.15 85)) - Shimmering highlight for achievements, CTAs, and top rankings, demanding attention for milestones
- **Foreground/Background Pairings**:
  - Background (White oklch(1 0 0)): Graphite text (oklch(0.25 0 0)) - Ratio 13.1:1 ✓
  - Card (Light Gray oklch(0.97 0 0)): Graphite text (oklch(0.25 0 0)) - Ratio 12.3:1 ✓
  - Primary (Championship Green oklch(0.52 0.15 155)): White text (oklch(1 0 0)) - Ratio 5.2:1 ✓
  - Secondary (Royal Blue oklch(0.45 0.15 250)): White text (oklch(1 0 0)) - Ratio 6.8:1 ✓
  - Accent (Trophy Gold oklch(0.85 0.15 85)): Graphite text (oklch(0.25 0 0)) - Ratio 4.9:1 ✓
  - Muted (Light Gray oklch(0.94 0 0)): Medium Gray text (oklch(0.50 0 0)) - Ratio 5.1:1 ✓

## Font Selection

Typography should feel modern and athletic like a premium sports broadcast, with strong headers that command attention like team jerseys and clean body text for performance metrics legibility.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Montserrat Bold/32px/tight (-0.02em) - Bold championship presence
  - H2 (Section Headers): Montserrat SemiBold/24px/normal - Clear division markers
  - H3 (Widget Titles): Montserrat Medium/18px/normal - Subtle hierarchy
  - Body (Metrics/Content): Inter Regular/16px/relaxed (1.5) - Maximum readability
  - Small (Labels/Captions): Inter Regular/14px/normal - Supportive information
  - Scores (Large Numbers): Montserrat Bold/48px/tight - Hero display

## Animations

Animations should celebrate achievements like goal replays on sports broadcasts - quick bursts of excitement that reward actions without delaying workflow, with confetti for completions and smooth card flips that feel premium and collectible.

- **Purposeful Meaning**: Motion reinforces the championship competition theme - cards "lift" like precious collectibles, scores "tick up" like stadium scoreboards, trophies "gleam" when unlocked
- **Hierarchy of Movement**: 
  - High priority: Task completion confetti, trophy unlocks, rank position changes
  - Medium priority: Card hover effects, modal entrances, button presses
  - Low priority: Subtle background parallax, gentle icon pulses

## Component Selection

- **Components**: 
  - Card (for trading cards and dashboard widgets, with custom chrome borders)
  - Badge (for trophy/achievement display)
  - Button (Primary for CTAs, Secondary for navigation)
  - Table (for ranking leaderboard with custom styling)
  - Dialog (for leader profiles and evaluation forms)
  - Checkbox (for task completion and ritual attendance)
  - Progress (circular for ritual attendance percentages)
  - Avatar (for leader photos with fallback initials)
  - Input, Textarea, Select (for admin forms)
  - Tabs (for admin dashboard sections)
  - Separator (for visual section division)
  - Radar chart from recharts (for leader attribute visualization)
  
- **Customizations**: 
  - Custom TradingCard component with shiny gradient border effects
  - Custom Trophy/Badge component with gleam animation
  - Custom Confetti celebration component using framer-motion
  - Custom ScrollingFeed component for live activity ticker
  - Custom RitualMatrix component for admin attendance tracking
  
- **States**: 
  - Buttons: Default with subtle shadow, Hover with lift and brighter color, Active with press-down, Disabled with 50% opacity
  - Cards: Default flat, Hover with translateY(-8px) and enhanced shadow, Active state for selected
  - Checkboxes: Unchecked outline, Checked with green fill and checkmark animation, Disabled grayed
  
- **Icon Selection**: 
  - Trophy (phosphor) for achievements
  - Medal (phosphor) for badges
  - Soccer (phosphor) for tasks/goals
  - ChartLine (phosphor) for ranking
  - Users (phosphor) for teams
  - Star (phosphor) for ratings
  - ArrowUp/ArrowDown (phosphor) for rank changes
  - CheckCircle (phosphor) for completed tasks
  
- **Spacing**: 
  - Card padding: p-6
  - Section gaps: gap-8 (vertical), gap-6 (horizontal)
  - Component spacing: space-y-4 for stacked elements
  - Grid gaps: gap-6 for card grids
  
- **Mobile**: 
  - Trading card grid: 2 columns on mobile, 3 on tablet, 4+ on desktop
  - Dashboard widgets: Stack vertically on mobile, 2x2 grid on tablet, flexible on desktop
  - Ranking table: Horizontal scroll on mobile with sticky first column
  - Navigation: Bottom tab bar on mobile, sidebar on desktop
  - Modals: Full screen on mobile, centered dialog on desktop
