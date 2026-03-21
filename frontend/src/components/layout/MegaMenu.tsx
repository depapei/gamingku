import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { categories } from "../../data/categories";
import { useCategories } from "@/src/hooks/useCategories";

export const MegaMenu = () => {
  // Get main categories (those without parentId)
  // const mainCategories = categories.filter((c) => !c.parentId);
  const { data, isSuccess, isLoading } = useCategories();
  const mainCategories = useMemo(() => {
    if (data) {
      return data.filter((c) => !c.parentId);
    }
    return [];
  }, [data, isSuccess]);

  // State to track hovered main category
  const [activeCategory, setActiveCategory] = useState(mainCategories[0]?.id);

  // Get subcategories for the active category
  // const subCategories = categories.filter((c) => c.parentId === activeCategory);
  const subCategories = useMemo(() => {
    if (data) {
      const filteredData = data.filter((c) => c.parentId === activeCategory);
      return filteredData;
    }
    return [];
  }, [data, isSuccess, activeCategory]);

  useEffect(() => {
    if (subCategories) {
      console.log(activeCategory);
      console.log(subCategories);
    }
  }, [activeCategory]);

  return (
    <div className="flex w-[600px] bg-white rounded-md shadow-xl border border-zinc-100 overflow-hidden">
      {/* Column 1: Main Categories */}
      <div className="w-1/3 bg-zinc-50 py-4 border-r border-zinc-100">
        <ul className="space-y-1">
          {mainCategories?.map((category) => (
            <li
              key={category.id}
              onMouseEnter={() => setActiveCategory(category.id)}
              className={`px-6 py-2 cursor-pointer transition-colors ${
                activeCategory === category.id
                  ? "bg-white text-zinc-900 font-medium border-l-2 border-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border-l-2 border-transparent"
              }`}
            >
              <Link
                to={`/category/${category.slug}`}
                className="block w-full text-zinc-600"
              >
                {category.name}
              </Link>
            </li>
          ))}
          {isLoading &&
            [1, 2, 3].map((category) => (
              <li
                key={category}
                className={`animate-pulse px-6 py-2 cursor-pointer transition-colors`}
              >
                <div className="block h-5 w-full text-zinc-200 bg-gray-200 rounded-xl">
                  -
                </div>
              </li>
            ))}
        </ul>
      </div>

      {/* Column 2: Subcategories / Products */}
      <div className="w-2/3 p-6 bg-white">
        <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">
          {mainCategories.find((c) => c.id === activeCategory)?.name}
        </h3>

        {subCategories.length > 0 ? (
          <ul className="grid grid-cols-2 gap-y-3 gap-x-6">
            {subCategories.map((sub) => (
              <li key={sub.id}>
                <Link
                  to={`/category/${sub.slug}`}
                  className="text-sm text-zinc-600 hover:text-zinc-900 hover:underline transition-colors block"
                >
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No subcategories found.</p>
        )}

        <div className="mt-8 pt-4 border-t border-zinc-100">
          <Link
            to={`/category/${mainCategories.find((c) => c.id === activeCategory)?.slug}`}
            className="text-sm font-medium text-zinc-900 hover:underline flex items-center"
          >
            Shop all {mainCategories.find((c) => c.id === activeCategory)?.name}{" "}
            &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
