import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {

  try {

    // Get the product and warehouse IDs
    const iPhone15 = await prisma.product.findFirst({ where: { name: "iPhone 15" } });
    const samsungS24 = await prisma.product.findFirst({ where: { name: "Samsung S24" } });
    const chennaiWarehouse = await prisma.warehouse.findFirst({ where: { name: "Chennai Warehouse" } });
    const bangaloreWarehouse = await prisma.warehouse.findFirst({ where: { name: "Bangalore Warehouse" } });

    if (!iPhone15 || !samsungS24 || !chennaiWarehouse || !bangaloreWarehouse) {
      throw new Error("Required products or warehouses not found");
    }

    // Clear all existing reservations
    await prisma.reservation.deleteMany();

    // Reset iPhone 15 Chennai to 10 units
    await prisma.inventory.updateMany({
      where: {
        productId: iPhone15.id,
        warehouseId: chennaiWarehouse.id,
      },
      data: {
        totalUnits: 10,
        reservedUnits: 0,
      },
    });

    // Reset iPhone 15 Bangalore to 5 units
    await prisma.inventory.updateMany({
      where: {
        productId: iPhone15.id,
        warehouseId: bangaloreWarehouse.id,
      },
      data: {
        totalUnits: 5,
        reservedUnits: 0,
      },
    });

    // Reset Samsung S24 Chennai to 7 units
    await prisma.inventory.updateMany({
      where: {
        productId: samsungS24.id,
        warehouseId: chennaiWarehouse.id,
      },
      data: {
        totalUnits: 7,
        reservedUnits: 0,
      },
    });

    return NextResponse.json({
      message: "Inventory reset successful",
    });

  } catch (error) {

    return NextResponse.json(
      { error: "Reset failed" },
      { status: 500 }
    );
  }
}
