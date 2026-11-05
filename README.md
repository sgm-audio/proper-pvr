# proper-pvr

[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A cable-style TV guide and PVR interface for iOS and Android (React Native + Expo), modelled on the Rogers/Shaw PVR. The goal is one front end for cable, streaming services and home media servers, with live record, rewind and offline playback.

Right now it's a UI prototype on mock data. See [rogers-pvr-clone/README.md](rogers-pvr-clone/README.md) for what's built and what isn't. Voice control, recording, offline playback and the multi-provider sources aren't built yet.

Known issues:
- `npx tsc --noEmit` fails with `TS2552: Cannot find name 'recordingId'` at `src/context/StorageContext.tsx:258`.
- `expo export --platform web` fails because `react-dom` and `react-native-web` aren't installed.

## License

MIT. See [LICENSE](LICENSE). `rogers-pvr-clone/LICENSE` is the MIT licence from Expo's app template, which the app was started from.
