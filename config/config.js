import dotenv from "dotenv"
dotenv.config()

dotenv.config({path: "../.env"})

export default {
    port: process.env.PORT || 3000,
    db: {
        server: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        dialect: "mssql",
        dialectOptions: {
            options: {
                encrypt: false, 
                trustServerCertificate: true,
            }
        }
    }
}