import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const { reservationId } = body;

    if (!reservationId) {

      return NextResponse.json(
        { error: "Missing reservationId" },
        { status: 400 }
      );
    }

    // FIND RESERVATION
    const reservation =
      await prisma.reservation.findUnique({
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

    // ONLY UPDATE STATUS
    // DO NOT TOUCH INVENTORY
    const updatedReservation =
      await prisma.reservation.update({
        where: {
          id: reservationId,
        },
        data: {
          status: "CONFIRMED",
        },
      });

    return NextResponse.json({
      message: "Payment confirmed",
      reservation: updatedReservation,
    });

  } catch (error: any) {

    return NextResponse.json(
      {
        error:
          error.message || "Confirmation failed",
      },
      {
        status: 500,
      }
    );
  }
}