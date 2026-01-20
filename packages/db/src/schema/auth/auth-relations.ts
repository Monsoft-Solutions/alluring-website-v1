import { relations } from 'drizzle-orm'

import { account } from './account.table'
import { invitation } from './invitation.table'
import { member } from './member.table'
import { organization } from './organization.table'
import { session } from './session.table'
import { user } from './user.table'

/**
 * User relations
 */
export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    memberships: many(member),
    sentInvitations: many(invitation),
}))

/**
 * Session relations
 */
export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}))

/**
 * Account relations
 */
export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}))

/**
 * Organization relations
 */
export const organizationRelations = relations(organization, ({ many }) => ({
    members: many(member),
    invitations: many(invitation),
}))

/**
 * Member relations
 */
export const memberRelations = relations(member, ({ one }) => ({
    user: one(user, {
        fields: [member.userId],
        references: [user.id],
    }),
    organization: one(organization, {
        fields: [member.organizationId],
        references: [organization.id],
    }),
}))

/**
 * Invitation relations
 */
export const invitationRelations = relations(invitation, ({ one }) => ({
    organization: one(organization, {
        fields: [invitation.organizationId],
        references: [organization.id],
    }),
    inviter: one(user, {
        fields: [invitation.inviterId],
        references: [user.id],
    }),
}))
