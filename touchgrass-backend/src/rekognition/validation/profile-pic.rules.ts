import { AssociateFacesCommandOutput, DeleteFacesCommandOutput, DetectFacesCommandOutput, DisassociateFacesCommandOutput, IndexFacesCommandOutput } from "@aws-sdk/client-rekognition";
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
        name: "at_least_one_face_present",
        validation_fn: (data) => data.FaceDetails!.length > 0,
        err_code: 1000,
        err_msg: "Photo must have at least one face present",
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
        validation_fn: (data) => !(data.FaceDetails![0].Sunglasses?.Value ?? false),
        err_code: 1000,
        err_msg: "Face present in photo must not have on sunglasses",
    },
    {
        name: "face_not_occluded",
        validation_fn: (data) => !(data.FaceDetails![0].FaceOccluded?.Value ?? false),
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


export const INDEX_FACES_PROFILE_PHOTO_RULES: ValidationRule<IndexFacesCommandOutput>[] = [
    {
        name: 'at_least_one_face_indexed',
        validation_fn: (data) => !(!data.FaceRecords),
        err_code: 1001,
        err_msg: "No faces indexed in the provided photo",
    },
    {
        name: "only_one_face_indexed",
        validation_fn: (data) => data.FaceRecords!.length === 1,
        err_code: 1001,
        err_msg: "Only one face allowed in a profile picture",
    },
    {
        name: "indexed_face_must_contain_face_object",
        validation_fn: (data) => !(!data.FaceRecords![0].Face),
        err_code: 1001,
        err_msg: "Indexed face doesn't have expected shape output",
    },
    {
        name: "indexed_face_must_be_given_faceid",
        validation_fn: (data) => !(!data.FaceRecords![0].Face?.FaceId),
        err_code: 1001,
        err_msg: "Indexed face must be given faceid",
    },
];


export const ASSOCIATE_FACES_PROFILE_PHOTO_RULES: ValidationRule<AssociateFacesCommandOutput>[] = [
    {
        name: 'at_least_one_face_associated',
        validation_fn: (data) => !(!data.AssociatedFaces),
        err_code: 1002,
        err_msg: "Face present in the photo must similar to existing profile photo",
    },
    {
        name: "only_one_face_associated",
        validation_fn: (data) => data.AssociatedFaces!.length === 1,
        err_code: 1002,
        err_msg: "Only one face allowed in a profile picture",
    },
];


export const DISASSOCIATE_FACES_PROFILE_PHOTO_RULES: ValidationRule<DisassociateFacesCommandOutput>[] = [
    {
        name: 'at_least_one_face_disassociated',
        validation_fn: (data) => !(!data.DisassociatedFaces),
        err_code: 1003,
        err_msg: "No faces disassociated with old profile photo faceid",
    },
    {
        name: "only_one_face_disassociated",
        validation_fn: (data) => data.DisassociatedFaces!.length === 1,
        err_code: 1003,
        err_msg: "Only one face should be disassociated with old profile photo faceid"
    }
];


export const DELETE_FACES_PROFILE_PHOTO_RULES: ValidationRule<DeleteFacesCommandOutput>[] = [
    {
        name: 'at_least_one_face_deleted',
        validation_fn: (data) => !(!data.DeletedFaces),
        err_code: 1004,
        err_msg: "No faces deleted with old profile photo faceid",
    },
    {
        name: 'only_one_face_deleted',
        validation_fn: (data) => data.DeletedFaces!.length === 1,
        err_code: 1004,
        err_msg: "Only one face should be deleted with old profile photo faceid",
    },
];