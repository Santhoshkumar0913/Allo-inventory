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

    try {

      const res = await fetch("/api/products");

      const data = await res.json();

      setInventory(data);

    } catch (error) {

      setMessage("Failed to load inventory");
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  async function reserveProduct(
    productId: string,
    warehouseId: string
  ) {

    try {

      setMessage("");

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
          setMessage("Not enough stock available");
          return;
        }

        if (res.status === 410) {
          setMessage("Reservation expired");
          return;
        }

        setMessage(data.error || "Reservation failed");
        return;
      }

      // REFRESH INVENTORY
      await loadInventory();

      // GO TO CHECKOUT
      router.push(
        `/checkout?id=${data.reservation.id}`
      );

    } catch (error) {

      setMessage("Something went wrong");
    }
  }

  return (

    <main className="min-h-screen bg-slate-100 p-10 text-black">

      {/* PAGE TITLE */}
      <h1 className="mb-10 text-5xl font-extrabold text-black">
        Inventory Dashboard
      </h1>

      {/* ERROR MESSAGE */}
      {message && (
        <div className="mb-6 rounded-xl border border-red-300 bg-red-100 p-4 text-red-800 font-semibold shadow">
          {message}
        </div>
      )}

      {/* INVENTORY GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {inventory.map((item) => (

          <div
            key={item.inventoryId}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition hover:shadow-2xl"
          >

            {/* PRODUCT NAME */}
            <h2 className="text-4xl font-extrabold text-black">
              {item.productName}
            </h2>

            {/* WAREHOUSE */}
            <p className="mb-5 mt-2 text-lg font-medium text-gray-700">
              {item.warehouseName}
            </p>

            {/* STOCK DETAILS */}
            <div className="space-y-2 text-lg">

              <p className="text-black">
                <strong>Total Units:</strong>{" "}
                {item.totalUnits}
              </p>

              <p className="text-black">
                <strong>Reserved Units:</strong>{" "}
                {item.reservedUnits}
              </p>

              {/* AVAILABLE UNITS IN GREEN */}
              <p className="text-xl font-bold">
                <span className="text-green-700">
                  Available Units:
                </span>{" "}
                <span className="text-green-700">
                  {item.availableUnits}
                </span>
              </p>

            </div>

            {/* BUTTON */}
            <button
              onClick={() =>
                reserveProduct(
                  item.productId,
                  item.warehouseId
                )
              }
              disabled={item.availableUnits <= 0}
              className={`mt-6 w-full rounded-xl px-4 py-3 text-lg font-bold transition ${
                item.availableUnits > 0
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
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