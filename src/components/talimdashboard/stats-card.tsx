import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number
  increase: number
  period?: string
}

export function StatsCard({ title, value, increase, period = "vs last month" }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{value}</span>
            <div className="flex items-center gap-1 text-sm text-emerald-600">
              <ArrowUp className="h-4 w-4" />
              <span>{increase}%</span>
              <span className="text-muted-foreground">{period}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

