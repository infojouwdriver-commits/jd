# JOUW DRIVER — cinematic assets

The ASTER sedan, phone, cockpit and thermal-printer meshes are original work
created for this repository on 2026-10-28, procedurally authored in
`src/components/landing/cinematic/models.ts`. They are not derived from a
manufacturer model, prior flat mockup, downloaded model or third-party artwork.
Commercial use, modification and distribution of these original assets are
permitted for JOUW DRIVER. No attribution is required. Source geometry is
retained in the repository so it can be edited without proprietary tooling.

The scene uses Three.js (MIT, https://github.com/mrdoob/three.js/blob/r180/LICENSE)
including its RoundedBoxGeometry, RoomEnvironment and BufferGeometryUtils.
GSAP is pinned to 3.13.0; its Standard License allows commercial websites:
https://gsap.com/community/standard-license/. Dependencies retain their licenses.
QR is generated locally with qrcode (MIT), encodes only
`https://jouww.com/#demo-receipt`, and contains no customer or trip data.

The WebP poster is a render of the same original scene, used for reduced motion
and WebGL failure. The interface textures reproduce the navy/gold hierarchy of
the approved driver cockpit, with explicitly fictional odometer and fare values.
The printer illustrates paper output; it does not assert hardware or Bluetooth
support. No external textures, fonts, HDR downloads or video assets are loaded.
