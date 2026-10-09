import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'

type StatCardProps = {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
}

const StatCard = ({ label, value, change, trend }: StatCardProps) => {
  return (
    <Card>
        <CardContent>
            <p className='text-sm text-muted-foreground'>{label}</p>
            <p className='text-3xl font-medium text-foreground'>{value}</p>
            <Badge className={cn(trend === 'up' ? 'mt-3 bg-success/10 text-success' : 'mt-3 bg-destructive/10 text-destructive')}>
                {change}
            </Badge>
        </CardContent>
    </Card>
  )
}

export default StatCard