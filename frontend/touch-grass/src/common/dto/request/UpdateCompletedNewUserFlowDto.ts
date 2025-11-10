export class UpdateCompletedNewUserFlowRequestDto {
    completed_new_user_flow: boolean;

    constructor(isComplete: boolean) {
        this.completed_new_user_flow = isComplete;
    }
}