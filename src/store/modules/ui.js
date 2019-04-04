import selections from "./ui/selections.js";
import filePicker from "./ui/filePicker.js";
import namePicker from "./ui/namePicker.js";
import conflictResolver from "./ui/conflictResolver.js";

export default {
    namespaced: true,

    modules: {
        selections,
        filePicker,
        namePicker,
        conflictResolver
    }
};
