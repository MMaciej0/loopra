import { describe, expect, it } from 'vitest';
import { anyInView, boundsOf, revealOffset } from './map-geometry';

const container = { left: 0, top: 0, right: 1000, bottom: 800, width: 1000 };

describe('revealOffset', () => {
  const sidePanel = { left: 12, top: 400, right: 372, bottom: 788, width: 360 };

  it('leaves a point clear of the panel alone', () => {
    expect(revealOffset({ x: 600, y: 500 }, sidePanel, container)).toBeNull();
  });

  it('shifts right by half the panel edge when a side panel covers the point', () => {
    expect(revealOffset({ x: 200, y: 500 }, sidePanel, container)).toEqual([186, 0]);
  });

  it('counts a point within the clearance margin as covered', () => {
    expect(revealOffset({ x: 390, y: 500 }, sidePanel, container)).toEqual([186, 0]);
  });

  it('shifts up by half the sheet height when a bottom sheet covers the point', () => {
    const bottomSheet = { left: 0, top: 500, right: 1000, bottom: 800, width: 1000 };
    expect(revealOffset({ x: 500, y: 700 }, bottomSheet, container)).toEqual([0, -150]);
  });

  it('measures relative to a container that is not at the page origin', () => {
    const offsetContainer = { left: 100, top: 50, right: 1100, bottom: 850, width: 1000 };
    const panel = { left: 112, top: 450, right: 472, bottom: 838, width: 360 };
    expect(revealOffset({ x: 200, y: 500 }, panel, offsetContainer)).toEqual([186, 0]);
  });
});

describe('boundsOf', () => {
  it('spans every point', () => {
    expect(
      boundsOf([
        { lng: 19.9, lat: 50.1 },
        { lng: 20.1, lat: 49.9 },
        { lng: 20, lat: 50 },
      ]),
    ).toEqual([
      [19.9, 49.9],
      [20.1, 50.1],
    ]);
  });
});

describe('anyInView', () => {
  const view: [[number, number], [number, number]] = [
    [19.9, 49.9],
    [20.1, 50.1],
  ];

  it('is true when a point lies inside the view', () => {
    expect(
      anyInView(view, [
        { lng: 21, lat: 50 },
        { lng: 20, lat: 50 },
      ]),
    ).toBe(true);
  });

  it('counts a point on the edge as inside', () => {
    expect(anyInView(view, [{ lng: 20.1, lat: 49.9 }])).toBe(true);
  });

  it('is false when every point lies outside the view', () => {
    expect(
      anyInView(view, [
        { lng: 21, lat: 50 },
        { lng: 20, lat: 51 },
      ]),
    ).toBe(false);
  });
});
