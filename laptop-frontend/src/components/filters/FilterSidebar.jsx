import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

function Section({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-semibold text-gray-900"
      >
        <span>{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({ filters, setFilters, onApply, onClear, isMobile = false, onClose }) {
  const options = filters?.availableOptions || {};
  const priceRange = options.price_range || { min: 0, max: 1000000 };
  const [priceMin, setPriceMin] = useState(filters?.price_min || 0);
  const [priceMax, setPriceMax] = useState(filters?.price_max || priceRange.max || 1000000);

  const update = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const toggleValue = (key, value) => {
    setFilters((prev) => {
      const current = prev[key] || [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const isChecked = (key, value) => (filters[key] || []).includes(value);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#3271D7]" />
          <h3 className="text-base font-bold text-gray-900">Filters</h3>
        </div>
        {isMobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        )}
      </div>

      {/* Price */}
      <div className="border-b border-gray-200 py-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">Price Range</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] text-gray-400 mb-1 block">Min</label>
            <input
              type="number"
              value={priceMin}
              min={0}
              onChange={(e) => setPriceMin(e.target.value)}
              onBlur={() => update({ price_min: Number(priceMin) || 0 })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3271D7]"
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-400 mb-1 block">Max</label>
            <input
              type="number"
              value={priceMax}
              min={0}
              onChange={(e) => setPriceMax(e.target.value)}
              onBlur={() => update({ price_max: Number(priceMax) || 0 })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3271D7]"
            />
          </div>
        </div>
      </div>

      {/* Brand */}
      {options.brands?.length > 0 && (
        <Section title="Brand">
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {options.brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.brand_ids?.includes(brand.id) || false}
                  onChange={() => toggleValue("brand_ids", brand.id)}
                  className="rounded border-gray-300 text-[#3271D7] focus:ring-[#3271D7]"
                />
                {brand.name}
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* Processor */}
      {options.processors?.length > 0 && (
        <Section title="Processor">
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {options.processors.map((processor) => (
              <label key={processor} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked("processors", processor)}
                  onChange={() => toggleValue("processors", processor)}
                  className="rounded border-gray-300 text-[#3271D7] focus:ring-[#3271D7]"
                />
                {processor}
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* RAM */}
      {options.rams?.length > 0 && (
        <Section title="RAM">
          <div className="space-y-2">
            {options.rams.map((ram) => (
              <label key={ram} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked("rams", ram)}
                  onChange={() => toggleValue("rams", ram)}
                  className="rounded border-gray-300 text-[#3271D7] focus:ring-[#3271D7]"
                />
                {ram}
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* Storage */}
      {options.storages?.length > 0 && (
        <Section title="Storage">
          <div className="space-y-2">
            {options.storages.map((storage) => (
              <label key={storage} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked("storages", storage)}
                  onChange={() => toggleValue("storages", storage)}
                  className="rounded border-gray-300 text-[#3271D7] focus:ring-[#3271D7]"
                />
                {storage}
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* Condition */}
      {options.conditions?.length > 0 && (
        <Section title="Condition">
          <div className="space-y-2">
            {options.conditions.map((condition) => (
              <label key={condition} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked("conditions", condition)}
                  onChange={() => toggleValue("conditions", condition)}
                  className="rounded border-gray-300 text-[#3271D7] focus:ring-[#3271D7]"
                />
                {condition}
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* Operating System */}
      {options.operating_systems?.length > 0 && (
        <Section title="Operating System">
          <div className="space-y-2">
            {options.operating_systems.map((os) => (
              <label key={os} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked("operating_systems", os)}
                  onChange={() => toggleValue("operating_systems", os)}
                  className="rounded border-gray-300 text-[#3271D7] focus:ring-[#3271D7]"
                />
                {os}
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* Availability */}
      <Section title="Availability">
        <div className="space-y-2">
          {["all", "in_stock", "out_of_stock"].map((value) => (
            <label key={value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="availability"
                checked={(filters.availability || "all") === value}
                onChange={() => update({ availability: value })}
                className="border-gray-300 text-[#3271D7] focus:ring-[#3271D7]"
              />
              {value === "all" ? "All" : value === "in_stock" ? "In Stock" : "Out of Stock"}
            </label>
          ))}
        </div>
      </Section>

      {/* Actions */}
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onApply}
          className="flex-1 rounded-lg bg-[#3271D7] text-white text-sm font-semibold py-2.5 hover:bg-[#265bb5] transition"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={onClear}
          className="flex-1 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold py-2.5 hover:bg-gray-50 transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
