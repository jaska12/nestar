import { registerEnumType } from '@nestjs/graphql';

export enum NotificationGroup {
    MEMBER = 'MEMBER',
    ARTICLE = 'ARTICLE',
    PROPERTY = 'PROPERTY',
}
registerEnumType(NotificationGroup, {
    name: 'NotificationGroup',
});

export enum NotificationStatus {
    WAIT = 'WAIT',
    READ = 'READ',
}
registerEnumType(NotificationStatus, {
    name: 'NotificationStatus',
});

export enum NotificationType {
    LIKE = 'LIKE',
    COMMENT = 'COMMENT',
    SUBSCRIBE = 'SUBSCRIBE',
}
registerEnumType(NotificationType, {
    name: 'NotificationType',
});
