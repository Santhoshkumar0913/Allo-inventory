import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const warehouses = await prisma.warehouse.findMany();

  return NextResponse.json(warehouses);
}