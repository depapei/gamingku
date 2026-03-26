export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  image?: string;
  createdBy?: number;
}
