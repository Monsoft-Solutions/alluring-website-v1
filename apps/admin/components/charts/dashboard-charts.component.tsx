'use client'

import {
    Bar,
    BarChart,
    Cell,
    CartesianGrid,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend,
} from 'recharts'

import type { ProcedureDemand } from '@/lib/types/procedure-demand.type'
import type { LeadGradeDistribution } from '@/lib/types/lead-grade-distribution.type'

const COLORS = {
    primary: '#78716c',
    accent: '#d4a574',
    background: '#e7e5e4',
}

// ============================================================================
// Procedure Demand Chart
// ============================================================================

type ProcedureDemandChartProps = {
    data: ProcedureDemand[]
}

export function ProcedureDemandChart({ data }: ProcedureDemandChartProps) {
    const formattedData = data.map((item) => ({
        ...item,
        displayLabel:
            item.procedure.length > 20
                ? item.procedure.slice(0, 20) + '...'
                : item.procedure,
    }))

    return (
        <ResponsiveContainer width='100%' height={300}>
            <BarChart
                data={formattedData}
                layout='vertical'
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
                <CartesianGrid
                    strokeDasharray='3 3'
                    horizontal={true}
                    vertical={false}
                    stroke='#e7e5e4'
                />
                <XAxis
                    type='number'
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    type='category'
                    dataKey='displayLabel'
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                />
                <Tooltip
                    content={({ active, payload }) => {
                        if (!active || !payload?.length || !payload[0])
                            return null
                        const item = payload[0] as { payload: ProcedureDemand }
                        const data = item.payload
                        return (
                            <div className='rounded-lg border bg-white px-3 py-2 shadow-sm'>
                                <p className='font-medium'>{data.procedure}</p>
                                <p className='text-sm'>
                                    {data.count.toLocaleString()} requests
                                </p>
                            </div>
                        )
                    }}
                />
                <Bar
                    dataKey='count'
                    fill={COLORS.primary}
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                >
                    {formattedData.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? COLORS.accent : COLORS.primary}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

// ============================================================================
// Lead Grade Chart
// ============================================================================

type LeadGradeChartProps = {
    data: LeadGradeDistribution[]
}

export function LeadGradeChart({ data }: LeadGradeChartProps) {
    return (
        <ResponsiveContainer width='100%' height={250}>
            <PieChart>
                <Pie
                    data={data}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey='count'
                    nameKey='grade'
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    content={({ active, payload }) => {
                        if (!active || !payload?.length || !payload[0])
                            return null
                        const item = payload[0] as {
                            payload: LeadGradeDistribution
                        }
                        const data = item.payload
                        return (
                            <div className='rounded-lg border bg-white px-3 py-2 shadow-sm'>
                                <p className='font-medium'>
                                    Grade {data.grade}
                                </p>
                                <p className='text-sm'>
                                    {data.count.toLocaleString()} leads
                                </p>
                            </div>
                        )
                    }}
                />
                <Legend
                    verticalAlign='bottom'
                    height={36}
                    formatter={(value) => (
                        <span className='text-xs font-medium'>
                            Grade {value}
                        </span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}
