import { updateUser } from "@/api/users";
import { JsonPatchDto } from "@/common/dto/request/JsonPatchDto";
import { TouchgrassUser } from "@/common/types/user";
import { generate, observe } from "fast-json-patch";

export async function patchUser(
    touchgrassUser: TouchgrassUser,
    setTouchgrassUser: (user: TouchgrassUser) => void,
    patches: Partial<TouchgrassUser>,
): Promise<boolean> {
    try {
        // generate the JSON patch
        const touchgrassUserCopy = touchgrassUser.clone();

        const observer = observe(touchgrassUserCopy);
        touchgrassUserCopy.update(patches);
        const jsonPatchDto = generate(observer) as JsonPatchDto;

        await updateUser(jsonPatchDto);
        setTouchgrassUser(touchgrassUserCopy);
        return true;
    } catch (err) {
        return false;
    }
}