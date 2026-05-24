import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { reservationId } = body;

    const reservation = await prisma.reservation.findUnique({
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

    if (reservation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Reservation already processed" },
        { status: 400 }
      );
    }

    const updatedReservation = await prisma.$transaction(async (tx) => {

      const inventory = await tx.inventory.findFirst({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

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

      return await tx.reservation.update({
        where: {
          id: reservationId,
        },
        data: {
          status: "CANCELLED",
        },
      });
    });

    return NextResponse.json({
      message: "Reservation cancelled",
      reservation: updatedReservation,
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Cancellation failed" },
      { status: 500 }
    );
  }
}
