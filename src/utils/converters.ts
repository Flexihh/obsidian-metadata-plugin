// converters.ts
import { CategoryDefinition, TableRow, MetadataValues } from '../types'

export const DEFAULT_ADD_ROW: TableRow = {
  id: 0,
  category: '',
  tags: [],
  inputValue: '',
  textContent: ''
};

export function convertMetadataValuesToCategoryRows(
  metadataValues: MetadataValues | undefined,
  categories: CategoryDefinition[]
): TableRow[] {
  if (!metadataValues) return [DEFAULT_ADD_ROW];

  const rows: TableRow[] = [];
  let nextId = 1;

  categories.forEach(category => {
    if (Array.isArray(category.key)) {
      const allTags = category.key
        .flatMap(key => metadataValues[key] || [])
        .filter((tag, index, self) => self.indexOf(tag) === index);
      
      if (allTags.length > 0) {
        rows.push({
          id: nextId++,
          category: category.label,
          tags: allTags,
          inputValue: '',
          textContent: ''
        });
      }
    } else {
      const value = metadataValues[category.key];
      if (value) {
        rows.push({
          id: nextId++,
          category: category.label,
          tags: [],
          inputValue: '',
          textContent: String(value)
        });
      }
    }
  });

  rows.push(DEFAULT_ADD_ROW);
  return rows;
}

export function convertCategoryRowsToMetadataValues(
  rows: TableRow[],
  categories: CategoryDefinition[]
): MetadataValues {
  const metadataValues: MetadataValues = {};
  
  rows.filter(row => !row.isDeleted && row.id !== 0).forEach(row => {
    const category = categories.find(cat => cat.label === row.category);
    if (!category) return;

    if (Array.isArray(category.key)) {
      category.key.forEach(key => {
        metadataValues[key] = [...row.tags];
      });
    } else {
      const value = row.textContent.trim();
      if (value) {
        metadataValues[category.key] = value;
      }
    }
  });

  return metadataValues;
}