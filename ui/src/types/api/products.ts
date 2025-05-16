export interface ProductAttributes {
  code: string;
  name: string;
  description: string | null;
  image_url: string | null;
  pieces_per_pack: number;
  weight: number;
  unit_of_weight: string;
  hs_tariff_number: string;
  do_not_ship: boolean;
  do_not_track: boolean;
  created_at: string;
  updated_at: string;
  reference: string | null;
  reference_origin: string | null;
  metadata: Record<string, unknown>;
}

export interface ProductRelationships {
  // Add relationships as needed
  [key: string]: any;
}

export interface Product {
  id: string;
  type: string;
  attributes: ProductAttributes;
  relationships?: ProductRelationships;
  links?: {
    self: string;
  };
}

export interface ProductsResponse {
  data: Product[];
  meta?: {
    record_count: number;
    page_count: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ProductsQueryParams {
  market: string;
  category?: string;
  page?: number;
  perPage?: number;
}
