import 'dotenv/config';

export default {
    expo: {
        name: "touch-grass",
        slug: "touch-grass",
        android: {
            "package": "com.touchgrass.touchgrass",
            "googleServicesFile": "./google-services.json"
        },
        ios: {
            "bundleIdentifier": "com.touchgrass.touchgrass",
            "googleServicesFile": "./GoogleService-Info.plist"
        },
        plugins: [
            "@react-native-firebase/app",
            "@react-native-firebase/auth"
        ],
        extra: {
            firebaseApiKey: process.env.FIREBASE_APIKEY,
            firebaseAuthDomain: process.env.FIREBASE_AUTHDOMAIN,
            firebaseProjectId: process.env.FIREBASE_PROJECTID,
            firebaseAppId: process.env.FIREBASE_APPID
        }
    }
}
