import mongoose from "mongoose";

const mongoDbUrl = process.env.MONGODB_URL
if (!mongoDbUrl) {
    throw new Error("MONGODB_URL not found");
}

let cached = global.mongooseCache

if (!cached) {
    cached = global.mongooseCache = { conn: null, promise: null }
}


const connectDB = async () => {
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(mongoDbUrl).then((c) => c.connection)
    }

    try {
        cached.conn = await cached.promise
    } catch (error) {
        cached.promise = null
        console.log(error)
        throw error
    }
    return cached.conn

}

export default connectDB