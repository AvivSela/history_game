import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  AnimationQueue,
  globalAnimationQueue,
  queueAnimation,
  queueCardAnimation,
  queueParallelAnimations,
  queueSequentialAnimations,
} from '../utils/animation/AnimationQueue.js';

describe('AnimationQueue', () => {
  let queue;

  beforeEach(() => {
    queue = new AnimationQueue();
    globalAnimationQueue.clear();
  });

  afterEach(() => {
    queue.clear();
    globalAnimationQueue.clear();
  });

  describe('Basic Functionality', () => {
    it('processes animations in order', async () => {
      const results = [];

      for (let i = 0; i < 3; i++) {
        const animation = vi.fn().mockImplementation(() => {
          results.push(i);
          return Promise.resolve();
        });
        queue.add(animation);
      }

      await queue.waitForAll();

      expect(results).toEqual([0, 1, 2]);
      expect(queue.getStatus().queueLength).toBe(0);
    });

    it('handles animation errors gracefully', async () => {
      const errorAnimation = vi.fn().mockRejectedValue(new Error('Animation failed'));
      const successAnimation = vi.fn().mockResolvedValue();

      queue.add(errorAnimation);
      queue.add(successAnimation);

      await queue.waitForAll();

      expect(successAnimation).toHaveBeenCalled();
      expect(queue.getStatus().queueLength).toBe(0);
    });

    it('prioritizes high priority animations', async () => {
      const results = [];

      const normalAnimation = vi.fn().mockImplementation(() => {
        results.push('normal');
        return new Promise(resolve => setTimeout(resolve, 10));
      });

      const highAnimation = vi.fn().mockImplementation(() => {
        results.push('high');
        return new Promise(resolve => setTimeout(resolve, 10));
      });

      queue.add(normalAnimation, 'normal');
      queue.add(highAnimation, 'high');

      await queue.waitForAll();

      expect(results).toContain('high');
      expect(results).toContain('normal');
    });
  });

  describe('Queue Operations', () => {
    it('clears all animations', async () => {
      const animation1 = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50)));
      const animation2 = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50)));

      queue.add(animation1);
      queue.add(animation2);

      await new Promise(resolve => setTimeout(resolve, 10));
      queue.clear();

      expect(queue.getStatus().queueLength).toBe(0);
      expect(queue.getStatus().activeAnimations).toBe(0);
    });

    it('waits for all animations to complete', async () => {
      const animation = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50)));

      queue.add(animation);
      queue.add(animation);

      const startTime = Date.now();
      await queue.waitForAll();
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(50);
    });
  });
});

describe('Global Animation Queue', () => {
  beforeEach(() => {
    globalAnimationQueue.clear();
  });

  afterEach(() => {
    globalAnimationQueue.clear();
  });

  it('maintains state across operations', async () => {
    const animation = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50)));

    globalAnimationQueue.add(animation);

    await new Promise(resolve => setTimeout(resolve, 20));

    expect(globalAnimationQueue.getStatus().activeAnimations).toBe(1);

    await globalAnimationQueue.waitForAll();
  });
});

describe('Queue Utility Functions', () => {
  beforeEach(() => {
    globalAnimationQueue.clear();
  });

  afterEach(() => {
    globalAnimationQueue.clear();
  });

  describe('queueAnimation', () => {
    it('adds animation to global queue', async () => {
      const animation = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50)));

      queueAnimation(animation);

      await new Promise(resolve => setTimeout(resolve, 20));

      expect(globalAnimationQueue.getStatus().activeAnimations).toBe(1);

      await globalAnimationQueue.waitForAll();
    });
  });

  describe('queueCardAnimation', () => {
    it('creates card animation', async () => {
      const element = document.createElement('div');
      const animationClass = 'test-animation';
      const duration = 100;

      queueCardAnimation(element, animationClass, duration);

      await globalAnimationQueue.waitForAll();

      expect(element.classList.contains('card-animating')).toBe(false);
      expect(element.classList.contains(animationClass)).toBe(false);
    });
  });

  describe('queueParallelAnimations', () => {
    it('runs animations in parallel', async () => {
      const results = [];

      const animation1 = vi.fn().mockImplementation(() => {
        results.push(1);
        return Promise.resolve();
      });

      const animation2 = vi.fn().mockImplementation(() => {
        results.push(2);
        return Promise.resolve();
      });

      queueParallelAnimations([animation1, animation2]);

      await globalAnimationQueue.waitForAll();

      expect(results).toContain(1);
      expect(results).toContain(2);
    });
  });

  describe('queueSequentialAnimations', () => {
    it('runs animations in sequence', async () => {
      const results = [];

      const animation1 = vi.fn().mockImplementation(() => {
        results.push(1);
        return Promise.resolve();
      });

      const animation2 = vi.fn().mockImplementation(() => {
        results.push(2);
        return Promise.resolve();
      });

      queueSequentialAnimations([animation1, animation2]);

      await globalAnimationQueue.waitForAll();

      expect(results).toEqual([1, 2]);
    });
  });
});
