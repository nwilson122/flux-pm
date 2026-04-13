import { subDays, subMonths, format, subHours, subMinutes } from "date-fns"
import type {
  Transaction,
  User,
  ActivityItem,
  DailyAnalytics,
  PageAnalytics,
  TrafficSource,
  DonutSegment,
  Project,
  Issue,
  TeamMember,
  SprintData,
  ProjectActivity,
  Priority,
  IssueStatus,
} from "@/types"

// ─── Seeded random for reproducibility ────────────────────────────────────────

function seededRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRng(42)
const rand = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min
const randFloat = (min: number, max: number) => Number((rng() * (max - min) + min).toFixed(2))
const pick = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)]

// ─── Revenue time series (12 months) ──────────────────────────────────────────

export function generateRevenueData() {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  const baseRevenue = [28000, 32000, 27500, 35000, 41000, 38500, 44000, 47500, 43000, 52000, 58000, 63000]
  const baseExpenses = [18000, 21000, 19500, 22000, 26000, 24000, 27500, 29000, 26000, 31000, 34000, 37000]
  return months.map((month, i) => ({
    date: month,
    revenue: baseRevenue[i] + rand(-1500, 1500),
    expenses: baseExpenses[i] + rand(-800, 800),
    profit: baseRevenue[i] - baseExpenses[i] + rand(-500, 500),
  }))
}

// ─── Daily analytics (30 days) ────────────────────────────────────────────────

export function generateDailyAnalytics(): DailyAnalytics[] {
  return Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i)
    const base = 3200 + i * 180
    return {
      date: format(date, "MMM d"),
      pageViews: base + rand(-400, 600),
      uniqueVisitors: Math.floor((base + rand(-400, 600)) * 0.68),
      sessions: Math.floor((base + rand(-400, 600)) * 0.82),
      bounceRate: randFloat(32, 58),
    }
  })
}

// ─── Donut chart — revenue by category ───────────────────────────────────────

export const REVENUE_BY_CATEGORY: DonutSegment[] = [
  { name: "SaaS Subscriptions", value: 54230, color: "#3b82f6" },
  { name: "Professional Services", value: 23870, color: "#10b981" },
  { name: "Marketplace", value: 14560, color: "#f59e0b" },
  { name: "Add-ons & Upgrades", value: 8940, color: "#8b5cf6" },
  { name: "Other", value: 3420, color: "#06b6d4" },
]

// ─── Transactions ─────────────────────────────────────────────────────────────

const CUSTOMERS = [
  { name: "Acme Corporation", email: "billing@acme.io" },
  { name: "Globex Systems", email: "finance@globex.com" },
  { name: "Initech LLC", email: "accounts@initech.co" },
  { name: "Umbrella Corp", email: "payments@umbrella.dev" },
  { name: "Weyland-Yutani", email: "ar@weyland.tech" },
  { name: "Oscorp Industries", email: "billing@oscorp.io" },
  { name: "Stark Enterprises", email: "ap@stark.com" },
  { name: "Wayne Enterprises", email: "finance@wayne.co" },
  { name: "Cyberdyne Systems", email: "billing@cyberdyne.ai" },
  { name: "Tyrell Corporation", email: "accounts@tyrell.io" },
  { name: "Soylent Corp", email: "billing@soylent.dev" },
  { name: "Nakatomi Trading", email: "finance@nakatomi.jp" },
  { name: "Rekall Industries", email: "ar@rekall.io" },
  { name: "Vandelay Industries", email: "billing@vandelay.com" },
  { name: "Dunder Mifflin", email: "accounts@dundermifflin.co" },
]

const DESCRIPTIONS = [
  "Enterprise Annual License",
  "Professional Seat × 12",
  "Infrastructure Top-up",
  "API Overage Charges",
  "Custom Integration Package",
  "Support Tier Upgrade",
  "White-label License",
  "Onboarding & Setup",
  "Analytics Pro Module",
  "Security Compliance Add-on",
  "SSO Configuration",
  "Data Export Tokens",
  "Priority Support Bundle",
  "Team Workspace (50 seats)",
  "Marketplace Commission",
]

const CATEGORIES: Transaction["category"][] = [
  "software", "software", "infrastructure", "marketing",
  "design", "consulting", "other",
]
const STATUSES: Transaction["status"][] = [
  "completed", "completed", "completed", "pending", "failed", "refunded",
]
const METHODS: Transaction["method"][] = ["card", "wire", "ach", "card", "card"]

export function generateTransactions(count = 50): Transaction[] {
  return Array.from({ length: count }, (_, i) => {
    const customer = pick(CUSTOMERS)
    const daysAgo = rand(0, 60)
    return {
      id: `TXN-${String(10000 + i).padStart(6, "0")}`,
      date: format(subDays(new Date(), daysAgo), "yyyy-MM-dd"),
      description: pick(DESCRIPTIONS),
      amount: randFloat(299, 24999),
      status: pick(STATUSES),
      category: pick(CATEGORIES),
      customer: customer.name,
      customerEmail: customer.email,
      method: pick(METHODS),
    }
  })
}

// ─── Users ────────────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Alex", "Morgan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Blake",
  "Avery", "Cameron", "Sage", "Devon", "Kendall", "Skyler", "Peyton",
  "Harper", "Finley", "Rowan", "Phoenix", "River",
]
const LAST_NAMES = [
  "Chen", "Park", "Williams", "Johnson", "Martinez", "Thompson", "Garcia",
  "Anderson", "Wilson", "Moore", "Taylor", "Jackson", "White", "Harris",
  "Clark", "Lewis", "Robinson", "Walker", "Hall", "Allen",
]
const DOMAINS = ["acme.io", "globex.com", "initech.co", "stark.com", "wayne.co"]
const ROLES: User["role"][] = ["admin", "editor", "viewer", "billing"]
const STATUSES_USER: User["status"][] = ["active", "active", "active", "inactive", "pending"]
const PLANS: User["plan"][] = ["starter", "pro", "pro", "enterprise"]

export function generateUsers(count = 30): User[] {
  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST_NAMES)
    const last = pick(LAST_NAMES)
    const domain = pick(DOMAINS)
    return {
      id: `USR-${String(1000 + i).padStart(5, "0")}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
      role: pick(ROLES),
      status: pick(STATUSES_USER),
      joinedAt: format(subMonths(new Date(), rand(1, 24)), "yyyy-MM-dd"),
      lastSeen: format(subHours(new Date(), rand(0, 168)), "yyyy-MM-dd'T'HH:mm:ss"),
      plan: pick(PLANS),
      revenue: randFloat(500, 48000),
    }
  })
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

export function generateActivityFeed(count = 12): ActivityItem[] {
  const events: Array<{
    type: ActivityItem["type"]
    title: string
    desc: string
  }> = [
    { type: "user_signup", title: "New user registered", desc: "alex.chen@acme.io joined Pro plan" },
    { type: "purchase", title: "New purchase", desc: "Globex Systems upgraded to Enterprise — $12,400/yr" },
    { type: "plan_upgrade", title: "Plan upgraded", desc: "Initech LLC moved from Starter → Pro" },
    { type: "refund", title: "Refund processed", desc: "$2,399 refunded to Oscorp Industries" },
    { type: "deploy", title: "Deployment succeeded", desc: "v4.2.1 deployed to production — 0 errors" },
    { type: "alert", title: "Anomaly detected", desc: "Unusual login from IP 185.220.x.x — blocked" },
    { type: "purchase", title: "New purchase", desc: "Weyland-Yutani signed Enterprise — $48,000/yr" },
    { type: "export", title: "Data exported", desc: "Full transaction export by billing@wayne.co" },
    { type: "user_signup", title: "New user registered", desc: "morgan.taylor@cyberdyne.ai joined Starter" },
    { type: "plan_upgrade", title: "Plan upgraded", desc: "Nakatomi Trading upgraded to Enterprise" },
    { type: "comment", title: "Support ticket resolved", desc: "Ticket #8842 closed — API latency issue" },
    { type: "plan_downgrade", title: "Plan downgraded", desc: "Rekall Industries moved to Starter plan" },
  ]

  return events.slice(0, count).map((e, i) => ({
    id: `ACT-${i + 1}`,
    type: e.type,
    title: e.title,
    description: e.desc,
    timestamp: format(subMinutes(new Date(), i * 18 + rand(2, 15)), "yyyy-MM-dd'T'HH:mm:ss"),
    user: {
      name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    },
  }))
}

// ─── Page analytics ──────────────────────────────────────────────────────────

export const PAGE_ANALYTICS: PageAnalytics[] = [
  { path: "/dashboard", title: "Dashboard Overview", views: 24830, uniqueVisitors: 18420, avgDuration: 287, bounceRate: 22.4, change: 12.3 },
  { path: "/analytics", title: "Analytics", views: 18640, uniqueVisitors: 14290, avgDuration: 342, bounceRate: 18.7, change: 28.1 },
  { path: "/settings", title: "Settings", views: 12310, uniqueVisitors: 9840, avgDuration: 198, bounceRate: 31.2, change: -4.3 },
  { path: "/users", title: "User Management", views: 9870, uniqueVisitors: 7620, avgDuration: 412, bounceRate: 15.8, change: 18.9 },
  { path: "/billing", title: "Billing & Plans", views: 7430, uniqueVisitors: 5890, avgDuration: 264, bounceRate: 27.3, change: 6.4 },
  { path: "/reports", title: "Reports", views: 5820, uniqueVisitors: 4710, avgDuration: 518, bounceRate: 11.2, change: 41.7 },
  { path: "/integrations", title: "Integrations", views: 4290, uniqueVisitors: 3480, avgDuration: 334, bounceRate: 24.6, change: 15.2 },
  { path: "/api-keys", title: "API Keys", views: 3140, uniqueVisitors: 2820, avgDuration: 156, bounceRate: 38.9, change: -9.1 },
]

// ─── Traffic sources ──────────────────────────────────────────────────────────

export const TRAFFIC_SOURCES: TrafficSource[] = [
  { source: "Organic Search", visitors: 38420, percentage: 42.3, change: 18.4 },
  { source: "Direct", visitors: 21840, percentage: 24.1, change: 7.2 },
  { source: "Referral", visitors: 14290, percentage: 15.7, change: 32.8 },
  { source: "Social Media", visitors: 9870, percentage: 10.9, change: -3.4 },
  { source: "Email Campaign", visitors: 4680, percentage: 5.2, change: 22.1 },
  { source: "Paid Search", visitors: 1760, percentage: 1.9, change: -11.7 },
]

// ─── Top pages by views (bar chart) ──────────────────────────────────────────

export function generateTopPagesBarData() {
  return PAGE_ANALYTICS.slice(0, 6).map((p) => ({
    page: p.title.replace(" Overview", "").replace(" Management", ""),
    views: p.views,
    visitors: p.uniqueVisitors,
  }))
}

// ═══ PROJECT MANAGEMENT DATA ═════════════════════════════════════════════════

// ─── Projects ─────────────────────────────────────────────────────────────────

const PROJECT_NAMES = [
  { name: "Platform v3.0", desc: "Core platform redesign with microservices architecture" },
  { name: "Mobile App Redesign", desc: "Complete UI/UX overhaul of iOS and Android apps" },
  { name: "API Gateway Migration", desc: "Migrate from legacy API to new GraphQL gateway" },
  { name: "Customer Dashboard", desc: "Self-service customer portal with analytics" },
  { name: "Payment System Upgrade", desc: "PCI compliance and payment processing improvements" },
  { name: "DevOps Infrastructure", desc: "Container orchestration and CI/CD pipeline" },
  { name: "Data Warehouse v2", desc: "Real-time analytics and reporting infrastructure" },
  { name: "Security Audit 2026", desc: "Full-featured security review and remediation" },
  { name: "Multi-tenant Architecture", desc: "Support for white-label customer deployments" },
  { name: "Machine Learning Pipeline", desc: "Automated insights and predictive analytics" },
  { name: "Notification Service", desc: "Real-time push notifications and email system" },
  { name: "Admin Portal Refresh", desc: "Internal tools modernization and workflow optimization" },
]

export function generateProjects(): Project[] {
  return PROJECT_NAMES.slice(0, 12).map((proj, i) => ({
    id: `PROJ-${String(1000 + i).padStart(4, "0")}`,
    name: proj.name,
    description: proj.desc,
    status: pick(["Planning", "Active", "Active", "Active", "On Hold", "Completed"] as const),
    progress: rand(15, 95),
    startDate: format(subDays(new Date(), rand(30, 200)), "yyyy-MM-dd"),
    endDate: rng() > 0.7 ? format(subDays(new Date(), -rand(10, 60)), "yyyy-MM-dd") : undefined,
    lead: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    team: Array.from({ length: rand(3, 8) }, () => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`),
    issueCount: rand(15, 85),
  }))
}

// ─── Team Members ─────────────────────────────────────────────────────────────

const DEVELOPER_ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer",
  "Mobile Developer", "QA Engineer", "Product Manager", "UI/UX Designer",
  "Technical Lead", "Software Architect", "Data Engineer", "Security Engineer"
]

const TECH_SKILLS = [
  "React", "TypeScript", "Node.js", "Python", "Go", "Kubernetes", "Docker",
  "AWS", "GraphQL", "PostgreSQL", "Redis", "MongoDB", "Figma", "Jest"
]

export function generateTeamMembers(): TeamMember[] {
  return Array.from({ length: 18 }, (_, i) => {
    const first = pick(FIRST_NAMES)
    const last = pick(LAST_NAMES)
    const capacity = pick([80, 90, 100, 100, 100]) // Most people at full capacity
    const currentLoad = Math.min(capacity, rand(60, 110))

    return {
      id: `TEAM-${String(1000 + i).padStart(4, "0")}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@company.com`,
      role: pick(DEVELOPER_ROLES),
      capacity,
      currentLoad,
      skills: Array.from({ length: rand(3, 6) }, () => pick(TECH_SKILLS)).filter((skill, idx, arr) => arr.indexOf(skill) === idx),
      projects: PROJECT_NAMES.slice(0, rand(2, 4)).map(p => p.name),
    }
  })
}

// ─── Issues ───────────────────────────────────────────────────────────────────

const ISSUE_TITLES = [
  "Fix authentication timeout on mobile devices",
  "Implement real-time collaboration features",
  "Optimize database query performance",
  "Add dark mode support to dashboard",
  "Resolve CORS issues in API endpoints",
  "Update dependencies to latest versions",
  "Implement automated backup system",
  "Fix memory leak in background processes",
  "Add internationalization support",
  "Improve error handling in payment flow",
  "Implement role-based access control",
  "Fix responsive design issues on tablet",
  "Add full-featured audit logging",
  "Optimize image loading and caching",
  "Implement advanced search functionality",
  "Fix race condition in concurrent updates",
  "Add support for SSO integration",
  "Implement data export functionality",
  "Fix timezone handling in scheduling",
  "Add full-featured unit test coverage",
  "Implement email notification system",
  "Fix security vulnerabilities in auth",
  "Add real-time status indicators",
  "Implement webhook integration system",
  "Fix performance issues in large datasets",
  "Add custom dashboard widgets",
  "Implement advanced filtering options",
  "Fix bug in user permission inheritance",
  "Add support for file attachments",
  "Implement advanced reporting features"
]

const PRIORITIES: Priority[] = ["P0", "P1", "P2", "P3", "P4"]
const ISSUE_STATUSES: IssueStatus[] = ["Open", "In Progress", "Review", "Done"]

export function generateIssues(count = 284): Issue[] {
  const projects = generateProjects()
  const teamMembers = generateTeamMembers()

  return Array.from({ length: count }, (_, i) => {
    const project = pick(projects)
    const assignee = pick(teamMembers)
    const createdDaysAgo = rand(1, 90)

    // P0 issues are mostly critical, P4 issues are mostly low priority
    let priority: Priority
    const priorityRoll = rng()
    if (priorityRoll < 0.15) priority = "P0" // 15% critical
    else if (priorityRoll < 0.35) priority = "P1" // 20% high
    else if (priorityRoll < 0.65) priority = "P2" // 30% medium
    else if (priorityRoll < 0.85) priority = "P3" // 20% low
    else priority = "P4" // 15% backlog

    // Higher priority issues more likely to be completed
    let status: IssueStatus
    if (priority === "P0") {
      status = pick(["Done", "Review", "In Progress", "Open"])
    } else if (priority === "P1") {
      status = pick(["Done", "Review", "In Progress", "In Progress", "Open"])
    } else {
      status = pick(ISSUE_STATUSES)
    }

    return {
      id: `ISS-${String(10000 + i).padStart(5, "0")}`,
      title: pick(ISSUE_TITLES),
      project: project.name,
      projectId: project.id,
      assignee: assignee.name,
      priority,
      status,
      created: format(subDays(new Date(), createdDaysAgo), "yyyy-MM-dd'T'HH:mm:ss"),
      updated: format(subDays(new Date(), rand(0, createdDaysAgo)), "yyyy-MM-dd'T'HH:mm:ss"),
      estimatedHours: rand(1, 16),
      labels: Array.from({ length: rand(0, 3) }, () => pick(["bug", "feature", "enhancement", "urgent", "tech-debt", "documentation"])),
    }
  })
}

// ─── Sprint Burndown Data ─────────────────────────────────────────────────────

export function generateSprintBurndown(): SprintData[] {
  const sprintLength = 14 // 2 week sprint
  const totalPoints = 38 + rand(-5, 5) // Sprint velocity around 38 points

  return Array.from({ length: sprintLength + 1 }, (_, day) => {
    const date = subDays(new Date(), sprintLength - day)
    const ideal = Math.max(0, totalPoints * (1 - day / sprintLength))

    // Actual burndown with some realistic variance
    let actual: number
    if (day === 0) {
      actual = totalPoints
    } else if (day === sprintLength) {
      actual = Math.max(0, rand(0, 3)) // Usually close to 0 at end
    } else {
      // Some realistic burndown with weekend slowdowns and mid-sprint acceleration
      const weekendSlowdown = [6, 7, 13, 14].includes(day) ? 0.3 : 1
      const midSprintAcceleration = day > 6 && day < 12 ? 1.2 : 1
      const baseReduction = totalPoints / sprintLength * weekendSlowdown * midSprintAcceleration
      const variance = randFloat(-2, 2)
      const previousActual = day === 1 ? totalPoints : totalPoints * (1 - (day - 1) / sprintLength * 1.1)
      actual = Math.max(0, previousActual - baseReduction + variance)
    }

    return {
      day,
      date: format(date, "MMM d"),
      ideal: Math.round(ideal),
      actual: Math.round(actual),
    }
  })
}

// ─── Issues by Priority Donut Chart ──────────────────────────────────────────

export const ISSUES_BY_PRIORITY: DonutSegment[] = [
  { name: "Critical (P0)", value: 42, color: "#dc2626" },    // Red - Critical
  { name: "High (P1)", value: 58, color: "#ea580c" },       // Orange - High
  { name: "Medium (P2)", value: 89, color: "#d97706" },     // Amber - Medium
  { name: "Low (P3)", value: 62, color: "#059669" },        // Green - Low
  { name: "Backlog (P4)", value: 33, color: "#6b7280" },    // Gray - Backlog
]

// ─── Project Activity Feed ────────────────────────────────────────────────────

export function generateProjectActivity(count = 12): ProjectActivity[] {
  const projects = generateProjects()
  const teamMembers = generateTeamMembers()

  const events: Array<{
    type: ProjectActivity["type"]
    title: string
    desc: string
  }> = [
    { type: "issue_created", title: "New issue created", desc: "Critical authentication bug reported in Platform v3.0" },
    { type: "pr_merged", title: "Pull request merged", desc: "feat: Add dark mode toggle to dashboard (#847)" },
    { type: "deploy", title: "Deployment successful", desc: "Mobile App v2.1.3 deployed to production - 0 errors" },
    { type: "issue_closed", title: "Issue resolved", desc: "Fixed memory leak in background sync process" },
    { type: "comment", title: "Issue commented", desc: "Updated API Gateway migration timeline" },
    { type: "sprint_started", title: "Sprint started", desc: "Sprint 23 kicked off - 38 story points planned" },
    { type: "issue_created", title: "New feature request", desc: "Implement advanced filtering in Customer Dashboard" },
    { type: "pr_merged", title: "Pull request merged", desc: "fix: Resolve CORS issues in payment endpoints (#852)" },
    { type: "deploy", title: "Deployment successful", desc: "API Gateway v1.2.0 deployed to staging environment" },
    { type: "issue_closed", title: "Bug fixed", desc: "Resolved responsive design issues on tablet devices" },
    { type: "sprint_completed", title: "Sprint completed", desc: "Sprint 22 completed - 36/38 points delivered" },
    { type: "comment", title: "Code review", desc: "Approved security improvements in authentication flow" },
  ]

  return events.slice(0, count).map((e, i) => ({
    id: `PROJ-ACT-${i + 1}`,
    type: e.type,
    title: e.title,
    description: e.desc,
    project: pick(projects).name,
    timestamp: format(subMinutes(new Date(), i * 25 + rand(5, 20)), "yyyy-MM-dd'T'HH:mm:ss"),
    user: {
      name: pick(teamMembers).name,
    },
  }))
}
