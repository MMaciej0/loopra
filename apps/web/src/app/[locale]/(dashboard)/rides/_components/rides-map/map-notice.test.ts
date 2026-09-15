import { describe, expect, it } from 'vitest';
import { mapNotice } from './map-notice';

describe('mapNotice', () => {
  it('shows loading while start points load', () => {
    expect(mapNotice({ status: 'loading', startPointCount: 0, hasStartPointInView: null })).toBe(
      'loading',
    );
  });

  it('shows the error when loading failed', () => {
    expect(mapNotice({ status: 'error', startPointCount: 0, hasStartPointInView: null })).toBe(
      'error',
    );
  });

  it('shows empty when there are no start points', () => {
    expect(mapNotice({ status: 'done', startPointCount: 0, hasStartPointInView: null })).toBe(
      'empty',
    );
  });

  it('shows out-of-view when no start point is in view', () => {
    expect(mapNotice({ status: 'done', startPointCount: 3, hasStartPointInView: false })).toBe(
      'out-of-view',
    );
  });

  it('shows nothing when a start point is in view', () => {
    expect(mapNotice({ status: 'done', startPointCount: 3, hasStartPointInView: true })).toBeNull();
  });

  it('shows nothing before the view has been measured', () => {
    expect(mapNotice({ status: 'done', startPointCount: 3, hasStartPointInView: null })).toBeNull();
  });
});
