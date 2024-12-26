import { Activity } from "../announcement component/profile"

interface ActivityTimelineProps {
  activities: Activity[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Recent activity</h2>
      <div className="relative border-l-2 border-muted pl-4 ml-2 space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="relative">
            <div className="absolute -left-[1.65rem] h-4 w-4 rounded-full bg-primary" />
            <div className="space-y-1">
              <div className="font-medium">{activity.date}</div>
              <div className="text-sm text-muted-foreground">{activity.location}</div>
              {activity.time && (
                <div className="text-sm text-muted-foreground">{activity.time}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

