'use client'

import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { Loader2, UserPlus } from 'lucide-react'
import { useState, useTransition } from 'react'

import { organization } from '@/lib/auth-client'

type InviteUserDialogProps = {
    organizationId: string
    onInviteSent?: () => void
}

export function InviteUserDialog({
    organizationId,
    onInviteSent,
}: InviteUserDialogProps) {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [role, setRole] = useState<'admin' | 'member'>('member')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setSuccess(false)

        startTransition(async () => {
            try {
                const { error: inviteError } = await organization.inviteMember({
                    email,
                    role,
                    organizationId,
                })

                if (inviteError) {
                    setError(inviteError.message || 'Failed to send invitation')
                    return
                }

                setSuccess(true)
                setEmail('')
                setRole('member')
                onInviteSent?.()

                // Close dialog after short delay
                setTimeout(() => {
                    setOpen(false)
                    setSuccess(false)
                }, 1500)
            } catch {
                setError('An error occurred. Please try again.')
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className='mr-2 h-4 w-4' />
                    Invite User
                </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Invite User</DialogTitle>
                        <DialogDescription>
                            Send an invitation email to add a new user to the
                            admin dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                        <div className='grid gap-2'>
                            <Label htmlFor='email'>Email address</Label>
                            <Input
                                id='email'
                                type='email'
                                placeholder='user@example.com'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isPending || success}
                                required
                            />
                        </div>
                        <div className='grid gap-2'>
                            <Label htmlFor='role'>Role</Label>
                            <Select
                                value={role}
                                onValueChange={(value) =>
                                    setRole(value as 'admin' | 'member')
                                }
                                disabled={isPending || success}
                            >
                                <SelectTrigger id='role'>
                                    <SelectValue placeholder='Select a role' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='admin'>
                                        <div className='flex flex-col'>
                                            <span>Admin</span>
                                            <span className='text-muted-foreground text-xs'>
                                                Full access to all features
                                            </span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value='member'>
                                        <div className='flex flex-col'>
                                            <span>Member</span>
                                            <span className='text-muted-foreground text-xs'>
                                                Standard access
                                            </span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {error && (
                            <div className='bg-destructive/10 text-destructive rounded-md p-3 text-sm'>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className='rounded-md bg-green-100 p-3 text-sm text-green-800'>
                                Invitation sent successfully!
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type='submit'
                            disabled={isPending || !email || success}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Sending...
                                </>
                            ) : (
                                'Send Invitation'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
