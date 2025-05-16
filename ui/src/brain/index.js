import { API_PATH } from "../constants";
import { Brain } from "./Brain";
const isLocalhost = /localhost:\d{4}/i.test(window.location.origin);
const constructBaseUrl = () => {
    return `${window.location.origin}${API_PATH}`;
};
const constructBaseApiParams = () => {
    return {
        credentials: "include",
    };
};
const constructClient = () => {
    const baseUrl = constructBaseUrl();
    const baseApiParams = constructBaseApiParams();
    return new Brain({
        baseUrl,
        baseApiParams,
    });
};
const brain = constructClient();
export default brain;
