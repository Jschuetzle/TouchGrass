import 'dotenv/config';

export default {
    expo: {
        name: "touch-grass",
        slug: "touch-grass",
        android: {
            "package": "com.touchgrass.touchgrass"
        },
        extra: {
            firebaseApiKey: process.env.FIREBASE_APIKEY,
            firebaseAuthDomain: process.env.FIREBASE_AUTHDOMAIN,
            firebaseProjectId: process.env.FIREBASE_PROJECTID,
            firebaseAppId: process.env.FIREBASE_APPID
        }
    }
}
