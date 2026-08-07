export const SECTION_OPTIONS = [
  { value: "home_top", label: "Home Top Banner (carousel)" },
  { value: "brand_logo", label: "Brand Logos (under main banner)" },
  { value: "deal_of_day", label: "Deal of the Day (below banner)" },
];

export const SECTION_LABELS = SECTION_OPTIONS.reduce((acc, opt) => {
  acc[opt.value] = opt.label;
  return acc;
}, {});
