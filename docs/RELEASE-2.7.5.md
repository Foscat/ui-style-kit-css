# UI Style Kit CSS 2.7.5

The actual SYS consumer of 2.7.4 reproduced a Graphite Cyan light-mode breadcrumb focus ring below 3:1 contrast. Its focus token reused the bright accent rather than the existing dark cyan link ink. This patch changes only that palette/mode focus token from `34 184 199` to `0 99 110`, retaining the palette, component geometry, focus width and all other themes.

The focused regression fails on published 2.7.4 and checks keyboard focus against background, surface, strong surface and soft surface. The unchanged normal local release, PR, signed-tag alignment and protected publisher gates remain required. Published-byte verification and the actual SYS consumer check are separate acceptance steps. No local Core or SDK substitution is introduced.

The unchanged Art Deco / Arctic Indigo accessibility cases exposed scans during active 150/240ms palette transitions. The representative scan now uses the existing demo contrast gate's settled-transition contract before invoking unchanged Axe rules. No motion, paint, thresholds or supported state is disabled. The Graphite Cyan regression is included in the normal curated release smoke selection.
