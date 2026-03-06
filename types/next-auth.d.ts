import { DefaultSession } from "next-auth"
import { Organization, OrganizationMember, Role, Team, TeamMember } from "@prisma/client"

export type UserOrg = OrganizationMember & {
    org: Organization
    role: Role
}

export type UserTeam = TeamMember & {
    team: Team
    role: Role
}

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            orgs: UserOrg[]
            teams: UserTeam[]
        } & DefaultSession["user"]
    }

    interface User {
        orgs?: UserOrg[]
        teams?: UserTeam[]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        orgs?: UserOrg[]
        teams?: UserTeam[]
    }
}