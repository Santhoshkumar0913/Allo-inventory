async function getInventory() {
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

  return res.json();
}

export default async function Home() {
  const inventory = await getInventory();

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        Inventory Dashboard
      </h1>

      <table className="border-collapse border border-gray-400 w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Product</th>
            <th className="border p-2">Warehouse</th>
            <th className="border p-2">Total Units</th>
            <th className="border p-2">Reserved Units</th>
            <th className="border p-2">Available Units</th>
          </tr>
        </thead>

        <tbody>
          {inventory.map((item: any) => (
            <tr key={item.inventoryId}>
              <td className="border p-2">{item.productName}</td>
              <td className="border p-2">{item.warehouseName}</td>
              <td className="border p-2">{item.totalUnits}</td>
              <td className="border p-2">{item.reservedUnits}</td>
              <td className="border p-2 font-bold text-green-600">
                {item.availableUnits}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}