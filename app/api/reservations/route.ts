import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { productId, warehouseId, quantity } = body;

    const result = await prisma.$transaction(async (tx) => {

      // Find inventory
      const inventory = await tx.inventory.findFirst({
        where: {
          productId,
          warehouseId,
        },
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      // Calculate available units
      const available =
        inventory.totalUnits - inventory.reservedUnits;

      // Check stock
      if (available < quantity) {
        throw new Error("Not enough stock");
      }

      // Update reserved units
      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          reservedUnits: inventory.reservedUnits + quantity,
        },
      });

      // Create reservation
      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          status: "PENDING",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      return reservation;
    });

    return NextResponse.json({
      message: "Reservation successful",
      reservation: result,
    });

  } catch (error: any) {

    return NextResponse.json(
      {
        error: error.message || "Reservation failed",
      },
      { status: 500 }
    );
  }
}