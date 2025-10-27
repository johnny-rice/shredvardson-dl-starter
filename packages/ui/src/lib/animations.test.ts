import { describe, expect, it } from 'vitest';
import {
  type AnimationCustomProps,
  fadeIn,
  getReducedMotionVariants,
  scale,
  slideInRight,
  slideUp,
} from './animations';

describe('Animation Variants', () => {
  describe('fadeIn', () => {
    it('should have hidden state with opacity 0', () => {
      expect(fadeIn.hidden).toEqual({ opacity: 0 });
    });

    it('should have visible state with opacity 1 and easeOut transition', () => {
      expect(fadeIn.visible).toMatchObject({
        opacity: 1,
        transition: {
          duration: 0.3,
          ease: 'easeOut',
        },
      });
    });
  });

  describe('slideUp', () => {
    it('should have hidden state with opacity 0 and y offset', () => {
      expect(slideUp.hidden).toEqual({ opacity: 0, y: 20 });
    });

    it('should have visible state with opacity 1 and y 0', () => {
      expect(slideUp.visible).toMatchObject({
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: 'easeOut',
        },
      });
    });
  });

  describe('scale', () => {
    it('should have hidden state with opacity 0 and scale 0.95', () => {
      expect(scale.hidden).toEqual({ opacity: 0, scale: 0.95 });
    });

    it('should have visible state with opacity 1 and scale 1', () => {
      expect(scale.visible).toMatchObject({
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.3,
          ease: 'easeOut',
        },
      });
    });
  });

  describe('slideInRight', () => {
    it('should have hidden state with opacity 0 and x offset', () => {
      expect(slideInRight.hidden).toEqual({ opacity: 0, x: 20 });
    });

    it('should have visible state with opacity 1 and x 0', () => {
      expect(slideInRight.visible).toMatchObject({
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.4,
          ease: 'easeOut',
        },
      });
    });
  });
});

describe('getReducedMotionVariants', () => {
  it('should reduce animation duration to 0.01s', () => {
    const reduced = getReducedMotionVariants(fadeIn);

    expect(reduced.visible).toMatchObject({
      transition: {
        duration: 0.01,
        ease: 'linear',
      },
    });
  });

  it('should remove transform properties while keeping opacity', () => {
    const reduced = getReducedMotionVariants(slideUp);

    expect(reduced.visible).toMatchObject({
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
    });
  });

  it('should handle scale animations', () => {
    const reduced = getReducedMotionVariants(scale);

    expect(reduced.visible).toMatchObject({
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.01,
        ease: 'linear',
      },
    });
  });

  it('should handle horizontal slide animations', () => {
    const reduced = getReducedMotionVariants(slideInRight);

    expect(reduced.visible).toMatchObject({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.01,
        ease: 'linear',
      },
    });
  });

  it('should preserve all variant keys from original', () => {
    const reduced = getReducedMotionVariants(fadeIn);

    expect(Object.keys(reduced)).toEqual(Object.keys(fadeIn));
  });

  it('should preserve function-based variants', () => {
    const functionVariants = {
      hidden: { opacity: 0 },
      visible: (custom: { delay: number }) => ({
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          delay: custom.delay,
        },
      }),
    };

    const reduced = getReducedMotionVariants(functionVariants);

    // Should preserve the function
    expect(typeof reduced.visible).toBe('function');

    // Function should return reduced motion values
    const result = (reduced.visible as (custom: { delay: number }) => unknown)({ delay: 0.2 });
    expect(result).toMatchObject({
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.01,
        ease: 'linear',
      },
    });
  });

  it('should handle empty variants object', () => {
    const reduced = getReducedMotionVariants({});
    expect(reduced).toEqual({});
  });
});

describe('AnimationCustomProps type', () => {
  it('should allow prefersReducedMotion property', () => {
    const props: AnimationCustomProps = {
      prefersReducedMotion: true,
    };

    expect(props.prefersReducedMotion).toBe(true);
  });

  it('should allow undefined prefersReducedMotion', () => {
    const props: AnimationCustomProps = {};

    expect(props.prefersReducedMotion).toBeUndefined();
  });
});
