import { set } from "../utils";

export function user(state={id: null}, action) {
    let user = state;
    switch (action.type) {
        case 'CREATE_USER_ID':
            return set(user, 'id', action.userId);
        case 'DELETE_USER_ID':
            return {...user, id: null};
        default:
            return state;
    }
}