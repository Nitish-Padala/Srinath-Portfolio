import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateInitial108Photos,
  generateInitial40Photos,
  getUniqueGallerySections,
  getPortraitTrioWindow,
  filterPhotosByMood,
  handleStackZoneInteraction,
  computeOrbPositions,
  buildTelUrl,
  buildWhatsAppUrl,
  buildMailtoUrl,
  validateBookingInquiry,
  evaluateFullscreenSwipeGesture,
  computeSwipeVisualTransform,
  shouldTriggerThresholdHaptic,
  triggerHapticFeedback,
  HAPTIC_PATTERNS,
  SRINATH_UPLOADED_IMAGES,
} from './portfolioLogic';

test('generateInitial108Photos creates 108 curated photos for the 3D Globe and getUniqueGallerySections partitions unique photos with zero repeats and zero Close Study items', () => {
  const photos = generateInitial108Photos();
  assert.equal(photos.length, 108);
  assert.equal(generateInitial40Photos().length, 108);

  const uniqueIds = new Set(photos.map((p) => p.id));
  assert.equal(uniqueIds.size, 108);
  assert.equal(SRINATH_UPLOADED_IMAGES.length, 40);

  for (const photo of photos) {
    assert.ok(
      photo.imageUrl.startsWith('/assets/quickshare/pro-') ||
        photo.imageUrl.startsWith('/assets/cinema/cam-')
    );
    assert.ok(!photo.title.includes('Close Study'), 'Expected no Close Study duplicate titles');
    assert.ok(photo.filterStyle.includes('brightness(0.'));
  }

  const sections = getUniqueGallerySections(photos);
  assert.equal(sections.solitaryPhotos.length, 4);
  assert.equal(sections.kinshipPhotos.length, 2);
  assert.equal(sections.twilightShowcasePhotos.length, 5);
  assert.equal(sections.twilightStackPhotos.length, 5);
  assert.equal(sections.portraitArchivePhotos.length, 30);
  assert.equal(sections.landscapeArchivePhotos.length, 8);

  // Verify zero repeated images across all gallery sections
  const allSectionPhotos = [
    sections.heroPhoto,
    ...sections.solitaryPhotos,
    ...sections.kinshipPhotos,
    ...sections.twilightShowcasePhotos,
    ...sections.twilightStackPhotos,
    ...sections.portraitArchivePhotos,
    ...sections.landscapeArchivePhotos,
  ];
  const sectionUrls = allSectionPhotos.map((p) => p.imageUrl);
  assert.equal(new Set(sectionUrls).size, sectionUrls.length, 'Expected zero repeated images across gallery sections');

  // Verify removed images are not in the gallery or globe catalog
  const allCatalogUrls = photos.map((p) => p.imageUrl);
  for (const removedUrl of [
    '/assets/quickshare/pro-02.jpg',
    '/assets/quickshare/pro-04.jpg',
    '/assets/quickshare/pro-06.jpg',
    '/assets/quickshare/pro-09.jpg',
    '/assets/quickshare/pro-10.jpg',
    '/assets/quickshare/pro-13.jpg',
    '/assets/quickshare/pro-27.jpg',
  ]) {
    assert.ok(!sectionUrls.includes(removedUrl), `Expected ${removedUrl} to be removed from gallery`);
    assert.ok(!allCatalogUrls.includes(removedUrl), `Expected ${removedUrl} to be removed from catalog`);
  }

  // Verify getPortraitTrioWindow shifts all 3 portrait images one by one
  const trio0 = getPortraitTrioWindow(sections.portraitArchivePhotos, 0);
  const trio1 = getPortraitTrioWindow(sections.portraitArchivePhotos, 1);
  assert.equal(trio0.length, 3);
  assert.equal(trio1.length, 3);
  assert.equal(trio1[0].imageUrl, trio0[1].imageUrl);
  assert.equal(trio1[1].imageUrl, trio0[2].imageUrl);

  assert.equal(filterPhotosByMood(photos, 'all').length, 108);
  assert.equal(filterPhotosByMood(photos, 'euphoria').length, 27);
  assert.equal(filterPhotosByMood(photos, 'warmth').length, 27);
  assert.equal(filterPhotosByMood(photos, 'serenity').length, 27);
  assert.equal(filterPhotosByMood(photos, 'electric').length, 27);
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

test('computeOrbPositions distributes all 108 photos evenly on the 3D sphere and guarantees no image repeats more than 2 times or within a radius of 2+ images', () => {
  const photos = generateInitial108Photos();
  const radius = 6.0;
  const nodes = computeOrbPositions(photos, radius);
  assert.equal(nodes.length, 108);

  const countByUrl = new Map<string, number[]>();
  for (let i = 0; i < photos.length; i++) {
    const url = photos[i].imageUrl;
    const list = countByUrl.get(url) || [];
    list.push(i);
    countByUrl.set(url, list);
  }

  for (const [url, indices] of countByUrl.entries()) {
    assert.ok(indices.length <= 2, `Expected ${url} to appear at most 2 times, got ${indices.length}`);
    if (indices.length === 2) {
      const a = nodes[indices[0]];
      const b = nodes[indices[1]];
      const unitDist = Math.hypot(a.nx - b.nx, a.ny - b.ny, a.nz - b.nz);
      // 2-hop neighbor radius on 108-node sphere is ~0.67; antipodal placement guarantees unitDist > 1.80
      assert.ok(
        unitDist > 1.8,
        `Expected duplicate copies of ${url} at indices ${indices[0]} & ${indices[1]} to be on opposite sides of globe (unitDist > 1.8), got ${unitDist}`
      );
    }
  }

  for (const node of nodes) {
    const dist = Math.hypot(node.x, node.y, node.z);
    assert.ok(Math.abs(dist - radius) < 0.01, `Expected radius ~${radius}, got ${dist}`);
  }
});

test('booking contact link builders and form validation work accurately', () => {
  assert.equal(buildTelUrl('+91 98480 52310'), 'tel:+919848052310');
  assert.ok(buildWhatsAppUrl('919848052310', 'Wedding Festivities').startsWith('https://wa.me/919848052310?text='));
  assert.ok(buildMailtoUrl('srinath.frames@studio.in', 'Portraits & Intimate', 'Aarav').startsWith('mailto:srinath.frames@studio.in?subject='));

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
