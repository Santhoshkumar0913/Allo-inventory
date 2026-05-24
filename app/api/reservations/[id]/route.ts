import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: any
) {

  try {

    const params = await context.params;

    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id: params.id,
        },

        include: {
          product: true,
          warehouse: true,
        },
      });

    if (!reservation) {

      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(reservation);

  } catch (error) {

    return NextResponse.json(
      { error: "Failed to fetch reservation" },
      { status: 500 }
    );
  }
}