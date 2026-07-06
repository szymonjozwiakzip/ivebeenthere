declare module 'topojson-client' {
  import type { Topology, GeometryCollection } from 'topojson-specification';
  import type { FeatureCollection, Feature, Geometry } from 'geojson';

  export function feature<P = Record<string, unknown>>(
    topology: Topology,
    object: GeometryCollection<P> | string,
  ): FeatureCollection | Feature;
}
