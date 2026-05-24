import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {

    const body = await req.json();

    const { productId, warehouseId, quantity } = body;

    // Basic validation
    if (!productId || !warehouseId || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {

      // Find inventory
      const inventory = await tx.inventory.findFirst({
        where: {
          productId,
          warehouseId,
        },
      });

      // Inventory check
      if (!inventory) {
        throw new Error("Inventory not found");
      }

      // Calculate available units
      const available =
        inventory.totalUnits - inventory.reservedUnits;

      // Stock check
      if (available < quantity) {
        throw new Error("Not enough stock");
      }

      // Update reserved units with defensive check
      await tx.inventory.update({
        where: {
          id: inventory.id,
          productId,
          warehouseId,
        },
        data: {
          reservedUnits: {
            increment: quantity,
          },
        },
      });

      // Create reservation
      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          status: "PENDING",
          expiresAt: new Date(
            Date.now() + 10 * 60 * 1000
          ),
        },
      });

      return reservation;
    });

    return NextResponse.json(
      {
        message: "Reservation successful",
        reservation: result,
      },
      { status: 200 }
    );

  } catch (error: any) {

    return NextResponse.json(
      {
        error: error.message || "Reservation failed",
      },
      { status: 500 }
    );
  }
}
