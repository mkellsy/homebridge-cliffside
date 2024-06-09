import fs from "fs";
import path from "path";

const links = new Map<string, string>();
const filename = path.resolve(__dirname, "../links.json");

if (fs.existsSync(filename)) {
    try {
        const contents = fs.readFileSync(filename).toString();
        const values: string[][] = JSON.parse(contents);

        for (const value of values) {
            links.set(value[0], value[1]);
            links.set(value[1], value[0]);
        }
    } catch (error) {
        /* no-op */
    }
}

export { links };
