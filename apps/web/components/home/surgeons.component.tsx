import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'
import { Button } from '@workspace/ui/components/button'
import Image from 'next/image'
import Link from 'next/link'
import { Award, BadgeCheck, ExternalLink, Stethoscope } from 'lucide-react'

import {
    KARLINSKY_ABS_CERTIFIED_ON,
    KARLINSKY_FLORIDA_LICENSE,
    KARLINSKY_NAME,
    karlinskyRecords,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

const ABS_YEAR = KARLINSKY_ABS_CERTIFIED_ON.slice(0, 4)

/**
 * Each verified credential with the public record a patient can check it
 * against (claims canon §2). The cosmetic boards are left out: naming them
 * needs the Florida statement beside them, which this compact list can't
 * carry. The fellowship line is held to the surgeon page (D9).
 */
const RECORDS = [
    {
        label: `Board certified in general surgery since ${ABS_YEAR}`,
        detail: 'American Board of Surgery',
        href: karlinskyRecords.americanBoardOfSurgery,
    },
    {
        label: 'Fellow of the American College of Surgeons (FACS)',
        detail: 'American College of Surgeons',
        href: karlinskyRecords.americanCollegeOfSurgeons,
    },
    {
        label: `Florida medical license ${KARLINSKY_FLORIDA_LICENSE}, clear and active`,
        detail: 'Florida Department of Health',
        href: karlinskyRecords.floridaLicense,
    },
] as const

/**
 * Credential stat type
 */
type CredentialStat = {
    readonly icon: React.ReactNode
    readonly value: string
    readonly label: string
}

/**
 * Staggered reveal for the credential stats. Spelled out rather than computed
 * so Tailwind's scanner can see each class.
 */
const STAT_DELAY = ['animate-delay-0', 'animate-delay-100', 'animate-delay-200']

export const Surgeons = () => {
    // Verified facts only (claims canon §4): no patient, procedure or
    // year counts.
    const credentialStats: CredentialStat[] = [
        {
            icon: <Award className='h-4 w-4' />,
            value: `Since ${ABS_YEAR}`,
            label: 'Board certified, American Board of Surgery',
        },
        {
            icon: <BadgeCheck className='h-4 w-4' />,
            value: 'FACS',
            label: 'Fellow, American College of Surgeons',
        },
        {
            icon: <Stethoscope className='h-4 w-4' />,
            value: 'One',
            label: 'Surgeon for every procedure',
        },
    ]

    return (
        <SectionContainer
            id='surgeons'
            variant='default'
            className='relative overflow-hidden bg-stone-900 text-white'
            paddingY='py-32'
        >
            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='flex flex-col items-center gap-16 lg:flex-row lg:items-stretch'>
                    {/* Image Stack */}
                    <div className='relative flex min-h-[400px] w-full justify-center lg:block lg:w-1/2'>
                        <div className='animate-fade-in-up relative aspect-[3/4] w-full max-w-md'>
                            <Image
                                src='/images/surgeons/dr-karlinsky.webp'
                                alt={`${KARLINSKY_NAME}, the surgeon at Alluring Plastic Surgery`}
                                fill
                                className='object-cover grayscale transition-all duration-700 ease-in-out hover:grayscale-0'
                                sizes='(max-width: 1024px) 100vw, 50vw'
                            />
                            {/* Floating Box */}
                            <div className='bg-gold-500/10 border-gold-500/30 absolute -right-8 -bottom-8 hidden h-48 w-48 border backdrop-blur-md md:block'></div>

                            {/* Credential Stats Overlay */}
                            <div className='absolute right-4 -bottom-4 left-4 flex gap-2 md:right-auto md:-bottom-12 md:left-0 md:gap-3'>
                                {credentialStats.map((stat, index) => (
                                    <div
                                        key={index}
                                        className={`animate-fade-in-up flex flex-1 flex-col items-center gap-1 border border-stone-700 bg-stone-900/95 p-3 backdrop-blur-sm md:p-4 ${STAT_DELAY[index] ?? ''}`}
                                    >
                                        <div className='text-gold-400'>
                                            {stat.icon}
                                        </div>
                                        <span className='text-lg font-bold text-white md:text-xl'>
                                            {stat.value}
                                        </span>
                                        <span className='text-center text-[10px] text-stone-400 uppercase md:text-xs'>
                                            {stat.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className='flex flex-col justify-center lg:w-1/2'>
                        <div className='mb-8'>
                            <span className='text-gold-500 mb-2 block text-sm font-bold tracking-widest uppercase'>
                                Your surgeon
                            </span>
                            <h2 className='mb-8 font-serif text-4xl leading-none md:text-6xl'>
                                Meet <br />
                                <span className='text-stone-500'>
                                    your surgeon.
                                </span>
                            </h2>
                        </div>

                        <div className='mb-8 space-y-8 border-l border-stone-800 pl-8'>
                            <p className='font-serif text-2xl leading-relaxed text-stone-300 italic'>
                                &quot;Cosmetic surgery is never just about a
                                single feature. It&apos;s about how you feel
                                when you walk into a room — and knowing we
                                prioritized your safety at every step.&quot;
                            </p>
                            <div className='flex flex-col gap-2'>
                                <span className='text-base font-bold tracking-wider text-white uppercase'>
                                    {KARLINSKY_NAME}
                                </span>
                                <span className='text-base text-stone-500'>
                                    {
                                        'Cosmetic surgeon · Board certified, American Board of Surgery'
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Board Certifications */}
                        <div className='mb-8 rounded-lg border border-stone-800 bg-stone-900/50 p-5'>
                            <h3 className='mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-white uppercase'>
                                <BadgeCheck className='text-gold-400 h-4 w-4' />
                                Verified Credentials
                            </h3>
                            <div className='space-y-3'>
                                {RECORDS.map((record) => (
                                    <a
                                        key={record.href}
                                        href={record.href}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='hover:border-gold-500/50 group flex items-center justify-between border-b border-stone-800 pb-3 transition-colors last:border-b-0'
                                    >
                                        <div>
                                            <span className='block text-sm font-medium text-white'>
                                                {record.label}
                                            </span>
                                            <span className='text-xs text-stone-500'>
                                                {record.detail}
                                            </span>
                                        </div>
                                        <ExternalLink className='text-gold-500 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100' />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className='flex flex-wrap gap-4'>
                            <Button variant='gold' size='md' asChild>
                                <Link href='/about'>Meet The Team</Link>
                            </Button>
                            <Button
                                variant='outline'
                                className='border-stone-700 text-white hover:border-white hover:text-white'
                                asChild
                            >
                                <Link href='/about#credentials'>
                                    Full Credentials
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
