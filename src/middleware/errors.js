export default {
    CreateFoldersError: class CreateFoldersError extends Error {
        constructor(message) {
            super(message);
        }

        static alreadyExists(entry) {
            return `The ${entry[".tag"]} named "${entry.name}" already exists`;
        }

        static badName(name) {
            return `A folder can't be named "${name}". The name must be at least 1 character long
                and must not include any of the following characters: <, >, /, \\, :, ?, *, \", |`;
        }

        static serverError(error) {
            if (error) {
                console.log(error);
            }

            return `Error processing your request on the server occurred.
                Detailed explanation is in the console`;
        }
    },

    MoveEntriesError: class MoveEntriesError extends Error {
        constructor(message) {
            super(message);
        }

        static serverError(error) {
            if (error) {
                console.log(error);
            }

            return `Error processing your request on the server occurred.
                Detailed explanation is in the console`;
        }
    },

    CopyEntriesError: class CopyEntriesError extends Error {
        constructor(message) {
            super(message);
        }

        static serverError(error) {
            if (error) {
                console.log(error);
            }

            return `Error processing your request on the server occurred.
                Detailed explanation is in the console`;
        }
    },

    RenameEntryError: class RenameEntryError extends Error {
        constructor(message) {
            super(message);
        }

        static serverError(error) {
            if (error) {
                console.log(error);
            }

            return `Error processing your request on the server occurred.
                Detailed explanation is in the console`;
        }
    }
}
