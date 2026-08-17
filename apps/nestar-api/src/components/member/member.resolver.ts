import { Args, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { Member } from '../../libs/dto/member/member';
import { ObjectId } from 'mongoose';

@Resolver()
export class MemberResolver {
    constructor(private readonly memberService: MemberService) { }

    @Query(() => String)
    public async sayHello(): Promise<string> {
        console.log('Query: sayHello');
        return await this.memberService.sayHello();
    }
}
