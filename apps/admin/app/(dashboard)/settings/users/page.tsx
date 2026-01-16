'use client'

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import {
    Ban,
    CheckCircle,
    Clock,
    MoreHorizontal,
    Shield,
    ShieldOff,
    UserCheck,
    Users,
} from 'lucide-react'
import { useCallback, useEffect, useState, useTransition } from 'react'

import { InviteUserDialog } from '@/components/settings/invite-user-dialog.component'
import { admin, useSession, organization } from '@/lib/auth-client'

type UserItem = {
    id: string
    name: string
    email: string
    role: string
    banned: boolean
    banReason: string | null
    createdAt: Date
}

type InvitationItem = {
    id: string
    email: string
    role: string
    status: string
    expiresAt: Date
    createdAt: Date
}

export default function UsersSettingsPage() {
    const { data: session } = useSession()
    const [users, setUsers] = useState<UserItem[]>([])
    const [invitations, setInvitations] = useState<InvitationItem[]>([])
    const [organizationId, setOrganizationId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()

    const isAdmin = session?.user?.role === 'admin'

    const fetchUsers = useCallback(async () => {
        try {
            const { data } = await admin.listUsers({
                query: {},
            })
            if (data?.users) {
                setUsers(
                    data.users.map((u) => ({
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        role: u.role || 'viewer',
                        banned: u.banned || false,
                        banReason: u.banReason || null,
                        createdAt: new Date(u.createdAt),
                    }))
                )
            }
        } catch (error) {
            console.error('Failed to fetch users:', error)
        }
    }, [])

    const fetchInvitations = useCallback(async () => {
        if (!organizationId) return

        try {
            const { data } = await organization.getFullOrganization({
                query: {
                    organizationId,
                },
            })
            if (data?.invitations) {
                setInvitations(
                    data.invitations
                        .filter((inv) => inv.status === 'pending')
                        .map((inv) => ({
                            id: inv.id,
                            email: inv.email,
                            role: inv.role,
                            status: inv.status,
                            expiresAt: new Date(inv.expiresAt),
                            createdAt: new Date(inv.createdAt || Date.now()),
                        }))
                )
            }
        } catch (error) {
            console.error('Failed to fetch invitations:', error)
        }
    }, [organizationId])

    const fetchOrganization = useCallback(async () => {
        try {
            const { data } = await organization.list({})
            if (data && data.length > 0 && data[0]) {
                setOrganizationId(data[0].id)
            }
        } catch (error) {
            console.error('Failed to fetch organization:', error)
        }
    }, [])

    useEffect(() => {
        async function loadData() {
            setIsLoading(true)
            await Promise.all([fetchUsers(), fetchOrganization()])
            setIsLoading(false)
        }
        loadData()
    }, [fetchUsers, fetchOrganization])

    useEffect(() => {
        if (organizationId) {
            fetchInvitations()
        }
    }, [organizationId, fetchInvitations])

    const handleBanUser = (userId: string) => {
        startTransition(async () => {
            try {
                await admin.banUser({
                    userId,
                    banReason: 'Banned by administrator',
                })
                await fetchUsers()
            } catch (error) {
                console.error('Failed to ban user:', error)
            }
        })
    }

    const handleUnbanUser = (userId: string) => {
        startTransition(async () => {
            try {
                await admin.unbanUser({ userId })
                await fetchUsers()
            } catch (error) {
                console.error('Failed to unban user:', error)
            }
        })
    }

    const handleChangeRole = (userId: string, newRole: 'admin' | 'viewer') => {
        startTransition(async () => {
            try {
                // Better-Auth admin plugin uses 'admin' and 'user' roles
                // We map 'viewer' to 'user' for the API call
                const apiRole = newRole === 'viewer' ? 'user' : 'admin'
                await admin.setRole({
                    userId,
                    role: apiRole,
                })
                await fetchUsers()
            } catch (error) {
                console.error('Failed to change role:', error)
            }
        })
    }

    const handleCancelInvitation = (invitationId: string) => {
        if (!organizationId) return

        startTransition(async () => {
            try {
                await organization.cancelInvitation({
                    invitationId,
                })
                await fetchInvitations()
            } catch (error) {
                console.error('Failed to cancel invitation:', error)
            }
        })
    }

    if (isLoading) {
        return (
            <div className='space-y-6'>
                <Skeleton className='h-10 w-48' />
                <Skeleton className='h-64 w-full' />
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>User Management</h1>
                    <p className='text-muted-foreground'>
                        Manage users and invitations for the admin dashboard
                    </p>
                </div>
                {isAdmin && organizationId && (
                    <InviteUserDialog
                        organizationId={organizationId}
                        onInviteSent={fetchInvitations}
                    />
                )}
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Users className='h-5 w-5' />
                        Users
                    </CardTitle>
                    <CardDescription>
                        {users.length} user{users.length !== 1 ? 's' : ''}{' '}
                        registered
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                {isAdmin && <TableHead className='w-[70px]' />}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className='flex flex-col'>
                                            <span className='font-medium'>
                                                {user.name}
                                            </span>
                                            <span className='text-muted-foreground text-sm'>
                                                {user.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                user.role === 'admin'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {user.role === 'admin' && (
                                                <Shield className='mr-1 h-3 w-3' />
                                            )}
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.banned ? (
                                            <Badge variant='destructive'>
                                                <Ban className='mr-1 h-3 w-3' />
                                                Banned
                                            </Badge>
                                        ) : (
                                            <Badge variant='outline'>
                                                <CheckCircle className='mr-1 h-3 w-3' />
                                                Active
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user.createdAt.toLocaleDateString()}
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell>
                                            {user.id !== session?.user?.id && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            disabled={isPending}
                                                        >
                                                            <MoreHorizontal className='h-4 w-4' />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align='end'>
                                                        {user.role ===
                                                        'viewer' ? (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleChangeRole(
                                                                        user.id,
                                                                        'admin'
                                                                    )
                                                                }
                                                            >
                                                                <Shield className='mr-2 h-4 w-4' />
                                                                Make Admin
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleChangeRole(
                                                                        user.id,
                                                                        'viewer'
                                                                    )
                                                                }
                                                            >
                                                                <ShieldOff className='mr-2 h-4 w-4' />
                                                                Make Viewer
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        {user.banned ? (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleUnbanUser(
                                                                        user.id
                                                                    )
                                                                }
                                                            >
                                                                <UserCheck className='mr-2 h-4 w-4' />
                                                                Unban User
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleBanUser(
                                                                        user.id
                                                                    )
                                                                }
                                                                className='text-destructive'
                                                            >
                                                                <Ban className='mr-2 h-4 w-4' />
                                                                Ban User
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pending Invitations */}
            {invitations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Clock className='h-5 w-5' />
                            Pending Invitations
                        </CardTitle>
                        <CardDescription>
                            {invitations.length} pending invitation
                            {invitations.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Expires</TableHead>
                                    {isAdmin && (
                                        <TableHead className='w-[70px]' />
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invitations.map((invitation) => (
                                    <TableRow key={invitation.id}>
                                        <TableCell>
                                            {invitation.email}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant='secondary'>
                                                {invitation.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {invitation.expiresAt.toLocaleDateString()}
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() =>
                                                        handleCancelInvitation(
                                                            invitation.id
                                                        )
                                                    }
                                                    disabled={isPending}
                                                >
                                                    Cancel
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
