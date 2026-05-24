import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const { reservationId } = body;

    const result = await prisma.$transaction(async (tx) => {

      // FIND RESERVATION
      const reservation =
        await tx.reservation.findUnique({
          where: {
            id: reservationId,
          },
        });

      if (!reservation) {

        return NextResponse.json(
          { error: "Reservation not found" },
          { status: 404 }
        );
      }

      // CHECK STATUS
      if (reservation.status !== "PENDING") {

        return NextResponse.json(
          { error: "Reservation already processed" },
          { status: 400 }
        );
      }

      // CHECK EXPIRY
      if (new Date() > reservation.expiresAt) {

        return NextResponse.json(
          { error: "Reservation expired" },
          { status: 410 }
        );
      }

      // FIND INVENTORY
      const inventory =
        await tx.inventory.findFirst({
          where: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        });

      if (!inventory) {

        return NextResponse.json(
          { error: "Inventory not found" },
          { status: 404 }
        );
      }

      // UPDATE INVENTORY with defensive check to ensure correct record
      const updatedInventory = await tx.inventory.update({
        where: {
          id: inventory.id,
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },

        data: {

          // FINAL STOCK REMOVAL
          totalUnits: {
            decrement: reservation.quantity,
          },

          // REMOVE RESERVED HOLD
          reservedUnits: {
            decrement: reservation.quantity,
          },
        },
      });

      // UPDATE RESERVATION STATUS
      const updatedReservation =
        await tx.reservation.update({
          where: {
            id: reservation.id,
          },

          data: {
            status: "CONFIRMED",
          },
        });

      return updatedReservation;
    });

    // HANDLE EARLY RESPONSE
    if (result instanceof NextResponse) {

      return result;
    }

    return NextResponse.json({
      message: "Payment confirmed successfully",
      reservation: result,
    });

  } catch (error: any) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          error.message || "Payment confirmation failed",
      },
      { status: 500 }
    );
  }
}
