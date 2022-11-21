import config, { IConfig } from 'config';
import mongoose, { Mongoose } from 'mongoose';

const dbConfig: IConfig = config.get('App.database');

export const connect = async (): Promise<Mongoose> => {
  return await mongoose.connect(dbConfig.get('mongoUrl'));
};

export const close = async (): Promise<void> => {
  return await mongoose.connection.close();
};
