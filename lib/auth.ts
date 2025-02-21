import { betterAuth } from "better-auth";
import { Pool } from "pg"
import { username } from "better-auth/plugins";
 
export const auth = betterAuth({
    emailAndPassword: {
        enabled: true
    },
    plugins: [
        username()
    ],
    database: new Pool({
        user: 'postgres',
        password: 'admin',
        host: 'localhost',
        port: 5433,
        database: 'betterauth',
    })
})