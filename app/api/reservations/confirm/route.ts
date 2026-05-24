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

    const updatedReservation = await prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        status: "CONFIRMED",
      },
    });

    return NextResponse.json({
      message: "Reservation confirmed",
      reservation: updatedReservation,
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Confirmation failed" },
      { status: 500 }
    );
  }
}