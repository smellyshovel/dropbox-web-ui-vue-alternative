import statusReflector from "./ui/statusReflector.js";
import selections from "./ui/selections.js";
import filePicker from "./ui/filePicker.js";
import namePicker from "./ui/namePicker.js";
import conflictResolver from "./ui/conflictResolver.js";

export default {
    namespaced: true,

    modules: {
        statusReflector,
        selections,
        filePicker,
        namePicker,
        conflictResolver
    }
};
