import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { ViewGroup } from '../../enums/view.enum';
import { Types } from 'mongoose';

@InputType()
export class ViewInput {
    @IsNotEmpty()
    @Field(() => String)
    memberId: Types.ObjectId;

    @IsNotEmpty()
    @Field(() => String)
    viewRefId: Types.ObjectId;

    @IsNotEmpty()
    @Field(() => ViewGroup)
    viewGroup: ViewGroup;
}
