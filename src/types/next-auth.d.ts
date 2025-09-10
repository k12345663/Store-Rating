import { UserRole } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      address: string
    }
  }

  interface User {
    role: UserRole
    address: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    address: string
  }
}