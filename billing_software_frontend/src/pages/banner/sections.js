export const SECTION_OPTIONS = [
  { value: "home_top", label: "Home Top Banner (carousel)" },
  { value: "brand_logo", label: "Brand Logos (under main banner)" },
  { value: "deal_of_day", label: "Deal of the Day (below banner)" },
  { value: "laptop_deals", label: "Laptop Deals (colored offer cards)" },
  { value: "client_logos", label: "Client Logos (auto-scroll strip)" },
  { value: "testimonial", label: "Customer Reviews (testimonials)" },
];

export const SECTION_LABELS = SECTION_OPTIONS.reduce((acc, opt) => {
  acc[opt.value] = opt.label;
  return acc;
}, {});
