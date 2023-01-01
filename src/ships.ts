export type Ship = 'light_fighter' | 'heavy_fighter' | 'small_transporter' | 'large_transporter' | 'battle_ship' | 'mothership';
export type Fleet = Partial<Record<Ship, number>>;

export type FleetWithSpecs = Partial<Record<Ship, Array<ShipSpecs>>>;

export interface ShipSpecs {
    hull: number;
    shields: number;
    weapons: number;
}

export type ShipSpecsByType = Record<Ship, ShipSpecs>;
export type ShipSpecProvider = (ship: Ship) => ShipSpecs;