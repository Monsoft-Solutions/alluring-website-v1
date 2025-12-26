type SectionProps = {
    icon: React.ComponentType<{ className?: string }>
    title: string
    children: React.ReactNode
}

export function Section({ icon: Icon, title, children }: SectionProps) {
    return (
        <div>
            <h3 className='mb-2 flex items-center gap-2 text-sm font-medium'>
                <Icon className='h-4 w-4 text-stone-500' />
                {title}
            </h3>
            <div className='pl-6'>{children}</div>
        </div>
    )
}
