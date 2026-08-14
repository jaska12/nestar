import { Schema } from 'mongoose';
import { CommentGroup, CommentStatus } from '../libs/enums/comment.enum';

const CommentSchema = new Schema(
    {
        commentGroup: {
            type: String,
            enum: CommentGroup,
            required: true,
        },

        commentStatus: {
            type: String,
            enum: CommentStatus,
            default: CommentStatus.ACTIVE,
        },

        commentContent: {
            type: String,
            required: true,
        },

        memberId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Member',
        },

        commentRefId: {
            type: Schema.Types.ObjectId,
            required: true,
        },

        deletedAt: {
            type: Date,
        },
    },
    { timestamps: true, collection: 'comments' },
);

export default CommentSchema;
