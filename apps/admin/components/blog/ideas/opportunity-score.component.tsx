type OpportunityScoreProps = {
    score: number
}

export function OpportunityScore({ score }: OpportunityScoreProps) {
    const color =
        score >= 80
            ? 'bg-green-500'
            : score >= 60
              ? 'bg-amber-500'
              : 'bg-red-500'

    return (
        <div className='flex items-center gap-1'>
            <div className='relative h-6 w-6'>
                <svg className='h-full w-full -rotate-90' viewBox='0 0 36 36'>
                    <circle
                        cx='18'
                        cy='18'
                        r='14'
                        fill='none'
                        strokeWidth='4'
                        className='stroke-stone-200'
                    />
                    <circle
                        cx='18'
                        cy='18'
                        r='14'
                        fill='none'
                        strokeWidth='4'
                        strokeDasharray={`${score} 100`}
                        className={`${color.replace('bg-', 'stroke-')}`}
                        strokeLinecap='round'
                    />
                </svg>
            </div>
            <span className='text-xs font-semibold'>{score}</span>
        </div>
    )
}
