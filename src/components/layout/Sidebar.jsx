"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { name: "ダッシュボード", path: "/" },
    { name: "分析グラフ", path: "/analytics" },
    { name: "総評", path: "/summary" },
    { name: "四半期AI比較", path: "/quarterly" },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
      <div className="p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded"
        >
          <span className="font-semibold">メニュー</span>
          <span
            className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        <div className={`mt-2 space-y-1 ${isOpen ? "block" : "hidden"}`}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`block p-2 rounded hover:bg-gray-100
                ${pathname === item.path ? "bg-gray-100 font-semibold" : ""}
              `}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
