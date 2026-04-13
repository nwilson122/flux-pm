"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/charts/stat-card"
import { AreaChart } from "@/components/charts/area-chart"
import { DonutChart } from "@/components/charts/donut-chart"
import { DataTable } from "@/components/data/data-table"
import { ActivityFeed } from "@/components/data/activity-feed"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, RefreshCw, Calendar } from "lucide-react"
import {
  generateSprintBurndown,
  generateIssues,
  generateProjectActivity,
  ISSUES_BY_PRIORITY,
} from "@/lib/mock-data"
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils"
import type { StatCard as StatCardType, Issue, Priority } from "@/types"
import { cn } from "@/lib/utils"

// ─── KPI Data ────────────────────────────────────────────────────────────────

const KPI_STATS: StatCardType[] = [
  {
    id: "active-projects",
    title: "Active Projects",
    value: "12",
    rawValue: 12,
    change: 20.0,
    changeLabel: "from last quarter",
    icon: "FolderOpen",
    trend: "up",
    sparkline: [8, 9, 9, 10, 11, 10, 11, 12, 13, 12, 11, 12],
  },
  {
    id: "open-issues",
    title: "Open Issues",
    value: "284",
    rawValue: 284,
    change: -8.5,
    changeLabel: "42 critical",
    icon: "AlertCircle",
    trend: "down",
    sparkline: [320, 315, 305, 298, 292, 301, 295, 289, 287, 285, 286, 284],
  },
  {
    id: "sprint-velocity",
    title: "Sprint Velocity",
    value: "38 pts",
    rawValue: 38,
    change: 11.8,
    changeLabel: "+4 from last sprint",
    icon: "TrendingUp",
    trend: "up",
    sparkline: [28, 30, 32, 34, 36, 35, 34, 36, 38, 37, 36, 38],
  },
  {
    id: "team-utilization",
    title: "Team Utilisation",
    value: "82%",
    rawValue: 82,
    change: 5.2,
    changeLabel: "optimal range",
    icon: "Users",
    trend: "up",
    sparkline: [75, 78, 80, 79, 81, 83, 84, 82, 80, 81, 83, 82],
  },
]

// ─── Issue table columns ──────────────────────────────────────────────────────

const STATUS_STYLES: Record<Issue["status"], { label: string; className: string }> = {
  "Open": { label: "Open", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  "In Progress": { label: "In Progress", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  "Review": { label: "Review", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  "Done": { label: "Done", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
}

const PRIORITY_STYLES: Record<Priority, { label: string; className: string }> = {
  "P0": { label: "P0", className: "bg-red-500/10 text-red-500 border-red-500/20" },
  "P1": { label: "P1", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  "P2": { label: "P2", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  "P3": { label: "P3", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  "P4": { label: "P4", className: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
}

const issueColumns: ColumnDef<Issue>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-muted-foreground">{String(getValue())}</span>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ getValue, row }) => (
      <div className="max-w-[200px]">
        <div className="font-medium text-foreground text-xs truncate">{String(getValue())}</div>
        <div className="text-[11px] text-muted-foreground">{row.original.project}</div>
      </div>
    ),
  },
  {
    accessorKey: "assignee",
    header: "Assignee",
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">{String(getValue())}</span>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ getValue }) => {
      const priority = getValue() as Priority
      const cfg = PRIORITY_STYLES[priority]
      return (
        <Badge variant="outline" className={cn("text-[10px] font-medium h-5 px-1.5 border", cfg.className)}>
          {cfg.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as Issue["status"]
      const cfg = STATUS_STYLES[status]
      return (
        <Badge variant="outline" className={cn("text-[10px] font-medium h-5 px-1.5 border", cfg.className)}>
          {cfg.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "created",
    header: "Created",
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground tabular-nums">
        {formatDate(String(getValue()))}
      </span>
    ),
  },
]

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const sprintData = useMemo(() => generateSprintBurndown(), [])
  const issues = useMemo(() => generateIssues(50), [])
  const activityFeed = useMemo(() => generateProjectActivity(10), [])
  const totalIssues = ISSUES_BY_PRIORITY.reduce((s, d) => s + d.value, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flux Dashboard"
        description="Ship Faster. Track your projects, issues, and team performance."
      >
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Calendar className="size-3.5" />
          Last 30 days
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Download className="size-3.5" />
          Export
        </Button>
        <Button size="sm" className="h-8 gap-1.5 text-xs">
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </PageHeader>

      {/* ── Row 1: KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_STATS.map((stat, i) => (
          <StatCard key={stat.id} stat={stat} animationDelay={i * 80} />
        ))}
      </div>

      {/* ── Row 2: Area Chart + Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sprint Burndown Chart */}
        <Card className="lg:col-span-2 border-border/60 animate-fade-in-up delay-300">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-semibold">Sprint Burndown</CardTitle>
                <CardDescription className="text-xs mt-0.5">Ideal vs actual progress over the current 14-day sprint</CardDescription>
              </div>
              <Tabs defaultValue="burndown" className="shrink-0">
                <TabsList className="h-7 p-0.5">
                  <TabsTrigger value="burndown" className="text-[11px] h-6 px-2.5">Burndown</TabsTrigger>
                  <TabsTrigger value="velocity" className="text-[11px] h-6 px-2.5">Velocity</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4 pr-2">
            <AreaChart
              data={sprintData}
              xKey="date"
              series={[
                { key: "ideal", name: "Ideal" },
                { key: "actual", name: "Actual" },
              ]}
              height={260}
              formatY={(v) => `${v} pts`}
              formatTooltip={(v) => `${v} story points`}
            />
          </CardContent>
        </Card>

        {/* Issues by Priority Donut */}
        <Card className="border-border/60 animate-fade-in-up delay-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Issues by Priority</CardTitle>
            <CardDescription className="text-xs">
              {totalIssues} total issues across all projects
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <DonutChart
              data={ISSUES_BY_PRIORITY}
              height={200}
              innerRadius={65}
              outerRadius={90}
              formatValue={(v) => `${v} issues`}
              centerValue={`${totalIssues}`}
              centerLabel="Total Issues"
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Transactions + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issues Table */}
        <Card className="lg:col-span-2 border-border/60 animate-fade-in-up delay-400">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Recent Issues</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Showing the latest {issues.length} issues across all projects
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <DataTable
              columns={issueColumns}
              data={issues}
              searchKey="title"
              searchPlaceholder="Search issues..."
            />
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border-border/60 animate-fade-in-up delay-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Project Activity</CardTitle>
              <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                Live
              </span>
            </div>
            <CardDescription className="text-xs">Recent project and development events</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ActivityFeed items={activityFeed} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
