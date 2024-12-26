import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { School } from "@/types/dashboard"
import { MapPin } from 'lucide-react'

interface SchoolListProps {
  schools: School[]
}

export function SchoolList({ schools }: SchoolListProps) {
  return (
    <div className="space-y-4">
      {schools.map((school) => (
        <Card key={school.id}>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{school.name}</h3>
                  <Badge variant="secondary">{school.id}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{school.address}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Principal</p>
                  <p className="font-medium">{school.principal.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Teachers</p>
                  <p className="font-medium">{school.teacherCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="font-medium">{school.studentCount}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

