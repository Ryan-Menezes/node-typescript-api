/* eslint-disable @typescript-eslint/comma-dangle */
import mongoose, { Schema } from 'mongoose';
import { BaseModel } from '@src/models';

export enum GeoPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N',
}

export interface Beach extends BaseModel {
  lat: number;
  lng: number;
  name: string;
  position: GeoPosition;
  user: string;
}

export interface ExistingBeach extends Beach {
  id: string;
}

const schema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export const Beach = mongoose.model<Beach>('Beach', schema);
