export interface Venue {
  id: number;
  name: string;
  address: string;
  postcode: string;
  state: AustralianState;
  capacity: number;
  hourlyRate: number;
}

type AustralianState = "NSW" | "VIC" | "QLD" | "SA" | "NT" | "WA" | "ACT"
  | "TAS";
