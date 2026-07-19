import { Injectable } from '@nestjs/common';
import { AppError, DiscountSource, DiscountType, validateCoupon, type Discount } from '@invincible/utils';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve a discount from an org coupon or a platform campaign code. Returns
   * null for an unknown code; throws when a known code is invalid/expired.
   */
  async resolveDiscount(
    organizationId: string,
    code: string,
    now: Date = new Date(),
  ): Promise<Discount | null> {
    const coupon = await this.prisma.coupon.findFirst({ where: { organizationId, code } });
    if (coupon) {
      const validity = validateCoupon(
        {
          isActive: coupon.isActive,
          expiresAt: coupon.expiresAt,
          maxRedemptions: coupon.maxRedemptions,
          timesRedeemed: coupon.timesRedeemed,
        },
        now,
      );
      if (!validity.valid) throw AppError.conflict(`Coupon "${code}" is ${validity.reason}.`);
      return {
        type: coupon.type === 'PERCENT' ? DiscountType.Percent : DiscountType.Fixed,
        value: coupon.amountOff,
        source: DiscountSource.Coupon,
        code,
      };
    }

    const campaign = await this.prisma.discountCampaign.findUnique({ where: { code } });
    if (campaign) {
      const active =
        campaign.isActive &&
        (!campaign.startsAt || campaign.startsAt.getTime() <= now.getTime()) &&
        (!campaign.endsAt || campaign.endsAt.getTime() >= now.getTime()) &&
        (campaign.maxRedemptions === null || campaign.timesRedeemed < campaign.maxRedemptions);
      if (!active) throw AppError.conflict(`Campaign "${code}" is not active.`);
      return {
        type: campaign.type === 'PERCENT' ? DiscountType.Percent : DiscountType.Fixed,
        value: campaign.amountOff,
        source: DiscountSource.Campaign,
        code,
      };
    }

    return null;
  }

  async recordRedemption(
    organizationId: string,
    code: string,
    amountDiscounted: number,
  ): Promise<void> {
    const coupon = await this.prisma.coupon.findFirst({ where: { organizationId, code } });
    if (coupon) {
      await this.prisma.$transaction([
        this.prisma.coupon.update({
          where: { id: coupon.id },
          data: { timesRedeemed: { increment: 1 } },
        }),
        this.prisma.couponRedemption.create({
          data: { organizationId, couponId: coupon.id, amountDiscounted },
        }),
      ]);
      return;
    }
    await this.prisma.discountCampaign.updateMany({
      where: { code },
      data: { timesRedeemed: { increment: 1 } },
    });
  }
}
