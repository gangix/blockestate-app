interface Window {
  ethereum?: {
    on?: (event: string, callback: (...args: any[]) => void) => void;
    removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    [key: string]: any; // For other Ethereum properties
  };
}
