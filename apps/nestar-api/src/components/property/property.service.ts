import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'bson';
import { Properties, Property } from '../../libs/dto/property/property';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AgentPropertiesInquiry, PropertiesInquiry, PropertyInput } from '../../libs/dto/property/property.input';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import moment from 'moment';

@Injectable()
export class PropertyService {
    constructor(
        @InjectModel('Property') private readonly propertyModel: Model<Property>,
        private memberService: MemberService,
        private viewService: ViewService,
    ) { }

    public async createProperty(input: PropertyInput): Promise<Property> {
        try {
            const result = await this.propertyModel.create(input);
            await this.memberService.memberStatsEditor({
                _id: shapeIntoMongoObjectId(result.memberId),
                targetKey: 'memberProperties',
                modifier: 1,
            });
            return result;
        } catch (err) {
            console.log('Error, Service.model:', err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        }
    }

    public async getProperty(memberId: ObjectId, propertyId: ObjectId): Promise<Property> {
        const search: T = {
            _id: propertyId,
            propertyStatus: PropertyStatus.ACTIVE,
        };

        const targetProperty: Property = (await this.propertyModel.findOne(search).lean().exec()) as Property;
        if (!targetProperty) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        if (memberId) {
            const viewInput = { memberId: memberId, viewRefId: propertyId, viewGroup: ViewGroup.PROPERTY };
            const newView = await this.viewService.recordView(viewInput);
            if (newView) {
                await this.propertyStatsEditor({ _id: shapeIntoMongoObjectId(propertyId), targetKey: 'propertyViews', modifier: 1 });
                targetProperty.propertyViews++;
            }

            // meLiked
        }

        targetProperty.memberData = await this.memberService.getMember(null, shapeIntoMongoObjectId(targetProperty.memberId));
        return targetProperty;
    }

    public async propertyStatsEditor(input: StatisticModifier): Promise<Property> {
        const { _id, targetKey, modifier } = input;
        return (await this.propertyModel
            .findByIdAndUpdate(
                _id,
                { $inc: { [targetKey]: modifier } },
                {
                    new: true,
                },
            )
            .exec()) as Property;
    }

    public async updateProperty(memberId: ObjectId, input: PropertyUpdate): Promise<Property> {
        let { propertyStatus, soldAt, deletedAt } = input;
        const search: T = {
            _id: input._id,
            memberId: memberId,
            propertyStatus: PropertyStatus.ACTIVE,
        };

        if (propertyStatus === PropertyStatus.SOLD) input.soldAt = moment().toDate();
        else if (propertyStatus === PropertyStatus.DELETE) input.deletedAt = moment().toDate();

        const result = (await this.propertyModel
            .findOneAndUpdate(search, input, {
                new: true,
            })
            .exec()) as Property;

        if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

        if (soldAt || deletedAt) {
            await this.memberService.memberStatsEditor({
                _id: shapeIntoMongoObjectId(memberId),
                targetKey: 'memberProperties',
                modifier: -1,
            });
        }

        return result;
    }

    public async getProperties(memberId: ObjectId, input: PropertiesInquiry): Promise<Properties> {
        const { match, sort } = this.shapeMatchQuery(input);
        const result = await this.propertyModel
            .aggregate([
                { $match: match },
                { $sort: sort },
                {
                    $facet: {
                        list: [
                            { $skip: (input.page - 1) * input.limit },
                            { $limit: input.limit },
                            {
                                $lookup: {
                                    from: 'members',
                                    localField: 'memberId',
                                    foreignField: '_id',
                                    as: 'memberData',
                                },
                            },
                            { $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
                        ],
                        metaCounter: [{ $count: 'total' }],
                    },
                },
            ])
            .exec();

        if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        return result[0];
    }

    private shapeMatchQuery(input: PropertiesInquiry): { match: T; sort: T } {
        const { memberId, locationList, typeList, roomsList, bedsList, pricesRange, periodsRange, squaresRange, text } =
            input.search;
        const match: T = { propertyStatus: PropertyStatus.ACTIVE };
        const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

        if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
        if (locationList && locationList.length) match.propertyLocation = { $in: locationList };
        if (typeList && typeList.length) match.propertyType = { $in: typeList };
        if (roomsList && roomsList.length) match.propertyRooms = { $in: roomsList };
        if (bedsList && bedsList.length) match.propertyBeds = { $in: bedsList };
        if (pricesRange) match.propertyPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
        if (squaresRange) match.propertySquare = { $gte: squaresRange.start, $lte: squaresRange.end };
        if (periodsRange) match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
        if (text) match.propertyTitle = { $regex: new RegExp(text, 'i') };

        return { match, sort };
    }

    public async getAgentProperties(memberId: ObjectId, input: AgentPropertiesInquiry): Promise<Properties> {
        const { propertyStatus } = input.search;
        if (propertyStatus === PropertyStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

        const match: T = {
            memberId: memberId,
            propertyStatus: propertyStatus ?? { $ne: PropertyStatus.DELETE },
        };
        const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

        const result = await this.propertyModel
            .aggregate([
                { $match: match },
                { $sort: sort },
                {
                    $facet: {
                        list: [
                            { $skip: (input.page - 1) * input.limit },
                            { $limit: input.limit },
                            {
                                $lookup: {
                                    from: 'members',
                                    localField: 'memberId',
                                    foreignField: '_id',
                                    as: 'memberData',
                                },
                            },
                            { $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
                        ],
                        metaCounter: [{ $count: 'total' }],
                    },
                },
            ])
            .exec();

        if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        return result[0];
    }
}
