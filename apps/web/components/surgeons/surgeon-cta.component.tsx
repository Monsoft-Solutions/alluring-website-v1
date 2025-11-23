'use client'

import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'
import { Button } from '../home/button.component'
import { getPhoneLink } from '@/lib/data/site-config'

export const SurgeonCTA = () => {
    return (
        <SectionContainer className='relative overflow-hidden bg-white py-24 lg:py-32'>
            <div className='absolute inset-0 opacity-5'>
                <div className='absolute inset-0' />
            </div>

            <ContentWrapper size='md' className='relative z-10 text-center'>
                <h2 className='mb-6 font-serif text-4xl text-stone-900 md:text-5xl lg:text-6xl'>
                    Ready to Begin Your <br />
                    <span className='text-gold-500 italic'>
                        Transformation?
                    </span>
                </h2>
                <p className='mx-auto mb-10 max-w-2xl text-lg text-stone-600'>
                    Schedule a consultation today to discuss your goals and
                    create a personalized treatment plan tailored to your unique
                    needs.
                </p>

                <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                    <Button variant='primary' size='lg' withArrow>
                        Schedule Consultation
                    </Button>
                    <a href={getPhoneLink()}>
                        <Button variant='outline' size='lg'>
                            Call (786) 305-8649
                        </Button>
                    </a>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
