"use client";

import AppLayout from "@/layouts/app-layout";
import { Head, usePage, Link } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";

interface Product {
  id: number;
  product_name: string;
}

interface Props {
  keywordName: string;
  products: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Keywords", href: "/keywords" },
  { title: "Products", href: "#" },
];

export default function KeywordProductsPage() {
  const { props } = usePage<Props>();
  const { keywordName, products } = props;

  const productObjects: Product[] = products.map((name, index) => ({
    id: index + 1,
    product_name: name,
  }));

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Products for keyword: ${keywordName}`} />

      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Products for "{keywordName}"</h1>

        {productObjects.length === 0 ? (
          <p className="text-gray-500">No products found for this keyword.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Product Name</th>
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
          href="/keywords"
          className="inline-block mt-4 text-blue-600 hover:underline"
        >
          ← Back to Keywords
        </Link>
      </div>
    </AppLayout>
  );
}
