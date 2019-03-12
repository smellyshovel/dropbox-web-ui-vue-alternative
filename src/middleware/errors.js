// a wrapper to differentiate known errors
export const Messages = {
    _common: {
        get remote() {
            return "A server-side error occured";
        },

        get unknown() {
            return `Something went wrong... ${ Messages._common.retry }`;
        },

        get retry() {
            return `Please, retry or <a href="#">tell us</a> (including the details from the console) if this keeps happening`
        }
    },

    connect: {
        remote() {
            return `${ Messages._common.remote }. Couldn't connect to the cloud. ${ Messages._common.retry }`;
        }
    },

    updateAccountInfo: {
        remote() {
            return `${ Messages._common.remote }. Couldn't get the account information. ${ Messages._common.retry }`;
        }
    },

    updateEntries: {
        remote() {
            return `${ Messages._common.remote }. Couldn't get the files. ${ Messages._common.retry }`;
        }
    },

    createFolder: {
        bad_name(name) {
            return `A folder name must be at least 1 character long and must not include any of the following characters: <, >, /, \\, :, ?, *, ", |`;
        },

        already_exists(entry) {
            return `The ${ entry.type } named "${ entry.name }" already exists. Please, pick a different name`;
        },

        remote() {
            return `${ Messages._common.remote }. The folder was not created. ${ Messages._common.retry }`;
        }
    },

    moveEntries: {
        remote_sole() {
            return `${ Messages._common.remote }. The entry was not moved. ${ Messages._common.retry }`;
        },

        remote_several() {
            return `${ Messages._common.remote }. Some entries may not have been moved. ${ Messages._common.retry }`;
        }
    },

    copyEntries: {
        not_enough_space(space) {
            return `Not enough space. Available space is ${ space }. Nothing's copied`;
        },

        remote_sole() {
            return `${ Messages._common.remote }. The entry was not copied. ${ Messages._common.retry }`;
        },

        remote_several() {
            return `${ Messages._common.remote }. Some entries may not have been copied. ${ Messages._common.retry }`;
        }
    },

    renameEntry: {
        bad_name(name) {
            return `The name must be at least 1 character long and must not include any of the following characters: <, >, /, \\, :, ?, *, ", |`;
        },

        already_exists(entry) {
            return `The ${ entry.type } named "${ entry.name }" already exists. Please, pick a different name`;
        },

        remote() {
            return `${ Messages._common.remote }. The entry was not renamed. ${ Messages._common.retry }`;
        }
    },

    deleteEntries: {
        remote_sole() {
            return `${ Messages._common.remote }. The entry was not deleted. ${ Messages._common.retry }`;
        },

        remote_several() {
            return `${ Messages._common.remote }. Some entries may not have been deleted. ${ Messages._common.retry }`;
        }
    },

    downloadEntries: {
        remote_sole() {
            return `${ Messages._common.remote }. The entry may not download. ${ Messages._common.retry }`;
        },

        remote_several() {
            return `${ Messages._common.remote }. Some entries probably won't download. ${ Messages._common.retry }`;
        },

        remote_zip() {
            return `${ Messages._common.remote }. The archive may not download. ${ Messages._common.retry }`;
        }
    }
}

export class CustomError {
    constructor({ reason, details }) {
        this.reason = reason;
        this.details = details;
    }

    create(action) {
        return new Error(Messages[action][this.reason](this.details));
    }
};

// must throw an instance of error (either direct or inherited)
export function handleError(action, error) {
    console.warn(`Error in ${action} action`);

    if (error instanceof CustomError) { // the cought error is expected
        var handledError = error.create(action);
        console.error(handledError);

        if (error.details) {
            console.error("Details:", error.details);
        }
    } else { // something really went wrong
        var handledError = new Error(Messages._common.unknown);
        console.error(error);
    }

    // forward the handlded error
    throw handledError;
}
