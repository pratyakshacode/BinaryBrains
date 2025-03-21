export function isInvalid(value: unknown): boolean {
    return (
      value === null || 
      value === undefined || 
      (typeof value === "string" && value.trim() === "") || 
      (Array.isArray(value) && value.length === 0) || 
      (typeof value === "object" && Object.keys(value || {}).length === 0) ||
      (typeof value === "number" && isNaN(value))
    );
  }