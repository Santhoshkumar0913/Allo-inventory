import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {

    // Find expired pending reservations
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lte: new Date(),
        },
      },
    });

    for (const reservation of expiredReservations) {

      // Find matching inventory
      const inventory = await prisma.inventory.findFirst({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
      });

      if (inventory) {

        // Release reserved stock
        await prisma.inventory.update({
          where: {
            id: inventory.id,
          },
          data: {
            reservedUnits: {
              decrement: reservation.quantity,
            },
          },
        });
      }

      // Mark reservation as expired
      await prisma.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: "EXPIRED",
        },
      });
    }

    return NextResponse.json({
      message: "Cleanup completed",
      expiredReservations: expiredReservations.length,
    });

  } catch (error) {

    return NextResponse.json(
      {
        error: "Cleanup failed",
      },
      { status: 500 }
    );
  }
}