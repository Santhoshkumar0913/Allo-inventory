import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {

    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    for (const reservation of expiredReservations) {

      await prisma.$transaction(async (tx) => {

        const inventory = await tx.inventory.findFirst({
          where: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        });

        if (inventory) {
          await tx.inventory.update({
            where: {
              id: inventory.id,
              productId: reservation.productId,
              warehouseId: reservation.warehouseId,
            },
            data: {
              reservedUnits: {
                decrement: reservation.quantity,
              },
            },
          });
        }

        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: "EXPIRED",
          },
        });

      });
    }

    return NextResponse.json({
      message: "Cleanup completed",
      expiredReservations: expiredReservations.length,
    });

  } catch (error) {

    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
