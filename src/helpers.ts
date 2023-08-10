import axios, { AxiosResponse } from 'axios';
import chalk from 'chalk';

export function createVideo(libraryId: number, title: string, collectionId: string, AccessKey: string): Promise<
    { success: true, data: string } | { success: false, data: null }
> {
    const url = `https://video.bunnycdn.com/library/${libraryId}/videos`;
    const data = { title, collectionId };
    const config = {
        headers: {
            'accept': 'application/json',
            'content-type': 'application/*+json',
            'AccessKey': AccessKey
        }
    };

    return axios.post(url, data, config)
        .then((response: AxiosResponse) => {
            const guid = response?.data?.guid;

            if (guid) {
                return {
                    success: true,
                    data: guid
                };
            }

            return {
                success: false,
                data: null
            };
        })
        .catch(() => {
            return {
                success: false,
                data: null
            };
        });
}

export function uploadVideo(libraryId: number, guid: string, AccessKey: string, file: Buffer): Promise<
    { success: boolean, data: null }
> {
    const url = `https://video.bunnycdn.com/library/${libraryId}/videos/${guid}`;

    const uploadStartTime = Date.now();

    const config = {
        headers: {
            'accept': 'application/json',
            'AccessKey': AccessKey,
            'Content-Type': 'application/octet-stream'
        },
        onUploadProgress: (progressEvent: any) => {
            const percentComplete = (progressEvent.loaded / progressEvent.total) * 100;
            const progressBar = createProgressBar(percentComplete);
            console.log(`Upload progress: ${progressBar}`);

            const remainingSize = progressEvent.total - progressEvent.loaded;
            const uploadSpeed = progressEvent.loaded / (progressEvent.timeStamp - uploadStartTime);
            const estimatedUploadTime = remainingSize / uploadSpeed;
            console.log(`Estimated upload time: ${estimatedUploadTime ?? 'N/A'} seconds`);
        }
    };

    return axios.put(url, file, config)
        .then((response: AxiosResponse) => {
            const success = response?.data?.success;

            if (success) {
                return {
                    success: true,
                    data: null
                };
            }

            return {
                success: false,
                data: null
            };
        })
        .catch((e) => {
            console.log(e);
            return {
                success: false,
                data: null
            };
        });
}

function createProgressBar(percentComplete: number): string {
    const filled = Math.round(percentComplete / 10);
    const empty = 10 - filled;
    const filledBar = chalk.green('█'.repeat(filled));
    const emptyBar = chalk.gray('░'.repeat(empty));
    return `${filledBar}${emptyBar} ${percentComplete.toFixed(2)}%`;
}
