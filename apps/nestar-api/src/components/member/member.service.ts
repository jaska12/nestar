import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { T } from '../../libs/types/common';

@Injectable()
export class MemberService {
    constructor(@InjectModel('Member') private readonly memberModel: Model<Member>) { }

    public async sayHello(): Promise<string> {
        return 'Welcome to MemberService!';
    }

    public async getInquiry(memberId: ObjectId): Promise<Member> {
        const result = await this.memberModel.findById(memberId).exec();
        if (!result) throw new Error('Member not found!');
        return result as unknown as Member;
    }
}
