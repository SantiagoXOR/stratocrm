import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Bienvenido al CRM. Esta es una página de ejemplo.
      </p>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Componentes shadcn/ui</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input placeholder="Input de prueba" readOnly />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
          </div>
          <Button>Botón de prueba</Button>
        </CardContent>
      </Card>
    </div>
  )
}

