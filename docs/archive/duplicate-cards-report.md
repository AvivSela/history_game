# Duplicate Cards Analysis Report

## Summary
- **Total cards across all migrations**: 107
- **Unique titles**: 92
- **Duplicate titles**: 15
- **Files analyzed**: 3 migration files

## Duplicate Cards Found

### 1. World War II ends (1945-09-02)
- **File**: `002_sample_data.sql`
- **Description**: Japan formally surrendered aboard the USS Missouri in Tokyo Bay
- **File**: `002_sample_data.sql` (duplicate)
- **Description**: Japan formally surrenders aboard the USS Missouri, ending World War II

### 2. First Moon Landing (1969-07-20)
- **File**: `002_sample_data.sql`
- **Description**: Apollo 11 mission successfully lands Neil Armstrong and Buzz Aldrin on the moon
- **File**: `002_sample_data.sql` (duplicate)
- **Description**: Apollo 11 mission successfully lands Neil Armstrong and Buzz Aldrin on the moon

### 3. Berlin Wall falls (1989-11-09)
- **File**: `002_sample_data.sql`
- **Description**: The barrier dividing East and West Berlin is torn down
- **File**: `004_add_more_events.sql`
- **Description**: The Berlin Wall dividing East and West Germany is torn down
- **File**: `005_additional_historical_events.sql`
- **Description**: The Berlin Wall dividing East and West Germany is torn down

### 4. Titanic sinks (1912-04-15)
- **File**: `002_sample_data.sql`
- **Description**: The RMS Titanic sinks on its maiden voyage
- **File**: `005_additional_historical_events.sql`
- **Description**: The RMS Titanic sinks on its maiden voyage after hitting an iceberg

### 5. Wright Brothers first flight (1903-12-17)
- **File**: `002_sample_data.sql`
- **Description**: First powered, sustained, and controlled heavier-than-air human flight
- **File**: `005_additional_historical_events.sql`
- **Description**: First powered, sustained, and controlled heavier-than-air human flight

### 6. World Wide Web invented (1989-03-12)
- **File**: `002_sample_data.sql`
- **Description**: Tim Berners-Lee proposes the World Wide Web
- **File**: `004_add_more_events.sql`
- **Description**: Tim Berners-Lee proposes the World Wide Web

### 7. American Civil War ends (1865-04-09)
- **File**: `002_sample_data.sql`
- **Description**: Confederate General Lee surrenders to Union General Grant
- **File**: `005_additional_historical_events.sql`
- **Description**: Confederate General Robert E. Lee surrenders to Union General Ulysses S. Grant

### 8. Julius Caesar assassinated (0044-03-15)
- **File**: `004_add_more_events.sql`
- **Description**: Roman dictator Julius Caesar is assassinated by senators
- **File**: `005_additional_historical_events.sql`
- **Description**: Julius Caesar is assassinated by Roman senators on the Ides of March (44 BC)

### 9. Magna Carta signed (1215-06-15)
- **File**: `004_add_more_events.sql`
- **Description**: King John of England signs the Magna Carta
- **File**: `005_additional_historical_events.sql`
- **Description**: King John of England signs the Magna Carta, establishing the principle of limited government

### 10. American Civil War begins (1861-04-12)
- **File**: `004_add_more_events.sql`
- **Description**: The American Civil War begins with the attack on Fort Sumter
- **File**: `005_additional_historical_events.sql`
- **Description**: The American Civil War begins with the Confederate attack on Fort Sumter

### 11. Eiffel Tower completed (1889-03-31)
- **File**: `004_add_more_events.sql`
- **Description**: The Eiffel Tower is completed in Paris
- **File**: `005_additional_historical_events.sql`
- **Description**: The Eiffel Tower is completed in Paris for the World's Fair

### 12. World War I begins (1914-07-28)
- **File**: `004_add_more_events.sql`
- **Description**: World War I begins with Austria-Hungary declaring war on Serbia
- **File**: `005_additional_historical_events.sql`
- **Description**: World War I begins with Austria-Hungary declaring war on Serbia

### 13. World War II begins (1939-09-01)
- **File**: `004_add_more_events.sql`
- **Description**: Germany invades Poland, starting World War II
- **File**: `005_additional_historical_events.sql`
- **Description**: Germany invades Poland, starting World War II

### 14. Pearl Harbor attack (1941-12-07)
- **File**: `004_add_more_events.sql`
- **Description**: Japan attacks Pearl Harbor, bringing US into World War II
- **File**: `005_additional_historical_events.sql`
- **Description**: Japan attacks Pearl Harbor, bringing the United States into World War II

## Similar Titles (Different wording)

### 15. Columbus reaches America vs Christopher Columbus reaches Americas (1492-10-12)
- **File**: `004_add_more_events.sql`
- **Title**: Columbus reaches America
- **File**: `005_additional_historical_events.sql`
- **Title**: Christopher Columbus reaches Americas

## Recommendations

### Immediate Actions Needed:
1. **Remove duplicates from migration files** - Keep only one instance of each card
2. **Standardize descriptions** - Choose the most accurate and detailed description
3. **Consolidate similar titles** - Decide on consistent naming conventions

### Suggested Approach:
1. **Keep the most detailed description** for each duplicate
2. **Remove duplicates from earlier migration files** (002 and 004)
3. **Keep the version in the latest migration** (005) as the authoritative version
4. **Create a new migration** to clean up any remaining duplicates in the database

### Files to Update:
- `002_sample_data.sql` - Remove 8 duplicate cards
- `004_add_more_events.sql` - Remove 7 duplicate cards
- `005_additional_historical_events.sql` - Keep all cards (most recent)

### Impact:
- **Reduced total cards**: From 107 to 92 unique cards
- **Improved data quality**: No duplicate entries
- **Better game experience**: Players won't see the same event multiple times
- **Easier maintenance**: Single source of truth for each historical event

## Next Steps
1. Create a cleanup migration script
2. Update the migration files to remove duplicates
3. Test the database to ensure no duplicates remain
4. Update any references to the removed cards in the application code 