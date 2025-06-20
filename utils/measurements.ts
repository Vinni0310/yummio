import { MeasurementSystem } from '@/context/LocationContext';

export interface Measurement {
  value: number;
  unit: string;
  originalValue: number;
  originalUnit: string;
}

// Conversion factors to metric base units
const CONVERSIONS = {
  // Volume conversions to milliliters
  volume: {
    'ml': 1,
    'l': 1000,
    'cup': 236.588,
    'cups': 236.588,
    'tbsp': 14.787,
    'tablespoon': 14.787,
    'tablespoons': 14.787,
    'tsp': 4.929,
    'teaspoon': 4.929,
    'teaspoons': 4.929,
    'fl oz': 29.574,
    'fluid ounce': 29.574,
    'fluid ounces': 29.574,
    'pint': 473.176,
    'pints': 473.176,
    'quart': 946.353,
    'quarts': 946.353,
    'gallon': 3785.41,
    'gallons': 3785.41,
  },
  // Weight conversions to grams
  weight: {
    'g': 1,
    'gram': 1,
    'grams': 1,
    'kg': 1000,
    'kilogram': 1000,
    'kilograms': 1000,
    'oz': 28.3495,
    'ounce': 28.3495,
    'ounces': 28.3495,
    'lb': 453.592,
    'pound': 453.592,
    'pounds': 453.592,
  },
  // Temperature conversions to Celsius
  temperature: {
    'c': (temp: number) => temp,
    'celsius': (temp: number) => temp,
    'f': (temp: number) => (temp - 32) * 5/9,
    'fahrenheit': (temp: number) => (temp - 32) * 5/9,
  }
};

// Preferred units by system
const PREFERRED_UNITS = {
  metric: {
    volume: {
      small: 'ml',    // < 100ml
      medium: 'ml',   // 100-999ml
      large: 'l',     // >= 1000ml
    },
    weight: {
      small: 'g',     // < 1000g
      large: 'kg',    // >= 1000g
    },
    temperature: 'c',
  },
  imperial: {
    volume: {
      small: 'tsp',   // < 3 tsp
      medium: 'tbsp', // 3 tsp - 16 tbsp
      large: 'cup',   // >= 16 tbsp
    },
    weight: {
      small: 'oz',    // < 16 oz
      large: 'lb',    // >= 16 oz
    },
    temperature: 'f',
  }
};

export function parseIngredient(ingredient: string): {
  amount?: number;
  unit?: string;
  ingredient: string;
} {
  // Match patterns like "2 cups flour", "1/2 tsp salt", "250ml milk"
  const patterns = [
    /^(\d+(?:\.\d+)?|\d+\/\d+|\d+\s+\d+\/\d+)\s*([a-zA-Z]+)\s+(.+)$/,
    /^(\d+(?:\.\d+)?|\d+\/\d+|\d+\s+\d+\/\d+)\s*([a-zA-Z]+)?\s*(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = ingredient.match(pattern);
    if (match) {
      const [, amountStr, unit, ingredientName] = match;
      
      // Parse fractions and mixed numbers
      let amount = 0;
      if (amountStr.includes('/')) {
        if (amountStr.includes(' ')) {
          // Mixed number like "1 1/2"
          const [whole, fraction] = amountStr.split(' ');
          const [num, den] = fraction.split('/');
          amount = parseInt(whole) + parseInt(num) / parseInt(den);
        } else {
          // Simple fraction like "1/2"
          const [num, den] = amountStr.split('/');
          amount = parseInt(num) / parseInt(den);
        }
      } else {
        amount = parseFloat(amountStr);
      }

      return {
        amount,
        unit: unit?.toLowerCase(),
        ingredient: ingredientName.trim(),
      };
    }
  }

  return { ingredient: ingredient.trim() };
}

export function convertMeasurement(
  amount: number,
  fromUnit: string,
  toSystem: MeasurementSystem
): Measurement {
  const originalValue = amount;
  const originalUnit = fromUnit;
  
  fromUnit = fromUnit.toLowerCase();
  
  // Determine measurement type
  let measurementType: 'volume' | 'weight' | 'temperature' | null = null;
  
  if (CONVERSIONS.volume[fromUnit as keyof typeof CONVERSIONS.volume]) {
    measurementType = 'volume';
  } else if (CONVERSIONS.weight[fromUnit as keyof typeof CONVERSIONS.weight]) {
    measurementType = 'weight';
  } else if (CONVERSIONS.temperature[fromUnit as keyof typeof CONVERSIONS.temperature]) {
    measurementType = 'temperature';
  }

  if (!measurementType) {
    // Return original if we can't convert
    return {
      value: amount,
      unit: fromUnit,
      originalValue,
      originalUnit,
    };
  }

  if (measurementType === 'temperature') {
    const converter = CONVERSIONS.temperature[fromUnit as keyof typeof CONVERSIONS.temperature];
    const celsiusValue = typeof converter === 'function' ? converter(amount) : amount;
    
    if (toSystem === 'imperial') {
      return {
        value: Math.round((celsiusValue * 9/5 + 32) * 10) / 10,
        unit: '°F',
        originalValue,
        originalUnit,
      };
    } else {
      return {
        value: Math.round(celsiusValue * 10) / 10,
        unit: '°C',
        originalValue,
        originalUnit,
      };
    }
  }

  // Convert to base unit first
  const conversionFactor = measurementType === 'volume' 
    ? CONVERSIONS.volume[fromUnit as keyof typeof CONVERSIONS.volume]
    : CONVERSIONS.weight[fromUnit as keyof typeof CONVERSIONS.weight];
    
  if (!conversionFactor) {
    return {
      value: amount,
      unit: fromUnit,
      originalValue,
      originalUnit,
    };
  }

  const baseValue = amount * conversionFactor;
  
  // Convert to preferred unit for target system
  const preferredUnits = PREFERRED_UNITS[toSystem];
  
  if (measurementType === 'volume') {
    const { small, medium, large } = preferredUnits.volume;
    
    if (toSystem === 'metric') {
      if (baseValue >= 1000) {
        return {
          value: Math.round((baseValue / 1000) * 100) / 100,
          unit: large,
          originalValue,
          originalUnit,
        };
      } else {
        return {
          value: Math.round(baseValue),
          unit: baseValue < 100 ? small : medium,
          originalValue,
          originalUnit,
        };
      }
    } else {
      // Imperial system
      const tspValue = baseValue / CONVERSIONS.volume.tsp;
      const tbspValue = baseValue / CONVERSIONS.volume.tbsp;
      const cupValue = baseValue / CONVERSIONS.volume.cup;
      
      if (tspValue < 3) {
        return {
          value: Math.round(tspValue * 4) / 4, // Round to nearest 1/4
          unit: tspValue === 1 ? 'tsp' : 'tsp',
          originalValue,
          originalUnit,
        };
      } else if (tbspValue < 16) {
        return {
          value: Math.round(tbspValue * 4) / 4,
          unit: tbspValue === 1 ? 'tbsp' : 'tbsp',
          originalValue,
          originalUnit,
        };
      } else {
        return {
          value: Math.round(cupValue * 4) / 4,
          unit: cupValue === 1 ? 'cup' : 'cups',
          originalValue,
          originalUnit,
        };
      }
    }
  } else {
    // Weight
    if (toSystem === 'metric') {
      if (baseValue >= 1000) {
        return {
          value: Math.round((baseValue / 1000) * 100) / 100,
          unit: 'kg',
          originalValue,
          originalUnit,
        };
      } else {
        return {
          value: Math.round(baseValue),
          unit: 'g',
          originalValue,
          originalUnit,
        };
      }
    } else {
      // Imperial system
      const ozValue = baseValue / CONVERSIONS.weight.oz;
      const lbValue = baseValue / CONVERSIONS.weight.lb;
      
      if (ozValue < 16) {
        return {
          value: Math.round(ozValue * 4) / 4,
          unit: ozValue === 1 ? 'oz' : 'oz',
          originalValue,
          originalUnit,
        };
      } else {
        return {
          value: Math.round(lbValue * 4) / 4,
          unit: lbValue === 1 ? 'lb' : 'lbs',
          originalValue,
          originalUnit,
        };
      }
    }
  }
}

export function formatMeasurement(measurement: Measurement): string {
  const { value, unit } = measurement;
  
  // Format fractions for imperial measurements
  if (unit && ['tsp', 'tbsp', 'cup', 'cups', 'oz', 'lb', 'lbs'].includes(unit)) {
    const fraction = convertToFraction(value);
    if (fraction !== value.toString()) {
      return `${fraction} ${unit}`;
    }
  }
  
  // Format decimal places
  const formattedValue = value % 1 === 0 ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '');
  
  return `${formattedValue} ${unit}`;
}

function convertToFraction(decimal: number): string {
  if (decimal % 1 === 0) return decimal.toString();
  
  const commonFractions: { [key: number]: string } = {
    0.25: '1/4',
    0.33: '1/3',
    0.5: '1/2',
    0.67: '2/3',
    0.75: '3/4',
    1.25: '1 1/4',
    1.33: '1 1/3',
    1.5: '1 1/2',
    1.67: '1 2/3',
    1.75: '1 3/4',
    2.25: '2 1/4',
    2.33: '2 1/3',
    2.5: '2 1/2',
    2.67: '2 2/3',
    2.75: '2 3/4',
  };
  
  const rounded = Math.round(decimal * 4) / 4; // Round to nearest 1/4
  return commonFractions[rounded] || decimal.toString();
}

export function convertIngredientList(
  ingredients: string[],
  targetSystem: MeasurementSystem
): string[] {
  return ingredients.map(ingredient => {
    const parsed = parseIngredient(ingredient);
    
    if (!parsed.amount || !parsed.unit) {
      return ingredient;
    }
    
    const converted = convertMeasurement(parsed.amount, parsed.unit, targetSystem);
    const formattedMeasurement = formatMeasurement(converted);
    
    return `${formattedMeasurement} ${parsed.ingredient}`;
  });
}