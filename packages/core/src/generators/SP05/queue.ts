/** Settings for single-server (M/M/1) questions: who arrives, where, and who serves. */
export const MM1_CONTEXTS = {
  bank: {
    place: 'a bank branch with one teller',
    thing: 'customer',
    things: 'customers',
    server: 'the teller',
    inside: 'in the branch',
  },
  petrol: {
    place: 'a petrol station with a single pump',
    thing: 'car',
    things: 'cars',
    server: 'the pump',
    inside: 'at the station',
  },
  calls: {
    place: 'a small help line with one agent',
    thing: 'call',
    things: 'calls',
    server: 'the agent',
    inside: 'in the system',
  },
  service: {
    place: 'one desk of a public service centre',
    thing: 'visitor',
    things: 'visitors',
    server: 'the clerk',
    inside: 'at the desk',
  },
  clinic: {
    place: "a walk-in clinic's triage nurse",
    thing: 'patient',
    things: 'patients',
    server: 'the nurse',
    inside: 'at triage',
  },
} as const;

export type Mm1Context = keyof typeof MM1_CONTEXTS;

/** The opening sentences of an M/M/1 question: Poisson arrivals at rate λ, exponential service at rate μ. */
export function mm1Setting(context: Mm1Context, lambda: number, mu: number): string {
  const c = MM1_CONTEXTS[context];
  return `${c.things[0]?.toUpperCase()}${c.things.slice(1)} arrive at ${c.place} as a Poisson process, on average $${lambda}$ per hour. Service times are exponential, and ${c.server} can serve on average $${mu}$ ${c.things} per hour.`;
}

/** Average number in an M/M/1 system, L = λ/(μ − λ). */
export const mm1L = (lambda: number, mu: number) => lambda / (mu - lambda);
/** Average number waiting in an M/M/1 queue, Lq = λ²/(μ(μ − λ)). */
export const mm1Lq = (lambda: number, mu: number) => (lambda * lambda) / (mu * (mu - lambda));
/** Average number in an M/M/2 system with one shared queue, L = 2ρ/(1 − ρ²), ρ = λ/(2μ). */
export function mm2L(lambda: number, mu: number): number {
  const rho = lambda / (2 * mu);
  return (2 * rho) / (1 - rho * rho);
}
/** Average number waiting in an M/M/2 queue, Lq = 2ρ³/(1 − ρ²), ρ = λ/(2μ). */
export function mm2Lq(lambda: number, mu: number): number {
  const rho = lambda / (2 * mu);
  return (2 * rho ** 3) / (1 - rho * rho);
}
