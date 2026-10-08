import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
dotenv.config();
await mongoose.connect(process.env.MONGO_URI);
const password=await bcrypt.hash('Demo123!',10);
for(const u of [
  {name:'Demo Customer',email:'customer@helpdesk.pro',role:'customer'},
  {name:'Demo Agent',email:'agent@helpdesk.pro',role:'agent'},
  {name:'Demo Admin',email:'admin@helpdesk.pro',role:'admin'}
]) { await User.updateOne({email:u.email},{$set:{...u,password}},{upsert:true}); }
console.log('HelpDesk demo accounts use password Demo123!');
await mongoose.disconnect();
