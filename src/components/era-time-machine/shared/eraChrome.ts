import type { EraSurfaceProps } from "./EraSurface";

/** True when archetype is rendered inside EraTimeMachine (hide duplicate transport). */
export function hideArchetypeTransport(props: Pick<EraSurfaceProps, "embedMode">): boolean {
  return props.embedMode === true;
}
