import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MoneyType {
  @Field(() => Int) amount!: number;
  @Field() currency!: string;
}

@ObjectType()
export class OrganizationType {
  @Field() name!: string;
  @Field() slug!: string;
  @Field({ nullable: true }) logoUrl?: string | null;
  @Field() timeZone!: string;
}

@ObjectType()
export class ServiceType {
  @Field() id!: string;
  @Field() title!: string;
  @Field() slug!: string;
  @Field({ nullable: true }) description?: string | null;
  @Field(() => Int) durationMinutes!: number;
  @Field() kind!: string;
  @Field() color!: string;
  @Field(() => Int) staffCount!: number;
  @Field(() => MoneyType, { nullable: true }) price?: MoneyType | null;
}

@ObjectType()
export class PublicOrganizationType {
  @Field(() => OrganizationType) organization!: OrganizationType;
  @Field(() => [ServiceType]) services!: ServiceType[];
}

@ObjectType()
export class StaffType {
  @Field() id!: string;
  @Field() name!: string;
  @Field({ nullable: true }) image?: string | null;
}

@ObjectType()
export class MeetingTypeType {
  @Field() id!: string;
  @Field() title!: string;
  @Field() slug!: string;
  @Field({ nullable: true }) description?: string | null;
  @Field(() => Int) durationMinutes!: number;
  @Field() kind!: string;
  @Field() color!: string;
  @Field(() => MoneyType, { nullable: true }) price?: MoneyType | null;
  @Field(() => [StaffType]) staff!: StaffType[];
}

@ObjectType()
export class BookingPageType {
  @Field(() => OrganizationType) organization!: OrganizationType;
  @Field(() => MeetingTypeType) meetingType!: MeetingTypeType;
}

@ObjectType()
export class AvailabilitySlotType {
  @Field() start!: string;
  @Field() end!: string;
  @Field(() => Int) seatsRemaining!: number;
}

@ObjectType()
export class BookingType {
  @Field() id!: string;
  @Field() reference!: string;
  @Field() status!: string;
  @Field() startTime!: string;
  @Field() endTime!: string;
  @Field() timeZone!: string;
}

@ObjectType()
export class ViewerOrganizationType {
  @Field() id!: string;
  @Field() name!: string;
  @Field() slug!: string;
  @Field() timeZone!: string;
  @Field() role!: string;
}

@InputType()
export class InviteeInput {
  @Field() name!: string;
  @Field() email!: string;
  @Field() timeZone!: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) notes?: string;
}

@InputType()
export class CreateBookingGqlInput {
  @Field() meetingTypeId!: string;
  @Field() startTime!: string;
  @Field({ nullable: true }) hostId?: string;
  @Field(() => InviteeInput) invitee!: InviteeInput;
}
