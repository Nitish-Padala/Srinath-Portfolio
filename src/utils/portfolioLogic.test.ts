import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateInitial150Photos,
  generateInitial108Photos,
  generateInitial40Photos,
  getPhotosByRatio,
  getSlidingWindow,
  ASPECT_RATIO_CATEGORIES,
  getUniqueGallerySections,
  getPortraitTrioWindow,
  filterPhotosByMood,
  handleStackZoneInteraction,
  computeOrbPositions,
  getInterleavedGlobePhotos,
  buildTelUrl,
  buildWhatsAppUrl,
  buildMailtoUrl,
  validateBookingInquiry,
  evaluateFullscreenSwipeGesture,
  computeSwipeVisualTransform,
  shouldTriggerThresholdHaptic,
  triggerHapticFeedback,
  HAPTIC_PATTERNS,
} from './portfolioLogic';

test('generateInitial150Photos creates exactly 150 photos across 5 aspect ratio categories (30 each: 1:1, 3:4, 4:3, 9:16, 16:9)', () => {
  const photos = generateInitial150Photos();
  assert.equal(photos.length, 150);
  assert.equal(generateInitial108Photos().length, 150);
  assert.equal(generateInitial40Photos().length, 150);

  const uniqueIds = new Set(photos.map((p) => p.id));
  assert.equal(uniqueIds.size, 150);

  // Assert 5 categories, each containing exactly 30 images
  const expectedRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'] as const;
  assert.equal(ASPECT_RATIO_CATEGORIES.length, 5);

  for (const cat of ASPECT_RATIO_CATEGORIES) {
    const list = getPhotosByRatio(photos, cat.id);
    assert.equal(list.length, 30, `Expected exactly 30 images in category ${cat.id}`);
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      const folderKey = cat.id.replace(':', '-');
      const expectedNum = String(i + 1).padStart(2, '0');
      assert.equal(p.imageUrl, `/photos/ratio-${folderKey}/photo-${expectedNum}.jpg`);
      assert.equal(p.aspectRatio, cat.id);
      assert.ok(p.tileW > 0 && p.tileH > 0);
    }
  }

  // Verify getSlidingWindow produces smooth sliding carousel windows
  const list34 = getPhotosByRatio(photos, '3:4');
  const window3_0 = getSlidingWindow(list34, 0, 3);
  const window3_1 = getSlidingWindow(list34, 1, 3);
  assert.equal(window3_0.length, 3);
  assert.equal(window3_1.length, 3);
  assert.equal(window3_1[0].id, window3_0[1].id);
  assert.equal(window3_1[1].id, window3_0[2].id);

  // Interleaved globe list has exactly 150 photos distributed across all 5 ratios
  const globePhotos = getInterleavedGlobePhotos(photos);
  assert.equal(globePhotos.length, 150);
  assert.equal(globePhotos[0].aspectRatio, '1:1');
  assert.equal(globePhotos[1].aspectRatio, '3:4');
  assert.equal(globePhotos[2].aspectRatio, '4:3');
  assert.equal(globePhotos[3].aspectRatio, '9:16');
  assert.equal(globePhotos[4].aspectRatio, '16:9');
});

test('handleStackZoneInteraction follows phone recent-tabs rules (left moves stack, middle opens fullscreen, any click in fullscreen returns back)', () => {
  const initialState = { activeIndex: 0, isFullscreen: false, returnView: 'recent-tabs' as const };

  const afterLeft = handleStackZoneInteraction(initialState, 'left', 27);
  assert.equal(afterLeft.activeIndex, 1);
  assert.equal(afterLeft.isFullscreen, false);

  const afterMiddle = handleStackZoneInteraction(afterLeft, 'middle', 27);
  assert.equal(afterMiddle.activeIndex, 1);
  assert.equal(afterMiddle.isFullscreen, true);

  const backFromFullscreen = handleStackZoneInteraction(afterMiddle, 'left', 27);
  assert.equal(backFromFullscreen.isFullscreen, false);
  assert.equal(backFromFullscreen.activeIndex, 1);
});

test('computeOrbPositions distributes all 150 photos evenly on the 3D sphere with accurate aspect-ratio tile dimensions', () => {
  const photos = generateInitial150Photos();
  const radius = 6.4;
  const nodes = computeOrbPositions(photos, radius);
  assert.equal(nodes.length, 150);

  const countByUrl = new Map<string, number[]>();
  for (let i = 0; i < photos.length; i++) {
    const url = photos[i].imageUrl;
    const list = countByUrl.get(url) || [];
    list.push(i);
    countByUrl.set(url, list);
  }

  // Each of the 150 photos appears exactly once with zero repeats
  for (const [url, indices] of countByUrl.entries()) {
    assert.equal(indices.length, 1, `Expected ${url} to appear exactly once, got ${indices.length}`);
  }

  for (const node of nodes) {
    const dist = Math.hypot(node.x, node.y, node.z);
    assert.ok(Math.abs(dist - radius) < 0.01, `Expected radius ~${radius}, got ${dist}`);
    assert.ok(node.tileW > 0 && node.tileH > 0, 'Expected positive tile dimensions');
  }
});

test('booking contact link builders and form validation work accurately', () => {
  assert.equal(buildTelUrl('+91 70038 95066'), 'tel:+917003895066');
  assert.ok(buildWhatsAppUrl('917003895066', 'Wedding Festivities').startsWith('https://wa.me/917003895066?text='));
  assert.ok(buildMailtoUrl('kollasri147@gmail.com', 'Portraits & Intimate', 'Aarav').startsWith('mailto:kollasri147@gmail.com?subject='));

  assert.equal(validateBookingInquiry({ clientName: '', eventDate: '2026-12-10', eventType: 'Marriage', notes: '' }).valid, false);
  assert.equal(validateBookingInquiry({ clientName: 'Karthik', eventDate: '2026-12-10', eventType: 'Marriage', notes: 'Hyderabad' }).valid, true);
});

test('evaluateFullscreenSwipeGesture dismisses on swipe up, swipe down, fast flick, or tap, and snaps back on short drag', () => {
  const swipeUp = evaluateFullscreenSwipeGesture(-120, 10, 260);
  assert.equal(swipeUp.shouldDismiss, true);
  assert.equal(swipeUp.direction, 'up');
  assert.equal(swipeUp.reason, 'swipe-distance');

  const swipeDown = evaluateFullscreenSwipeGesture(115, -8, 240);
  assert.equal(swipeDown.shouldDismiss, true);
  assert.equal(swipeDown.direction, 'down');
  assert.equal(swipeDown.reason, 'swipe-distance');

  const fastFlick = evaluateFullscreenSwipeGesture(-48, 4, 70);
  assert.equal(fastFlick.shouldDismiss, true);
  assert.equal(fastFlick.direction, 'up');
  assert.equal(fastFlick.reason, 'swipe-velocity');

  const shortDrag = evaluateFullscreenSwipeGesture(32, 5, 400);
  assert.equal(shortDrag.shouldDismiss, false);
  assert.equal(shortDrag.reason, 'snap-back');

  const tap = evaluateFullscreenSwipeGesture(2, -1, 100);
  assert.equal(tap.shouldDismiss, true);
  assert.equal(tap.reason, 'tap');

  const visualRest = computeSwipeVisualTransform(0);
  assert.equal(visualRest.scale, 1);
  assert.equal(visualRest.thresholdReached, false);

  const visualDragged = computeSwipeVisualTransform(-100);
  assert.equal(visualDragged.translateY, -100);
  assert.ok(visualDragged.scale < 1);
  assert.ok(visualDragged.backdropOpacity < 0.92);
  assert.equal(visualDragged.thresholdReached, true);
});

test('haptic feedback triggers on swipe threshold crossing and swipe-to-dismiss completion', () => {
  assert.equal(shouldTriggerThresholdHaptic(-40, -90), true);
  assert.equal(shouldTriggerThresholdHaptic(60, 95), true);
  assert.equal(shouldTriggerThresholdHaptic(-90, -130), false);
  assert.equal(shouldTriggerThresholdHaptic(20, 50), false);

  const triggeredPatterns: Array<number | number[]> = [];
  const mockVibrate = (pattern: number | number[]) => {
    triggeredPatterns.push(pattern);
    return true;
  };

  assert.equal(triggerHapticFeedback('threshold-tick', mockVibrate), true);
  assert.equal(triggerHapticFeedback('swipe-dismiss', mockVibrate), true);
  assert.deepEqual(triggeredPatterns, [
    HAPTIC_PATTERNS['threshold-tick'],
    HAPTIC_PATTERNS['swipe-dismiss'],
  ]);
});
