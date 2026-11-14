import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// LOGIC
// 1. pahle ek arrow funtion banao jo ek file ko argument ki tarah le aur file ka type blob ho
// 2. Iss funtion ka return type ek Promise hoga jo ki pura hone par ya to string dega image ka ya fir null
// 3. fir jo file argument ke taur par mil raha hai use arrayBuffer ke packet me dal do
// 4. fir uss packet se ek buffer(chunk) nikalo 
// 5. fir ye code dekh ke andaja laga lena kya hua hai kya nahi


const uploadOnCloudinary = async (file: Blob): Promise<string | null> => {

    if (!file) {
        return null
    }

    try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        return new Promise((resolve) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                resource_type: "auto",
                folder: "rydex_documents"

            }, (error, result) => {
                if (error) {
                    console.log("Cloudinary upload error", error)
                    resolve(null)
                } else {
                    resolve(result?.secure_url ?? null)
                }
            })
            uploadStream.end(buffer)
        })

    } catch (error) {
        console.log("Buffer Conversion Error",error)
        return null
    }

}


export default uploadOnCloudinary