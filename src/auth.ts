import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "./lib/db";
import User from "./models/user.model";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: {
                    type: "email",
                    label: "Email",
                    placeholder: "johndoe@gmail.com"
                },
                password: {
                    type: "password",
                    label: "Password",
                    placeholder: "*****"
                }
            },
            async authorize(credentials) {

                const email = credentials.email
                const password = credentials.password as string

                if (!email || !password) {
                    throw Error("Missing credentials");
                }
                await connectDB()
                const user = await User.findOne({ email })
                if (!user) {
                    throw Error("User doesn't exist!")
                }

                if (!user.password) {
                    throw new Error("You register with Google. Please continue with Google.")
                }

                const isMatch = await bcrypt.compare(password, user.password)
                if (!isMatch) {
                    throw Error("incorrect password")
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role
                }

            }
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET

        })

    ],
    callbacks: {

        async signIn({ user, account }) {
            if (account?.provider !== "google") {
                return true
            }

            try {
                await connectDB()
                let exitingUser = await User.findOne({ email: user.email })
                if (!exitingUser) {
                    exitingUser = await User.create({
                        name: user.name,
                        email: user.email,
                        isEmailVerified: true
                    })
                }
                user.id = exitingUser._id
                user.name = exitingUser.name
                user.role = exitingUser.role


                return true
            } catch (error) {
                console.log("Google Sign-in failed", error)
                return false
            }
        },

        async jwt({ token, user }) {
            if (user) {
                Object.assign(token, {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                })
            }
            return token
        },

        async session({ token, session }) {
            if (session.user) {
                Object.assign(session.user, {
                    id: token.id,
                    name: token.name,
                    email: token.email,
                    role: token.role
                })
            }
            return session
        }

    },
    pages: {
        signIn: "/signin",
        error: "/signin"
    },
    session: {
        strategy: "jwt",
        maxAge: 10 * 24 * 60 * 60
    },
    secret: process.env.AUTH_SECRET
})