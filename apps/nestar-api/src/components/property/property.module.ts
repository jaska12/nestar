import { Module } from '@nestjs/common';
import { PropertyResolver } from './property.resolver';
import { PropertyService } from './property.service';
import { MongooseModule } from '@nestjs/mongoose';
import PropertySchema from '../../schemas/Property.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Property', schema: PropertySchema }])],
  providers: [PropertyResolver, PropertyService],
  exports: [PropertyService],
})
export class PropertyModule { }
