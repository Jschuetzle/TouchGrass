import { DetectFacesCommandOutput } from "@aws-sdk/client-rekognition";
import { ValidationRule } from "./validation-rule.interface";
import { REKOGNITION_PROFILEPIC_CONFIDENCE_THRESHOLD } from "../../common/constants/rekognition";

export const PROFILE_PIC_VALIDATION_RULES: ValidationRule<DetectFacesCommandOutput>[] = [
    {
        name: "face_details_present",
        validation_fn: (data) => !!data.FaceDetails,
        err_code: 1000,
        err_msg: "No face detected in uploaded photo",
    },
    {
        name: "only_one_face_present",
        validation_fn: (data) => data.FaceDetails!.length === 1,
        err_code: 1000,
        err_msg: "Photo must have only one face present",
    },
    {
        name: "eyes_open",
        validation_fn: (data) => data.FaceDetails![0].EyesOpen?.Value ?? false,
        err_code: 1000,
        err_msg: "Face present in photo must have their eyes open",
    },
    {
        name: "no_sunglasses",
        validation_fn: (data) => data.FaceDetails![0].Sunglasses?.Value ?? false,
        err_code: 1000,
        err_msg: "Face present in photo must not have on sunglasses",
    },
    {
        name: "face_not_occluded",
        validation_fn: (data) => data.FaceDetails![0].FaceOccluded?.Value ?? false,
        err_code: 1000,
        err_msg: "Face present in photo is obstructed",
    },
    {
        name: "confidence",
        validation_fn: (data) => (data.FaceDetails![0].Confidence ?? 0) >= REKOGNITION_PROFILEPIC_CONFIDENCE_THRESHOLD,
        err_code: 1000,
        err_msg: "Face present in photo is not clear enough for detection",
    },
];