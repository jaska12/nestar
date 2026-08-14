import { registerEnumType } from '@nestjs/graphql';

export enum LikeGroup {
    MEMBER = 'MEMBER',
    ARTICLE = 'ARTICLE',
    PROPERTY = 'PROPERTY',
}
registerEnumType(LikeGroup, {
    name: 'LikeGroup',
});
