import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import fs from 'node:fs';
import path from 'node:path';
import { createVideo, uploadVideo } from './helpers';

const argv = yargs(hideBin(process.argv)).argv as Record<string, unknown>;

const file = argv.file as string;
const key = argv.key as string;
const library = argv.library as string;
const collection = argv.collection as string;

const title = argv.title as string;

if (!file) {
    throw new Error('Please specify a file');
}

if (!key || !/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}-[a-z0-9]{4}-[a-z0-9]{4}/.test(key)) {
    throw new Error('Please specify a valid key');
}

if (!library || Number.isNaN(Number(library))) {
    throw new Error('Please specify a valid library id');
}

if (!collection || !/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/.test(collection)) {
    throw new Error('Please specify a valid collection id');
}

if (!title) {
    throw new Error('Please specify a title');
}


const filePath = path.resolve(process.cwd(), file);

if (!fs.existsSync(filePath)) {
    throw new Error('File does not exist');
}

console.log(`Reading file: ${filePath}`);

const content = fs.readFileSync(filePath);

async function main() {

    const createResult = await createVideo(Number(library), title, collection, key);

    if (!createResult.success) {
        throw new Error('Could not create video');
    }

    const guid = createResult.data;

    const uploadResult = await uploadVideo(Number(library), guid, key, content);

    if (!uploadResult.success) {
        throw new Error('Could not upload video');
    }

    console.log(`Video uploaded: ${guid}`);

}

main();