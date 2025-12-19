/**
 * Chat Admin Dashboard Page
 *
 * Main chat management page with configuration, analytics overview,
 * and quick actions.
 *
 * @module app/(dashboard)/chat/page
 */
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs'
import {
    MessageCircle,
    Settings,
    BarChart3,
    Users,
    MessagesSquare,
    Zap,
    ExternalLink,
    MessageSquarePlus,
    AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'

import { getChatConfig, getChatAnalytics } from '@/lib/queries/chat.query'
import { ChatConfigForm } from '@/components/chat/chat-config-form.component'
import { formatRelativeTime } from '@workspace/chat/utils'
import type { ChatModel, ButtonPosition } from '@workspace/chat/types'

export const dynamic = 'force-dynamic'

export default async function ChatAdminPage() {
    const [config, analytics] = await Promise.all([
        getChatConfig(),
        getChatAnalytics(),
    ])

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>Chat Agent</h1>
                    <p className='text-muted-foreground'>
                        Configure and monitor your AI chat assistant
                    </p>
                </div>
                <div className='flex items-center gap-3'>
                    <Badge variant={config.isEnabled ? 'default' : 'secondary'}>
                        {config.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Button asChild variant='outline' size='sm'>
                        <Link href='/chat/quick-replies'>
                            <MessageSquarePlus className='mr-2 h-4 w-4' />
                            Quick Replies
                        </Link>
                    </Button>
                    <Button asChild variant='outline' size='sm'>
                        <Link href='/chat/escalations'>
                            <AlertTriangle className='mr-2 h-4 w-4' />
                            Escalations
                        </Link>
                    </Button>
                    <Button asChild variant='outline' size='sm'>
                        <Link href='/chat/test'>
                            <Zap className='mr-2 h-4 w-4' />
                            Test Chat
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className='grid gap-4 md:grid-cols-4'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Conversations
                        </CardTitle>
                        <MessagesSquare className='text-muted-foreground h-4 w-4' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {analytics.totalSessions}
                        </div>
                        <p className='text-muted-foreground text-xs'>
                            All time chat sessions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Messages
                        </CardTitle>
                        <MessageCircle className='text-muted-foreground h-4 w-4' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {analytics.totalMessages}
                        </div>
                        <p className='text-muted-foreground text-xs'>
                            Messages exchanged
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Active Sessions
                        </CardTitle>
                        <Users className='text-muted-foreground h-4 w-4' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {analytics.activeSessions}
                        </div>
                        <p className='text-muted-foreground text-xs'>
                            Currently active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Avg Messages/Session
                        </CardTitle>
                        <BarChart3 className='text-muted-foreground h-4 w-4' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {analytics.avgMessagesPerSession}
                        </div>
                        <p className='text-muted-foreground text-xs'>
                            Messages per conversation
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for Config and Recent Activity */}
            <Tabs defaultValue='config' className='space-y-4'>
                <TabsList>
                    <TabsTrigger value='config' className='gap-2'>
                        <Settings className='h-4 w-4' />
                        Configuration
                    </TabsTrigger>
                    <TabsTrigger value='recent' className='gap-2'>
                        <MessagesSquare className='h-4 w-4' />
                        Recent Conversations
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='config'>
                    <ChatConfigForm
                        initialData={{
                            agentName: config.agentName,
                            systemPrompt: config.systemPrompt,
                            welcomeMessage: config.welcomeMessage,
                            modelId: config.modelId as ChatModel,
                            temperature: config.temperature,
                            maxTokens: config.maxTokens,
                            isEnabled: config.isEnabled,
                            buttonPosition:
                                config.buttonPosition as ButtonPosition,
                            primaryColor: config.primaryColor,
                            agentImageUrl: config.agentImageUrl,
                        }}
                    />
                </TabsContent>

                <TabsContent value='recent'>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between'>
                            <CardTitle>Recent Conversations</CardTitle>
                            <Button asChild variant='outline' size='sm'>
                                <Link href='/chat/conversations'>
                                    View All
                                    <ExternalLink className='ml-2 h-4 w-4' />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {analytics.recentSessions.length === 0 ? (
                                <p className='text-muted-foreground py-8 text-center'>
                                    No conversations yet
                                </p>
                            ) : (
                                <div className='space-y-4'>
                                    {analytics.recentSessions.map((session) => (
                                        <Link
                                            key={session.id}
                                            href={`/chat/conversations/${session.id}`}
                                            className='flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-stone-50'
                                        >
                                            <div>
                                                <p className='font-medium'>
                                                    {session.fullName}
                                                </p>
                                                <p className='text-muted-foreground text-sm'>
                                                    {session.phone}
                                                </p>
                                            </div>
                                            <div className='text-right'>
                                                <Badge
                                                    variant={
                                                        session.status ===
                                                        'active'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {session.status}
                                                </Badge>
                                                <p className='text-muted-foreground mt-1 text-xs'>
                                                    {formatRelativeTime(
                                                        session.createdAt
                                                    )}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
