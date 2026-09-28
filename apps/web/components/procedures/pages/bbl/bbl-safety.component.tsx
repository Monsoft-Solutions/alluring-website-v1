import {
    ModuleSceneSection,
    type ModuleSceneEvidence,
    type ModuleSceneItem,
} from '@/components/procedures/module-kit/module-scene.component'

const law: ModuleSceneItem[] = [
    {
        title: 'Fat under the skin only',
        body: 'Fat goes only into the layer under the skin and never crosses the fascia, the tissue that covers the gluteal muscle.',
    },
    {
        title: 'Ultrasound guidance',
        body: 'The surgeon uses ultrasound while moving the cannula, to see where the fat is going.',
    },
    {
        title: 'One surgeon, one patient',
        body: 'Your surgeon stays with you for the whole procedure and is not operating on anyone else at the same time.',
    },
    {
        title: 'An exam before surgery day',
        body: 'The surgeon examines you in person no later than the day before surgery.',
    },
    {
        title: 'The surgeon does the transfer',
        body: 'The surgeon removes and injects the fat personally. That work cannot be handed to anyone else.',
    },
]

const evidence: ModuleSceneEvidence[] = [
    {
        title: 'Why the law exists',
        body: 'South Florida recorded 25 deaths from BBL fat embolism between 2010 and 2022. 92% of those patients had surgery at high-volume, budget clinics, and in every case examined at autopsy, fat had been injected into the muscle (Pazmiño and Garcia, Aesthetic Surgery Journal, 2023).',
        sourceId: 'pazmino-garcia-2023',
    },
    {
        title: 'How often complications happen',
        body: 'A 2026 meta-analysis of 38 studies and 22,151 patients found minor complications in 3.58% of BBL patients, most often a seroma (a pocket of fluid) in 2.03%. Major complications were less common with ultrasound guidance: 0.02% versus 0.08% (Elsaftawy and colleagues, Plastic and Reconstructive Surgery, 2026).',
        sourceId: 'elsaftawy-meta-analysis-2026',
    },
]

const checklist = [
    'Where exactly will you place the fat, and how do you confirm it stays under the skin?',
    'Do you watch the cannula on ultrasound while you inject?',
    'Will you remove and inject the fat yourself, and stay with me for the whole surgery?',
    'Are you operating on anyone else while I am in surgery?',
    "Which board certifies you? Then check that certification on the board's own website, not the clinic's.",
    'Who gives the anesthesia, and where does the surgery take place?',
]

/**
 * Where Florida law lets fat go, as the layers of the buttock. Real text, not
 * a picture of text, so it is read, translated and quoted like the rest of
 * the page. The cannula is drawn in as the diagram scrolls into view.
 */
function BblStrata() {
    return (
        <figure aria-label='Where Florida law allows fat to go: the layers of the buttock'>
            <div className='flex flex-col border border-stone-700'>
                <div className='flex h-14 items-center bg-[#2B2724] px-5'>
                    <p className='text-base font-bold text-stone-100'>Skin</p>
                </div>
                <div className='bg-gold-400/15 flex min-h-[10.5rem] flex-col justify-between gap-6 p-5 lg:min-h-[11.875rem]'>
                    <div>
                        <p className='text-gold-100 font-serif text-2xl leading-[1.2]'>
                            Fat under the skin
                        </p>
                        <p className='mt-1.5 text-[0.9375rem] leading-[1.45] text-stone-200'>
                            The only layer Florida law allows fat to go
                        </p>
                    </div>
                    <div className='flex items-center'>
                        <span
                            aria-hidden='true'
                            className='pm-draw-x bg-gold-400 relative block h-0.5 w-[40%] after:absolute after:top-1/2 after:-right-1 after:size-2 after:-translate-y-1/2 after:rounded-full after:bg-inherit lg:w-[56%]'
                        />
                        <p className='ml-4 text-[0.8125rem] leading-[1.4] text-stone-300'>
                            Cannula, watched on ultrasound
                        </p>
                    </div>
                </div>
                <div aria-hidden='true' className='bg-gold-500 h-1' />
                <div className='flex items-baseline justify-between gap-3 bg-stone-900 px-5 py-3'>
                    <p className='text-gold-100 text-base font-bold'>
                        Gluteal fascia
                    </p>
                    <p className='text-gold-400 text-[0.9375rem]'>
                        Never crossed
                    </p>
                </div>
                <div className='min-h-[7.5rem] bg-[repeating-linear-gradient(135deg,#191614_0px,#191614_10px,#221E1B_10px,#221E1B_20px)] p-5 lg:min-h-[9.375rem]'>
                    <p className='text-base font-bold text-stone-400'>
                        Gluteal muscle
                    </p>
                    <p className='mt-1 text-[0.9375rem] text-stone-400'>
                        Fat never goes here
                    </p>
                </div>
            </div>
            <figcaption className='mt-3.5 text-sm leading-[1.45] text-stone-400'>
                Layers not to scale. Florida Statutes §458.328.
            </figcaption>
        </figure>
    )
}

/**
 * "Is a BBL safe in Miami?" The page's one dark band, laid out by the kit's
 * `ModuleSceneSection`, which opens from an inset card to full width as it
 * arrives. The layer diagram sits between the answer and the law on phones,
 * and stays pinned beside the reading column from `lg`.
 *
 * It ends where a reader has just been told to question every surgeon, so
 * the band's last word is an invitation to question ours.
 */
export function BblSafety() {
    return (
        <ModuleSceneSection
            question='Is a BBL safe in Miami?'
            answer={
                <>
                    A BBL&apos;s most serious risk is a fat embolism: fat
                    injected into or below the gluteal muscle can enter a blood
                    vessel, which can be fatal. The risk is lowest when the fat
                    stays under the skin, and Florida law now requires exactly
                    that, along with ultrasound guidance and one surgeon for one
                    patient.
                </>
            }
            diagram={<BblStrata />}
            law={{
                heading: 'What Florida law requires',
                sources: [
                    {
                        label: 'Florida Statutes §458.328',
                        sourceId: 'florida-statutes-458-328',
                    },
                ],
                items: law,
            }}
            evidence={{ items: evidence }}
            checklist={{
                heading: 'Questions to ask any BBL surgeon, including us',
                questions: checklist,
            }}
        />
    )
}
