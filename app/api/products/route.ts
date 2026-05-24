import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const inventory = await prisma.inventory.findMany({
    include: {
      product: true,
      warehouse: true,
    },
  });

  const data = inventory.map((item) => ({
    inventoryId: item.id,
    productId: item.product.id,
    productName: item.product.name,
    warehouseId: item.warehouse.id,
    warehouseName: item.warehouse.name,
    totalUnits: item.totalUnits,
    reservedUnits: item.reservedUnits,
    availableUnits: item.totalUnits - item.reservedUnits,
  }));

  return NextResponse.json(data);
}