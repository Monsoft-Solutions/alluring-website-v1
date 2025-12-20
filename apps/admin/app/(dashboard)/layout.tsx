import { Header } from '@/components/layout/header.component'
import { Sidebar } from '@/components/layout/sidebar.component'
import { QueryProvider } from '@/components/providers/query-provider.component'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <QueryProvider>
            <div className='flex h-screen overflow-hidden'>
                <Sidebar />
                <div className='flex flex-1 flex-col overflow-hidden'>
                    <Header />
                    <main className='flex-1 overflow-y-auto bg-stone-50 p-4 pt-16 lg:p-6 lg:pt-6'>
                        {children}
                    </main>
                </div>
            </div>
        </QueryProvider>
    )
}
