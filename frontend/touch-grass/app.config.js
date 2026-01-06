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
            "googleServicesFile": "./GoogleService-Info.plist",
            infoPlist: {
                NSAppTransportSecurity: {
                    NSAllowsArbitraryLoads: true
                }
            },
        },
        plugins: [
            "@react-native-firebase/app",
            "@react-native-firebase/auth",
            [
                "expo-build-properties",
                {
                    ios: {
                        useFrameworks: "static"
                    },
                    android: {
                        usesCleartextTraffic: true,
                    },
                }
            ],
            "@react-native-google-signin/google-signin",
            [
                "expo-image-picker",
                {
                photosPermission:
                    "We need access to your photo library so you can choose a profile picture.",
                cameraPermission:
                    "We need the camera so you can take a profile picture."
                }
            ],
            [
                "expo-media-library",
                {
                photosPermission:
                    "We need access to your photo library so you can choose a profile picture.",
                savePhotosPermission:
                    "We may save your profile picture to your library if you ask us to."
                }
            ]
        ],
        extra: {
            firebaseApiKey: process.env.FIREBASE_APIKEY,
            firebaseAuthDomain: process.env.FIREBASE_AUTHDOMAIN,
            firebaseProjectId: process.env.FIREBASE_PROJECTID,
            firebaseAppId: process.env.FIREBASE_APPID,
            firebaseWebClientId: process.env.FIREBASE_WEBCLIENT_ID,
            backendIP: process.env.BACKEND_IP,
            backendPort: process.env.BACKEND_PORT
        }
    }
}
