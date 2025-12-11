"use client";

import AppLayout from "@/layouts/app-layout";
import { Head, usePage, Link } from "@inertiajs/react";
import { BreadcrumbItem } from "@/types";

interface Product {
  id: number;
  product_name: string;
  status?: "active" | "inactive"; // optional
}

interface Props {
  campaignName: string;
  products: string[]; // now it's an array of strings
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Campaigns", href: "/campaign" },
  { title: "Products", href: "#" },
];

export default function CampaignProductsPage() {
  const { props } = usePage<Props>();
  const { campaignName, products } = props;

  // Convert strings into objects for the table
  const productObjects: Product[] = products.map((name, index) => ({
    id: index + 1,
    product_name: name,
    status: undefined, // optional
  }));

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Products of ${campaignName}`} />

      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Product of {campaignName}</h1>

        {productObjects.length === 0 ? (
          <p className="text-gray-500">No products found for this campaign.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Product Name
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productObjects.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-2 text-sm text-gray-600">{p.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {p.product_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Link
          href="/campaign"
          className="inline-block mt-4 text-blue-600 hover:underline"
        >
          ← Back to Campaigns
        </Link>
      </div>
    </AppLayout>
  );
}
