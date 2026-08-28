declare module 'graphql-upload' {
    import { GraphQLScalarType } from 'graphql';
    import { RequestHandler } from 'express';
    import { ReadStream } from 'fs';

    export class FileUpload {
        filename: string;
        mimetype: string;
        encoding: string;
        createReadStream: () => ReadStream;
    }

    export const GraphQLUpload: GraphQLScalarType;

    export interface UploadOptions {
        maxFileSize?: number;
        maxFiles?: number;
    }

    export function graphqlUploadExpress(options?: UploadOptions): RequestHandler;
}
