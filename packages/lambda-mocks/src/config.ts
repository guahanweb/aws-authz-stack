import path from "path";

function configure() {
    return {
        dataPath: path.resolve(__dirname, '../data'),
    }
}

export default configure();