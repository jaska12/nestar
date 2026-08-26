import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';

@Injectable()
export class ViewService {
    constructor(@InjectModel('View') private readonly viewModel: Model<View>) { }

    public async recordView(input: ViewInput): Promise<View | null> {
        const viewExist = await this.checkViewExistence(input);
        if (!viewExist) {
            console.log('- New View Inserted -');
            return (await this.viewModel.create(input)) as unknown as View;
        } else {
            return null;
        }
    }

    public async checkViewExistence(input: ViewInput): Promise<View | null> {
        const { memberId, viewRefId } = input;
        return (await this.viewModel.findOne({ memberId: memberId, viewRefId: viewRefId }).exec()) as unknown as View;
    }
}
