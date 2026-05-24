"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type InventoryItem = {
  inventoryId: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  totalUnits: number;
  reservedUnits: number;
  availableUnits: number;
};

export default function Home() {

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [message, setMessage] = useState("");

  const router = useRouter();

  async function loadInventory() {

    const res = await fetch("/api/products");

    const data = await res.json();

    setInventory(data);
  }

  useEffect(() => {
    loadInventory();
  }, []);

  async function reserveProduct(
    productId: string,
    warehouseId: string
  ) {

    try {

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          warehouseId,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {

        if (res.status === 409) {
          setMessage("Not enough stock");
          return;
        }

        if (res.status === 410) {
          setMessage("Reservation expired");
          return;
        }

        setMessage(data.error);
        return;
      }

      router.push(
        `/checkout?id=${data.reservation.id}`
      );

    } catch (error) {

      setMessage("Something went wrong");
    }
  }

  return (

    <main className="min-h-screen bg-gray-100 p-10">

      <h1 className="mb-8 text-4xl font-bold">
        Inventory Dashboard
      </h1>

      {message && (
        <div className="mb-6 rounded bg-red-100 p-4 text-red-700">
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {inventory.map((item) => (

          <div
            key={item.inventoryId}
            className="rounded-xl bg-white p-6 shadow"
          >

            <h2 className="text-2xl font-bold">
              {item.productName}
            </h2>

            <p className="mb-4 text-gray-500">
              {item.warehouseName}
            </p>

            <p>
              <strong>Total Units:</strong>{" "}
              {item.totalUnits}
            </p>

            <p>
              <strong>Reserved Units:</strong>{" "}
              {item.reservedUnits}
            </p>

            <p className="text-green-600 font-bold">
              Available Units: {item.availableUnits}
            </p>

            <button
              onClick={() =>
                reserveProduct(
                  item.productId,
                  item.warehouseId
                )
              }
              disabled={item.availableUnits <= 0}
              className="mt-6 w-full rounded bg-black px-4 py-2 text-white"
            >
              {item.availableUnits > 0
                ? "Reserve"
                : "Out of Stock"}
            </button>

          </div>
        ))}

      </div>

    </main>
  );
}