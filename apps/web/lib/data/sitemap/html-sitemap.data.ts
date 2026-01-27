/**
 * HTML Sitemap Static Routes Configuration
 *
 * Organizes all hardcoded routes by category for the HTML sitemap page.
 * Dynamic content (procedures, surgeons, blog, gallery) is fetched at render time.
 */

export type SitemapCategory = {
    title: string
    links: Array<{ label: string; href: string }>
}

export const staticSitemapCategories: SitemapCategory[] = [
    {
        title: 'Main Pages',
        links: [
            { label: 'Home', href: '/' },
            { label: 'About Us', href: '/about' },
            { label: 'Contact Us', href: '/contact-us' },
            { label: 'FAQ', href: '/faqs' },
            { label: 'Reviews', href: '/reviews' },
            { label: 'Gallery', href: '/gallery' },
            { label: 'Instagram', href: '/instagram' },
        ],
    },
    {
        title: 'Consultations',
        links: [
            { label: 'Free Consultation', href: '/free-consultation' },
            { label: 'Miami Patients', href: '/free-consultation/miami' },
            { label: 'Out-of-Town Patients', href: '/fly-in-consultation' },
            { label: 'Mommy Makeover', href: '/mommy-makeover-consultation' },
            {
                label: 'After Weight Loss',
                href: '/after-weight-loss-consultation',
            },
            { label: 'BBL Miami', href: '/bbl-miami' },
            { label: 'Bridal', href: '/bridal-consultation' },
            { label: 'New Beginning', href: '/new-beginning-consultation' },
            {
                label: "Men's Plastic Surgery",
                href: '/mens-plastic-surgery-miami',
            },
            { label: 'Consulta Gratis', href: '/consulta-gratis' },
        ],
    },
    {
        title: 'Resources',
        links: [
            { label: 'Financing', href: '/plastic-surgery-financing-miami' },
            { label: 'Specials', href: '/miami-plastic-surgery-specials' },
            { label: 'BMI Calculator', href: '/bmi-calculator' },
            { label: 'Blog', href: '/blog' },
            { label: 'Blog Categories', href: '/blog/categories' },
            { label: 'Blog Tags', href: '/blog/tags' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Cookie Policy', href: '/cookies' },
        ],
    },
]
