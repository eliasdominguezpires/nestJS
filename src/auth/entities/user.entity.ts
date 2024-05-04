import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";

@Schema()
export class User {

    _id?: string;

    @Prop({ required: true })
    name: string;

    @Prop({ unique: true, required: true, index: true })
    email: string;

    @Prop({ minlength: 6, maxlength: 200, required: true })
    password?: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: [String], default: ['user'] })
    roles: string[];

    @Prop()
    birthday: string;

    @Prop(raw({
        firstName: { type: String },
        lastName: { type: String }
    }))
    details: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);